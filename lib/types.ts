import { Provincie, Regio } from "./provincies";

export type Categorie = "heren" | "dames" | "mix" | "jeugd" | "kampioenschap" | "circuit" | "recreanten";

export type Formule =
  | "tete-a-tete"
  | "doublette"
  | "triplette"
  | "sextet"
  | "quartet"
  | "kwintet"
  | "kleurentornooi";

export type Speelvorm = "rondes" | "poules";

export type ToernooiStatus = "in_behandeling" | "goedgekeurd" | "geweigerd";

export type ModeratorRol = "moderator" | "admin";

export type NieuwsbriefTaal = "nl" | "fr";

export type Toernooi = {
  id: string;
  aangemaakt_op: string;
  datum: string;
  uur: string;
  clubnaam: string;
  naam_nl: string;
  naam_fr: string;
  gemeente: string;
  provincie: Provincie;
  regio: Regio;
  categorie: Categorie;
  formule: Formule;
  speelvorm: Speelvorm;
  aantal_ronden: number | null;
  aantal_poules: number | null;
  inschrijvingsprijs: number | null;
  gratis: boolean;
  max_ploegen: number | null;
  vol: boolean;
  open_toernooi: boolean;
  finale: boolean;
  affiche_url: string | null;
  contact_email: string | null;
  link_inschrijving: string | null;
  opmerking: string | null;
  status: ToernooiStatus;
  ingediend_door: string | null;
  goedgekeurd_door: string | null;
  goedgekeurd_op: string | null;
};

export type NieuwToernooi = Omit<
  Toernooi,
  "id" | "aangemaakt_op" | "regio" | "status" | "goedgekeurd_door" | "goedgekeurd_op"
>;

export type Club = {
  id: string;
  naam: string;
  gemeente: string;
  provincie: Provincie;
  regio: Regio;
  adres: string | null;
  website: string | null;
  contact_email: string | null;
  telefoon: string | null;
  openingsuren: string | null;
  foto_url: string | null;
  aangemaakt_op: string;
  actief: boolean;
};

export type NieuweClub = Omit<Club, "id" | "regio" | "aangemaakt_op" | "actief">;

export type NieuwsbriefInschrijving = {
  id: string;
  email: string;
  provincie: Provincie | null;
  taal: NieuwsbriefTaal;
  aangemaakt_op: string;
  actief: boolean;
};

export type Moderator = {
  id: string;
  user_id: string;
  naam: string;
  email: string;
  provincie: Provincie | null;
  rol: ModeratorRol;
};
