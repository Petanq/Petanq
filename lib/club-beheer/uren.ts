import { z } from "zod";

// Openingsuren die een club zelf beheert. Twee weekschema's (zomer 1 april - 30 september,
// winter 1 oktober - 31 maart), tijdelijke afwijkingen en per dag een soort + korte opmerking.

export const DAG_SOORTEN = ["open", "competitie", "leden", "tornooi"] as const;
export type DagSoort = (typeof DAG_SOORTEN)[number];

export interface DagUren {
  open: boolean;
  van: string; // "13:30"
  tot: string; // "19:00" (mag na middernacht, bv. "01:00")
  soort: DagSoort;
  notitie: string;
}

export interface Afwijking {
  van: string; // ISO-datum, bv. "2026-12-24"
  tot: string; // ISO-datum, inclusief
  tekst: string;
}

export interface ClubUren {
  zomer: DagUren[]; // 7 dagen, maandag eerst
  winter: DagUren[];
  afwijkingen: Afwijking[];
}

export interface ClubGegevens {
  adres: string;
  contact_email: string;
  telefoon: string;
  website: string;
}

// Wat een club indient: enkel wat ze wil wijzigen.
export interface Voorstel {
  gegevens?: Partial<ClubGegevens>;
  uren?: ClubUren;
}

export const DAG_NAMEN_NL = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"] as const;
export const DAG_NAMEN_FR = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"] as const;

export const MAX_NOTITIE = 60;
export const MAX_AFWIJKING_TEKST = 80;
export const MAX_AFWIJKINGEN = 6;

export function leegeDag(): DagUren {
  return { open: false, van: "13:30", tot: "19:00", soort: "open", notitie: "" };
}

export function leegUren(): ClubUren {
  return {
    zomer: Array.from({ length: 7 }, leegeDag),
    winter: Array.from({ length: 7 }, leegeDag),
    afwijkingen: [],
  };
}

// ---- Validatie ---------------------------------------------------------------

const tijd = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const isoDatum = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
// Geen links in vrije tekst (enkel in het websiteveld) — houdt het kort en veilig.
const geenLink = (s: string) => !/https?:|www\.|\.(be|com|nl|fr|org|net)\b/i.test(s);

const dagSchema = z.object({
  open: z.boolean(),
  van: tijd,
  tot: tijd,
  soort: z.enum(DAG_SOORTEN),
  notitie: z.string().trim().max(MAX_NOTITIE).refine(geenLink),
});

const afwijkingSchema = z
  .object({
    van: isoDatum,
    tot: isoDatum,
    tekst: z.string().trim().min(1).max(MAX_AFWIJKING_TEKST).refine(geenLink),
  })
  .refine((a) => a.van <= a.tot);

export const clubUrenSchema = z.object({
  zomer: z.array(dagSchema).length(7),
  winter: z.array(dagSchema).length(7),
  afwijkingen: z.array(afwijkingSchema).max(MAX_AFWIJKINGEN),
});

export const clubGegevensSchema = z
  .object({
    adres: z.string().trim().max(200),
    contact_email: z.union([z.literal(""), z.string().trim().email().max(160)]),
    telefoon: z.string().trim().max(40),
    website: z.union([z.literal(""), z.string().trim().url().max(200)]),
  })
  .partial();

export const voorstelSchema = z.object({
  gegevens: clubGegevensSchema.optional(),
  uren: clubUrenSchema.optional(),
});

// ---- Datums en seizoenen -------------------------------------------------------

// De datum "vandaag" zoals ze in België is, ongeacht de tijdzone van de server.
export function brusselsVandaag(nu: Date = new Date()): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Brussels" }).format(nu); // "2026-11-04"
}

export type Seizoen = "zomer" | "winter";

// Zomer: 1 april t/m 30 september. Winter: de rest.
export function seizoenVoor(isoDatum: string): Seizoen {
  const maand = Number(isoDatum.slice(5, 7));
  return maand >= 4 && maand <= 9 ? "zomer" : "winter";
}

// Maandag = 0 ... zondag = 6, voor een ISO-datum.
export function weekdagIndex(isoDatum: string): number {
  const [j, m, d] = isoDatum.split("-").map(Number);
  const dag = new Date(Date.UTC(j, m - 1, d)).getUTCDay(); // zondag = 0
  return (dag + 6) % 7;
}

export function dagVoorDatum(uren: ClubUren, isoDatum: string): DagUren {
  return uren[seizoenVoor(isoDatum)][weekdagIndex(isoDatum)];
}

export function actieveAfwijkingen(uren: ClubUren, isoDatum: string): Afwijking[] {
  return uren.afwijkingen.filter((a) => a.van <= isoDatum && isoDatum <= a.tot);
}

// ---- Weergave ----------------------------------------------------------------

export function formatTijd(t: string): string {
  return t.replace(":", "u");
}

export function formatDagUren(dag: DagUren, gesloten = "Gesloten"): string {
  return dag.open ? `${formatTijd(dag.van)} – ${formatTijd(dag.tot)}` : gesloten;
}

export function heeftIngevuldeUren(uren: ClubUren | null | undefined): boolean {
  if (!uren) return false;
  return [...uren.zomer, ...uren.winter].some((d) => d.open);
}

export function gelijkeUren(a: ClubUren | null | undefined, b: ClubUren | null | undefined): boolean {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

// Welke dagen verschillen tussen twee schema's? Voor de "voor en na"-weergave bij het nakijken.
export function veranderdeDagen(oud: DagUren[], nieuw: DagUren[]): boolean[] {
  return nieuw.map((d, i) => JSON.stringify(d) !== JSON.stringify(oud[i] ?? null));
}
