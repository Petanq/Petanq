import { describe, expect, it } from "vitest";
import { isGeldigeOrganisator, schoonOrganisator, splitsOrganisator, voegOrganisatorSamen } from "./organisator";

describe("isGeldigeOrganisator", () => {
  it("accepteert voornaam en naam", () => {
    expect(isGeldigeOrganisator("Jan Peeters")).toBe(true);
    expect(isGeldigeOrganisator("  Marie-Claire  De Smet ")).toBe(true);
    expect(isGeldigeOrganisator("Frédéric Müller")).toBe(true);
  });

  it("weigert leeg, één woord of losse letters", () => {
    expect(isGeldigeOrganisator("")).toBe(false);
    expect(isGeldigeOrganisator("   ")).toBe(false);
    expect(isGeldigeOrganisator(null)).toBe(false);
    expect(isGeldigeOrganisator(undefined)).toBe(false);
    expect(isGeldigeOrganisator("Jan")).toBe(false);
    expect(isGeldigeOrganisator("J P")).toBe(false);
    expect(isGeldigeOrganisator("Jan 12")).toBe(false);
  });
});

describe("schoonOrganisator", () => {
  it("haalt dubbele spaties weg", () => {
    expect(schoonOrganisator("  Jan   Peeters ")).toBe("Jan Peeters");
  });
});

describe("splitsOrganisator / voegOrganisatorSamen", () => {
  it("splitst op de eerste spatie", () => {
    expect(splitsOrganisator("Frederic Keulemans")).toEqual({ voornaam: "Frederic", naam: "Keulemans" });
    expect(splitsOrganisator("Marie De Smet")).toEqual({ voornaam: "Marie", naam: "De Smet" });
    expect(splitsOrganisator("Jan")).toEqual({ voornaam: "Jan", naam: "" });
    expect(splitsOrganisator(null)).toEqual({ voornaam: "", naam: "" });
  });

  it("voegt twee velden samen tot één geldige waarde", () => {
    expect(voegOrganisatorSamen(" Jan ", " Peeters ")).toBe("Jan Peeters");
    expect(isGeldigeOrganisator(voegOrganisatorSamen("Jan", "Peeters"))).toBe(true);
    expect(isGeldigeOrganisator(voegOrganisatorSamen("Jan", ""))).toBe(false);
    expect(isGeldigeOrganisator(voegOrganisatorSamen("", "Peeters"))).toBe(false);
    expect(isGeldigeOrganisator(voegOrganisatorSamen("J", "Peeters"))).toBe(false);
  });

  it("is bij laden en terug samenvoegen stabiel", () => {
    const { voornaam, naam } = splitsOrganisator("Marie De Smet");
    expect(voegOrganisatorSamen(voornaam, naam)).toBe("Marie De Smet");
  });
});
