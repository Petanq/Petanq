// Assortiment pétanqueboules van Boulenciel (shopboulenciel.com), getoond op
// de tussenpagina /boules. Bezoekers lezen hier alles in het NL/FR en klikken
// dan door naar de productpagina in de shop van Boulenciel om te bestellen.
//
// Manueel bijgehouden: prijzen en opties overgenomen van de shop op
// 2026-10-07. Wijzigt er iets in de shop, pas het dan hier aan. Foto's staan
// in public/images/boules/<id>.jpg.

export type BouleFamilie = "iris" | "vartan" | "planeet" | "continental" | "ovaal";
export type BouleMateriaal = "inox" | "carbone" | "inox-kunststof" | "duraluminium";
export type BouleHardheid = "tendre" | "demi-tendre";

export type BouleSet = {
  id: string;
  naam: string;
  familie: BouleFamilie;
  materiaal: BouleMateriaal;
  prijs: number;
  hardheden: BouleHardheid[];
  diameters: number[];
  gewichten: number[];
  // Max. aantal tekens voor gravure (0 = geen gravure mogelijk).
  gravureTekens: number;
  garantieMaanden: number | null;
  fipjp: boolean;
  beschrijvingNl: string;
  beschrijvingFr: string;
  // Pad achter https://shopboulenciel.com/<taal>/petanque/ (zonder .html).
  shopPad: string;
};

export const BOULENCIEL_SHOP = "https://shopboulenciel.com";

// Elke klik naar de shop telt mee als "pagina-bezoek" op dit aparte pad, zo
// staat het aantal doorkliks naast de paginabezoeken in het beheer-dashboard
// (handig om aan Boulenciel te tonen) zonder nieuwe tabel.
export const BOULES_DOORKLIK_PAD = "/boules#doorklik";

// De shop heeft geen Nederlandstalige versie: NL-bezoekers gaan naar de
// Engelse, FR-bezoekers naar de Franse.
export function shopTaal(taal: "nl" | "fr") {
  return taal === "fr" ? "fr" : "en";
}

export function shopUrl(set: BouleSet, taal: "nl" | "fr") {
  return `${BOULENCIEL_SHOP}/${shopTaal(taal)}/petanque/${set.shopPad}.html`;
}

export function outletUrl(taal: "nl" | "fr") {
  return `${BOULENCIEL_SHOP}/${shopTaal(taal)}/19-outlet-petanque`;
}

const ALLE_DIAMETERS = [71, 72, 73, 74, 75, 76, 77, 78, 79, 80];

const IRIS_NL = (kleur: string) =>
  `De Iris-lijn combineert roestvrij staal met kunststof inleg in ${kleur}. Deze set bestaat uit drie halfzachte boules (demi-tendre 125), met een bijpassend Iris-doeltje. Tijdens de eerste speelweken kunnen kleine metaal- of kunststofsplinters ontstaan; Boulenciel adviseert die met een slijpsteentje weg te werken.`;
const IRIS_FR = (couleur: string) =>
  `La gamme Iris associe l’acier inoxydable à des inserts en plastique ${couleur}. Le jeu comprend trois boules demi-tendres (125) et un but Iris assorti. De petits éclats de métal ou de plastique peuvent apparaître lors des premières utilisations ; Boulenciel recommande de les retirer avec une pierre abrasive.`;

const BRUNI_NL =
  " De nieuwe bruneerbehandeling verbetert zowel het schieten als het plaatsen (rond de lasnaad kan daardoor een lichte rode gloed zichtbaar zijn).";
const BRUNI_FR =
  " Le nouveau traitement de brunissage améliore à la fois le tir et le point (un léger halo rouge peut apparaître au niveau de la soudure).";

const VARTAN_NL = (strepen: number, richting: "rechts" | "links") =>
  `De Vartan ${strepen} heeft ${strepen} spiraalgroeven die naar ${richting} lopen (${richting === "rechts" ? "met de klok mee" : "tegen de klok in"}). De drie boules zijn gemaakt van roestvrij staal en uitgevoerd in halfzacht staal (demi-tendre 125).`;
const VARTAN_FR = (stries: number, sens: "droite" | "gauche") =>
  `La Vartan ${stries} présente ${stries} stries en spirale vers la ${sens} (${sens === "droite" ? "sens horaire" : "sens antihoraire"}). Le jeu comprend trois boules en acier inoxydable, en version demi-tendre (125).`;

const PLANEET = {
  venus: {
    nl: "glad, zonder enige versiering — sober en klassiek",
    fr: "lisses et sans aucune décoration — sobres et classiques",
  },
  mercure: { nl: "versierd met losse cirkels", fr: "décorées de cercles individuels" },
  saturne: { nl: "versierd met dubbele cirkels", fr: "décorées de doubles cercles" },
  mars: { nl: "versierd met talrijke kleine puntjes", fr: "décorées de nombreux petits points" },
} as const;

function planeetSet(
  planeet: keyof typeof PLANEET,
  materiaal: "inox" | "carbone",
  extra: Pick<BouleSet, "id" | "naam" | "prijs" | "hardheden" | "diameters" | "gewichten" | "shopPad">,
): BouleSet {
  const naamPlaneet = planeet.charAt(0).toUpperCase() + planeet.slice(1);
  const staalNl = materiaal === "inox" ? "roestvrij staal (inox)" : "koolstofstaal (carbone)";
  const staalFr = materiaal === "inox" ? "acier inoxydable" : "acier au carbone";
  const hardNl =
    extra.hardheden.length === 2 ? "Verkrijgbaar in zacht (tendre) en halfzacht (demi-tendre)." : "Enkel verkrijgbaar in zacht (tendre).";
  const hardFr =
    extra.hardheden.length === 2 ? "Disponibles en version tendre et demi-tendre." : "Disponibles uniquement en version tendre.";
  return {
    ...extra,
    familie: "planeet",
    materiaal,
    gravureTekens: 10,
    garantieMaanden: 24,
    fipjp: true,
    beschrijvingNl: `Set van 3 pétanqueboules ${naamPlaneet} in ${staalNl}, ${PLANEET[planeet].nl}. ${hardNl}${materiaal === "carbone" ? BRUNI_NL : ""}`,
    beschrijvingFr: `Jeu de 3 boules ${naamPlaneet} en ${staalFr}, ${PLANEET[planeet].fr}. ${hardFr}${materiaal === "carbone" ? BRUNI_FR : ""}`,
  };
}

const BEIDE: BouleHardheid[] = ["tendre", "demi-tendre"];

export const BOULE_SETS: BouleSet[] = [
  ...(
    [
      ["iris-noir", "Iris Noir", "zwart", "noir", "21-11168-set-petanque-iris-nero", ALLE_DIAMETERS, [670, 680, 690, 700, 710]],
      ["iris-fuchsia", "Iris Fuchsia", "fuchsia", "fuchsia", "22-10916-set-petanque-iris-fucsia", [71, 72, 73, 74, 75, 76, 77, 78, 80], [670, 680, 690, 700, 710]],
      ["iris-vert", "Iris Vert", "groen", "vert", "23-11023-set-petanque-iris-verde", ALLE_DIAMETERS, [680, 690, 700, 710]],
      ["iris-bleu", "Iris Bleu", "blauw", "bleu", "24-11096-set-petanque-iris-blu", ALLE_DIAMETERS, [680, 690, 700, 710]],
    ] as const
  ).map(
    ([id, naam, kleurNl, kleurFr, shopPad, diameters, gewichten]): BouleSet => ({
      id,
      naam: `Set ${naam}`,
      familie: "iris",
      materiaal: "inox-kunststof",
      prijs: 315,
      hardheden: ["demi-tendre"],
      diameters: [...diameters],
      gewichten: [...gewichten],
      gravureTekens: 4,
      garantieMaanden: 24,
      fipjp: true,
      beschrijvingNl: IRIS_NL(kleurNl),
      beschrijvingFr: IRIS_FR(kleurFr),
      shopPad,
    }),
  ),
  ...(
    [
      ["vartan-24-sx", "Vartan 24 SX", 24, "links", "gauche", 290, "25-13076-set-petanque-vartan-24-sx", [71, 72, 73, 74, 75, 76], [680, 690, 700]],
      ["vartan-24-dx", "Vartan 24 DX", 24, "rechts", "droite", 290, "26-13014-set-petanque-vartan-24-dx", [71, 75, 76], [680]],
      ["vartan-16-dx", "Vartan 16 DX", 16, "rechts", "droite", 280, "27-12968-set-petanque-vartan-16-dx", [72, 73, 74, 75, 76], [680, 690, 700]],
      ["vartan-16-sx", "Vartan 16 SX", 16, "links", "gauche", 280, "28-12914-set-petanque-vartan-16-sx", [71, 72, 73, 74, 75, 76], [680, 690, 700]],
    ] as const
  ).map(
    ([id, naam, strepen, richtingNl, richtingFr, prijs, shopPad, diameters, gewichten]): BouleSet => ({
      id,
      naam: `Set ${naam}`,
      familie: "vartan",
      materiaal: "inox",
      prijs,
      hardheden: ["demi-tendre"],
      diameters: [...diameters],
      gewichten: [...gewichten],
      gravureTekens: 4,
      garantieMaanden: 24,
      fipjp: true,
      beschrijvingNl: VARTAN_NL(strepen, richtingNl),
      beschrijvingFr: VARTAN_FR(strepen, richtingFr),
      shopPad,
    }),
  ),
  planeetSet("mars", "inox", {
    id: "mars-inox",
    naam: "Set Mars Inox",
    prijs: 255,
    hardheden: BEIDE,
    diameters: ALLE_DIAMETERS,
    gewichten: [660, 670, 680, 690, 700, 710],
    shopPad: "61-12266-set-petanque-mars-inox",
  }),
  planeetSet("mercure", "inox", {
    id: "mercure-inox",
    naam: "Set Mercure Inox",
    prijs: 255,
    hardheden: BEIDE,
    diameters: ALLE_DIAMETERS,
    gewichten: [660, 670, 680, 700, 710],
    shopPad: "59-12704-set-petanque-mercure-inox",
  }),
  planeetSet("saturne", "inox", {
    id: "saturne-inox",
    naam: "Set Saturne Inox",
    prijs: 255,
    hardheden: BEIDE,
    diameters: ALLE_DIAMETERS,
    gewichten: [680, 690, 700, 710],
    shopPad: "60-12479-set-petanque-saturne-inox",
  }),
  planeetSet("venus", "inox", {
    id: "venus-inox",
    naam: "Set Venus Inox",
    prijs: 230,
    hardheden: BEIDE,
    diameters: ALLE_DIAMETERS,
    gewichten: [670, 680, 690, 700, 710],
    shopPad: "58-11258-set-petanque-venus-inox",
  }),
  planeetSet("mars", "carbone", {
    id: "mars-carbone",
    naam: "Set Mars Carbone",
    prijs: 230,
    hardheden: BEIDE,
    diameters: ALLE_DIAMETERS,
    gewichten: [660, 670, 680, 690, 700, 710],
    shopPad: "161-10700-set-petanque-saturne-carbone",
  }),
  planeetSet("mercure", "carbone", {
    id: "mercure-carbone",
    naam: "Set Mercure Carbone",
    prijs: 230,
    hardheden: BEIDE,
    diameters: ALLE_DIAMETERS,
    gewichten: [690, 700, 710],
    shopPad: "63-11688-set-petanque-mercure-carbone",
  }),
  planeetSet("saturne", "carbone", {
    id: "saturne-carbone",
    naam: "Set Saturne Carbone",
    prijs: 230,
    hardheden: ["tendre"],
    diameters: ALLE_DIAMETERS,
    gewichten: [660, 670, 680, 690, 700, 710],
    shopPad: "64-11474-set-petanque-saturne-carbone",
  }),
  planeetSet("venus", "carbone", {
    id: "venus-carbone",
    naam: "Set Venus Carbone",
    prijs: 205,
    hardheden: BEIDE,
    diameters: ALLE_DIAMETERS,
    gewichten: [670, 680, 690, 700, 710],
    shopPad: "62-11906-set-petanque-venus-carbone",
  }),
  {
    id: "rd-diego-rizzi",
    naam: "Set RD – Diego Rizzi",
    familie: "planeet",
    materiaal: "carbone",
    prijs: 240,
    hardheden: ["tendre"],
    diameters: [73, 74],
    gewichten: [680, 690, 700],
    gravureTekens: 10,
    garantieMaanden: 24,
    fipjp: true,
    beschrijvingNl:
      "Set van 3 pétanqueboules in koolstofstaal met zeefdruk van Diego Rizzi: gladde boules met zijn kenmerkende \"ALIEN\"-symbool. Enkel verkrijgbaar in zacht (tendre)." +
      BRUNI_NL,
    beschrijvingFr:
      "Jeu de 3 boules en acier au carbone sérigraphiées par Diego Rizzi : boules lisses portant son symbole « ALIEN ». Disponibles uniquement en version tendre." +
      BRUNI_FR,
    shopPad: "30-11234-set-petanque-rd-diego-rizzi",
  },
  {
    id: "la-continental",
    naam: "La Continental",
    familie: "continental",
    materiaal: "carbone",
    prijs: 150,
    hardheden: ["tendre"],
    diameters: [72, 73, 74],
    gewichten: [680, 690],
    gravureTekens: 10,
    garantieMaanden: 12,
    fipjp: true,
    beschrijvingNl:
      "Set van 3 instapboules in koolstofstaal, speciaal ontworpen voor schieters. Een zachte kern met een glanzend zwarte behandeling die de boule duurzaam maakt en bij de inslag laat doorglijden. De voordeligste manier om met gehomologeerde Boulenciel-boules te spelen.",
    beschrijvingFr:
      "Jeu de 3 boules en carbone d'entrée de gamme, spécialement conçues pour les tireurs. Un cœur tendre avec un traitement noir brillant pour la durabilité, qui permet à la boule de glisser à l'impact. La façon la plus abordable de jouer avec des boules Boulenciel homologuées.",
    shopPad: "113-10682-la-continental",
  },
];

// "71–80 mm" voor een aaneengesloten reeks, anders "71, 75, 76 mm".
export function formatReeks(waarden: number[], eenheid: string) {
  if (waarden.length === 0) return "";
  if (waarden.length === 1) return `${waarden[0]} ${eenheid}`;
  const stap = waarden[1] - waarden[0];
  const aaneengesloten = waarden.every((w, i) => i === 0 || w - waarden[i - 1] === stap);
  return aaneengesloten
    ? `${waarden[0]}–${waarden[waarden.length - 1]} ${eenheid}`
    : `${waarden.join(", ")} ${eenheid}`;
}

