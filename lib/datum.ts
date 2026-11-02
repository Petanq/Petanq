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

// Maandag van de week waarin de datum valt (weken lopen van maandag tot zondag).
export function weekStart(datum: string): Date {
  const d = parseDatum(datum);
  const dagIndex = (d.getDay() + 6) % 7;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - dagIndex);
}

export function weekKey(datum: string): string {
  const s = weekStart(datum);
  return `${s.getFullYear()}-${String(s.getMonth() + 1).padStart(2, "0")}-${String(s.getDate()).padStart(2, "0")}`;
}

// "9 – 15 nov" of "30 nov – 6 dec"; het jaar erbij als het niet dit jaar is.
export function weekBereik(start: Date, taal: Taal): string {
  const einde = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
  const maanden = taal === "fr" ? MAAND_KORT_FR : MAAND_KORT_NL;
  const jaar = einde.getFullYear() !== vandaag().getFullYear() ? ` ${einde.getFullYear()}` : "";
  if (start.getMonth() === einde.getMonth()) {
    return `${start.getDate()} – ${einde.getDate()} ${maanden[einde.getMonth()]}${jaar}`;
  }
  return `${start.getDate()} ${maanden[start.getMonth()]} – ${einde.getDate()} ${maanden[einde.getMonth()]}${jaar}`;
}

// Hoeveel weken ligt deze week van de huidige week (0 = deze week, 1 = volgende week).
export function wekenVanNu(start: Date): number {
  const t = vandaag();
  const nu = new Date(t.getFullYear(), t.getMonth(), t.getDate() - ((t.getDay() + 6) % 7));
  return Math.round((start.getTime() - nu.getTime()) / (7 * 24 * 60 * 60 * 1000));
}

export function maandJaarKey(datum: string): string {
  const d = parseDatum(datum);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function formatDatumKort(datum: string): string {
  const [jaar, maand, dag] = datum.split("-");
  return `${dag}-${maand}-${jaar}`;
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
