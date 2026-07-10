"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { clubSchema } from "@/lib/validations";
import { getResendClient, AFZENDER } from "@/lib/resend";
import { MeldingNieuweClubEmail, meldingNieuweClubOnderwerp } from "@/lib/emails/melding-nieuwe-club";
import {
  BevestigingClubIndienerEmail,
  bevestigingClubIndienerOnderwerp,
} from "@/lib/emails/bevestiging-club-indiener";

export type ClubActieResultaat = { succes: true } | { succes: false; fout: string };

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.petanq.be";

export async function clubVoorstellen(
  input: unknown,
  taalFormulier: "nl" | "fr" = "nl"
): Promise<ClubActieResultaat> {
  const parsed = clubSchema.safeParse(input);
  if (!parsed.success) {
    return { succes: false, fout: "ongeldige_invoer" };
  }

  const supabase = createClient();
  const { error } = await supabase.from("clubs").insert({
    naam: parsed.data.naam,
    gemeente: parsed.data.gemeente,
    provincie: parsed.data.provincie,
    adres: parsed.data.adres || null,
    website: parsed.data.website || null,
    contact_email: parsed.data.contact_email || null,
    actief: false,
  });

  if (error) {
    console.error("Club voorstellen mislukt:", error.message);
    return { succes: false, fout: "server_fout" };
  }

  try {
    const resend = getResendClient();

    if (parsed.data.contact_email) {
      await resend.emails.send({
        from: AFZENDER,
        to: parsed.data.contact_email,
        subject: bevestigingClubIndienerOnderwerp(taalFormulier),
        react: BevestigingClubIndienerEmail({
          taal: taalFormulier,
          naam: parsed.data.naam,
          gemeente: parsed.data.gemeente,
        }),
      });
    }

    const serviceClient = createServiceRoleClient();
    const { data: moderatoren } = await serviceClient.from("moderatoren").select("email");
    const moderatorEmails = (moderatoren ?? []).map((m: { email: string }) => m.email);

    if (moderatorEmails.length > 0) {
      await resend.emails.send({
        from: AFZENDER,
        to: moderatorEmails,
        subject: meldingNieuweClubOnderwerp,
        react: MeldingNieuweClubEmail({
          naam: parsed.data.naam,
          gemeente: parsed.data.gemeente,
          beheerLink: `${siteUrl()}/beheer/clubs`,
        }),
      });
    }
  } catch (mailFout) {
    console.error("Meldingsmail voor nieuwe club versturen mislukt:", mailFout);
  }

  return { succes: true };
}
