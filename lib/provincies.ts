export type Provincie =
  | "antwerpen"
  | "oost-vlaanderen"
  | "west-vlaanderen"
  | "limburg"
  | "vlaams-brabant"
  | "henegouwen"
  | "luik"
  | "namen"
  | "waals-brabant"
  | "luxemburg"
  | "brussel";

export type Regio = "vlaanderen" | "wallonie" | "brussel";

export const PROVINCIE_REGIO: Record<Provincie, Regio> = {
  antwerpen: "vlaanderen",
  "oost-vlaanderen": "vlaanderen",
  "west-vlaanderen": "vlaanderen",
  limburg: "vlaanderen",
  "vlaams-brabant": "vlaanderen",
  henegouwen: "wallonie",
  luik: "wallonie",
  namen: "wallonie",
  "waals-brabant": "wallonie",
  luxemburg: "wallonie",
  brussel: "brussel",
};

export const ALLE_PROVINCIES: Provincie[] = [
  "antwerpen",
  "oost-vlaanderen",
  "west-vlaanderen",
  "limburg",
  "vlaams-brabant",
  "henegouwen",
  "luik",
  "namen",
  "waals-brabant",
  "luxemburg",
  "brussel",
];

export const PROVINCIE_NAAM: Record<Provincie, { nl: string; fr: string }> = {
  antwerpen: { nl: "Antwerpen", fr: "Anvers" },
  "oost-vlaanderen": { nl: "Oost-Vlaanderen", fr: "Flandre Orientale" },
  "west-vlaanderen": { nl: "West-Vlaanderen", fr: "Flandre Occidentale" },
  limburg: { nl: "Limburg", fr: "Limbourg" },
  "vlaams-brabant": { nl: "Vlaams-Brabant", fr: "Brabant Flamand" },
  henegouwen: { nl: "Henegouwen", fr: "Hainaut" },
  luik: { nl: "Luik", fr: "Liège" },
  namen: { nl: "Namen", fr: "Namur" },
  "waals-brabant": { nl: "Waals-Brabant", fr: "Brabant Wallon" },
  luxemburg: { nl: "Luxemburg", fr: "Luxembourg" },
  brussel: { nl: "Brussel", fr: "Bruxelles" },
};

export const REGIO_NAAM: Record<Regio, { nl: string; fr: string }> = {
  vlaanderen: { nl: "Vlaanderen", fr: "Flandre" },
  wallonie: { nl: "Wallonië", fr: "Wallonie" },
  brussel: { nl: "Brussel", fr: "Bruxelles" },
};

export function vertaalProvincie(provincie: Provincie, taal: "nl" | "fr"): string {
  return PROVINCIE_NAAM[provincie][taal];
}

export function vertaalRegio(regio: Regio, taal: "nl" | "fr"): string {
  return REGIO_NAAM[regio][taal];
}
