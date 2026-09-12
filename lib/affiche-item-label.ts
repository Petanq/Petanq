import { AfficheVelden } from "@/actions/affiche-analyseren";
import { dagNummer, formatUur, maandKort } from "@/lib/datum";

// Kort label voor één item uit een affiche die meerdere tornooien opleverde
// (bv. "27 nov 19u30 — Wijnegemse Vrijdag Avond"), gebruikt in het overzichtje
// dat toont welke van de gevonden tornooien al verwerkt zijn.
export function afficheItemLabel(item: AfficheVelden, taal: "nl" | "fr"): string {
  const datumLabel = item.datum ? `${dagNummer(item.datum)} ${maandKort(item.datum, taal)}` : "?";
  const uurLabel = item.uur ? ` ${formatUur(item.uur)}` : "";
  const naam = (taal === "fr" ? item.naam_fr : item.naam_nl) ?? item.clubnaam ?? "?";
  return `${datumLabel}${uurLabel} — ${naam}`;
}
