import { Toernooi } from "@/lib/types";

// "Flémalle" en "FLEMALLE" verwijzen naar dezelfde gemeente, maar blijven na
// .toLowerCase() alleen nog verschillende strings door het accent. Accenten
// wegnemen voorkomt dat zo'n schrijfvariant een echte dubbel laat ontsnappen.
const DIAKRITISCHE_TEKENS = new RegExp("[\\u0300-\\u036f]", "g");

function normaliseer(tekst: string): string {
  return tekst.trim().toLowerCase().normalize("NFD").replace(DIAKRITISCHE_TEKENS, "");
}

// Mensen die hetzelfde toernooi indienen, typen de clubnaam/toernooinaam zelden
// exact hetzelfde (andere schrijfwijze, hoofdletters, afkortingen...). Dezelfde
// datum + gemeente is een veel betrouwbaardere aanwijzing dat het om hetzelfde
// toernooi gaat, zonder daarbij afhankelijk te zijn van exacte tekstgelijkheid.
export function vindMogelijkeDubbels(toernooi: Toernooi, alleAndere: Toernooi[]): Toernooi[] {
  return vindMogelijkeDubbelsVoorVelden(toernooi.datum, toernooi.gemeente, alleAndere, toernooi.id);
}

// Zelfde logica, maar bruikbaar voordat er een Toernooi-object bestaat (bv. in het
// "+Nieuw toernooi"-formulier, terwijl de beheerder nog aan het typen is).
export function vindMogelijkeDubbelsVoorVelden(
  datum: string,
  gemeente: string,
  alleAndere: Toernooi[],
  eigenId?: string
): Toernooi[] {
  if (!datum || !gemeente.trim()) return [];
  const gemeenteNorm = normaliseer(gemeente);
  return alleAndere.filter(
    (t) => t.id !== eigenId && t.datum === datum && normaliseer(t.gemeente) === gemeenteNorm
  );
}
