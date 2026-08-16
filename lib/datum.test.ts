import { describe, it, expect } from "vitest";
import { formatDatumKort, formatUur, aantalDagenTot, parseDatum } from "./datum";

describe("formatDatumKort", () => {
  it("zet JJJJ-MM-DD om naar DD-MM-JJJJ", () => {
    expect(formatDatumKort("2026-12-27")).toBe("27-12-2026");
  });
});

describe("formatUur", () => {
  it("zet UU:MM om naar UUuMM", () => {
    expect(formatUur("09:00")).toBe("9u00");
    expect(formatUur("14:30")).toBe("14u30");
  });

  it("negeert eventuele seconden achteraan", () => {
    expect(formatUur("10:00:00")).toBe("10u00");
  });
});

describe("parseDatum", () => {
  it("interpreteert JJJJ-MM-DD als lokale datum, niet UTC", () => {
    const d = parseDatum("2026-01-01");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(0);
    expect(d.getDate()).toBe(1);
  });
});

describe("aantalDagenTot", () => {
  it("geeft 0 voor vandaag", () => {
    const vandaagStr = new Date().toISOString().slice(0, 10);
    expect(aantalDagenTot(vandaagStr)).toBe(0);
  });

  it("geeft een positief aantal dagen voor een datum in de toekomst", () => {
    const morgen = new Date();
    morgen.setDate(morgen.getDate() + 5);
    const morgenStr = morgen.toISOString().slice(0, 10);
    expect(aantalDagenTot(morgenStr)).toBe(5);
  });
});
