import { describe, it, expect } from "vitest";
import { normaliseerUrl } from "./normaliseer-url";

describe("normaliseerUrl", () => {
  it("voegt https:// toe als het protocol ontbreekt", () => {
    expect(normaliseerUrl("www.pctornooi.be")).toBe("https://www.pctornooi.be");
    expect(normaliseerUrl("facebook.com/evenement/123")).toBe("https://facebook.com/evenement/123");
  });

  it("laat een bestaand protocol ongemoeid", () => {
    expect(normaliseerUrl("https://www.pctornooi.be")).toBe("https://www.pctornooi.be");
    expect(normaliseerUrl("http://www.pctornooi.be")).toBe("http://www.pctornooi.be");
  });

  it("verwijdert overtollige spaties", () => {
    expect(normaliseerUrl("  www.pctornooi.be  ")).toBe("https://www.pctornooi.be");
  });

  it("laat een lege waarde leeg", () => {
    expect(normaliseerUrl("")).toBe("");
    expect(normaliseerUrl("   ")).toBe("");
  });
});
