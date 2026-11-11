"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth-helpers";
import { geocodeAdres } from "@/lib/geocode";
import { CLUBS_MOGEN_ZELF_BEHEREN } from "@/lib/club-beheer/instellingen";
import { getResendClient, AFZENDER } from "@/lib/resend";
import { siteUrl } from "@/lib/site-url";
import { MeldingClubWijzigingEmail, meldingClubWijzigingOnderwerp } from "@/lib/emails/melding-club-wijziging";
import { ClubVoorstelBezoekerEmail, clubVoorstelBezoekerOnderwerp } from "@/lib/emails/club-voorstel-bezoeker";
import {
  MAX_PER_CLUB_PER_DAG,
  MAX_PER_EMAIL_PER_DAG,
  MAX_WACHTEND_PER_CLUB,
  MIN_INVUL_MS,
  bezoekerVoorstelSchema,
} from "@/lib/club-beheer/bezoeker";
import {
  brusselsVandaag,
  gelijkeUren,
  heeftIngevuldeUren,
  voorstelSchema,
  type ClubGegevens,
  type ClubUren,
  type Voorstel,
} from "@/lib/club-beheer/uren";

export type ClubBeheerResultaat =
  | { succes: true; status?: "online" | "wachtend" | "geen_wijziging" }
  | { succes: false; fout: string };

export interface MijnClub {
  id: string;
  naam: string;
  gemeente: string;
  gegevens: ClubGegevens;
  openingsurenTekst: string | null;
  vertrouwd: boolean;
  uren: ClubUren | null;
  wachtend: Voorstel | null;
  vandaag: { soort: "dicht" | "extra"; reden: string } | null;
}

// Ontbrekende tabel (migratie 0066 nog niet uitgevoerd): Postgres 42P01 / PostgREST-schemacache.
function tabelOntbreekt(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    error.code === "42883" ||
    /club_uren|club_wijzigingen|club_bezoeker_voorstellen|club_vandaag|mag_club_beheren|vertrouwd/i.test(error.message ?? "")
  );
}

async function huidigeGebruikerId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

async function magClubBeheren(clubId: string): Promise<boolean> {
  if (await isAdmin()) return true;
  if (!CLUBS_MOGEN_ZELF_BEHEREN) return false; // clubs zelf zijn nog niet vrijgegeven
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("mag_club_beheren", { p_club: clubId });
  return !error && data === true;
}

// Welke clubs mag deze persoon beheren? Een gebruiker is aan één club gekoppeld; de admin kiest zelf.
export async function haalMijnClubId(gekozen?: string): Promise<string | null> {
  const userId = await huidigeGebruikerId();
  if (!userId) return null;
  if (await isAdmin()) return gekozen ?? null;
  if (!CLUBS_MOGEN_ZELF_BEHEREN) return null;

  // De lijst match13_gebruikers mag volgens de database-regels enkel de admin lezen. Met de gewone
  // sessie van de club zelf kwam er dus nooit een rij terug ("account niet aan een club gekoppeld").
  // Daarom zoeken we met de service-rol op, strikt beperkt tot het user_id van wie nu is ingelogd.
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("match13_gebruikers")
    .select("club_id")
    .eq("user_id", userId)
    .eq("actief", true)
    .not("club_id", "is", null)
    .limit(1)
    .maybeSingle();
  return (data?.club_id as string | undefined) ?? null;
}

export async function haalMijnClub(clubId: string): Promise<MijnClub | null> {
  if (!(await magClubBeheren(clubId))) return null;

  const supabase = await createClient();
  let { data: club, error } = await supabase
    .from("clubs")
    .select("id, naam, gemeente, adres, contact_email, telefoon, website, openingsuren, vertrouwd")
    .eq("id", clubId)
    .maybeSingle();
  if (error && tabelOntbreekt(error)) {
    const oud = await supabase
      .from("clubs")
      .select("id, naam, gemeente, adres, contact_email, telefoon, website, openingsuren")
      .eq("id", clubId)
      .maybeSingle();
    club = oud.data ? { ...oud.data, vertrouwd: false } : null;
  }
  if (!club) return null;

  const [urenRes, wachtRes, vandaagRes] = await Promise.all([
    supabase.from("club_uren").select("uren").eq("club_id", clubId).maybeSingle(),
    supabase.from("club_wijzigingen").select("voorstel").eq("club_id", clubId).eq("status", "wachtend").maybeSingle(),
    supabase.from("club_vandaag").select("soort, reden, datum").eq("club_id", clubId).maybeSingle(),
  ]);

  const vandaagRij = vandaagRes.data;
  return {
    id: club.id as string,
    naam: club.naam as string,
    gemeente: club.gemeente as string,
    gegevens: {
      adres: (club.adres as string | null) ?? "",
      contact_email: (club.contact_email as string | null) ?? "",
      telefoon: (club.telefoon as string | null) ?? "",
      website: (club.website as string | null) ?? "",
    },
    openingsurenTekst: (club.openingsuren as string | null) ?? null,
    vertrouwd: !!club.vertrouwd,
    uren: (urenRes.data?.uren as ClubUren | undefined) ?? null,
    wachtend: (wachtRes.data?.voorstel as Voorstel | undefined) ?? null,
    vandaag:
      vandaagRij && vandaagRij.datum === brusselsVandaag()
        ? { soort: vandaagRij.soort as "dicht" | "extra", reden: (vandaagRij.reden as string) ?? "" }
        : null,
  };
}

// Past een goedgekeurd voorstel toe: gegevens op de club zelf, uren in club_uren.
async function pasVoorstelToe(clubId: string, voorstel: Voorstel): Promise<{ fout?: string }> {
  const service = createServiceRoleClient();

  if (voorstel.gegevens && Object.keys(voorstel.gegevens).length > 0) {
    const update: Record<string, unknown> = {};
    for (const [sleutel, waarde] of Object.entries(voorstel.gegevens)) update[sleutel] = waarde === "" ? null : waarde;

    if (voorstel.gegevens.adres !== undefined) {
      const { data: huidig } = await service.from("clubs").select("gemeente, provincie").eq("id", clubId).single();
      const geocode = await geocodeAdres(
        voorstel.gegevens.adres || null,
        (huidig?.gemeente as string) ?? "",
        (huidig?.provincie as string) ?? ""
      );
      update.lat = geocode?.lat ?? null;
      update.lng = geocode?.lng ?? null;
      update.geocoded_provincie = geocode?.provincie ?? null;
    }
    const { error } = await service.from("clubs").update(update).eq("id", clubId);
    if (error) return { fout: error.message };
  }

  if (voorstel.uren) {
    const { error } = await service
      .from("club_uren")
      .upsert({ club_id: clubId, uren: voorstel.uren, bijgewerkt_op: new Date().toISOString() });
    if (error) return { fout: error.message };
  }

  revalidatePath("/clubs");
  return {};
}

// Laat de admin(s) per mail weten dat een voorstel wacht, zodat ze enkel nog moeten goedkeuren.
// Best-effort: een mislukte mail mag het indienen nooit laten mislukken.
async function meldAanAdmins(clubNaam: string, voorstel: Voorstel): Promise<void> {
  try {
    const service = createServiceRoleClient();
    const { data: admins } = await service.from("moderatoren").select("email").eq("rol", "admin");
    const naar = (admins ?? []).map((a) => a.email as string).filter(Boolean);
    if (naar.length === 0) return;
    const onderdelen = [voorstel.gegevens ? "gegevens" : null, voorstel.uren ? "openingsuren" : null].filter(Boolean) as string[];
    await getResendClient().emails.send({
      from: AFZENDER,
      to: naar,
      subject: meldingClubWijzigingOnderwerp(clubNaam),
      react: MeldingClubWijzigingEmail({ clubNaam, onderdelen, beheerLink: `${siteUrl()}/beheer/club-wijzigingen` }),
    });
  } catch (fout) {
    console.error("Melding aan admin over clubwijziging mislukt:", fout);
  }
}

// Een club stelt wijzigingen voor. Vertrouwde clubs (en de admin) staan meteen online,
// de rest wacht op goedkeuring (de oude gegevens blijven intussen zichtbaar).
export async function dienVoorstelIn(clubId: string, invoer: unknown): Promise<ClubBeheerResultaat> {
  if (!(await magClubBeheren(clubId))) return { succes: false, fout: "niet_geautoriseerd" };
  const userId = await huidigeGebruikerId();
  if (!userId) return { succes: false, fout: "niet_geautoriseerd" };

  const parsed = voorstelSchema.safeParse(invoer);
  if (!parsed.success) return { succes: false, fout: "ongeldige_invoer" };

  const huidig = await haalMijnClub(clubId);
  if (!huidig) return { succes: false, fout: "niet_gevonden" };

  // Enkel wat echt verschilt van wat er nu online staat.
  const voorstel: Voorstel = {};
  if (parsed.data.gegevens) {
    const gewijzigd: Partial<ClubGegevens> = {};
    for (const sleutel of ["adres", "contact_email", "telefoon", "website"] as const) {
      const nieuw = parsed.data.gegevens[sleutel];
      if (nieuw !== undefined && nieuw !== huidig.gegevens[sleutel]) gewijzigd[sleutel] = nieuw;
    }
    if (Object.keys(gewijzigd).length > 0) voorstel.gegevens = gewijzigd;
  }
  if (parsed.data.uren && !gelijkeUren(parsed.data.uren, huidig.uren)) voorstel.uren = parsed.data.uren;

  const service = createServiceRoleClient();
  const wachtendeVerwijderen = () => service.from("club_wijzigingen").delete().eq("club_id", clubId).eq("status", "wachtend");

  if (!voorstel.gegevens && !voorstel.uren) {
    await wachtendeVerwijderen(); // alles terug zoals het online staat: een eerder voorstel vervalt
    revalidatePath("/beheer/mijn-club");
    return { succes: true, status: "geen_wijziging" };
  }

  if (huidig.vertrouwd || (await isAdmin())) {
    const { fout } = await pasVoorstelToe(clubId, voorstel);
    if (fout) return { succes: false, fout: "opslaan_mislukt" };
    await wachtendeVerwijderen();
    revalidatePath("/beheer/mijn-club");
    return { succes: true, status: "online" };
  }

  const { error: wisFout } = await wachtendeVerwijderen();
  if (wisFout) return { succes: false, fout: tabelOntbreekt(wisFout) ? "nog_niet_beschikbaar" : "opslaan_mislukt" };
  const { error } = await service.from("club_wijzigingen").insert({ club_id: clubId, ingediend_door: userId, voorstel });
  if (error) return { succes: false, fout: "opslaan_mislukt" };

  revalidatePath("/beheer/mijn-club");
  revalidatePath("/beheer/club-wijzigingen");
  await meldAanAdmins(huidig.naam, voorstel);
  return { succes: true, status: "wachtend" };
}

// "Vandaag gesloten" / "vandaag extra open": staat meteen online, geldt tot middernacht (Belgische tijd).
export async function zetVandaag(clubId: string, soort: "dicht" | "extra", reden: string): Promise<ClubBeheerResultaat> {
  if (!(await magClubBeheren(clubId))) return { succes: false, fout: "niet_geautoriseerd" };
  if (soort !== "dicht" && soort !== "extra") return { succes: false, fout: "ongeldige_invoer" };
  const schoneReden = reden.trim().slice(0, 60);
  if (/https?:|www\./i.test(schoneReden)) return { succes: false, fout: "ongeldige_invoer" };

  const service = createServiceRoleClient();
  const { error } = await service.from("club_vandaag").upsert({
    club_id: clubId,
    datum: brusselsVandaag(),
    soort,
    reden: schoneReden,
    ingesteld_door: await huidigeGebruikerId(),
    ingesteld_op: new Date().toISOString(),
  });
  if (error) return { succes: false, fout: tabelOntbreekt(error) ? "nog_niet_beschikbaar" : "opslaan_mislukt" };

  revalidatePath("/clubs");
  revalidatePath("/beheer/mijn-club");
  return { succes: true };
}

export async function wisVandaag(clubId: string): Promise<ClubBeheerResultaat> {
  if (!(await magClubBeheren(clubId))) return { succes: false, fout: "niet_geautoriseerd" };
  const service = createServiceRoleClient();
  const { error } = await service.from("club_vandaag").delete().eq("club_id", clubId);
  if (error && !tabelOntbreekt(error)) return { succes: false, fout: "opslaan_mislukt" };
  revalidatePath("/clubs");
  revalidatePath("/beheer/mijn-club");
  return { succes: true };
}

// ---- Admin: voorstellen nakijken ----------------------------------------------

export interface TeKeurenWijziging {
  id: string;
  // "account": voorstel van een ingelogde club; "bezoeker": voorstel van iemand zonder account.
  bron: "account" | "bezoeker";
  clubId: string;
  clubNaam: string;
  ingediendOp: string;
  voorstel: Voorstel;
  huidigeGegevens: ClubGegevens;
  huidigeUren: ClubUren | null;
  vertrouwd: boolean;
  indiener: { naam: string; email: string } | null;
}

export async function haalTeKeuren(): Promise<TeKeurenWijziging[]> {
  if (!(await isAdmin())) return [];
  const supabase = await createClient();
  const service = createServiceRoleClient();
  const [accountRes, bezoekerRes] = await Promise.all([
    supabase
      .from("club_wijzigingen")
      .select("id, club_id, ingediend_op, voorstel")
      .eq("status", "wachtend")
      .order("ingediend_op", { ascending: true }),
    // Enkel de service-rol leest deze tabel (bevat e-mailadressen). Ontbreekt de tabel nog: gewoon leeg.
    service
      .from("club_bezoeker_voorstellen")
      .select("id, club_id, ingediend_op, voorstel, indiener_naam, indiener_email")
      .eq("status", "wachtend")
      .order("ingediend_op", { ascending: true }),
  ]);
  const accountRijen = accountRes.error ? [] : accountRes.data ?? [];
  const bezoekerRijen = bezoekerRes.error ? [] : bezoekerRes.data ?? [];
  if (accountRijen.length === 0 && bezoekerRijen.length === 0) return [];

  const ids = Array.from(new Set([...accountRijen, ...bezoekerRijen].map((r) => r.club_id as string)));
  const [clubsRes, urenRes] = await Promise.all([
    supabase.from("clubs").select("id, naam, adres, contact_email, telefoon, website, vertrouwd").in("id", ids),
    supabase.from("club_uren").select("club_id, uren").in("club_id", ids),
  ]);
  const clubs = new Map((clubsRes.data ?? []).map((c) => [c.id as string, c]));
  const uren = new Map((urenRes.data ?? []).map((u) => [u.club_id as string, u.uren as ClubUren]));

  function maak(
    r: { id: unknown; club_id: unknown; ingediend_op: unknown; voorstel: unknown },
    bron: "account" | "bezoeker",
    indiener: { naam: string; email: string } | null
  ): TeKeurenWijziging {
    const club = clubs.get(r.club_id as string);
    return {
      id: r.id as string,
      bron,
      clubId: r.club_id as string,
      clubNaam: (club?.naam as string) ?? "(onbekende club)",
      ingediendOp: r.ingediend_op as string,
      voorstel: r.voorstel as Voorstel,
      huidigeGegevens: {
        adres: (club?.adres as string | null) ?? "",
        contact_email: (club?.contact_email as string | null) ?? "",
        telefoon: (club?.telefoon as string | null) ?? "",
        website: (club?.website as string | null) ?? "",
      },
      huidigeUren: uren.get(r.club_id as string) ?? null,
      vertrouwd: !!club?.vertrouwd,
      indiener,
    };
  }

  return [
    ...accountRijen.map((r) => maak(r, "account", null)),
    ...bezoekerRijen.map((r) =>
      maak(r, "bezoeker", { naam: (r.indiener_naam as string) ?? "", email: (r.indiener_email as string) ?? "" })
    ),
  ].sort((a, b) => a.ingediendOp.localeCompare(b.ingediendOp));
}

export async function telTeKeuren(): Promise<number> {
  if (!(await isAdmin())) return 0;
  const supabase = await createClient();
  const service = createServiceRoleClient();
  const [account, bezoeker] = await Promise.all([
    supabase.from("club_wijzigingen").select("id", { count: "exact", head: true }).eq("status", "wachtend"),
    service.from("club_bezoeker_voorstellen").select("id", { count: "exact", head: true }).eq("status", "wachtend"),
  ]);
  return (account.error ? 0 : account.count ?? 0) + (bezoeker.error ? 0 : bezoeker.count ?? 0);
}

export async function keurWijzigingGoed(id: string): Promise<ClubBeheerResultaat> {
  if (!(await isAdmin())) return { succes: false, fout: "niet_geautoriseerd" };
  const supabase = await createClient();
  const { data: rij } = await supabase
    .from("club_wijzigingen")
    .select("club_id, voorstel, status")
    .eq("id", id)
    .maybeSingle();
  if (!rij || rij.status !== "wachtend") return { succes: false, fout: "niet_gevonden" };

  // Het voorstel is bij het indienen al gecontroleerd; voor de zekerheid nog eens voor het online komt.
  const parsed = voorstelSchema.safeParse(rij.voorstel);
  if (!parsed.success) return { succes: false, fout: "ongeldige_invoer" };

  const { fout } = await pasVoorstelToe(rij.club_id as string, parsed.data);
  if (fout) return { succes: false, fout: "opslaan_mislukt" };

  await supabase
    .from("club_wijzigingen")
    .update({ status: "goedgekeurd", behandeld_op: new Date().toISOString(), behandeld_door: await huidigeGebruikerId() })
    .eq("id", id);
  revalidatePath("/beheer/club-wijzigingen");
  revalidatePath("/beheer/mijn-club");
  return { succes: true };
}

export async function wijsWijzigingAf(id: string, reden: string): Promise<ClubBeheerResultaat> {
  if (!(await isAdmin())) return { succes: false, fout: "niet_geautoriseerd" };
  const supabase = await createClient();
  const { error } = await supabase
    .from("club_wijzigingen")
    .update({
      status: "afgewezen",
      reden_afwijzing: reden.trim().slice(0, 300) || null,
      behandeld_op: new Date().toISOString(),
      behandeld_door: await huidigeGebruikerId(),
    })
    .eq("id", id)
    .eq("status", "wachtend");
  if (error) return { succes: false, fout: "opslaan_mislukt" };
  revalidatePath("/beheer/club-wijzigingen");
  revalidatePath("/beheer/mijn-club");
  return { succes: true };
}

// Een vertrouwde club staat met haar wijzigingen meteen online (geen controle meer door de admin).
export async function zetClubVertrouwd(clubId: string, vertrouwd: boolean): Promise<ClubBeheerResultaat> {
  if (!(await isAdmin())) return { succes: false, fout: "niet_geautoriseerd" };
  const supabase = await createClient();
  const { error } = await supabase.from("clubs").update({ vertrouwd }).eq("id", clubId);
  if (error) return { succes: false, fout: tabelOntbreekt(error) ? "nog_niet_beschikbaar" : "opslaan_mislukt" };
  revalidatePath("/beheer/club-wijzigingen");
  return { succes: true };
}

// ── Voorstellen van bezoekers (zonder account) ─────────────────────────────────

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Best-effort: een mislukte mail mag het indienen of behandelen nooit laten mislukken.
async function mailBezoeker(
  naar: string,
  taal: "nl" | "fr",
  clubNaam: string,
  soort: "ontvangen" | "goedgekeurd" | "afgewezen",
  reden?: string
): Promise<void> {
  if (!naar) return;
  try {
    await getResendClient().emails.send({
      from: AFZENDER,
      to: naar,
      subject: clubVoorstelBezoekerOnderwerp(taal, soort),
      react: ClubVoorstelBezoekerEmail({ taal, clubNaam, soort, reden }),
    });
  } catch (fout) {
    console.error("Mail aan indiener van clubvoorstel mislukt:", fout);
  }
}

// Iedereen mag een aanpassing voorstellen voor de gegevens of openingsuren van een club, zonder account.
// Er komt NOOIT iets rechtstreeks online: het voorstel wacht tot de admin het goedkeurt.
export async function dienBezoekerVoorstelIn(clubId: string, invoer: unknown): Promise<ClubBeheerResultaat> {
  if (!UUID.test(clubId)) return { succes: false, fout: "niet_gevonden" };
  const parsed = bezoekerVoorstelSchema.safeParse(invoer);
  if (!parsed.success) return { succes: false, fout: "ongeldige_invoer" };
  const p = parsed.data;

  // Robots: doen alsof het gelukt is, zonder iets op te slaan.
  if (p.website_bevestig) return { succes: true, status: "wachtend" };
  if (p.startMs !== undefined && Date.now() - p.startMs < MIN_INVUL_MS) return { succes: true, status: "wachtend" };

  const service = createServiceRoleClient();
  const { data: club } = await service
    .from("clubs")
    .select("id, naam, adres, contact_email, telefoon, website, actief, verwijderd_op")
    .eq("id", clubId)
    .maybeSingle();
  if (!club || !club.actief || club.verwijderd_op) return { succes: false, fout: "niet_gevonden" };
  const { data: urenRij } = await service.from("club_uren").select("uren").eq("club_id", clubId).maybeSingle();
  const huidigeUren = (urenRij?.uren as ClubUren | undefined) ?? null;

  // Enkel wat echt verschilt van wat er nu online staat.
  const huidigeGegevens: ClubGegevens = {
    adres: (club.adres as string | null) ?? "",
    contact_email: (club.contact_email as string | null) ?? "",
    telefoon: (club.telefoon as string | null) ?? "",
    website: (club.website as string | null) ?? "",
  };
  const voorstel: Voorstel = {};
  if (p.voorstel.gegevens) {
    const gewijzigd: Partial<ClubGegevens> = {};
    for (const sleutel of ["adres", "contact_email", "telefoon", "website"] as const) {
      const nieuw = p.voorstel.gegevens[sleutel];
      if (nieuw !== undefined && nieuw !== huidigeGegevens[sleutel]) gewijzigd[sleutel] = nieuw;
    }
    if (Object.keys(gewijzigd).length > 0) voorstel.gegevens = gewijzigd;
  }
  // Heeft de club nog geen uren en is het "voorstel" een leeg schema (alles gesloten), dan is dat geen wijziging.
  if (p.voorstel.uren && !gelijkeUren(p.voorstel.uren, huidigeUren) && (huidigeUren || heeftIngevuldeUren(p.voorstel.uren))) {
    voorstel.uren = p.voorstel.uren;
  }
  if (!voorstel.gegevens && !voorstel.uren) return { succes: true, status: "geen_wijziging" };

  // Grenzen tegen misbruik: per club per dag, openstaande voorstellen per club, en per e-mailadres per dag.
  const sinds = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const email = p.email.toLowerCase();
  const [perClub, wachtend, perMail] = await Promise.all([
    service.from("club_bezoeker_voorstellen").select("id", { count: "exact", head: true }).eq("club_id", clubId).gte("ingediend_op", sinds),
    service.from("club_bezoeker_voorstellen").select("id", { count: "exact", head: true }).eq("club_id", clubId).eq("status", "wachtend"),
    service.from("club_bezoeker_voorstellen").select("id", { count: "exact", head: true }).eq("indiener_email", email).gte("ingediend_op", sinds),
  ]);
  const telFout = perClub.error ?? wachtend.error ?? perMail.error;
  if (telFout) return { succes: false, fout: tabelOntbreekt(telFout) ? "nog_niet_beschikbaar" : "opslaan_mislukt" };
  if ((perClub.count ?? 0) >= MAX_PER_CLUB_PER_DAG || (wachtend.count ?? 0) >= MAX_WACHTEND_PER_CLUB || (perMail.count ?? 0) >= MAX_PER_EMAIL_PER_DAG) {
    return { succes: false, fout: "te_veel" };
  }

  const { error } = await service
    .from("club_bezoeker_voorstellen")
    .insert({ club_id: clubId, voorstel, indiener_naam: p.naam, indiener_email: email, taal: p.taal });
  if (error) return { succes: false, fout: tabelOntbreekt(error) ? "nog_niet_beschikbaar" : "opslaan_mislukt" };

  revalidatePath("/beheer/club-wijzigingen");
  await mailBezoeker(email, p.taal, club.naam as string, "ontvangen");
  await meldAanAdmins(club.naam as string, voorstel);
  return { succes: true, status: "wachtend" };
}

export async function keurBezoekerVoorstelGoed(id: string): Promise<ClubBeheerResultaat> {
  if (!(await isAdmin())) return { succes: false, fout: "niet_geautoriseerd" };
  const service = createServiceRoleClient();
  const { data: rij } = await service
    .from("club_bezoeker_voorstellen")
    .select("club_id, voorstel, status, indiener_email, taal")
    .eq("id", id)
    .maybeSingle();
  if (!rij || rij.status !== "wachtend") return { succes: false, fout: "niet_gevonden" };

  // Voor de zekerheid nog eens controleren voor het online komt.
  const parsed = voorstelSchema.safeParse(rij.voorstel);
  if (!parsed.success) return { succes: false, fout: "ongeldige_invoer" };

  const { fout } = await pasVoorstelToe(rij.club_id as string, parsed.data);
  if (fout) return { succes: false, fout: "opslaan_mislukt" };

  const { data: club } = await service.from("clubs").select("naam").eq("id", rij.club_id).maybeSingle();
  await service
    .from("club_bezoeker_voorstellen")
    .update({
      status: "goedgekeurd",
      behandeld_op: new Date().toISOString(),
      behandeld_door: await huidigeGebruikerId(),
      indiener_email: "", // niet langer bewaren nu het voorstel behandeld is
    })
    .eq("id", id);
  await mailBezoeker(rij.indiener_email as string, (rij.taal as "nl" | "fr") ?? "nl", (club?.naam as string) ?? "", "goedgekeurd");
  revalidatePath("/beheer/club-wijzigingen");
  return { succes: true };
}

export async function wijsBezoekerVoorstelAf(id: string, reden: string): Promise<ClubBeheerResultaat> {
  if (!(await isAdmin())) return { succes: false, fout: "niet_geautoriseerd" };
  const service = createServiceRoleClient();
  const { data: rij } = await service
    .from("club_bezoeker_voorstellen")
    .select("club_id, status, indiener_email, taal")
    .eq("id", id)
    .maybeSingle();
  if (!rij || rij.status !== "wachtend") return { succes: false, fout: "niet_gevonden" };

  const schoneReden = reden.trim().slice(0, 300);
  const { data: club } = await service.from("clubs").select("naam").eq("id", rij.club_id).maybeSingle();
  const { error } = await service
    .from("club_bezoeker_voorstellen")
    .update({
      status: "afgewezen",
      reden_afwijzing: schoneReden || null,
      behandeld_op: new Date().toISOString(),
      behandeld_door: await huidigeGebruikerId(),
      indiener_email: "",
    })
    .eq("id", id)
    .eq("status", "wachtend");
  if (error) return { succes: false, fout: "opslaan_mislukt" };
  await mailBezoeker(rij.indiener_email as string, (rij.taal as "nl" | "fr") ?? "nl", (club?.naam as string) ?? "", "afgewezen", schoneReden || undefined);
  revalidatePath("/beheer/club-wijzigingen");
  return { succes: true };
}
