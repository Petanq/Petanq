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
