export type AfficheVelden = {
  datum: string | null;
  uur: string | null;
  clubnaam: string | null;
  naam_nl: string | null;
  naam_fr: string | null;
  gemeente: string | null;
  adres: string | null;
  provincie: string | null;
  categorie: string | null;
  formule: string | null;
  speelvorm: string | null;
  aantal_ronden: number | null;
  aantal_poules: number | null;
  contact_email: string | null;
  inschrijvingsprijs: number | null;
  gratis: boolean | null;
  max_ploegen: number | null;
  link_inschrijving: string | null;
  opmerking: string | null;
  kwalificatiedata: { datum: string | null; uur: string | null }[] | null;
  kwalificatie_uur: string | null;
};

// Vangnet naast de instructie in de prompt: als het model toch een datum
// zonder jaartal verkeerd inschat (bv. een jaar in het verleden), duwen we
// die hier alsnog naar de eerstvolgende toekomstige gelijke dag-en-maand.
// Onafhankelijk per datum toepassen behoudt de juiste volgorde tussen
// schiftingsdata en de finale (bv. okt-dec van jaar X, finale jan van X+1
// blijft kloppen ook na de correctie).
export function naarToekomst(datum: string, vandaag: string): string {
  const match = datum.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return datum;
  let jaar = Number(match[1]);
  const maandDag = `${match[2]}-${match[3]}`;
  while (`${jaar}-${maandDag}` < vandaag) jaar += 1;
  return `${jaar}-${maandDag}`;
}

export function corrigeerJaartallen(toernooien: AfficheVelden[], vandaag: string): AfficheVelden[] {
  return toernooien.map((item) => ({
    ...item,
    datum: item.datum ? naarToekomst(item.datum, vandaag) : item.datum,
    kwalificatiedata: item.kwalificatiedata
      ? item.kwalificatiedata.map((k) => ({
          ...k,
          datum: k.datum ? naarToekomst(k.datum, vandaag) : k.datum,
        }))
      : item.kwalificatiedata,
  }));
}
