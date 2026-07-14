import { Toernooi } from "@/lib/types";

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
  const gemeenteNorm = gemeente.trim().toLowerCase();
  return alleAndere.filter(
    (t) => t.id !== eigenId && t.datum === datum && t.gemeente.trim().toLowerCase() === gemeenteNorm
  );
}
