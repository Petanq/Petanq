// Doorklik-acties op een tornooipagina die we anoniem optellen (zie actions/toernooi-acties.ts).
export const TOERNOOI_ACTIES = [
  "route_google",
  "route_waze",
  "agenda_google",
  "agenda_ics",
  "delen_whatsapp",
  "delen_messenger",
  "delen_link",
  "opslaan",
  "inschrijven",
  "affiche",
  "contact_mail",
] as const;

export type ToernooiActie = (typeof TOERNOOI_ACTIES)[number];

// Tel een doorklik, maar per tornooi en actie maar één keer per bezoek (tabblad): zo blijft het cijfer
// "hoeveel bezoekers deden dit" en tellen herhaalde klikken van dezelfde persoon niet mee.
// Mag nooit iets op de pagina breken: elke fout wordt genegeerd.
export function volgToernooiActie(toernooiId: string, actie: ToernooiActie): void {
  try {
    const sleutel = `p13_actie_${toernooiId}_${actie}`;
    if (sessionStorage.getItem(sleutel)) return;
    sessionStorage.setItem(sleutel, "1");
    void import("@/actions/toernooi-acties").then((m) => m.registreerToernooiActie(toernooiId, actie)).catch(() => {});
  } catch {
    // sessionStorage kan geblokkeerd zijn: dan tellen we niet.
  }
}
