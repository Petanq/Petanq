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
import { geocodeAdres } from "@/lib/geocode";
import { vindClubVoorTornooi } from "@/lib/club-koppelen";
import { lijktBuitenBelgie, type BuitenlandVermoeden } from "@/lib/buitenland";
import { laadPostcodes } from "@/lib/postcodes";

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

export type DubbelCheckVelden = {
  datum: string;
  categorie: string;
  formule: string;
  speelvorm: string;
  aantal_ronden: number | null;
  aantal_poules: number | null;
  club_id: string | null;
  clubnaam: string;
};

// Losstaand van toernooiIndienen zodat de client dit ook meteen na het
// scannen van een affiche kan aanroepen — vóór de indiener alle ontbrekende
// velden (adres, prijs, ...) manueel is gaan invullen. Zo niet, dan merkt de
// indiener pas bij het versturen dat het al een dubbel is, en heeft die voor
// niets tijd gestoken in het aanvullen van het formulier.
export async function checkDubbelToernooi(velden: DubbelCheckVelden): Promise<BestaandDubbelTornooi | null> {
  // Mensen dienen hetzelfde tornooi soms twee keer in met lichtjes andere
  // bewoording (typo, ander lidwoord, "Doublettes" vs "Doublettes Formées",
  // ...) — een exacte naam-vergelijking mist die dan. We vergelijken daarom
  // op de structurele velden (net als bij het herkennen van een herhalende
  // reeks affiches), niet op de vrije naamtekst. De service-role client is
  // nodig omdat een anonieme indiener via RLS geen nog-niet-goedgekeurde
  // tornooien mag lezen, maar we willen ook dubbels tussen twee "in
  // behandeling"-inzendingen tegenhouden, niet enkel tegen al goedgekeurde.
  //
  // Categorie "circuit" slaan we hier bewust over: die tornooien draaien
  // vaak een aparte Dames- en Herenreeks die verder exact dezelfde
  // club/datum/formule/rondes delen — enkel het volgnummer in de naam
  // maakt het verschil, en dat zit niet in een apart veld.
  if (velden.categorie === "circuit") return null;
  if (!velden.datum || !velden.categorie || !velden.formule || !velden.speelvorm || !velden.clubnaam.trim()) {
    return null;
  }

  const serviceClient = createServiceRoleClient();
  let dubbelCheck = serviceClient
    .from("toernooien")
    .select("naam_nl, naam_fr, datum, clubnaam, affiche_url")
    .eq("datum", velden.datum)
    .eq("categorie", velden.categorie)
    .eq("formule", velden.formule)
    .eq("speelvorm", velden.speelvorm)
    .is("verwijderd_op", null)
    .neq("status", "geweigerd");
  dubbelCheck =
    velden.speelvorm === "rondes"
      ? dubbelCheck.eq("aantal_ronden", velden.aantal_ronden ?? null)
      : dubbelCheck.eq("aantal_poules", velden.aantal_poules ?? null);
  dubbelCheck = velden.club_id
    ? dubbelCheck.eq("club_id", velden.club_id)
    : dubbelCheck.ilike("clubnaam", velden.clubnaam.trim());

  const { data: mogelijkeDubbels, error: dubbelFout } = await dubbelCheck.limit(1);
  if (dubbelFout) {
    console.error("Dubbel-check mislukt:", dubbelFout.message);
    return null;
  }
  return mogelijkeDubbels?.[0] ?? null;
}

// Typt de organisator de clubnaam zelf in (of negeert hij de suggestie), dan zoeken we de club zelf op:
// zo hangt het tornooi toch aan de juiste club (adres, uren, contact) en vangt de dubbel-check meer.
// Alleen bij een duidelijke match (zie lib/club-koppelen.ts); anders blijft het tornooi ongekoppeld
// en ziet de moderator een melding bij het nakijken.
async function zoekClubId(clubnaam: string, gemeente: string, adres: string | null): Promise<string | null> {
  try {
    const serviceClient = createServiceRoleClient();
    const { data: clubs } = await serviceClient
      .from("clubs")
      .select("id, naam, gemeente, adres")
      .eq("actief", true)
      .is("verwijderd_op", null)
      .limit(2000);
    return vindClubVoorTornooi({ clubnaam, gemeente, adres }, clubs ?? [])?.id ?? null;
  } catch (e) {
    console.error("Club zoeken mislukt:", e);
    return null;
  }
}

// Zachte controle voor het formulier: lijkt dit adres buiten België te liggen? Geeft enkel een waarschuwing
// terug, nooit een blokkade (er zijn veel spellingvarianten en deelgemeenten).
export async function controleerPlaats(adres: string, gemeente: string): Promise<BuitenlandVermoeden> {
  try {
    if (!gemeente.trim() && !adres.trim()) return null;
    return lijktBuitenBelgie(adres.slice(0, 200), gemeente.slice(0, 120), await laadPostcodes());
  } catch (e) {
    console.error("Plaatscontrole mislukt:", e);
    return null;
  }
}

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

  const clubId = data.club_id || (await zoekClubId(data.clubnaam, data.gemeente, data.adres || null));

  if (!negeerDubbelCheck) {
    const bestaand = await checkDubbelToernooi({
      datum: data.datum,
      categorie: data.categorie,
      formule: data.formule,
      speelvorm: data.speelvorm,
      aantal_ronden: data.aantal_ronden ?? null,
      aantal_poules: data.aantal_poules ?? null,
      club_id: clubId,
      clubnaam: data.clubnaam,
    });
    if (bestaand) {
      return { succes: false, fout: "dubbel_toernooi", bestaand };
    }

    // Tweede, ruimere controle: dezelfde club, dezelfde dag en dezelfde categorie is vrijwel altijd
    // hetzelfde tornooi, ook als formule of rondes anders zijn ingevuld.
    if (clubId && data.categorie !== "circuit") {
      const { data: zelfdeDag } = await createServiceRoleClient()
        .from("toernooien")
        .select("naam_nl, naam_fr, datum, clubnaam, affiche_url")
        .eq("club_id", clubId)
        .eq("datum", data.datum)
        .eq("categorie", data.categorie)
        .is("verwijderd_op", null)
        .neq("status", "geweigerd")
        .limit(1);
      if (zelfdeDag?.[0]) return { succes: false, fout: "dubbel_toernooi", bestaand: zelfdeDag[0] };
    }
  }

  // Best-effort: mislukt geocoding, dan slaan we gewoon zonder coördinaten
  // op — dat mag een inzending nooit laten mislukken.
  const geocode = await geocodeAdres(data.adres || null, data.gemeente, data.provincie);

  const supabase = await createClient();
  const { error } = await supabase.from("toernooien").insert({
    datum: data.datum,
    uur: data.uur,
    clubnaam: data.clubnaam,
    club_id: clubId,
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
    lat: geocode?.lat ?? null,
    lng: geocode?.lng ?? null,
    geocoded_provincie: geocode?.provincie ?? null,
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
