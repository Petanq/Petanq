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

export type KwalificatieDatum = { datum: string; uur: string | null };

export type Toernooi = {
  id: string;
  aangemaakt_op: string;
  datum: string;
  uur: string;
  clubnaam: string;
  naam_nl: string;
  naam_fr: string;
  gemeente: string;
  adres: string | null;
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
  geannuleerd: boolean;
  open_toernooi: boolean;
  finale: boolean;
  affiche_url: string | null;
  contact_email: string | null;
  link_inschrijving: string | null;
  opmerking: string | null;
  kwalificatiedata: KwalificatieDatum[] | null;
  kwalificatie_uur: string | null;
  status: ToernooiStatus;
  ingediend_door: string | null;
  goedgekeurd_door: string | null;
  goedgekeurd_op: string | null;
  verwijderd_op: string | null;
  verwijder_aanvraag_door: string | null;
  verwijder_aanvraag_reden: string | null;
  verwijder_aanvraag_op: string | null;
};

export type NieuwToernooi = Omit<
  Toernooi,
  | "id"
  | "aangemaakt_op"
  | "regio"
  | "status"
  | "goedgekeurd_door"
  | "goedgekeurd_op"
  | "verwijderd_op"
  | "verwijder_aanvraag_door"
  | "verwijder_aanvraag_reden"
  | "verwijder_aanvraag_op"
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
  verwijderd_op: string | null;
  verwijder_aanvraag_door: string | null;
  verwijder_aanvraag_reden: string | null;
  verwijder_aanvraag_op: string | null;
};

export type NieuweClub = Omit<
  Club,
  | "id"
  | "regio"
  | "aangemaakt_op"
  | "actief"
  | "verwijderd_op"
  | "verwijder_aanvraag_door"
  | "verwijder_aanvraag_reden"
  | "verwijder_aanvraag_op"
>;

export type NieuwsbriefInschrijving = {
  id: string;
  email: string;
  provincie: Provincie | null;
  taal: NieuwsbriefTaal;
  aangemaakt_op: string;
  actief: boolean;
};

export type Idee = {
  id: string;
  moderator_naam: string;
  tekst: string;
  afgehandeld: boolean;
  aangemaakt_op: string;
};

export type Moderator = {
  id: string;
  user_id: string;
  naam: string;
  email: string;
  provincie: Provincie | null;
  rol: ModeratorRol;
  wachtwoord_ingesteld: boolean;
  goedgekeurd: boolean;
  toegangsniveau: "eigen_provincie" | "eigen_regio" | "heel_belgie";
  aangemaakt_op: string;
  bezoek_aantal: number;
  laatste_bezoek: string | null;
};
