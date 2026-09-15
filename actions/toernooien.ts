"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { toernooiSchema } from "@/lib/validations";
import { getResendClient, AFZENDER } from "@/lib/resend";
import {
  BevestigingIndienerEmail,
  bevestigingIndienerOnderwerp,
} from "@/lib/emails/bevestiging-indiener";
import { MeldingModeratorEmail, meldingModeratorOnderwerp } from "@/lib/emails/melding-moderator";
import { siteUrl } from "@/lib/site-url";
import { heeftToegangTotProvincie } from "@/lib/moderator-toegang";
import { Provincie } from "@/lib/provincies";

export type BestaandDubbelTornooi = {
  naam_nl: string;
  naam_fr: string;
  datum: string;
  clubnaam: string;
  affiche_url: string | null;
};

export type ToernooiActieResultaat =
  | { succes: true }
  | { succes: false; fout: string; bestaand?: BestaandDubbelTornooi };

export async function toernooiIndienen(
  input: unknown,
  taalFormulier: "nl" | "fr",
  negeerDubbelCheck?: boolean
): Promise<ToernooiActieResultaat> {
  const parsed = toernooiSchema.safeParse(input);
  if (!parsed.success) {
    return { succes: false, fout: "ongeldige_invoer" };
  }
  const data = parsed.data;
  const kwalificatiedata = (data.kwalificatiedata ?? [])
    .filter((k) => k.datum)
    .map((k) => ({ datum: k.datum, uur: k.uur || null, opmerking: k.opmerking || null }));

  // Mensen dienen hetzelfde tornooi soms twee keer in met lichtjes andere
  // bewoording (typo, ander lidwoord, "Doublettes" vs "Doublettes Formées",
  // ...) — een exacte naam-vergelijking mist die dan. We vergelijken daarom
  // op de structurele velden (net als bij het herkennen van een herhalende
  // reeks affiches), niet op de vrije naamtekst. De service-role client is
  // nodig omdat een anonieme indiener via RLS geen nog-niet-goedgekeurde
  // tornooien mag lezen, maar we willen ook dubbels tussen twee "in
  // behandeling"-inzendingen tegenhouden, niet enkel tegen al goedgekeurde.
  if (!negeerDubbelCheck) {
    const serviceClient = createServiceRoleClient();
    let dubbelCheck = serviceClient
      .from("toernooien")
      .select("naam_nl, naam_fr, datum, clubnaam, affiche_url")
      .eq("datum", data.datum)
      .eq("categorie", data.categorie)
      .eq("formule", data.formule)
      .eq("speelvorm", data.speelvorm)
      .is("verwijderd_op", null)
      .neq("status", "geweigerd");
    dubbelCheck =
      data.speelvorm === "rondes"
        ? dubbelCheck.eq("aantal_ronden", data.aantal_ronden ?? null)
        : dubbelCheck.eq("aantal_poules", data.aantal_poules ?? null);
    dubbelCheck = data.club_id
      ? dubbelCheck.eq("club_id", data.club_id)
      : dubbelCheck.ilike("clubnaam", data.clubnaam.trim());

    const { data: mogelijkeDubbels, error: dubbelFout } = await dubbelCheck.limit(1);
    if (dubbelFout) console.error("Dubbel-check mislukt:", dubbelFout.message);
    if (mogelijkeDubbels && mogelijkeDubbels.length > 0) {
      return { succes: false, fout: "dubbel_toernooi", bestaand: mogelijkeDubbels[0] };
    }
  }

  const supabase = await createClient();
  const { error } = await supabase.from("toernooien").insert({
    datum: data.datum,
    uur: data.uur,
    clubnaam: data.clubnaam,
    club_id: data.club_id || null,
    naam_nl: data.naam_nl,
    naam_fr: data.naam_fr,
    gemeente: data.gemeente,
    adres: data.adres || null,
    provincie: data.provincie,
    categorie: data.categorie,
    formule: data.formule,
    speelvorm: data.speelvorm,
    aantal_ronden: data.speelvorm === "rondes" ? data.aantal_ronden ?? null : null,
    aantal_poules: data.speelvorm === "poules" ? data.aantal_poules ?? null : null,
    inschrijvingsprijs: data.gratis ? null : data.inschrijvingsprijs || null,
    gratis: data.gratis ?? false,
    max_ploegen: data.max_ploegen || null,
    contact_email: data.contact_email || null,
    link_inschrijving: data.link_inschrijving || null,
    opmerking: data.opmerking || null,
    affiche_url: data.affiche_url || null,
    open_toernooi: data.open_toernooi ?? false,
    finale: data.speelvorm === "rondes" ? data.finale ?? false : false,
    kwalificatiedata: kwalificatiedata.length ? kwalificatiedata : null,
    kwalificatie_uur: data.kwalificatie_uur || null,
    status: "in_behandeling",
    ingediend_door: data.ingediend_door || null,
  });

  // Let op: geen .select() na deze insert — de indiener (anoniem/publiek) mag
  // een "in_behandeling"-toernooi zelf niet meteen terug uitlezen (RLS-select
  // staat enkel goedgekeurde toernooien toe), dus een .select() hier zou de
  // hele insert laten mislukken met een row-level-security-foutmelding.
  if (error) {
    console.error("Toernooi indienen mislukt:", error.message);
    if (error.code === "23505") return { succes: false, fout: "dubbel_toernooi" };
    return { succes: false, fout: "server_fout" };
  }

  // E-mails zijn best-effort: een mail-fout mag het indienen niet ongedaan maken.
  try {
    const resend = getResendClient();
    const naam = taalFormulier === "fr" ? data.naam_fr : data.naam_nl;

    if (data.contact_email) {
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
    }

    const serviceClient = createServiceRoleClient();
    const { data: moderatoren } = await serviceClient
      .from("moderatoren")
      .select("email, rol, toegang_scope");
    const moderatorEmails = (moderatoren ?? [])
      .filter((m) =>
        heeftToegangTotProvincie(
          m.rol === "admin" ? "heel_belgie" : m.toegang_scope,
          data.provincie as Provincie
        )
      )
      .map((m) => m.email);

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
