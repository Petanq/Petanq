import { afterEach, describe, expect, it } from "vitest";
import { siteUrl } from "./site-url";

const oud = process.env.NEXT_PUBLIC_SITE_URL;
afterEach(() => {
  if (oud === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = oud;
});

describe("siteUrl", () => {
  it("gebruikt altijd het www-adres voor de echte site", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://petanque13.be";
    expect(siteUrl()).toBe("https://www.petanque13.be");
    process.env.NEXT_PUBLIC_SITE_URL = "https://petanque13.be/";
    expect(siteUrl()).toBe("https://www.petanque13.be");
    process.env.NEXT_PUBLIC_SITE_URL = "http://petanque13.be";
    expect(siteUrl()).toBe("https://www.petanque13.be");
  });
  it("laat een correct adres en lokaal gebruik ongemoeid", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://www.petanque13.be";
    expect(siteUrl()).toBe("https://www.petanque13.be");
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
    expect(siteUrl()).toBe("http://localhost:3000");
  });
  it("valt terug op het www-adres zonder instelling", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(siteUrl()).toBe("https://www.petanque13.be");
  });
});
