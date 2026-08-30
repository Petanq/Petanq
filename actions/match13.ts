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
  aangemaakt_op: string;
  bijgewerkt_op: string;
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
    .select("id, naam, aangemaakt_op, bijgewerkt_op")
    .order("bijgewerkt_op", { ascending: false });

  if (error) {
    console.error("Kon Match13-toernooien niet ophalen:", error.message);
    return [];
  }
  return data as Match13ToernooiRij[];
}

export async function haalMatch13Toernooi(id: string): Promise<AppState | null> {
  if (!(await magMatch13Gebruiken())) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("match13_toernooien")
    .select("data")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Kon Match13-toernooi niet laden:", id, error.message);
    return null;
  }
  return data.data as AppState;
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
    console.error("Kon nieuw Match13-toernooi niet aanmaken:", error?.message);
    redirect("/beheer/match13");
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
