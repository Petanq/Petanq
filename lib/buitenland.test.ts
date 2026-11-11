import { beforeAll, describe, expect, it } from "vitest";
import { laadPostcodes, type PostcodeIndex } from "./postcodes";
import { lijktBuitenBelgie } from "./buitenland";

let index: PostcodeIndex;
beforeAll(async () => {
  index = await laadPostcodes();
});

describe("lijktBuitenBelgie", () => {
  it("laat Belgische plaatsen met rust, in beide talen", () => {
    expect(lijktBuitenBelgie("Hemeldreef 5", "Brasschaat", index)).toBeNull();
    expect(lijktBuitenBelgie(null, "Luik", index)).toBeNull();
    expect(lijktBuitenBelgie(null, "Liège", index)).toBeNull();
    expect(lijktBuitenBelgie(null, "Beyne-Heusay", index)).toBeNull();
    expect(lijktBuitenBelgie(null, "MONT-SUR-MARCHIENNE", index)).toBeNull();
  });

  it("herkent een postcode van 5 cijfers (Frankrijk)", () => {
    expect(lijktBuitenBelgie("266 rue des Ogiers, 59170 Croix", "Croix", index)).toBe("postcode");
  });

  it("herkent een plaats die niet in België ligt", () => {
    expect(lijktBuitenBelgie("Rue du Point d'Arrêt", "Flaumont-Waudrechies", index)).toBe("plaats");
    expect(lijktBuitenBelgie(null, "Maubeuge", index)).toBe("plaats");
  });

  it("zegt niets bij een leeg veld", () => {
    expect(lijktBuitenBelgie(null, "", index)).toBeNull();
  });
});

describe("Belgische postcode in het adres", () => {
  it("telt als bewijs, ook bij een afwijkende plaatsnaam", () => {
    expect(lijktBuitenBelgie("Rue du Beau Site 25, 4400 Flémalle", "Flémalles", index)).toBeNull();
    expect(lijktBuitenBelgie(null, "8301 Knokke-Heist", index)).toBeNull();
  });
  it("een onbestaand viercijferig getal telt niet", () => {
    expect(lijktBuitenBelgie("plaats 0123A", "Maubeuge", index)).toBe("plaats");
  });
});
