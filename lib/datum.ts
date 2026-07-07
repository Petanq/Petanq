import { Taal, vertalingen } from "./i18n";

const MAAND_KORT_NL = [
  "jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec",
];
const MAAND_KORT_FR = [
  "jan", "fév", "mar", "avr", "mai", "jun", "jul", "aoû", "sep", "oct", "nov", "déc",
];

export function parseDatum(datum: string): Date {
  const [jaar, maand, dag] = datum.split("-").map(Number);
  return new Date(jaar, maand - 1, dag);
}

export function vandaag(): Date {
  const nu = new Date();
  return new Date(nu.getFullYear(), nu.getMonth(), nu.getDate());
}

export function dagVanWeekKort(datum: string, taal: Taal): string {
  const d = parseDatum(datum);
  return vertalingen[taal].dagen[d.getDay()];
}

export function dagNummer(datum: string): number {
  return parseDatum(datum).getDate();
}

export function maandKort(datum: string, taal: Taal): string {
  const d = parseDatum(datum);
  return (taal === "fr" ? MAAND_KORT_FR : MAAND_KORT_NL)[d.getMonth()];
}

export function maandVolledig(maandIndex: number, taal: Taal): string {
  return vertalingen[taal].maanden[maandIndex];
}

export function maandJaarKey(datum: string): string {
  const d = parseDatum(datum);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function formatUur(uur: string): string {
  const [h, m] = uur.split(":");
  return `${parseInt(h, 10)}u${m}`;
}

export function aantalDagenTot(datum: string): number {
  const d = parseDatum(datum);
  const t = vandaag();
  const verschil = d.getTime() - t.getTime();
  return Math.round(verschil / (1000 * 60 * 60 * 24));
}

export function countdownTekst(datum: string, taal: Taal): string {
  const dagen = aantalDagenTot(datum);
  const t = vertalingen[taal].lijst;
  if (dagen < 0) return t.voorbij;
  if (dagen === 0) return t.vandaag;
  if (dagen === 1) return t.morgen;
  return t.overDagen(dagen);
}

export function isToekomstig(datum: string): boolean {
  return aantalDagenTot(datum) >= 0;
}
