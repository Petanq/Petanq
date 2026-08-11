import { Provincie } from "./provincies";

// Vercel geeft naast de (onnauwkeurige) stadsnaam ook een ISO 3166-2-
// regiocode mee (header x-vercel-ip-country-region, bv. "VAN" voor
// Antwerpen) — die dekt alle 11 provincies/Brussel exact, in tegenstelling
// tot de stad-naar-provincie-lijst hieronder die enkel de grotere steden
// kent. Dit is daarom de primaire methode; de stadsnaam blijft een terugval
// voor het (zeldzame) geval dat de regiocode ontbreekt.
const REGIOCODE_PROVINCIE: Record<string, Provincie> = {
  VAN: "antwerpen",
  VOV: "oost-vlaanderen",
  VWV: "west-vlaanderen",
  VLI: "limburg",
  VBR: "vlaams-brabant",
  WHT: "henegouwen",
  WLG: "luik",
  WNA: "namen",
  WBR: "waals-brabant",
  WLX: "luxemburg",
  BRU: "brussel",
};

export function provincieVoorRegiocode(regiocode: string | null | undefined): Provincie | null {
  if (!regiocode) return null;
  const code = regiocode.trim().toUpperCase().replace(/^BE-/, "");
  return REGIOCODE_PROVINCIE[code] ?? null;
}

const DIAKRITISCHE_TEKENS = new RegExp("[\\u0300-\\u036f]", "g");

function normaliseer(tekst: string): string {
  return tekst.trim().toLowerCase().normalize("NFD").replace(DIAKRITISCHE_TEKENS, "");
}

// Vercel geeft per bezoek enkel een (IP-geschatte) stadsnaam mee, geen
// provincie. Deze lijst dekt de grotere Belgische steden/gemeenten per
// provincie — kleinere gemeenten worden vaak als de dichtstbijzijnde grotere
// stad herkend, dus dit is een schatting, geen exacte meting.
const STAD_PROVINCIE: Record<string, Provincie> = {
  // Antwerpen
  antwerp: "antwerpen",
  antwerpen: "antwerpen",
  anvers: "antwerpen",
  mechelen: "antwerpen",
  malines: "antwerpen",
  turnhout: "antwerpen",
  mortsel: "antwerpen",
  lier: "antwerpen",
  herentals: "antwerpen",
  geel: "antwerpen",
  brasschaat: "antwerpen",
  schoten: "antwerpen",
  kontich: "antwerpen",
  boom: "antwerpen",
  wijnegem: "antwerpen",
  // Oost-Vlaanderen
  ghent: "oost-vlaanderen",
  gent: "oost-vlaanderen",
  gand: "oost-vlaanderen",
  aalst: "oost-vlaanderen",
  "sint-niklaas": "oost-vlaanderen",
  dendermonde: "oost-vlaanderen",
  oudenaarde: "oost-vlaanderen",
  eeklo: "oost-vlaanderen",
  zottegem: "oost-vlaanderen",
  lokeren: "oost-vlaanderen",
  wetteren: "oost-vlaanderen",
  deinze: "oost-vlaanderen",
  ronse: "oost-vlaanderen",
  // West-Vlaanderen
  bruges: "west-vlaanderen",
  brugge: "west-vlaanderen",
  kortrijk: "west-vlaanderen",
  courtrai: "west-vlaanderen",
  ostend: "west-vlaanderen",
  oostende: "west-vlaanderen",
  ostende: "west-vlaanderen",
  roeselare: "west-vlaanderen",
  ypres: "west-vlaanderen",
  ieper: "west-vlaanderen",
  waregem: "west-vlaanderen",
  menen: "west-vlaanderen",
  "knokke-heist": "west-vlaanderen",
  knokke: "west-vlaanderen",
  veurne: "west-vlaanderen",
  diksmuide: "west-vlaanderen",
  poperinge: "west-vlaanderen",
  blankenberge: "west-vlaanderen",
  // Limburg
  hasselt: "limburg",
  genk: "limburg",
  "sint-truiden": "limburg",
  tongeren: "limburg",
  bilzen: "limburg",
  beringen: "limburg",
  lommel: "limburg",
  maasmechelen: "limburg",
  peer: "limburg",
  // Vlaams-Brabant
  leuven: "vlaams-brabant",
  louvain: "vlaams-brabant",
  vilvoorde: "vlaams-brabant",
  halle: "vlaams-brabant",
  tienen: "vlaams-brabant",
  aarschot: "vlaams-brabant",
  diest: "vlaams-brabant",
  zaventem: "vlaams-brabant",
  grimbergen: "vlaams-brabant",
  asse: "vlaams-brabant",
  // Brussel
  brussels: "brussel",
  brussel: "brussel",
  bruxelles: "brussel",
  schaerbeek: "brussel",
  schaarbeek: "brussel",
  anderlecht: "brussel",
  molenbeek: "brussel",
  ixelles: "brussel",
  elsene: "brussel",
  uccle: "brussel",
  ukkel: "brussel",
  etterbeek: "brussel",
  woluwe: "brussel",
  // Henegouwen
  charleroi: "henegouwen",
  mons: "henegouwen",
  bergen: "henegouwen",
  tournai: "henegouwen",
  doornik: "henegouwen",
  "la louviere": "henegouwen",
  mouscron: "henegouwen",
  moeskroen: "henegouwen",
  ath: "henegouwen",
  binche: "henegouwen",
  soignies: "henegouwen",
  // Luik
  liege: "luik",
  luik: "luik",
  verviers: "luik",
  seraing: "luik",
  herstal: "luik",
  huy: "luik",
  hoei: "luik",
  waremme: "luik",
  spa: "luik",
  eupen: "luik",
  malmedy: "luik",
  // Namen
  namur: "namen",
  namen: "namen",
  dinant: "namen",
  ciney: "namen",
  andenne: "namen",
  sambreville: "namen",
  gembloux: "namen",
  // Waals-Brabant
  wavre: "waals-brabant",
  nivelles: "waals-brabant",
  nijvel: "waals-brabant",
  "ottignies-louvain-la-neuve": "waals-brabant",
  ottignies: "waals-brabant",
  "braine-l'alleud": "waals-brabant",
  tubize: "waals-brabant",
  genappe: "waals-brabant",
  // Luxemburg
  arlon: "luxemburg",
  aarlen: "luxemburg",
  "marche-en-famenne": "luxemburg",
  bastogne: "luxemburg",
  bastenaken: "luxemburg",
  virton: "luxemburg",
  libramont: "luxemburg",
  "saint-hubert": "luxemburg",
  durbuy: "luxemburg",
};

// Retourneert null als de stad niet herkend wordt (bv. buiten België, of een
// kleine gemeente die niet in de lijst staat) — dan valt de teller onder
// "onbekend" in plaats van een gok te wagen.
export function provincieVoorStad(stad: string | null | undefined): Provincie | null {
  if (!stad) return null;
  return STAD_PROVINCIE[normaliseer(stad)] ?? null;
}
