import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { Club, Idee, Moderator, Toernooi } from "@/lib/types";
import { CLUB_PUBLIEK, TOERNOOI_PUBLIEK } from "@/lib/kolommen";

export async function getGoedgekeurdeToernooien(): Promise<Toernooi[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("toernooien")
    .select(TOERNOOI_PUBLIEK)
    .eq("status", "goedgekeurd")
    .is("verwijderd_op", null)
    .order("datum", { ascending: true })
    .order("uur", { ascending: true });

  if (error) {
    console.error("Kon toernooien niet ophalen:", error.message);
    return [];
  }
  return data as unknown as Toernooi[];
}

export async function getToernooiById(id: string): Promise<Toernooi | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("toernooien")
    .select(TOERNOOI_PUBLIEK)
    .eq("id", id)
    .eq("status", "goedgekeurd")
    .is("verwijderd_op", null)
    .single();

  if (error) return null;
  return data as unknown as Toernooi;
}

export async function getInBehandelingToernooien(): Promise<Toernooi[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("toernooien")
    .select("*")
    .eq("status", "in_behandeling")
    .order("aangemaakt_op", { ascending: true });

  if (error) {
    console.error("Kon toernooien in behandeling niet ophalen:", error.message);
    return [];
  }
  return data as Toernooi[];
}

export async function getAlleGoedgekeurdeToernooienVoorBeheer(): Promise<Toernooi[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("toernooien")
    .select("*")
    .eq("status", "goedgekeurd")
    .is("verwijderd_op", null)
    .order("datum", { ascending: false });

  if (error) {
    console.error("Kon toernooien niet ophalen:", error.message);
    return [];
  }
  return data as Toernooi[];
}

export async function getAlleClubsVoorBeheer(): Promise<Club[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clubs")
    .select("*")
    .is("verwijderd_op", null)
    .order("naam", { ascending: true });

  if (error) {
    console.error("Kon clubs niet ophalen:", error.message);
    return [];
  }
  return data as Club[];
}

export async function getVerwijderAanvragenToernooien(): Promise<Toernooi[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("toernooien")
    .select("*")
    .not("verwijder_aanvraag_op", "is", null)
    .is("verwijderd_op", null)
    .order("verwijder_aanvraag_op", { ascending: true });

  if (error) {
    console.error("Kon verwijderaanvragen (toernooien) niet ophalen:", error.message);
    return [];
  }
  return data as Toernooi[];
}

export async function getVerwijderAanvragenClubs(): Promise<Club[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clubs")
    .select("*")
    .not("verwijder_aanvraag_op", "is", null)
    .is("verwijderd_op", null)
    .order("verwijder_aanvraag_op", { ascending: true });

  if (error) {
    console.error("Kon verwijderaanvragen (clubs) niet ophalen:", error.message);
    return [];
  }
  return data as Club[];
}

export async function getWachtendeClubs(): Promise<Club[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clubs")
    .select("*")
    .eq("actief", false)
    .order("aangemaakt_op", { ascending: true });

  if (error) {
    console.error("Kon wachtende clubs niet ophalen:", error.message);
    return [];
  }
  return data as Club[];
}

export async function getModeratoren(): Promise<Moderator[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("moderatoren").select("*").order("naam", { ascending: true });

  if (error) {
    console.error("Kon moderatoren niet ophalen:", error.message);
    return [];
  }
  return data as Moderator[];
}

export type ModeratorMetStatus = Moderator & { bevestigd: boolean };

export async function getModeratorenMetStatus(): Promise<ModeratorMetStatus[]> {
  const moderatoren = await getModeratoren();
  // "Actief" betekent hier: heeft effectief zelf een wachtwoord ingesteld en kan
  // dus echt inloggen — niet enkel dat de uitnodigingslink ooit werd geopend.
  return moderatoren.map((mod) => ({ ...mod, bevestigd: mod.wachtwoord_ingesteld }));
}

export async function getHuidigeModerator(): Promise<Moderator | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("moderatoren").select("*").eq("user_id", user.id).single();
  return (data as Moderator) ?? null;
}

export type BezoekStatistieken = { totaal: number; dezeMaand: number; vandaag: number };

export async function getBezoekStatistieken(): Promise<BezoekStatistieken> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.from("site_bezoeken").select("dag, aantal");

  if (error || !data) {
    console.error("Kon bezoekstatistieken niet ophalen:", error?.message);
    return { totaal: 0, dezeMaand: 0, vandaag: 0 };
  }

  const vandaagIso = new Date().toISOString().slice(0, 10);
  const huidigeMaand = vandaagIso.slice(0, 7);
  const totaal = data.reduce((som: number, rij: { dag: string; aantal: number }) => som + rij.aantal, 0);
  const dezeMaand = data
    .filter((rij: { dag: string; aantal: number }) => rij.dag.startsWith(huidigeMaand))
    .reduce((som: number, rij: { dag: string; aantal: number }) => som + rij.aantal, 0);
  const vandaag = data.find((rij: { dag: string; aantal: number }) => rij.dag === vandaagIso)?.aantal ?? 0;

  return { totaal, dezeMaand, vandaag };
}

export type BezoekPerDag = { dag: string; aantal: number };

export async function getBezoekenPerDag(aantalDagen: number): Promise<BezoekPerDag[]> {
  const supabase = createServiceRoleClient();
  const vanaf = new Date();
  vanaf.setDate(vanaf.getDate() - (aantalDagen - 1));
  const vanafIso = vanaf.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("site_bezoeken")
    .select("dag, aantal")
    .gte("dag", vanafIso)
    .order("dag", { ascending: true });

  if (error || !data) {
    console.error("Kon bezoeken per dag niet ophalen:", error?.message);
    return [];
  }

  // Ook dagen zonder bezoek tonen (aantal 0), zodat de reeks nooit gaten heeft.
  const perDag = new Map<string, number>(data.map((rij: BezoekPerDag) => [rij.dag, rij.aantal]));
  const reeks: BezoekPerDag[] = [];
  for (let i = 0; i < aantalDagen; i++) {
    const datum = new Date(vanaf);
    datum.setDate(vanaf.getDate() + i);
    const sleutel = datum.toISOString().slice(0, 10);
    reeks.push({ dag: sleutel, aantal: perDag.get(sleutel) ?? 0 });
  }
  return reeks;
}

export type BezoekPerProvincie = { provincie: string; aantal: number };

export async function getBezoekenPerProvincie(): Promise<BezoekPerProvincie[]> {
  const supabase = createServiceRoleClient();
  // Per bladzijde van 1000 ophalen: Supabase geeft anders maximaal 1000 rijen terug en dan klopt het totaal niet meer.
  const data = await haalAlleRijen<{ provincie: string; aantal: number }>("bezoeken_provincie", "provincie, aantal", [
    "dag",
    "provincie",
  ]);

  if (!data) {
    console.error("Kon bezoeken per provincie niet ophalen");
    return [];
  }

  const totalen = new Map<string, number>();
  for (const rij of data) {
    totalen.set(rij.provincie, (totalen.get(rij.provincie) ?? 0) + rij.aantal);
  }

  return Array.from(totalen.entries())
    .map(([provincie, aantal]) => ({ provincie, aantal }))
    .sort((a, b) => b.aantal - a.aantal);
}

export async function getPaginaBezoekTotaal(pad: string): Promise<number> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.from("pagina_bezoeken").select("aantal").eq("pad", pad);

  if (error || !data) {
    console.error("Kon paginabezoeken niet ophalen:", error?.message);
    return 0;
  }

  return data.reduce((som: number, rij: { aantal: number }) => som + rij.aantal, 0);
}

export type ToernooiStatistieken = {
  totaalGoedgekeurd: number;
  aanvragenDezeMaand: number;
  goedgekeurdDezeMaand: number;
  geweigerdDezeMaand: number;
  actieveClubs: number;
  perModerator: { naam: string; aantal: number; laatsteBezoek: string | null }[];
};

export async function getToernooiStatistieken(): Promise<ToernooiStatistieken> {
  const supabase = createServiceRoleClient();
  const maandStart = new Date();
  maandStart.setDate(1);
  maandStart.setHours(0, 0, 0, 0);
  const maandStartIso = maandStart.toISOString();

  const [totaalRes, aanvragenRes, goedgekeurdRes, geweigerdRes, clubsRes, perModeratorRes, moderatorenRes] =
    await Promise.all([
      supabase.from("toernooien").select("id", { count: "exact", head: true }).eq("status", "goedgekeurd").is("verwijderd_op", null),
      supabase.from("toernooien").select("id", { count: "exact", head: true }).gte("aangemaakt_op", maandStartIso),
      supabase
        .from("toernooien")
        .select("id", { count: "exact", head: true })
        .eq("status", "goedgekeurd")
        .is("verwijderd_op", null)
        .gte("goedgekeurd_op", maandStartIso),
      supabase
        .from("toernooien")
        .select("id", { count: "exact", head: true })
        .eq("status", "geweigerd")
        .gte("goedgekeurd_op", maandStartIso),
      supabase.from("clubs").select("id", { count: "exact", head: true }).eq("actief", true).is("verwijderd_op", null),
      supabase
        .from("toernooien")
        .select("goedgekeurd_door")
        .eq("status", "goedgekeurd")
        .is("verwijderd_op", null)
        .not("goedgekeurd_door", "is", null),
      supabase.from("moderatoren").select("naam, laatste_bezoek"),
    ]);

  // Start met alle vrijwilligers op 0, zodat ook wie nog niets goedkeurde
  // gewoon in de lijst verschijnt in plaats van stilzwijgend te ontbreken.
  const tellingen = new Map<string, number>();
  const laatsteBezoeken = new Map<string, string | null>();
  for (const mod of moderatorenRes.data ?? []) {
    const { naam, laatste_bezoek } = mod as { naam: string; laatste_bezoek: string | null };
    tellingen.set(naam, 0);
    laatsteBezoeken.set(naam, laatste_bezoek);
  }
  for (const rij of perModeratorRes.data ?? []) {
    const naam = (rij as { goedgekeurd_door: string }).goedgekeurd_door;
    tellingen.set(naam, (tellingen.get(naam) ?? 0) + 1);
  }
  const perModerator = Array.from(tellingen.entries())
    .map(([naam, aantal]) => ({ naam, aantal, laatsteBezoek: laatsteBezoeken.get(naam) ?? null }))
    .sort((a, b) => b.aantal - a.aantal);

  return {
    totaalGoedgekeurd: totaalRes.count ?? 0,
    aanvragenDezeMaand: aanvragenRes.count ?? 0,
    goedgekeurdDezeMaand: goedgekeurdRes.count ?? 0,
    geweigerdDezeMaand: geweigerdRes.count ?? 0,
    actieveClubs: clubsRes.count ?? 0,
    perModerator,
  };
}

export async function getAantalActieveModeratoren(): Promise<number> {
  const supabase = createServiceRoleClient();
  const { count, error } = await supabase
    .from("moderatoren")
    .select("id", { count: "exact", head: true })
    .eq("goedgekeurd", true);

  if (error) {
    console.error("Kon aantal moderatoren niet ophalen:", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function getActieveClubs(): Promise<Club[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clubs")
    .select(CLUB_PUBLIEK)
    .eq("actief", true)
    .is("verwijderd_op", null)
    .order("naam", { ascending: true });

  if (error) {
    console.error("Kon clubs niet ophalen:", error.message);
    return [];
  }
  return data as unknown as Club[];
}

export async function getIdeeen(): Promise<Idee[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ideeen")
    .select("*")
    .order("aangemaakt_op", { ascending: false });

  if (error) {
    console.error("Kon ideeën niet ophalen:", error.message);
    return [];
  }
  return data as Idee[];
}

// Haalt alle rijen van een tabel op, bladzijde per bladzijde (Supabase geeft standaard maar 1000 rijen terug).
// `volgorde` moet de hele sleutel van de tabel bevatten, zodat de bladzijden niet door elkaar lopen.
async function haalAlleRijen<T>(tabel: string, kolommen: string, volgorde: string[]): Promise<T[] | null> {
  const supabase = createServiceRoleClient();
  const alles: T[] = [];
  for (let van = 0; ; van += 1000) {
    let query = supabase.from(tabel).select(kolommen);
    for (const kolom of volgorde) query = query.order(kolom, { ascending: true });
    const { data, error } = await query.range(van, van + 999);
    if (error || !data) return null;
    alles.push(...(data as unknown as T[]));
    if (data.length < 1000) break;
  }
  return alles;
}

function datumKort(iso: string | null | undefined): string | null {
  return iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : null;
}

export type SleutelAantal = { sleutel: string; aantal: number };

export type BezoekKenmerken = {
  sinds: string | null;
  totaal: number;
  belgie: number;
  buitenland: number;
  onbekend: number;
  bots: number;
  talen: SleutelAantal[];
  landen: SleutelAantal[];
  provincies: SleutelAantal[];
};

function optellen(map: Map<string, number>, sleutel: string, aantal: number) {
  map.set(sleutel, (map.get(sleutel) ?? 0) + aantal);
}

function gesorteerd(map: Map<string, number>, max?: number): SleutelAantal[] {
  const lijst = Array.from(map.entries())
    .map(([sleutel, aantal]) => ({ sleutel, aantal }))
    .sort((a, b) => b.aantal - a.aantal);
  return max ? lijst.slice(0, max) : lijst;
}

// Wie bezoekt de site: Belgen, buitenland, onbekend en bots uit elkaar (tabel bezoeken_kenmerken, migratie 0067).
// Geeft null als de tabel nog niet bestaat.
export async function getBezoekKenmerken(): Promise<BezoekKenmerken | null> {
  const rijen = await haalAlleRijen<{
    dag: string;
    land: string;
    provincie: string;
    taal: string;
    bot: boolean;
    aantal: number;
  }>("bezoeken_kenmerken", "dag, land, provincie, taal, bot, aantal", ["dag", "land", "provincie", "taal", "bot"]);
  if (!rijen) return null;

  const talen = new Map<string, number>();
  const landen = new Map<string, number>();
  const provincies = new Map<string, number>();
  let belgie = 0;
  let buitenland = 0;
  let onbekend = 0;
  let bots = 0;
  let sinds: string | null = null;
  for (const r of rijen) {
    if (!sinds || r.dag < sinds) sinds = r.dag;
    if (r.bot) {
      bots += r.aantal;
      continue;
    }
    optellen(talen, r.taal, r.aantal);
    optellen(landen, r.land, r.aantal);
    if (r.land === "BE") {
      belgie += r.aantal;
      optellen(provincies, r.provincie, r.aantal);
    } else if (r.land === "onbekend") onbekend += r.aantal;
    else buitenland += r.aantal;
  }
  return {
    sinds: datumKort(sinds),
    totaal: belgie + buitenland + onbekend + bots,
    belgie,
    buitenland,
    onbekend,
    bots,
    talen: gesorteerd(talen),
    landen: gesorteerd(landen, 8),
    provincies: gesorteerd(provincies),
  };
}

export type ToernooiActies = {
  sinds: string | null;
  totalen: { actie: string; aantal: number }[];
  top: { id: string; naam: string; club: string; aantal: number }[];
};

// Doorklikken op tornooipagina's: totaal per soort en de tornooien met de meeste doorklikken
// (tabel toernooi_acties, migratie 0067). Geeft null als de tabel nog niet bestaat.
export async function getToernooiActies(): Promise<ToernooiActies | null> {
  const rijen = await haalAlleRijen<{ dag: string; toernooi_id: string; actie: string; aantal: number }>(
    "toernooi_acties",
    "dag, toernooi_id, actie, aantal",
    ["dag", "toernooi_id", "actie"]
  );
  if (!rijen) return null;

  const perActie = new Map<string, number>();
  const perToernooi = new Map<string, number>();
  let sinds: string | null = null;
  for (const r of rijen) {
    if (!sinds || r.dag < sinds) sinds = r.dag;
    optellen(perActie, r.actie, r.aantal);
    optellen(perToernooi, r.toernooi_id, r.aantal);
  }

  const topIds = gesorteerd(perToernooi, 8);
  const namen = new Map<string, { naam: string; club: string }>();
  if (topIds.length > 0) {
    const supabase = createServiceRoleClient();
    const { data } = await supabase
      .from("toernooien")
      .select("id, naam_nl, clubnaam")
      .in("id", topIds.map((t) => t.sleutel));
    for (const t of (data ?? []) as { id: string; naam_nl: string; clubnaam: string }[]) {
      namen.set(t.id, { naam: t.naam_nl, club: t.clubnaam });
    }
  }

  return {
    sinds: datumKort(sinds),
    totalen: gesorteerd(perActie).map((r) => ({ actie: r.sleutel, aantal: r.aantal })),
    top: topIds.map((r) => ({
      id: r.sleutel,
      naam: namen.get(r.sleutel)?.naam ?? "—",
      club: namen.get(r.sleutel)?.club ?? "",
      aantal: r.aantal,
    })),
  };
}
