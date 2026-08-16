import { describe, it, expect } from "vitest";
import { googleAgendaLink } from "./agenda";
import { Toernooi } from "./types";

const basisToernooi: Toernooi = {
  id: "1",
  aangemaakt_op: "2026-01-01T00:00:00Z",
  datum: "2026-12-27",
  uur: "10:00",
  clubnaam: "OPC Oostende",
  naam_nl: "Trofee Jeannot Backaert",
  naam_fr: "Trofee Jeannot Backaert",
  gemeente: "Oostende",
  adres: "Steensedijk 2",
  provincie: "west-vlaanderen",
  regio: "vlaanderen",
  categorie: "heren",
  formule: "doublette",
  speelvorm: "rondes",
  aantal_ronden: null,
  aantal_poules: null,
  inschrijvingsprijs: 20,
  gratis: false,
  max_ploegen: null,
  vol: false,
  geannuleerd: false,
  open_toernooi: true,
  finale: true,
  affiche_url: null,
  contact_email: null,
  link_inschrijving: null,
  opmerking: null,
  kwalificatiedata: [{ datum: "2026-12-26", uur: "14:00" }],
  kwalificatie_uur: "19:00",
  status: "goedgekeurd",
  ingediend_door: null,
  goedgekeurd_door: null,
  goedgekeurd_op: null,
  verwijderd_op: null,
  verwijder_aanvraag_door: null,
  verwijder_aanvraag_reden: null,
  verwijder_aanvraag_op: null,
};

describe("googleAgendaLink", () => {
  it("gebruikt de hoofddatum/-uur van het toernooi zonder override", () => {
    const link = googleAgendaLink(basisToernooi, basisToernooi.naam_nl);
    expect(link).toContain("dates=20261227T100000%2F20261227T140000");
  });

  it("gebruikt de eigen datum/uur van een schiftingsdag wanneer die meegegeven worden", () => {
    // Dit is exact het scenario van de "Trofee Jeannot Backaert": de laatste
    // schifting (26/12) heeft een ander uur (14u) dan de rest (19u).
    const link = googleAgendaLink(basisToernooi, basisToernooi.naam_nl, "2026-12-26", "14:00");
    expect(link).toContain("dates=20261226T140000%2F20261226T180000");
  });

  it("valt terug op het algemene kwalificatie_uur wanneer een schiftingsdag geen eigen uur heeft", () => {
    const eigenUur = basisToernooi.kwalificatie_uur ?? undefined;
    const link = googleAgendaLink(basisToernooi, basisToernooi.naam_nl, "2026-12-14", eigenUur);
    expect(link).toContain("dates=20261214T190000%2F20261214T230000");
  });

  it("neemt de locatie en clubnaam op in de link", () => {
    const link = decodeURIComponent(googleAgendaLink(basisToernooi, basisToernooi.naam_nl).replace(/\+/g, " "));
    expect(link).toContain("Steensedijk 2, Oostende");
    expect(link).toContain("Trofee Jeannot Backaert - OPC Oostende");
  });
});
