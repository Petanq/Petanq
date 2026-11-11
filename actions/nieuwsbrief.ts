"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { nieuwsbriefSchema } from "@/lib/validations";
import { getResendClient, AFZENDER } from "@/lib/resend";
import { siteUrl } from "@/lib/site-url";
import { magFormulierIndienen, magMailVersturenNaar } from "@/lib/formulier-limiet";
import { NieuwsbriefBevestigenEmail, nieuwsbriefBevestigenOnderwerp } from "@/lib/emails/nieuwsbrief-bevestigen";

export type NieuwsbriefResultaat = { succes: true } | { succes: false; fout: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Een ontbrekende kolom (SQL 0069 nog niet gedraaid) herkennen we aan deze foutcodes.
function kolomOntbreekt(error: { code?: string; message?: string }): boolean {
  return error.code === "42703" || error.code === "PGRST204" || /bevestig/i.test(error.message ?? "");
}

async function stuurBevestiging(email: string, token: string, taal: "nl" | "fr"): Promise<void> {
  try {
    if (!(await magMailVersturenNaar(email))) return;
    await getResendClient().emails.send({
      from: AFZENDER,
      to: email,
      subject: nieuwsbriefBevestigenOnderwerp(taal),
      react: NieuwsbriefBevestigenEmail({ taal, link: `${siteUrl()}/nieuwsbrief/bevestigen?token=${token}` }),
    });
  } catch (fout) {
    console.error("Bevestigingsmail nieuwsbrief mislukt:", fout);
  }
}

// Inschrijven met bevestiging (double opt-in): de inschrijving wordt pas actief nadat de eigenaar van het
// e-mailadres op de link in de mail klikt. Zo kan niemand een ander adres zomaar inschrijven.
export async function inschrijvenOpNieuwsbrief(input: {
  email: string;
  provincie: string | null;
  taal: "nl" | "fr";
}): Promise<NieuwsbriefResultaat> {
  const parsed = nieuwsbriefSchema.safeParse(input);
  if (!parsed.success) {
    return { succes: false, fout: "ongeldige_invoer" };
  }
  if (!(await magFormulierIndienen("nieuwsbrief", 10))) return { succes: false, fout: "te_veel" };

  const service = createServiceRoleClient();
  const { email, provincie, taal } = parsed.data;

  // Bestaat het adres al? Dan nooit iets onthullen: bevestigd = stil gelukt, onbevestigd = bevestigingsmail opnieuw.
  const bestaand = await service.from("nieuwsbrief").select("bevestigd, bevestig_token").ilike("email", email).maybeSingle();
  if (!bestaand.error && bestaand.data) {
    if (!bestaand.data.bevestigd) await stuurBevestiging(email, bestaand.data.bevestig_token as string, taal);
    return { succes: true };
  }

  const { data, error } = await service
    .from("nieuwsbrief")
    .insert({ email, provincie: provincie ?? null, taal, actief: false, bevestigd: false })
    .select("bevestig_token")
    .single();

  if (error) {
    if (error.code === "23505") return { succes: true };
    if (kolomOntbreekt(error)) {
      // Overgangsperiode vóór SQL 0069: zoals voorheen inschrijven (zonder bevestiging).
      const oud = await service.from("nieuwsbrief").insert({ email, provincie: provincie ?? null, taal, actief: true });
      if (oud.error && oud.error.code !== "23505") {
        console.error("Nieuwsbrief-inschrijving mislukt:", oud.error.message);
        return { succes: false, fout: "server_fout" };
      }
      return { succes: true };
    }
    console.error("Nieuwsbrief-inschrijving mislukt:", error.message);
    return { succes: false, fout: "server_fout" };
  }

  await stuurBevestiging(email, data.bevestig_token as string, taal);
  return { succes: true };
}

// De klik op de bevestigingslink.
export async function bevestigNieuwsbrief(token: string): Promise<NieuwsbriefResultaat> {
  if (!UUID.test(token)) return { succes: false, fout: "ongeldige_link" };
  const service = createServiceRoleClient();
  const { data, error } = await service
    .from("nieuwsbrief")
    .update({ bevestigd: true, actief: true, bevestigd_op: new Date().toISOString() })
    .eq("bevestig_token", token)
    .select("id");
  if (error) {
    console.error("Nieuwsbrief bevestigen mislukt:", error.message);
    return { succes: false, fout: "server_fout" };
  }
  return data && data.length > 0 ? { succes: true } : { succes: false, fout: "ongeldige_link" };
}
