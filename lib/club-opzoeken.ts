import { Club } from "@/lib/types";
import { normaliseerClubnaam } from "@/lib/dubbels";

// Zoekt een club op exacte (accent-/hoofdletter-/lidwoordongevoelige)
// naam-overeenkomst, zodat we bij het invullen van een tornooi het adres van
// de club kunnen hergebruiken i.p.v. dat de indiener het zelf moet uittypen.
export function vindClubBijNaam(clubnaam: string, clubs: Club[]): Club | undefined {
  const naamNorm = normaliseerClubnaam(clubnaam);
  if (!naamNorm) return undefined;
  return clubs.find((c) => normaliseerClubnaam(c.naam) === naamNorm);
}
