import { describe, expect, it } from "vitest";
import { isGeldigeOrganisator, schoonOrganisator } from "./organisator";

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
