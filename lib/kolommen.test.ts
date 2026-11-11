import { describe, expect, it } from "vitest";
import { CLUB_PUBLIEKE_KOLOMLIJST, TOERNOOI_PUBLIEKE_KOLOMLIJST } from "./kolommen";

// De privékolommen mogen nooit in de openbare lijsten komen.
describe("openbare kolommen", () => {
  it("bevat geen persoonsgegevens van indieners of moderatoren", () => {
    for (const prive of ["ingediend_door", "goedgekeurd_door", "verwijder_aanvraag_door", "verwijder_aanvraag_reden", "verwijder_aanvraag_op"]) {
      expect(TOERNOOI_PUBLIEKE_KOLOMLIJST).not.toContain(prive);
      expect(CLUB_PUBLIEKE_KOLOMLIJST).not.toContain(prive);
    }
    expect(CLUB_PUBLIEKE_KOLOMLIJST).not.toContain("vertrouwd");
  });
  it("bevat de kolommen die de pagina's nodig hebben voor filteren", () => {
    for (const k of ["id", "status", "verwijderd_op", "datum"]) expect(TOERNOOI_PUBLIEKE_KOLOMLIJST).toContain(k);
    for (const k of ["id", "actief", "verwijderd_op", "naam"]) expect(CLUB_PUBLIEKE_KOLOMLIJST).toContain(k);
  });
});
