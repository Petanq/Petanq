// De organisator van een Match13-toernooi is verplicht en moet een echte
// persoon zijn: voornaam én naam (dus minstens twee woorden van elk minstens
// twee letters). "Jan" of "J P" is dus niet genoeg.

/** Verwijdert dubbele/omringende spaties ("  Jan   Peeters " → "Jan Peeters"). */
export function schoonOrganisator(waarde: string): string {
  return waarde.trim().replace(/\s+/g, " ");
}

export function isGeldigeOrganisator(waarde: string | null | undefined): boolean {
  if (!waarde) return false;
  const woorden = schoonOrganisator(waarde).split(" ");
  if (woorden.length < 2) return false;
  return woorden.every((woord) => (woord.match(/\p{L}/gu) ?? []).length >= 2);
}

/**
 * De organisator staat in de database als één tekst ("Voornaam Naam"), maar in het
 * scherm als twee velden. Bij het laden splitsen we op de eerste spatie: het eerste
 * woord is de voornaam, de rest de naam ("Marie De Smet" → "Marie" + "De Smet").
 */
export function splitsOrganisator(waarde: string | null | undefined): { voornaam: string; naam: string } {
  const schoon = schoonOrganisator(waarde ?? "");
  const i = schoon.indexOf(" ");
  if (i < 0) return { voornaam: schoon, naam: "" };
  return { voornaam: schoon.slice(0, i), naam: schoon.slice(i + 1) };
}

export function voegOrganisatorSamen(voornaam: string, naam: string): string {
  return schoonOrganisator(`${voornaam} ${naam}`);
}
