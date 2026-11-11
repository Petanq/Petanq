import { ALIAS, normaliseerPlaats, type PostcodeIndex } from "@/lib/postcodes";

// Een zachte controle (geen blokkade): lijkt dit adres buiten België te liggen?
// Petanque13 toont enkel Belgische tornooien. Frans-Belgische grensplaatsen (Croix, Boussois...) worden
// anders gemakkelijk voor Belgische aangezien.
//  - "postcode": het adres bevat een postcode van 5 cijfers (Frankrijk, Duitsland, Nederland: 4 cijfers + letters)
//  - "plaats": de plaatsnaam staat niet in de lijst van Belgische plaatsen
export type BuitenlandVermoeden = "postcode" | "plaats" | null;

const VIJF_CIJFERS = /(^|\D)\d{5}(\D|$)/;

export function lijktBuitenBelgie(adres: string | null | undefined, gemeente: string, index: PostcodeIndex): BuitenlandVermoeden {
  if (adres && VIJF_CIJFERS.test(adres)) return "postcode";

  // Een bestaande Belgische postcode (4 cijfers) in het adres of de gemeente is een sterk teken dat het klopt,
  // ook als de plaatsnaam anders gespeld is of een deelgemeente is.
  for (const tekst of [adres ?? "", gemeente]) {
    for (const m of tekst.matchAll(/(?<!\d)\d{4}(?!\d)/g)) if (index.perPostcode.has(m[0])) return null;
  }

  const naam = normaliseerPlaats(gemeente);
  if (!naam) return null;
  // Meerdere namen ("Mont-sur-Marchienne (Charleroi)") of een toevoeging na een komma: probeer ook het eerste stuk.
  const kandidaten = new Set([naam, normaliseerPlaats(gemeente.split(/[,(/]/)[0])]);
  const bekend = index.genormaliseerd;
  for (const k0 of kandidaten) {
    if (!k0) continue;
    const k = ALIAS[k0] ?? k0; // "Luik" = "Liège"
    if (bekend.includes(k)) return null;
    // Samengestelde namen zoals "Beyne-Heusay" of "Mont-Saint-Guibert" staan soms onder een deel van de naam.
    if (bekend.some((b) => b.startsWith(k + " ") || k.startsWith(b + " "))) return null;
  }
  return "plaats";
}
