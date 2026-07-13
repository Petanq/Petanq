import { Toernooi } from "@/lib/types";

// Mensen die hetzelfde toernooi indienen, typen de clubnaam/toernooinaam zelden
// exact hetzelfde (andere schrijfwijze, hoofdletters, afkortingen...). Dezelfde
// datum + gemeente is een veel betrouwbaardere aanwijzing dat het om hetzelfde
// toernooi gaat, zonder daarbij afhankelijk te zijn van exacte tekstgelijkheid.
export function vindMogelijkeDubbels(toernooi: Toernooi, alleAndere: Toernooi[]): Toernooi[] {
  const gemeente = toernooi.gemeente.trim().toLowerCase();
  return alleAndere.filter(
    (t) => t.id !== toernooi.id && t.datum === toernooi.datum && t.gemeente.trim().toLowerCase() === gemeente
  );
}
