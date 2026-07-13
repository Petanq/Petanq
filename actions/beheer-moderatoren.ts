"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { Moderator, ModeratorRol } from "@/lib/types";
import { Provincie } from "@/lib/provincies";
import { isModerator, isAdmin } from "@/lib/auth-helpers";
import { maakKorteLink } from "@/lib/korte-link";

export type BeheerActieResultaat = { succes: true } | { succes: false; fout: string };
export type UitnodigenResultaat =
  | { succes: true; link: string }
  | { succes: false; fout: string };

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.petanq.be";

// Supabase's eigen action_link laat de browser via een cross-domain omleiding
// het token in het #-gedeelte van de URL zetten. Sommige in-app browsers
// (bv. WhatsApp) laten dat #-gedeelte onderweg wegvallen, waardoor de sessie
// nooit tot stand komt. Door zelf een link naar onze eigen pagina te bouwen met
// het token als gewone queryparameter, is er geen cross-domain omleiding meer
// nodig en overleeft het token elke omleiding betrouwbaar.
function wachtwoordLink(hashedToken: string, type: "invite" | "recovery") {
  return `${siteUrl()}/beheer/wachtwoord-resetten?token_hash=${hashedToken}&type=${type}`;
}

export async function moderatorUitnodigen(input: {
  email: string;
  naam: string;
  rol: ModeratorRol;
  provincie: Provincie | null;
}): Promise<UitnodigenResultaat> {
  if (!(await isAdmin())) return { succes: false, fout: "niet_geautoriseerd" };

  const serviceClient = createServiceRoleClient();
  // generateLink (i.p.v. inviteUserByEmail) maakt de gebruiker aan zonder zelf een
  // e-mail te versturen — we tonen de link in het beheerpaneel zodat de admin die
  // zelf kan doorsturen (WhatsApp, sms, ...), voor het geval Supabase's gratis
  // e-maildienst niet aankomt bij de ontvanger.
  const { data, error } = await serviceClient.auth.admin.generateLink({
    type: "invite",
    email: input.email,
    options: { redirectTo: `${siteUrl()}/beheer/wachtwoord-resetten` },
  });

  if (error || !data.user) {
    if (error?.message.toLowerCase().includes("already been registered")) {
      // Er bestaat al een auth-account met dit e-mailadres — bv. omdat een eerdere
      // uitnodiging werd verwijderd uit de lijst zonder het account zelf op te ruimen.
      // In dat geval maken we gewoon een nieuwe moderatoren-rij + link aan i.p.v. te falen.
      const { data: lijst } = await serviceClient.auth.admin.listUsers({ perPage: 200 });
      const bestaandeUser = lijst?.users.find(
        (u) => u.email?.toLowerCase() === input.email.toLowerCase()
      );
      if (!bestaandeUser) return { succes: false, fout: "al_geregistreerd" };

      const { data: bestaandeRij } = await serviceClient
        .from("moderatoren")
        .select("id")
        .eq("user_id", bestaandeUser.id)
        .maybeSingle();
      if (bestaandeRij) return { succes: false, fout: "al_geregistreerd" };

      const { error: invoegFout2 } = await serviceClient.from("moderatoren").insert({
        user_id: bestaandeUser.id,
        naam: input.naam,
        email: input.email,
        rol: input.rol,
        provincie: input.provincie,
      });
      if (invoegFout2) {
        console.error("Vrijwilliger-rij toevoegen mislukt (bestaande gebruiker):", invoegFout2.message);
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

      revalidatePath("/beheer/moderatoren");
      return { succes: true, link: await maakKorteLink(wachtwoordLink(linkData.properties.hashed_token, "recovery")) };
    }
    console.error("Vrijwilliger uitnodigen mislukt:", error?.message);
    return { succes: false, fout: "server_fout" };
  }

  const { error: invoegFout } = await serviceClient.from("moderatoren").insert({
    user_id: data.user.id,
    naam: input.naam,
    email: input.email,
    rol: input.rol,
    provincie: input.provincie,
  });

  if (invoegFout) {
    // Best-effort: de net aangemaakte auth-user weer opruimen als de moderatoren-rij mislukt.
    await serviceClient.auth.admin.deleteUser(data.user.id);
    console.error("Vrijwilliger-rij toevoegen mislukt:", invoegFout.message);
    return { succes: false, fout: "server_fout" };
  }

  revalidatePath("/beheer/moderatoren");
  return { succes: true, link: await maakKorteLink(wachtwoordLink(data.properties.hashed_token, "invite")) };
}

export async function moderatorBewerken(
  id: string,
  wijzigingen: Partial<Pick<Moderator, "naam" | "provincie">>
): Promise<BeheerActieResultaat> {
  if (!(await isModerator())) return { succes: false, fout: "niet_geautoriseerd" };

  const supabase = createClient();
  const { error } = await supabase.from("moderatoren").update(wijzigingen).eq("id", id);
  if (error) return { succes: false, fout: "server_fout" };
  revalidatePath("/beheer/moderatoren");
  return { succes: true };
}

export async function moderatorWachtwoordBevestigen(): Promise<BeheerActieResultaat> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { succes: false, fout: "niet_geautoriseerd" };

  const serviceClient = createServiceRoleClient();
  const { error } = await serviceClient
    .from("moderatoren")
    .update({ wachtwoord_ingesteld: true })
    .eq("user_id", user.id);
  if (error) return { succes: false, fout: "server_fout" };

  revalidatePath("/beheer/moderatoren");
  return { succes: true };
}

export async function moderatorVerwijderen(id: string): Promise<BeheerActieResultaat> {
  if (!(await isModerator())) return { succes: false, fout: "niet_geautoriseerd" };

  const supabase = createClient();
  const { data: mod } = await supabase.from("moderatoren").select("user_id").eq("id", id).single();
  const { error } = await supabase.from("moderatoren").delete().eq("id", id);
  if (error) return { succes: false, fout: "server_fout" };

  // Ook het onderliggende auth-account opruimen, anders blijft een nieuwe uitnodiging
  // naar hetzelfde e-mailadres later vastlopen op "e-mailadres is al geregistreerd".
  if (mod?.user_id) {
    const serviceClient = createServiceRoleClient();
    await serviceClient.auth.admin.deleteUser(mod.user_id);
  }

  revalidatePath("/beheer/moderatoren");
  return { succes: true };
}
