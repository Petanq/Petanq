"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { vrijwilligerAanmeldenSchema } from "@/lib/validations";
import { Provincie } from "@/lib/provincies";

export type VrijwilligerAanmeldenResultaat = { succes: true } | { succes: false; fout: string };

export async function vrijwilligerAanmelden(input: {
  naam: string;
  email: string;
  wachtwoord: string;
  provincie: Provincie | null;
}): Promise<VrijwilligerAanmeldenResultaat> {
  const parsed = vrijwilligerAanmeldenSchema.safeParse(input);
  if (!parsed.success) return { succes: false, fout: "ongeldige_invoer" };

  const serviceClient = createServiceRoleClient();

  // Het account wordt meteen met het zelfgekozen wachtwoord aangemaakt (geen
  // magische link nodig, die in sommige in-app browsers niet betrouwbaar aankomt).
  // De persoon kan pas echt bij het beheerpaneel als een admin de aanvraag goedkeurt.
  const { data, error } = await serviceClient.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.wachtwoord,
    email_confirm: true,
  });

  if (error || !data.user) {
    if (error?.message.toLowerCase().includes("already been registered")) {
      return { succes: false, fout: "al_geregistreerd" };
    }
    console.error("Vrijwilliger aanmelden mislukt:", error?.message);
    return { succes: false, fout: "server_fout" };
  }

  const { error: invoegFout } = await serviceClient.from("moderatoren").insert({
    user_id: data.user.id,
    naam: parsed.data.naam,
    email: parsed.data.email,
    rol: "moderator",
    provincie: parsed.data.provincie,
    wachtwoord_ingesteld: true,
    goedgekeurd: false,
  });

  if (invoegFout) {
    await serviceClient.auth.admin.deleteUser(data.user.id);
    console.error("Vrijwilliger-rij toevoegen mislukt:", invoegFout.message);
    return { succes: false, fout: "server_fout" };
  }

  return { succes: true };
}
