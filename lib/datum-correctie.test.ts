import { describe, it, expect } from "vitest";
import { naarToekomst, corrigeerJaartallen, AfficheVelden } from "./datum-correctie";

describe("naarToekomst", () => {
  it("laat een datum die al in de toekomst ligt ongewijzigd", () => {
    expect(naarToekomst("2026-12-27", "2026-08-16")).toBe("2026-12-27");
  });

  it("duwt een datum in het verleden naar hetzelfde dag-en-maand volgend jaar", () => {
    expect(naarToekomst("2024-10-02", "2026-08-16")).toBe("2026-10-02");
  });

  it("duwt meerdere jaren vooruit indien nodig", () => {
    // 5 januari ligt vroeger op het jaar dan 16 augustus, dus 2026-01-05 telt
    // ook al als voorbij t.o.v. "vandaag" 2026-08-16 — pas 2027 is toekomstig.
    expect(naarToekomst("2020-01-05", "2026-08-16")).toBe("2027-01-05");
  });

  it("behandelt vandaag zelf als niet-verleden (blijft dit jaar)", () => {
    expect(naarToekomst("2026-08-16", "2026-08-16")).toBe("2026-08-16");
  });

  it("geeft ongeldige invoer ongewijzigd terug", () => {
    expect(naarToekomst("onbekend", "2026-08-16")).toBe("onbekend");
  });
});

describe("corrigeerJaartallen", () => {
  const basis: AfficheVelden = {
    datum: null,
    uur: null,
    clubnaam: "Test Club",
    naam_nl: "Test",
    naam_fr: "Test",
    gemeente: "Gent",
    adres: null,
    provincie: null,
    categorie: null,
    formule: null,
    speelvorm: null,
    aantal_ronden: null,
    aantal_poules: null,
    contact_email: null,
    inschrijvingsprijs: null,
    gratis: null,
    max_ploegen: null,
    link_inschrijving: null,
    opmerking: null,
    kwalificatiedata: null,
    kwalificatie_uur: null,
  };

  it("behoudt de juiste volgorde tussen schiftingen (okt-dec) en een finale die pas in januari van het jaar erna valt", () => {
    const vandaag = "2026-08-16";
    const [resultaat] = corrigeerJaartallen(
      [
        {
          ...basis,
          datum: "2025-01-17", // finale, oorspronkelijk jaar X
          kwalificatiedata: [
            { datum: "2024-10-02", uur: null, opmerking: null }, // schifting, jaar X-1
            { datum: "2024-11-13", uur: null, opmerking: null },
          ],
        },
      ],
      vandaag
    );

    expect(resultaat.kwalificatiedata?.[0].datum).toBe("2026-10-02");
    expect(resultaat.kwalificatiedata?.[1].datum).toBe("2026-11-13");
    expect(resultaat.datum).toBe("2027-01-17");
    // De finale moet na alle schiftingen liggen, ook na de correctie.
    expect(resultaat.datum! > resultaat.kwalificatiedata![1].datum!).toBe(true);
  });

  it("laat null-datums met rust", () => {
    const [resultaat] = corrigeerJaartallen([{ ...basis, datum: null, kwalificatiedata: null }], "2026-08-16");
    expect(resultaat.datum).toBeNull();
    expect(resultaat.kwalificatiedata).toBeNull();
  });
});
