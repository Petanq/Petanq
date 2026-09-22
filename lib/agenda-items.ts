import { Toernooi } from "./types";

export interface AgendaItem {
  toernooi: Toernooi;
  datum: string;
  uur: string;
  isKwalificatie: boolean;
}

/**
 * Een toernooi met kwalificatiedata (bv. een "challenge" met wekelijkse
 * speeldagen die naar 1 finale toeleiden) leverde tot nu toe maar 1 agenda-
 * item op — de hoofddatum — waardoor alle andere speeldagen nergens op de
 * kalender verschenen. Dit zet elk toernooi om in 1 item per echte speeldag
 * (hoofddatum + elke kwalificatiedatum), zodat een meerdaagse challenge op
 * elke eigen dag zichtbaar is, niet enkel op de einddatum.
 */
export function agendaItems(toernooien: Toernooi[]): AgendaItem[] {
  const items: AgendaItem[] = [];
  for (const tn of toernooien) {
    items.push({ toernooi: tn, datum: tn.datum, uur: tn.uur, isKwalificatie: false });
    for (const k of tn.kwalificatiedata ?? []) {
      // Eigen uur per kwalificatiedatum, anders het gedeelde kwalificatie-uur,
      // en pas als geen van beide ingevuld is het hoofduur van het toernooi.
      if (k.datum) {
        items.push({ toernooi: tn, datum: k.datum, uur: k.uur ?? tn.kwalificatie_uur ?? tn.uur, isKwalificatie: true });
      }
    }
  }
  return items;
}
