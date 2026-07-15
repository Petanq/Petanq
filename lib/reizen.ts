export type PetanqueReis = {
  id: string;
  naam: string;
  organisatorNl: string;
  organisatorFr: string;
  periodeNl: string;
  periodeFr: string;
  locatieNl: string;
  locatieFr: string;
  prijsVanafNl: string;
  prijsVanafFr: string;
  beschrijvingNl: string;
  beschrijvingFr: string;
  link: string;
  // Pad naar de affiche in /public/images/reizen — nog toe te voegen zodra
  // Frederic de effectieve afbeeldingsbestanden doorstuurt (niet enkel een
  // in de chat geplakte screenshot, die hier niet automatisch opgeslagen wordt).
  afficheUrl?: string;
};

// Manueel bijgehouden lijst — Claudy Weibel (Petank'Events) en partners sturen
// nieuwe affiches door, die worden hier gewoon bijgevoegd. Geen database nodig
// zolang dit een handvol reizen per jaar blijft.
export const PETANQUE_REIZEN: PetanqueReis[] = [
  {
    id: "thailande-2026",
    naam: "Thaïlande & Wereldkampioenschap Petanque 2026",
    organisatorNl: "Jamain Voyages (begeleid door Claudy Weibel)",
    organisatorFr: "Jamain Voyages (accompagné par Claudy Weibel)",
    periodeNl: "17 - 29 november 2026 (extensie mogelijk tot 3 december)",
    periodeFr: "17 - 29 novembre 2026 (extension possible jusqu'au 3 décembre)",
    locatieNl: "Bangkok, Khao Yai, Korat, Khon Kaen (Thailand)",
    locatieFr: "Bangkok, Khao Yai, Korat, Khon Kaen (Thaïlande)",
    prijsVanafNl: "€ 2.090 per persoon",
    prijsVanafFr: "€ 2 090 par personne",
    beschrijvingNl:
      "13 dagen Thailand met een bezoek aan het Wereldkampioenschap Petanque in Khon Kaen, cultuur, tempels, tuk-tuk en lokale gastronomie. Extensies naar Pattaya of Chiang Mai mogelijk.",
    beschrijvingFr:
      "13 jours en Thaïlande avec visite du Mondial de Pétanque à Khon Kaen, culture, temples, tuk-tuk et gastronomie locale. Extensions possibles vers Pattaya ou Chiang Mai.",
    link: "mailto:mondialpetanque2026@outlook.com",
    afficheUrl: "/images/reizen/thailande-jamain-voyages.jpg",
  },
  {
    id: "combat-des-teams-2026",
    naam: "Combat des Teams — 6ème édition",
    organisatorNl: "Petank'Events",
    organisatorFr: "Petank'Events",
    periodeNl: "19 - 23 oktober 2026",
    periodeFr: "19 - 23 octobre 2026",
    locatieNl: "Costa Brava, Santa Susanna (Spanje)",
    locatieFr: "Costa Brava, Santa Susanna (Espagne)",
    prijsVanafNl: "€ 475 per speler",
    prijsVanafFr: "€ 475 par joueur",
    beschrijvingNl:
      "Kies je favoriete team (Frankrijk, België, Internationaal of Corso-Marseillaise) en speel drie dagen lang samen met bekende kampioenen tijdens dit teamtoernooi.",
    beschrijvingFr:
      "Choisissez votre équipe favorite (France, Belgique, Internationale ou Corso-Marseillaise) et jouez pendant trois jours aux côtés de champions reconnus.",
    link: "mailto:petank.events@gmail.com",
    afficheUrl: "/images/reizen/combat-des-teams.jpg",
  },
  {
    id: "champions-family-corsica-2026",
    naam: "Champions Family — Séjour pétanque festif",
    organisatorNl: "Petank'Events",
    organisatorFr: "Petank'Events",
    periodeNl: "27 september - 2 oktober 2026 (varianten van 5, 6 of 7 nachten)",
    periodeFr: "27 septembre - 2 octobre 2026 (variantes de 5, 6 ou 7 nuits)",
    locatieNl: "Taglio, Corsica",
    locatieFr: "Taglio, Corse",
    prijsVanafNl: "€ 615 per persoon",
    prijsVanafFr: "€ 615 par personne",
    beschrijvingNl:
      "Feestelijk petanqueverblijf aan zee op Corsica, met dagelijkse tornooien en de garantie dat je minstens één keer met een kampioen speelt.",
    beschrijvingFr:
      "Séjour pétanque festif au bord de mer en Corse, avec des concours quotidiens et l'assurance de jouer au moins une fois avec un champion.",
    link: "mailto:petank.events@gmail.com",
    afficheUrl: "/images/reizen/champions-family.jpg",
  },
  {
    id: "the-warrior-2027",
    naam: "The Warrior — 2ème édition \"La Revanche\"",
    organisatorNl: "Petank'Events",
    organisatorFr: "Petank'Events",
    periodeNl: "22 - 26 maart 2027",
    periodeFr: "22 - 26 mars 2027",
    locatieNl: "Costa Brava, Santa Susanna (Spanje)",
    locatieFr: "Costa Brava, Santa Susanna (Espagne)",
    prijsVanafNl: "€ 475 per speler",
    prijsVanafFr: "€ 475 par joueur",
    beschrijvingNl:
      "Petanquekamp in teamverband: 4 tribus strijden 3 dagen lang om de finale totem, onder leiding van gekende Franse spelers.",
    beschrijvingFr:
      "Stage de pétanque par équipes : 4 tribus s'affrontent pendant 3 jours pour remporter le totem final, encadrées par des joueurs français reconnus.",
    link: "mailto:petank.events@gmail.com",
    afficheUrl: "/images/reizen/the-warrior.jpg",
  },
  {
    id: "women-tour-2027",
    naam: "Women Tour — 3rd Edition",
    organisatorNl: "Petank'Events",
    organisatorFr: "Petank'Events",
    periodeNl: "27 - 31 maart 2027",
    periodeFr: "27 - 31 mars 2027",
    locatieNl: "Costa Brava, Santa Susanna (Spanje)",
    locatieFr: "Costa Brava, Santa Susanna (Espagne)",
    prijsVanafNl: "€ 475 per speelster",
    prijsVanafFr: "€ 475 par joueuse",
    beschrijvingNl:
      "Petanquetornooi exclusief voor vrouwen, met € 9.000 prijzengeld, een individuele eindrangschikking en verblijf in een 4-sterrenhotel.",
    beschrijvingFr:
      "Tournoi de pétanque exclusivement féminin, avec 9 000 € de prix, un classement individuel et un séjour en hôtel 4 étoiles.",
    link: "mailto:petank.events@gmail.com",
    afficheUrl: "/images/reizen/women-tour.jpg",
  },
  {
    id: "men-tour-2027",
    naam: "Men Tour — 1st Edition",
    organisatorNl: "Petank'Events",
    organisatorFr: "Petank'Events",
    periodeNl: "27 - 31 maart 2027",
    periodeFr: "27 - 31 mars 2027",
    locatieNl: "Costa Brava, Santa Susanna (Spanje)",
    locatieFr: "Costa Brava, Santa Susanna (Espagne)",
    prijsVanafNl: "€ 475 per speler",
    prijsVanafFr: "€ 475 par joueur",
    beschrijvingNl:
      "Eerste editie van het mannentornooi, in parallel met de Women Tour, met € 9.000 prijzengeld en plaats voor beginners tot gevorderden.",
    beschrijvingFr:
      "Première édition du tournoi masculin, organisé en parallèle du Women Tour, avec 9 000 € de prix et une place pour tous les niveaux.",
    link: "mailto:petank.events@gmail.com",
    afficheUrl: "/images/reizen/men-tour.jpg",
  },
];
