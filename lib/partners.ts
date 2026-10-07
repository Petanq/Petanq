// Partners die in de partnerbalk onder de kop van de homepage getoond worden.
// Leeg = de balk toont de uitnodiging "Wil jouw bedrijf hier staan?".
// Een partner toevoegen: zet het logo in public/images/partners/ en voeg hier
// een regel toe, bv.
//   { naam: "Scheerlinck", logo: "/images/partners/scheerlinck.png", url: "https://www.bm-scheerlinck.be" }
export type Partner = {
  naam: string;
  logo: string;
  url?: string;
};

export const PARTNERS: Partner[] = [];
