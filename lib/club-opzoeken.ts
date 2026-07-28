import { Club } from "@/lib/types";
import { normaliseer } from "@/lib/dubbels";

// Zoekt een club op exacte (accent-/hoofdletterongevoelige) naam-overeenkomst,
// zodat we bij het invullen van een tornooi het adres van de club kunnen
// hergebruiken i.p.v. dat de indiener het zelf moet uittypen.
export function vindClubBijNaam(clubnaam: string, clubs: Club[]): Club | undefined {
  const naamNorm = normaliseer(clubnaam);
  if (!naamNorm) return undefined;
  return clubs.find((c) => normaliseer(c.naam) === naamNorm);
}
