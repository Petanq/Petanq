import { describe, expect, it } from "vitest";
import { httpUrl, veiligeUrl } from "./veilige-url";

describe("veiligeUrl", () => {
  it("laat gewone webadressen door", () => {
    expect(veiligeUrl("https://www.petanque13.be/clubs")).toBe("https://www.petanque13.be/clubs");
    expect(veiligeUrl("  http://club.be  ")).toBe("http://club.be");
  });
  it("weigert gevaarlijke of onbruikbare adressen", () => {
    expect(veiligeUrl("javascript:alert(1)")).toBeUndefined();
    expect(veiligeUrl("JavaScript:alert(1)")).toBeUndefined();
    expect(veiligeUrl("data:text/html,<script>alert(1)</script>")).toBeUndefined();
    expect(veiligeUrl("vbscript:x")).toBeUndefined();
    expect(veiligeUrl("ftp://x.be")).toBeUndefined();
    expect(veiligeUrl("www.zonder-protocol.be")).toBeUndefined();
    expect(veiligeUrl("")).toBeUndefined();
    expect(veiligeUrl(null)).toBeUndefined();
  });
});

describe("httpUrl (schema)", () => {
  it("aanvaardt http(s) en weigert de rest", () => {
    expect(httpUrl.safeParse("https://ok.be/affiche.png").success).toBe(true);
    expect(httpUrl.safeParse("javascript:alert(1)").success).toBe(false);
    expect(httpUrl.safeParse("data:text/html,x").success).toBe(false);
    expect(httpUrl.safeParse("ftp://x.be").success).toBe(false);
  });
});
