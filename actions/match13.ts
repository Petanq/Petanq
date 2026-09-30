"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { isAdmin, heeftMatch13Toegang } from "@/lib/auth-helpers";
import { defaultAppState, type AppState } from "@/lib/match13/state";

export type Match13ActieResultaat = { succes: true } | { succes: false; fout: string };

export interface Match13ToernooiRij {
  id: string;
  naam: string;
  club: string;
  aangemaakt_op: string;
  bijgewerkt_op: string;
  is_test: boolean;
  afgewerkt: boolean;
  organisator: string | null;
  geplande_datum: string | null;
  live_delen: boolean;
  toernooi_id: string | null;
}

// Admin ziet alles; een pilootgebruiker mag enkel Match13 gebruiken (nooit de
// rest van het beheerpaneel) — welke rijen ze precies te zien krijgen wordt
// daarna nog eens afgedwongen door de RLS-policy op match13_toernooien zelf.
async function magMatch13Gebruiken(): Promise<boolean> {
  return (await isAdmin()) || (await heeftMatch13Toegang());
}

export async function haalMatch13Toernooien(): Promise<Match13ToernooiRij[]> {
  if (!(await magMatch13Gebruiken())) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("match13_toernooien")
    .select(
      "id, naam, club, aangemaakt_op, bijgewerkt_op, is_test, afgewerkt, organisator, geplande_datum, live_delen, toernooi_id"
    )
    .order("bijgewerkt_op", { ascending: false });

  if (error) {
    console.error("Kon Match13-toernooien niet ophalen:", error.message);
    return [];
  }
  return data as Match13ToernooiRij[];
}

export interface Match13ToernooiMetMeta {
  state: AppState;
  geplandeDatum: string | null;
}

export async function haalMatch13Toernooi(id: string): Promise<Match13ToernooiMetMeta | null> {
  if (!(await magMatch13Gebruiken())) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("match13_toernooien")
    .select("data, geplande_datum")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Kon Match13-toernooi niet laden:", id, error.message);
    return null;
  }
  return { state: data.data as AppState, geplandeDatum: data.geplande_datum as string | null };
}

// Redirect gebeurt hier zelf (in plaats van het resultaat terug te geven aan
// de aanroeper) zodat de "Nieuw toernooi"-knop meteen naar het nieuwe
// toernooi springt, zoals bij de bestaande beheer-acties met formuliertjes.
export async function nieuwMatch13Toernooi(): Promise<void> {
  if (!(await magMatch13Gebruiken())) redirect("/beheer");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/beheer");

  // match13_gebruikers is enkel leesbaar voor de admin via de gewone client
  // (RLS) — de service-role client omzeilt dat om iemand zijn eigen club op
  // te zoeken. Admins hebben hier geen rij (club blijft dan leeg), maar
  // is_admin() geeft hen sowieso overal toegang, ongeacht de clubwaarde.
  const serviceClient = createServiceRoleClient();
  const { data: gebruikerRij } = await serviceClient
    .from("match13_gebruikers")
    .select("club")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data, error } = await supabase
    .from("match13_toernooien")
    .insert({ aangemaakt_door: user.id, club: gebruikerRij?.club ?? "", data: defaultAppState() })
    .select("id")
    .single();

  if (error || !data) {
    // Dit gebeurde vroeger stil (gewoon terug naar dezelfde lijst, geen
    // uitleg) — voor een piloot-gebruiker wiens Match13-toegang bv. nog
    // uitstaat, leek dat exact "ik klik en er gebeurt niets". De reden zit
    // hier in de URL zodat Match13Overzicht.tsx die kan tonen.
    console.error("Kon nieuw Match13-toernooi niet aanmaken:", error?.message);
    redirect("/beheer/match13?fout=aanmaken_mislukt");
  }
  redirect(`/beheer/match13/${data.id}`);
}

// Bewaart een kopie van de eindstand vóór een club (of de admin) hem wist of
// verwijdert — enkel als er effectief al gespeeld is, zodat een lege/net
// aangemaakte toernooitest het archief niet vervuilt. Gebruikt de
// service-role client zodat dit ook lukt voor een club-gebruiker, die zelf
// geen rechten heeft op match13_archief (enkel de admin mag dat lezen).
async function archiveerIndienGespeeld(id: string, state: AppState, reden: "gewist" | "verwijderd") {
  const heeftGespeeld =
    state.rounds.length > 0 ||
    state.pouleBracket.some((m) => m.scoreA !== undefined) ||
    state.knockoutBracket.some((m) => m.scoreA !== undefined);
  if (!heeftGespeeld) return;

  const serviceClient = createServiceRoleClient();
  const { error } = await serviceClient.from("match13_archief").insert({
    oorspronkelijk_toernooi_id: id,
    club: state.clubName || "",
    data: state,
    reden,
  });
  if (error) console.error("Archiveren van Match13-resultaten mislukt:", error.message);
}

// Aangeroepen vanuit de client vlak vóór "Dit toernooi wissen" de teams,
// rondes en brackets effectief leegmaakt — dat wissen zelf blijft een lokale
// state-wijziging (bewaard via de gewone debounced save), dit is enkel de
// kopie voor het admin-archief.
export async function archiveerMatch13Resultaten(id: string, state: AppState): Promise<Match13ActieResultaat> {
  if (!(await magMatch13Gebruiken())) return { succes: false, fout: "niet_geautoriseerd" };
  await archiveerIndienGespeeld(id, state, "gewist");
  return { succes: true };
}

export async function slaMatch13OpAsync(id: string, state: AppState): Promise<Match13ActieResultaat> {
  if (!(await magMatch13Gebruiken())) return { succes: false, fout: "niet_geautoriseerd" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("match13_toernooien")
    .update({ data: state, naam: state.clubName || "Nieuw toernooi", bijgewerkt_op: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Kon Match13-toernooi niet opslaan:", error.message);
    return { succes: false, fout: "opslaan_mislukt" };
  }
  return { succes: true };
}

// Wordt gebruikt vanuit de overzichtslijst zelf (checkboxes/organisator-veld
// per rij) zodat je die niet per toernooi hoeft te openen om ze te zetten.
export async function bewerkMatch13Metadata(
  id: string,
  wijziging: {
    is_test?: boolean;
    afgewerkt?: boolean;
    organisator?: string;
    geplande_datum?: string | null;
    live_delen?: boolean;
    toernooi_id?: string | null;
  }
): Promise<Match13ActieResultaat> {
  if (!(await magMatch13Gebruiken())) return { succes: false, fout: "niet_geautoriseerd" };

  const supabase = await createClient();
  const { error } = await supabase.from("match13_toernooien").update(wijziging).eq("id", id);

  if (error) {
    console.error("Kon Match13-metadata niet opslaan:", error.message);
    return { succes: false, fout: "opslaan_mislukt" };
  }
  revalidatePath("/beheer/match13");
  return { succes: true };
}

export async function verwijderMatch13Toernooi(id: string): Promise<Match13ActieResultaat> {
  if (!(await magMatch13Gebruiken())) return { succes: false, fout: "niet_geautoriseerd" };

  const supabase = await createClient();
  const { data: rij } = await supabase.from("match13_toernooien").select("data").eq("id", id).single();
  if (rij) await archiveerIndienGespeeld(id, rij.data as AppState, "verwijderd");

  const { error } = await supabase.from("match13_toernooien").delete().eq("id", id);

  if (error) return { succes: false, fout: "verwijderen_mislukt" };
  revalidatePath("/beheer/match13");
  return { succes: true };
}

export interface Match13LivePubliek {
  naam: string;
  club: string;
  bijgewerktOp: string;
  state: AppState;
}

// Publiek, geen authenticatie — dit is precies waarvoor "live_delen" bestaat.
// De RLS-policy "match13_toernooien_publiek_live" zorgt dat dit sowieso enkel
// een rij teruggeeft als live_delen effectief aanstaat; de expliciete
// .eq("live_delen", true) hieronder is enkel voor de duidelijkheid.
export async function haalMatch13ToernooiVoorPubliek(id: string): Promise<Match13LivePubliek | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("match13_toernooien")
    .select("naam, club, data, bijgewerkt_op")
    .eq("id", id)
    .eq("live_delen", true)
    .maybeSingle();

  if (error || !data) return null;
  return { naam: data.naam, club: data.club, bijgewerktOp: data.bijgewerkt_op, state: data.data as AppState };
}

// Is er, voor dit specifieke Petanque13.be-toernooi, een Match13-toernooi
// gekoppeld dat live gedeeld wordt? Gebruikt om de "Volg live"-knop op de
// publieke toernooipagina te tonen (of niet).
export async function haalMatch13LiveKoppeling(toernooiId: string): Promise<{ match13Id: string } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("match13_toernooien")
    .select("id")
    .eq("toernooi_id", toernooiId)
    .eq("live_delen", true)
    .maybeSingle();

  if (error || !data) return null;
  return { match13Id: data.id };
}

// Voor de "LIVE"-badge op de compacte tornooikaartjes: welke
// Petanque13.be-toernooien hebben op dit moment een live-gedeeld
// Match13-toernooi lopen? Eén bulk-query i.p.v. één per kaartje.
export async function haalLiveGedeeldeToernooiIds(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("match13_toernooien")
    .select("toernooi_id")
    .eq("live_delen", true)
    .eq("afgewerkt", false)
    .not("toernooi_id", "is", null);

  if (error || !data) return [];
  return data.map((r) => r.toernooi_id as string);
}

export interface EigenToernooiOptie {
  id: string;
  naam_nl: string;
  datum: string;
  clubnaam?: string;
}

// Voor de "koppel aan een Petanque13.be-toernooi"-keuzelijst: normaal enkel de
// eigen club z'n toernooien, opgezocht via de club_id op match13_gebruikers
// (net als match13ToegangGevenAanModerator elders dat al doet). Een admin
// heeft daarentegen zelf geen match13_gebruikers-rij/club_id, en moet net
// namens eender welke club snel een koppeling kunnen leggen (bv. om een
// toernooi voor een club klaar te zetten of om de live-functie te testen) —
// die krijgt daarom alle recente/toekomstige toernooien van alle clubs te
// zien, mét clubnaam erbij zodat duidelijk is van wie welk toernooi is.
export async function haalEigenToernooienOmTeKoppelen(): Promise<EigenToernooiOptie[]> {
  if (!(await magMatch13Gebruiken())) return [];

  const supabase = await createClient();

  if (await isAdmin()) {
    const drieMaandenGeleden = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from("toernooien")
      .select("id, naam_nl, datum, clubnaam")
      .gte("datum", drieMaandenGeleden)
      .order("datum", { ascending: false })
      .limit(150);

    if (error) {
      console.error("Kon toernooien voor admin-koppeling niet ophalen:", error.message);
      return [];
    }
    return data;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const serviceClient = createServiceRoleClient();
  const { data: gebruikerRij } = await serviceClient
    .from("match13_gebruikers")
    .select("club_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!gebruikerRij?.club_id) return [];

  const { data, error } = await supabase
    .from("toernooien")
    .select("id, naam_nl, datum")
    .eq("club_id", gebruikerRij.club_id)
    .order("datum", { ascending: false })
    .limit(30);

  if (error) {
    console.error("Kon eigen toernooien niet ophalen:", error.message);
    return [];
  }
  return data;
}
