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
  email: string;
  actief: boolean;
  status: Match13Status;
  bevestigd: boolean;
  aangemaakt_op: string;
}

export async function haalMatch13Gebruikers(): Promise<Match13Gebruiker[]> {
  if (!(await isAdmin())) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("match13_gebruikers")
    .select("id, naam, email, actief, status, bevestigd, aangemaakt_op")
    .order("aangemaakt_op", { ascending: false });

  if (error) {
    console.error("Kon Match13-gebruikers niet ophalen:", error.message);
    return [];
  }
  return data as Match13Gebruiker[];
}

// Zelfde aanpak als moderatorUitnodigen: we genereren de link zelf i.p.v. een
// e-mail te laten versturen, zodat de admin die ook via WhatsApp/sms kan
// doorsturen als Supabase's gratis e-maildienst de ontvanger niet bereikt.
function wachtwoordLink(hashedToken: string, type: "invite" | "recovery") {
  return `${siteUrl()}/beheer/wachtwoord-resetten?token_hash=${hashedToken}&type=${type}`;
}

export async function match13GebruikerUitnodigen(input: {
  email: string;
  naam: string;
}): Promise<Match13UitnodigenResultaat> {
  if (!(await isAdmin())) return { succes: false, fout: "niet_geautoriseerd" };

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
