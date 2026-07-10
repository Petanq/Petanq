"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { toernooiSchema } from "@/lib/validations";
import { getResendClient, AFZENDER } from "@/lib/resend";
import {
  BevestigingIndienerEmail,
  bevestigingIndienerOnderwerp,
} from "@/lib/emails/bevestiging-indiener";
import { MeldingModeratorEmail, meldingModeratorOnderwerp } from "@/lib/emails/melding-moderator";

export type ToernooiActieResultaat = { succes: true } | { succes: false; fout: string };

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.petanq.be";

export async function toernooiIndienen(
  input: unknown,
  taalFormulier: "nl" | "fr"
): Promise<ToernooiActieResultaat> {
  const parsed = toernooiSchema.safeParse(input);
  if (!parsed.success) {
    return { succes: false, fout: "ongeldige_invoer" };
  }
  const data = parsed.data;

  const supabase = createClient();
  const { data: nieuwToernooi, error } = await supabase
    .from("toernooien")
    .insert({
      datum: data.datum,
      uur: data.uur,
      clubnaam: data.clubnaam,
      naam_nl: data.naam_nl,
      naam_fr: data.naam_fr,
      gemeente: data.gemeente,
      provincie: data.provincie,
      categorie: data.categorie,
      formule: data.formule,
      speelvorm: data.speelvorm,
      aantal_ronden: data.speelvorm === "rondes" ? data.aantal_ronden ?? null : null,
      aantal_poules: data.speelvorm === "poules" ? data.aantal_poules ?? null : null,
      inschrijvingsprijs: data.gratis ? null : data.inschrijvingsprijs || null,
      gratis: data.gratis ?? false,
      max_ploegen: data.max_ploegen || null,
      contact_email: data.contact_email,
      link_inschrijving: data.link_inschrijving || null,
      opmerking: data.opmerking || null,
      affiche_url: data.affiche_url || null,
      open_toernooi: data.open_toernooi ?? false,
      finale: data.speelvorm === "rondes" ? data.finale ?? false : false,
      status: "in_behandeling",
      ingediend_door: data.contact_email,
    })
    .select()
    .single();

  if (error || !nieuwToernooi) {
    console.error("Toernooi indienen mislukt:", error?.message);
    if (error?.code === "23505") return { succes: false, fout: "dubbel_toernooi" };
    return { succes: false, fout: "server_fout" };
  }

  // E-mails zijn best-effort: een mail-fout mag het indienen niet ongedaan maken.
  try {
    const resend = getResendClient();
    const naam = taalFormulier === "fr" ? data.naam_fr : data.naam_nl;

    await resend.emails.send({
      from: AFZENDER,
      to: data.contact_email,
      subject: bevestigingIndienerOnderwerp(taalFormulier),
      react: BevestigingIndienerEmail({
        taal: taalFormulier,
        naam,
        datum: data.datum,
        gemeente: data.gemeente,
      }),
    });

    const serviceClient = createServiceRoleClient();
    const { data: moderatoren } = await serviceClient.from("moderatoren").select("email");
    const moderatorEmails = (moderatoren ?? []).map((m: { email: string }) => m.email);

    if (moderatorEmails.length > 0) {
      await resend.emails.send({
        from: AFZENDER,
        to: moderatorEmails,
        subject: meldingModeratorOnderwerp,
        react: MeldingModeratorEmail({
          naam: data.naam_nl,
          clubnaam: data.clubnaam,
          datum: data.datum,
          gemeente: data.gemeente,
          beheerLink: `${siteUrl()}/beheer`,
        }),
      });
    }
  } catch (mailFout) {
    console.error("E-mail versturen mislukt na toernooi-indiening:", mailFout);
  }

  return { succes: true };
}
