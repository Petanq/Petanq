import type { Club } from "./types";

export type Plaats = { postcode: string; naam: string; lat: number; lng: number };

const DIAKRITISCHE_TEKENS = new RegExp("[\\u0300-\\u036f]", "g");

export function normaliseerPlaats(tekst: string): string {
  return tekst
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(DIAKRITISCHE_TEKENS, "")
    .replace(/[-'’.]/g, " ")
    .replace(/\s+/g, " ");
}

// Nederlandse naam <-> Franse naam: wie "Luik" typt, vindt "Liège" (en omgekeerd).
export const ALIAS: Record<string, string> = {
  gand: "gent",
  anvers: "antwerpen",
  bruges: "brugge",
  louvain: "leuven",
  malines: "mechelen",
  ostende: "oostende",
  courtrai: "kortrijk",
  ypres: "ieper",
  luik: "liege",
  namen: "namur",
  doornik: "tournai",
  bergen: "mons",
  nijvel: "nivelles",
  aarlen: "arlon",
  hoei: "huy",
  moeskroen: "mouscron",
  brussel: "bruxelles",
  brussels: "bruxelles",
};

export type PostcodeIndex = { plaatsen: Plaats[]; genormaliseerd: string[]; perPostcode: Map<string, Plaats[]> };

let cache: Promise<PostcodeIndex> | null = null;

// Laadt de lijst pas wanneer ze nodig is (zware gegevens, niet in de gewone pagina).
export function laadPostcodes(): Promise<PostcodeIndex> {
  if (!cache) {
    cache = import("./postcodes-data").then(({ POSTCODE_DATA }) => {
      const plaatsen: Plaats[] = [];
      const perPostcode = new Map<string, Plaats[]>();
      for (const regel of POSTCODE_DATA.split("\n")) {
        const [postcode, naam, lat, lng] = regel.split("|");
        if (!postcode || !naam) continue;
        const p: Plaats = { postcode, naam, lat: Number(lat), lng: Number(lng) };
        plaatsen.push(p);
        const lijst = perPostcode.get(postcode);
        if (lijst) lijst.push(p);
        else perPostcode.set(postcode, [p]);
      }
      return { plaatsen, genormaliseerd: plaatsen.map((p) => normaliseerPlaats(p.naam)), perPostcode };
    });
  }
  return cache;
}

function afstandTekst(a: string, b: string, max: number): number {
  // Levenshtein (omgewisselde buurletters tellen als één fout) met vroege stop.
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let vorigeVorige: number[] = [];
  let vorige = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const huidig = [i];
    let min = i;
    for (let j = 1; j <= b.length; j++) {
      const kost = a[i - 1] === b[j - 1] ? 0 : 1;
      huidig[j] = Math.min(vorige[j] + 1, huidig[j - 1] + 1, vorige[j - 1] + kost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        huidig[j] = Math.min(huidig[j], vorigeVorige[j - 2] + 1);
      }
      if (huidig[j] < min) min = huidig[j];
    }
    if (min > max) return max + 1;
    vorigeVorige = vorige;
    vorige = huidig;
  }
  return vorige[b.length];
}

// Middelpunt van alle plaatsen met dezelfde postcode (bv. 3550 = Heusden + Zolder).
function perPostcodeSamen(lijst: Plaats[]): Plaats {
  // Enkel de volledige namen (zonder "Heusden" of "Zolder" naast "Heusden-Zolder").
  const alle = Array.from(new Set(lijst.map((p) => p.naam)));
  const namen = alle.filter((n) => !alle.some((andere) => andere !== n && andere.includes(n)));
  return {
    postcode: lijst[0].postcode,
    naam: namen.slice(0, 2).join(" / "),
    lat: lijst.reduce((s, p) => s + p.lat, 0) / lijst.length,
    lng: lijst.reduce((s, p) => s + p.lng, 0) / lijst.length,
  };
}

// Geeft tot `max` mogelijke plaatsen voor wat iemand typt: een postcode
// (4 cijfers) of een gemeente / deelgemeente, het beste eerst.
export function zoekPlaatsen(index: PostcodeIndex, invoer: string, max = 6): Plaats[] {
  const raw = invoer.trim();
  if (!raw) return [];

  if (/^\d{4}$/.test(raw)) {
    const lijst = index.perPostcode.get(raw);
    return lijst ? [perPostcodeSamen(lijst)] : [];
  }
  // "9000 Gent": postcode eerst
  const metPostcode = raw.match(/^(\d{4})\s+(.+)$/);
  if (metPostcode) {
    const lijst = index.perPostcode.get(metPostcode[1]);
    if (lijst) return [perPostcodeSamen(lijst)];
  }
  // Nog bezig met een postcode intikken: dan geen gok.
  if (/^\d+$/.test(raw)) return [];

  let term = normaliseerPlaats(raw);
  if (term.length < 2) return [];
  term = ALIAS[term] ?? term;

  const exact: Plaats[] = [];
  const begin: Plaats[] = [];
  const bevat: Plaats[] = [];
  index.plaatsen.forEach((p, i) => {
    const naam = index.genormaliseerd[i];
    if (naam === term) exact.push(p);
    else if (naam.startsWith(term)) begin.push(p);
    else if (term.length >= 3 && naam.includes(term)) bevat.push(p);
  });

  // Een exacte naam wint van half-passende; "bevat" enkel als er niets beters is.
  let kandidaten = exact.length ? exact : begin.length ? begin : bevat;

  // Tikfout: pas als er niets is gevonden (max. 1 letter ernaast, 2 bij lange namen).
  if (kandidaten.length === 0 && term.length >= 4) {
    const maxFout = term.length >= 8 ? 2 : 1;
    const dichtbij: { p: Plaats; d: number }[] = [];
    index.plaatsen.forEach((p, i) => {
      const d = afstandTekst(term, index.genormaliseerd[i], maxFout);
      if (d <= maxFout) dichtbij.push({ p, d });
    });
    dichtbij.sort((a, b) => a.d - b.d);
    kandidaten = dichtbij.map((x) => x.p);
  }

  // Dezelfde naam op dezelfde plek (bv. Liège 4000 en 4020) maar één keer.
  const gezien = new Set<string>();
  const uit: Plaats[] = [];
  for (const p of kandidaten) {
    const sleutel = `${p.naam}|${p.lat}|${p.lng}`;
    if (gezien.has(sleutel)) continue;
    gezien.add(sleutel);
    uit.push(p);
    if (uit.length >= max) break;
  }
  return uit;
}

export function plaatsLabel(p: Plaats): string {
  return `${p.postcode} ${p.naam}`;
}

// "1,4 km" onder de 10 km, daarboven afgerond ("23 km").
export function formatKm(km: number): string {
  return `${km < 10 ? km.toFixed(1).replace(".", ",") : Math.round(km)} km`;
}

export function afstandKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLng = (lng2 - lng1) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Plaats van een club: eigen coördinaten als ze er zijn, anders afgeleid van
// de postcode in het adres, en als laatste van de gemeentenaam. Zo tellen ook
// clubs zonder coördinaten mee voor "dichtstbij" (op postcode-niveau nauwkeurig).
export function clubPositie(
  index: PostcodeIndex,
  club: Pick<Club, "lat" | "lng" | "adres" | "gemeente">
): { lat: number; lng: number } | null {
  if (club.lat != null && club.lng != null) return { lat: club.lat, lng: club.lng };

  const pc = club.adres?.match(/\b([1-9]\d{3})\b/)?.[1];
  const opPostcode = pc ? index.perPostcode.get(pc) : undefined;
  if (opPostcode) {
    const p = perPostcodeSamen(opPostcode);
    return { lat: p.lat, lng: p.lng };
  }

  const gemeente = normaliseerPlaats(club.gemeente ?? "");
  if (gemeente) {
    const naam = ALIAS[gemeente] ?? gemeente;
    const treffers = index.plaatsen.filter((_, i) => index.genormaliseerd[i] === naam);
    const lijst = treffers.length ? treffers : index.plaatsen.filter((_, i) => index.genormaliseerd[i].startsWith(naam));
    if (lijst.length) {
      return {
        lat: lijst.reduce((s, p) => s + p.lat, 0) / lijst.length,
        lng: lijst.reduce((s, p) => s + p.lng, 0) / lijst.length,
      };
    }
  }
  return null;
}

export function dichtstbijzijndeClubs(
  index: PostcodeIndex,
  clubs: Club[],
  lat: number,
  lng: number,
  aantal: number
): { club: Club; km: number }[] {
  const uit: { club: Club; km: number }[] = [];
  for (const club of clubs) {
    const pos = clubPositie(index, club);
    if (!pos) continue;
    uit.push({ club, km: afstandKm(lat, lng, pos.lat, pos.lng) });
  }
  return uit.sort((a, b) => a.km - b.km).slice(0, aantal);
}
