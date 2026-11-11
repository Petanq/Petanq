import { normaliseer } from "@/lib/dubbels";

// Zoekt bij een ingediend tornooi de bijpassende club, ook als de organisator de clubnaam anders
// schrijft dan wij ("R.P.C. Nivelloise" voor "Royal Petanque Club Nivelloise").
//
// Een verkeerde koppeling is erger dan geen: dan toont het tornooi het adres en de uren van een
// andere club. Daarom koppelen we alleen als er precies één club overblijft:
//  - zelfde straat en huisnummer (adres), of
//  - zelfde kernnaam in dezelfde gemeente.
// Wijzen die twee verschillende clubs aan, of vallen er meerdere af, dan geven we niets terug.

export type KoppelClub = { id: string; naam: string; gemeente: string; adres: string | null };
export type KoppelTornooi = { clubnaam: string; gemeente: string; adres: string | null };

// Woorden die in bijna elke clubnaam voorkomen en dus niets onderscheiden.
const ALGEMEEN = new Set([
  "petanque", "petanqueclub", "pc", "kpc", "rpc", "kp", "pk", "club", "vzw", "asbl", "royal", "royale",
  "koninklijke", "de", "het", "een", "la", "le", "les", "du", "des", "van", "der", "den", "d", "l", "t", "en", "et",
  "cercle", "boule", "boules", "bouliste",
]);
const STRAATWOORDEN = new Set([
  "rue", "straat", "str", "avenue", "av", "place", "plein", "chaussee", "steenweg", "laan", "weg", "dreef", "lei",
  "de", "la", "le", "du", "des", "van", "der", "den", "het", "n", "nr", "no",
]);

function woorden(tekst: string): string[] {
  return normaliseer(tekst)
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean);
}

// "R.P.C. Nivelloise" en "Royal Petanque Club Nivelloise" hebben beide de kern {nivelloise}.
export function kernNaam(naam: string): string {
  // Afkortingen als "R.P.C." eerst samenvoegen tot "rpc", dan pas de algemene woorden weglaten.
  const samen = normaliseer(naam).replace(/\b([a-z])\.(?=[a-z]\.|[a-z]\b)/g, "$1").replace(/\./g, "");
  return woorden(samen)
    .filter((w) => !ALGEMEEN.has(w))
    .sort()
    .join(" ");
}

// Straat + huisnummer als verzameling woorden (volgorde en "rue/straat" maken niet uit).
// Het deel vanaf de postcode of gemeente laten we weg: enkel de straat telt.
function straatTokens(adres: string | null): Set<string> | null {
  if (!adres) return null;
  const eerste = adres.split(/\s*,\s*(?=\d{4})/)[0];
  const tokens = woorden(eerste).filter((w) => !STRAATWOORDEN.has(w));
  const heeftNummer = tokens.some((w) => /\d/.test(w));
  const heeftNaam = tokens.some((w) => /^[a-z]{4,}$/.test(w));
  if (!heeftNummer || !heeftNaam) return null;
  return new Set(tokens);
}

function adresGelijk(a: string | null, b: string | null): boolean {
  const A = straatTokens(a);
  if (!A) return false;
  const alleB = new Set(woorden(b ?? "").filter((w) => !STRAATWOORDEN.has(w)));
  if (alleB.size === 0) return false;
  for (const w of A) if (!alleB.has(w)) return false;
  return true;
}

export function vindClubVoorTornooi<C extends KoppelClub>(tornooi: KoppelTornooi, clubs: C[]): C | null {
  const gemeente = normaliseer(tornooi.gemeente);
  const kern = kernNaam(tornooi.clubnaam);

  const opAdres = clubs.filter((c) => adresGelijk(tornooi.adres, c.adres));
  const opNaam = kern ? clubs.filter((c) => normaliseer(c.gemeente) === gemeente && kernNaam(c.naam) === kern) : [];

  // Meerdere clubs op hetzelfde adres (bv. een zaal die door twee clubs gebruikt wordt): de naam beslist.
  let adresKandidaten = opAdres;
  if (opAdres.length > 1) {
    adresKandidaten = kern ? opAdres.filter((c) => kernNaam(c.naam) === kern) : [];
  }

  if (adresKandidaten.length === 1 && opNaam.length === 0) return adresKandidaten[0];
  if (opNaam.length === 1 && adresKandidaten.length === 0) return opNaam[0];
  if (opNaam.length === 1 && adresKandidaten.length === 1 && opNaam[0].id === adresKandidaten[0].id) return opNaam[0];
  return null;
}
