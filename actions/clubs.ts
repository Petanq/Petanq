"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { clubSchema } from "@/lib/validations";
import { getResendClient, AFZENDER } from "@/lib/resend";
import { MeldingNieuweClubEmail, meldingNieuweClubOnderwerp } from "@/lib/emails/melding-nieuwe-club";
import {
  BevestigingClubIndienerEmail,
  bevestigingClubIndienerOnderwerp,
} from "@/lib/emails/bevestiging-club-indiener";
import { siteUrl } from "@/lib/site-url";
import { heeftToegangTotProvincie } from "@/lib/moderator-toegang";
import { Provincie } from "@/lib/provincies";
import { geocodeAdres } from "@/lib/geocode";
import { magFormulierIndienen, magMailVersturenNaar } from "@/lib/formulier-limiet";

export type ClubActieResultaat = { succes: true } | { succes: false; fout: string };

export async function clubVoorstellen(
  input: unknown,
  taalFormulier: "nl" | "fr" = "nl"
): Promise<ClubActieResultaat> {
  const parsed = clubSchema.safeParse(input);
  if (!parsed.success) {
    return { succes: false, fout: "ongeldige_invoer" };
  }
  if (!(await magFormulierIndienen("club", 10))) return { succes: false, fout: "te_veel" };

  // Best-effort: mislukt geocoding, dan slaan we gewoon zonder coördinaten
  // op — dat mag een club-aanmelding nooit laten mislukken.
  const geocode = await geocodeAdres(parsed.data.adres || null, parsed.data.gemeente, parsed.data.provincie);

  // Inzenden gebeurt hier, aan de serverkant, zodat de controles en grenzen hierboven altijd gelden. De
  // status staat vast op "in_behandeling": een bezoeker kan nooit zelf iets goedkeuren. (De openbare
  // schrijfrechten in de databank zelf zijn met SQL 0070 gesloten.)
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("clubs").insert({
    naam: parsed.data.naam,
    gemeente: parsed.data.gemeente,
    provincie: parsed.data.provincie,
    adres: parsed.data.adres || null,
    website: parsed.data.website || null,
    contact_email: parsed.data.contact_email || null,
    ingediend_door: parsed.data.ingediend_door || null,
    actief: false,
    lat: geocode?.lat ?? null,
    lng: geocode?.lng ?? null,
    geocoded_provincie: geocode?.provincie ?? null,
  });

  if (error) {
    console.error("Club voorstellen mislukt:", error.message);
    return { succes: false, fout: "server_fout" };
  }

  try {
    const resend = getResendClient();

    if (parsed.data.contact_email && (await magMailVersturenNaar(parsed.data.contact_email))) {
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
    const { data: moderatoren } = await serviceClient
      .from("moderatoren")
      .select("email, rol, toegang_scope");
    const moderatorEmails = (moderatoren ?? [])
      .filter((m) =>
        heeftToegangTotProvincie(
          m.rol === "admin" ? "heel_belgie" : m.toegang_scope,
          parsed.data.provincie as Provincie
        )
      )
      .map((m) => m.email);

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
