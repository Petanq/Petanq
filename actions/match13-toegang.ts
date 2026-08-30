"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth-helpers";
import { maakKorteLink } from "@/lib/korte-link";
import { siteUrl } from "@/lib/site-url";

export type Match13ToegangActieResultaat = { succes: true } | { succes: false; fout: string };
export type Match13UitnodigenResultaat =
  | { succes: true; link: string }
  | { succes: false; fout: string };

export type Match13Status = "proef" | "betalend";

export interface Match13Gebruiker {
  id: string;
  naam: string;
  club: string;
  club_id: string | null;
  email: string;
  actief: boolean;
  status: Match13Status;
  bevestigd: boolean;
  aangemaakt_op: string;
  toernooiAantal: number;
}

export interface EchteClub {
  id: string;
  naam: string;
  gemeente: string;
}

// Voor het kies-uit-de-lijst-veld bij het uitnodigen/bewerken — de volledige
// clubdirectory, ook niet-actieve clubs (bv. een piloot die nog niet publiek
// goedgekeurd is moet ook koppelbaar zijn).
export async function haalEchteClubs(): Promise<EchteClub[]> {
  if (!(await isAdmin())) return [];

  const supabase = await createClient();
  const { data, error } = await supabase.from("clubs").select("id, naam, gemeente").order("naam");

  if (error) {
    console.error("Kon clubs niet ophalen:", error.message);
    return [];
  }
  return data;
}

export async function haalMatch13Gebruikers(): Promise<Match13Gebruiker[]> {
  if (!(await isAdmin())) return [];

  const supabase = await createClient();
  const [{ data, error }, { data: toernooien }] = await Promise.all([
    supabase
      .from("match13_gebruikers")
      .select("id, naam, club, club_id, email, actief, status, bevestigd, aangemaakt_op")
      .order("aangemaakt_op", { ascending: false }),
    supabase.from("match13_toernooien").select("club"),
  ]);

  if (error) {
    console.error("Kon Match13-gebruikers niet ophalen:", error.message);
    return [];
  }

  // Aantal toernooien per club — meerdere uitgenodigde personen van dezelfde
  // club delen dezelfde toernooien, dus dit telt per club, niet per persoon.
  const aantalPerClub = new Map<string, number>();
  for (const tour of toernooien ?? []) {
    aantalPerClub.set(tour.club, (aantalPerClub.get(tour.club) ?? 0) + 1);
  }

  return (data as Omit<Match13Gebruiker, "toernooiAantal">[]).map((g) => ({
    ...g,
    toernooiAantal: aantalPerClub.get(g.club) ?? 0,
  }));
}

// Zelfde aanpak als moderatorUitnodigen: we genereren de link zelf i.p.v. een
// e-mail te laten versturen, zodat de admin die ook via WhatsApp/sms kan
// doorsturen als Supabase's gratis e-maildienst de ontvanger niet bereikt.
function wachtwoordLink(hashedToken: string, type: "invite" | "recovery") {
  return `${siteUrl()}/beheer/wachtwoord-resetten?token_hash=${hashedToken}&type=${type}`;
}

// Zoekt de echte clubrij op via een exacte (hoofdletter-ongevoelige) naam-
// match — dat is wat gebeurt als je uit de lijst kiest. Typ je iets dat niet
// (meer) exact bestaat, dan blijft club_id gewoon leeg — geen harde eis, om
// het uitnodigen niet te blokkeren voor een club die nog niet in de
// directory staat.
async function zoekClubId(naam: string): Promise<{ club: string; club_id: string | null }> {
  const serviceClient = createServiceRoleClient();
  const { data } = await serviceClient.from("clubs").select("id, naam").ilike("naam", naam.trim()).maybeSingle();
  return data ? { club: data.naam, club_id: data.id } : { club: naam.trim(), club_id: null };
}

export async function match13GebruikerUitnodigen(input: {
  email: string;
  naam: string;
  club: string;
}): Promise<Match13UitnodigenResultaat> {
  if (!(await isAdmin())) return { succes: false, fout: "niet_geautoriseerd" };

  const { club, club_id } = await zoekClubId(input.club);

  const serviceClient = createServiceRoleClient();
  const { data, error } = await serviceClient.auth.admin.generateLink({
    type: "invite",
    email: input.email,
    options: { redirectTo: `${siteUrl()}/beheer/wachtwoord-resetten` },
  });

  if (error || !data.user) {
    if (error?.message.toLowerCase().includes("already been registered")) {
      // Bestaat het auth-account al (bv. iemand die ook moderator is, of een
      // eerdere poging)? Dan gewoon een match13_gebruikers-rij + nieuwe link
      // aanmaken in plaats van te falen.
      const { data: lijst } = await serviceClient.auth.admin.listUsers({ perPage: 200 });
      const bestaandeUser = lijst?.users.find(
        (u) => u.email?.toLowerCase() === input.email.toLowerCase()
      );
      if (!bestaandeUser) return { succes: false, fout: "al_geregistreerd" };

      const { data: bestaandeRij } = await serviceClient
        .from("match13_gebruikers")
        .select("id")
        .eq("user_id", bestaandeUser.id)
        .maybeSingle();
      if (bestaandeRij) return { succes: false, fout: "al_geregistreerd" };

      const { error: invoegFout2 } = await serviceClient.from("match13_gebruikers").insert({
        user_id: bestaandeUser.id,
        naam: input.naam,
        club,
        club_id,
        email: input.email,
      });
      if (invoegFout2) {
        console.error("Match13-gebruiker toevoegen mislukt (bestaande gebruiker):", invoegFout2.message);
        return { succes: false, fout: "server_fout" };
      }

      const { data: linkData, error: linkFout } = await serviceClient.auth.admin.generateLink({
        type: "recovery",
        email: input.email,
        options: { redirectTo: `${siteUrl()}/beheer/wachtwoord-resetten` },
      });
      if (linkFout || !linkData) {
        console.error("Link opnieuw genereren mislukt:", linkFout?.message);
        return { succes: false, fout: "server_fout" };
      }

      revalidatePath("/beheer/match13/toegang");
      return { succes: true, link: await maakKorteLink(wachtwoordLink(linkData.properties.hashed_token, "recovery")) };
    }
    console.error("Match13-gebruiker uitnodigen mislukt:", error?.message);
    return { succes: false, fout: "server_fout" };
  }

  const { error: invoegFout } = await serviceClient.from("match13_gebruikers").insert({
    user_id: data.user.id,
    naam: input.naam,
    club,
    club_id,
    email: input.email,
  });

  if (invoegFout) {
    // Best-effort: de net aangemaakte auth-user weer opruimen als de rij mislukt.
    await serviceClient.auth.admin.deleteUser(data.user.id);
    console.error("Match13-gebruiker-rij toevoegen mislukt:", invoegFout.message);
    return { succes: false, fout: "server_fout" };
  }

  revalidatePath("/beheer/match13/toegang");
  return { succes: true, link: await maakKorteLink(wachtwoordLink(data.properties.hashed_token, "invite")) };
}

// Voor een club die al in de lijst staat: hun link is verlopen (7 dagen) of
// verbruikt, en de uitnodig-balk bovenaan weigert dat e-mailadres net omdat
// er al een rij bestaat — dus een apart "stuur nieuwe link"-knopje per rij.
export async function match13LinkOpnieuwSturen(id: string): Promise<Match13UitnodigenResultaat> {
  if (!(await isAdmin())) return { succes: false, fout: "niet_geautoriseerd" };

  const supabase = await createClient();
  const { data: gebruiker } = await supabase.from("match13_gebruikers").select("email").eq("id", id).single();
  if (!gebruiker) return { succes: false, fout: "server_fout" };

  const serviceClient = createServiceRoleClient();
  const { data: linkData, error } = await serviceClient.auth.admin.generateLink({
    type: "recovery",
    email: gebruiker.email,
    options: { redirectTo: `${siteUrl()}/beheer/wachtwoord-resetten` },
  });
  if (error || !linkData) {
    console.error("Nieuwe link genereren mislukt:", error?.message);
    return { succes: false, fout: "server_fout" };
  }

  return { succes: true, link: await maakKorteLink(wachtwoordLink(linkData.properties.hashed_token, "recovery")) };
}

// Aangeroepen vanuit wachtwoord-resetten-form.tsx zodra iemand daadwerkelijk
// een wachtwoord instelde — zo weet Frederic wie de link enkel ontving en wie
// er ook echt mee inlogde. Werkt voor eender welke ingelogde gebruiker (geen
// gevolgen als ze geen match13_gebruikers-rij hebben, net als de
// moderator-tegenhanger hiervan).
export async function match13WachtwoordBevestigen(): Promise<Match13ToegangActieResultaat> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { succes: false, fout: "niet_geautoriseerd" };

  const serviceClient = createServiceRoleClient();
  const { error } = await serviceClient.from("match13_gebruikers").update({ bevestigd: true }).eq("user_id", user.id);
  if (error) return { succes: false, fout: "server_fout" };

  revalidatePath("/beheer/match13/toegang");
  return { succes: true };
}

// Het schakelaartje: toegang tijdelijk afzetten zonder het account te wissen
// — de club kan later, bv. volgend seizoen, gewoon opnieuw aangezet worden.
export async function match13ToegangWijzigen(id: string, actief: boolean): Promise<Match13ToegangActieResultaat> {
  if (!(await isAdmin())) return { succes: false, fout: "niet_geautoriseerd" };

  const supabase = await createClient();
  const { error } = await supabase.from("match13_gebruikers").update({ actief }).eq("id", id);
  if (error) return { succes: false, fout: "server_fout" };

  revalidatePath("/beheer/match13/toegang");
  return { succes: true };
}

export async function match13StatusWijzigen(id: string, status: Match13Status): Promise<Match13ToegangActieResultaat> {
  if (!(await isAdmin())) return { succes: false, fout: "niet_geautoriseerd" };

  const supabase = await createClient();
  const { error } = await supabase.from("match13_gebruikers").update({ status }).eq("id", id);
  if (error) return { succes: false, fout: "server_fout" };

  revalidatePath("/beheer/match13/toegang");
  return { succes: true };
}

export async function match13GegevensWijzigen(
  id: string,
  input: { club: string; naam: string }
): Promise<Match13ToegangActieResultaat> {
  if (!(await isAdmin())) return { succes: false, fout: "niet_geautoriseerd" };
  if (!input.club.trim() || !input.naam.trim()) return { succes: false, fout: "server_fout" };

  const { club, club_id } = await zoekClubId(input.club);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("match13_gebruikers")
    .update({ club, club_id, naam: input.naam.trim() })
    .eq("id", id)
    .select("user_id")
    .single();
  if (error || !data) return { succes: false, fout: "server_fout" };

  // Neem de eigen toernooien van deze persoon mee naar de (gecorrigeerde)
  // clubnaam — anders zou een typfout-correctie hun bestaande toernooien
  // per ongeluk loskoppelen van de rest van hun club.
  const { error: toernooiFout } = await supabase
    .from("match13_toernooien")
    .update({ club })
    .eq("aangemaakt_door", data.user_id);
  if (toernooiFout) console.error("Kon club op bestaande toernooien niet bijwerken:", toernooiFout.message);

  revalidatePath("/beheer/match13/toegang");
  return { succes: true };
}

export interface EchteClubDetail extends EchteClub {
  adres: string | null;
  provincie: string;
  website: string | null;
  contact_email: string | null;
  telefoon: string | null;
  openingsuren: string | null;
  foto_url: string | null;
}

export interface Match13GebruikerMetToernooien extends Omit<Match13Gebruiker, "toernooiAantal"> {
  toernooien: { id: string; naam: string; bijgewerkt_op: string }[];
  echteClub: EchteClubDetail | null;
}

// Voor het nakijken: welke toernooien heeft deze pilootclub zelf al
// aangemaakt/gespeeld? is_admin() in de RLS-policy op match13_toernooien
// laat de admin sowieso alles zien, ongeacht wie het aanmaakte.
export async function haalMatch13GebruikerMetToernooien(id: string): Promise<Match13GebruikerMetToernooien | null> {
  if (!(await isAdmin())) return null;

  const supabase = await createClient();
  const { data: gebruiker, error } = await supabase
    .from("match13_gebruikers")
    .select(
      "id, naam, club, club_id, email, actief, status, bevestigd, aangemaakt_op, user_id, echteClub:clubs(id, naam, gemeente, provincie, adres, website, contact_email, telefoon, openingsuren, foto_url)"
    )
    .eq("id", id)
    .single();
  if (error || !gebruiker) return null;

  // Op club gefilterd (niet op deze ene persoon) — anders zou dit een
  // onvolledig beeld geven zodra een club meerdere uitgenodigde mensen heeft
  // die dezelfde toernooien delen.
  const { data: toernooien } = await supabase
    .from("match13_toernooien")
    .select("id, naam, bijgewerkt_op")
    .eq("club", gebruiker.club)
    .order("bijgewerkt_op", { ascending: false });

  const { user_id: _userId, echteClub: echteClubRuw, ...rest } = gebruiker;
  // De ingebouwde club-join komt afhankelijk van de Supabase-clientversie
  // terug als object of als array van 1 — dit vangt beide op.
  const echteClub = (Array.isArray(echteClubRuw) ? echteClubRuw[0] : echteClubRuw) as EchteClubDetail | null;

  return { ...rest, toernooien: toernooien ?? [], echteClub: echteClub ?? null };
}

export async function match13GebruikerVerwijderen(id: string): Promise<Match13ToegangActieResultaat> {
  if (!(await isAdmin())) return { succes: false, fout: "niet_geautoriseerd" };

  const supabase = await createClient();
  const { data: gebruiker } = await supabase.from("match13_gebruikers").select("user_id").eq("id", id).single();
  const { error } = await supabase.from("match13_gebruikers").delete().eq("id", id);
  if (error) return { succes: false, fout: "server_fout" };

  // Ook het auth-account opruimen, anders loopt een latere nieuwe uitnodiging
  // naar hetzelfde e-mailadres vast op "is al geregistreerd".
  if (gebruiker?.user_id) {
    const serviceClient = createServiceRoleClient();
    await serviceClient.auth.admin.deleteUser(gebruiker.user_id);
  }

  revalidatePath("/beheer/match13/toegang");
  return { succes: true };
}
