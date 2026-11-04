import { describe, expect, it } from "vitest";
import {
  actieveAfwijkingen,
  brusselsVandaag,
  clubUrenSchema,
  dagVoorDatum,
  formatDagUren,
  heeftIngevuldeUren,
  leegUren,
  seizoenVoor,
  veranderdeDagen,
  voorstelSchema,
  weekdagIndex,
} from "./uren";

describe("seizoenVoor", () => {
  it("zomer loopt van 1 april tot 30 september", () => {
    expect(seizoenVoor("2026-04-01")).toBe("zomer");
    expect(seizoenVoor("2026-09-30")).toBe("zomer");
  });
  it("winter loopt van 1 oktober tot 31 maart", () => {
    expect(seizoenVoor("2026-10-01")).toBe("winter");
    expect(seizoenVoor("2027-03-31")).toBe("winter");
    expect(seizoenVoor("2026-12-24")).toBe("winter");
  });
});

describe("weekdagIndex", () => {
  it("maandag is 0 en zondag is 6", () => {
    expect(weekdagIndex("2026-11-02")).toBe(0); // maandag
    expect(weekdagIndex("2026-11-04")).toBe(2); // woensdag
    expect(weekdagIndex("2026-11-08")).toBe(6); // zondag
  });
});

describe("dagVoorDatum", () => {
  it("kiest het juiste seizoen en de juiste weekdag", () => {
    const uren = leegUren();
    uren.winter[2] = { open: true, van: "13:30", tot: "22:00", soort: "competitie", notitie: "" };
    uren.zomer[2] = { open: true, van: "13:30", tot: "20:00", soort: "open", notitie: "" };
    expect(dagVoorDatum(uren, "2026-11-04").tot).toBe("22:00"); // woensdag in de winter
    expect(dagVoorDatum(uren, "2026-07-01").tot).toBe("20:00"); // woensdag in de zomer
  });
});

describe("actieveAfwijkingen", () => {
  it("telt de begin- en einddatum mee", () => {
    const uren = leegUren();
    uren.afwijkingen = [{ van: "2026-12-24", tot: "2027-01-02", tekst: "Gesloten" }];
    expect(actieveAfwijkingen(uren, "2026-12-23")).toHaveLength(0);
    expect(actieveAfwijkingen(uren, "2026-12-24")).toHaveLength(1);
    expect(actieveAfwijkingen(uren, "2027-01-02")).toHaveLength(1);
    expect(actieveAfwijkingen(uren, "2027-01-03")).toHaveLength(0);
  });
});

describe("brusselsVandaag", () => {
  it("gebruikt de Belgische datum, ook vlak na middernacht UTC-tijd", () => {
    expect(brusselsVandaag(new Date("2026-11-03T23:30:00Z"))).toBe("2026-11-04"); // 00:30 in België
    expect(brusselsVandaag(new Date("2026-07-01T22:30:00Z"))).toBe("2026-07-02"); // 00:30 in de zomer
  });
});

describe("formatDagUren", () => {
  it("toont uren of gesloten", () => {
    expect(formatDagUren({ open: true, van: "13:30", tot: "19:00", soort: "open", notitie: "" })).toBe("13u30 – 19u00");
    expect(formatDagUren({ open: false, van: "13:30", tot: "19:00", soort: "open", notitie: "" })).toBe("Gesloten");
  });
});

describe("heeftIngevuldeUren", () => {
  it("is false zolang alle dagen gesloten zijn", () => {
    expect(heeftIngevuldeUren(leegUren())).toBe(false);
    expect(heeftIngevuldeUren(null)).toBe(false);
    const uren = leegUren();
    uren.zomer[0].open = true;
    expect(heeftIngevuldeUren(uren)).toBe(true);
  });
});

describe("veranderdeDagen", () => {
  it("markeert enkel de gewijzigde dagen", () => {
    const oud = leegUren().winter;
    const nieuw = oud.map((d) => ({ ...d }));
    nieuw[4].open = true;
    expect(veranderdeDagen(oud, nieuw)).toEqual([false, false, false, false, true, false, false]);
  });
});

describe("validatie", () => {
  it("accepteert een geldig schema", () => {
    expect(clubUrenSchema.safeParse(leegUren()).success).toBe(true);
  });
  it("weigert een link in de opmerking", () => {
    const uren = leegUren();
    uren.winter[0].notitie = "Kijk op www.voorbeeld.be";
    expect(clubUrenSchema.safeParse(uren).success).toBe(false);
  });
  it("weigert een te lange opmerking en een slecht uur", () => {
    const lang = leegUren();
    lang.winter[0].notitie = "x".repeat(61);
    expect(clubUrenSchema.safeParse(lang).success).toBe(false);
    const slecht = leegUren();
    slecht.winter[0].van = "25:00";
    expect(clubUrenSchema.safeParse(slecht).success).toBe(false);
  });
  it("weigert een afwijking waarvan de einddatum voor de begindatum ligt", () => {
    const uren = leegUren();
    uren.afwijkingen = [{ van: "2026-12-24", tot: "2026-12-01", tekst: "Gesloten" }];
    expect(clubUrenSchema.safeParse(uren).success).toBe(false);
  });
  it("een voorstel mag enkel gegevens bevatten", () => {
    expect(voorstelSchema.safeParse({ gegevens: { telefoon: "09 221 36 63" } }).success).toBe(true);
    expect(voorstelSchema.safeParse({ gegevens: { contact_email: "geen-mail" } }).success).toBe(false);
  });
});
