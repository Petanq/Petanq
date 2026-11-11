import { describe, expect, it } from "vitest";
import { kernNaam, vindClubVoorTornooi, type KoppelClub } from "./club-koppelen";

const clubs: KoppelClub[] = [
  { id: "nivelles", naam: "Royal Petanque Club Nivelloise", gemeente: "Nivelles", adres: "rue de Bruxelles 10, 1400 Nivelles" },
  { id: "hemelhof", naam: "PC Hemelhof", gemeente: "Antwerpen", adres: "Hemeldreef 5, 2930 Brasschaat" },
  { id: "uccle", naam: "Royal Petanque Uccle Centre", gemeente: "Uccle", adres: "rue Robert Scott, 14, 1180 Uccle" },
  { id: "domaine", naam: "PC Le Domaine", gemeente: "Bruxelles", adres: "rue Robert Scott, 14, 1180 Bruxelles" },
  { id: "forever", naam: "Forever Saint Josse", gemeente: "Evere", adres: "Avenue des Communautés, 6, 1140 Evere" },
  { id: "beyne", naam: "P.c. Beyne", gemeente: "Beyne-Heusay", adres: "rue Victor Yansenne, 2, 4610 Beyne-Heusay" },
  { id: "cigales", naam: "Les Cigales De Boncelles", gemeente: "Beyne-Heusay", adres: "rue Victor Yansenne, 4510 Beyne-Heusay" },
  { id: "carolos", naam: "Royal PC Les Carolos", gemeente: "Lodelinsart", adres: "Rue du Chemin Vert ,125B, 6042 Lodelinsart" },
  { id: "jumet", naam: "PC A.s. Jumet", gemeente: "Lodelinsart", adres: "Rue du Chemin Vert, 25B, 6042 Lodelinsart" },
];

describe("kernNaam", () => {
  it("laat afkortingen en algemene woorden weg", () => {
    expect(kernNaam("R.P.C. Nivelloise")).toBe("nivelloise");
    expect(kernNaam("Royal Petanque Club Nivelloise")).toBe("nivelloise");
    expect(kernNaam("PC BEYNE B03")).toBe("b03 beyne");
  });
});

describe("vindClubVoorTornooi", () => {
  it("koppelt op kernnaam in dezelfde gemeente", () => {
    expect(vindClubVoorTornooi({ clubnaam: "R.P.C. Nivelloise", gemeente: "Nivelles", adres: null }, clubs)?.id).toBe("nivelles");
  });

  it("koppelt op adres, ook als de naam anders is en de gemeente verschilt", () => {
    expect(vindClubVoorTornooi({ clubnaam: "Pc Hemelhof", gemeente: "Brasschaat", adres: "Hemeldreef 5" }, clubs)?.id).toBe("hemelhof");
    expect(vindClubVoorTornooi({ clubnaam: "PC Forever", gemeente: "Evère", adres: "Avenue des Communautés 6" }, clubs)?.id).toBe("forever");
  });

  it("herkent een huisnummer dat vooraan staat", () => {
    expect(vindClubVoorTornooi({ clubnaam: "Royal Pétanque Carolo", gemeente: "Mont-sur-Marchienne", adres: "125B Rue du Chemin Vert" }, clubs)?.id).toBe("carolos");
  });

  it("koppelt niet als twee clubs op hetzelfde adres staan en de naam niet beslist", () => {
    expect(vindClubVoorTornooi({ clubnaam: "Onbekende club", gemeente: "Uccle", adres: "Rue Robert Scott 14" }, clubs)).toBeNull();
  });

  it("laat de naam beslissen bij meerdere clubs op hetzelfde adres", () => {
    expect(vindClubVoorTornooi({ clubnaam: "RPUC Uccle Centre", gemeente: "Uccle", adres: "Rue Robert Scott 14" }, clubs)).toBeNull();
    expect(vindClubVoorTornooi({ clubnaam: "Royal Petanque Uccle Centre", gemeente: "Uccle", adres: "Rue Robert Scott 14" }, clubs)?.id).toBe("uccle");
  });

  it("koppelt niet als naam en adres twee verschillende clubs aanwijzen", () => {
    expect(vindClubVoorTornooi({ clubnaam: "PC Hemelhof", gemeente: "Antwerpen", adres: "Rue Victor Yansenne 2" }, clubs)).toBeNull();
  });

  it("koppelt niet zonder aanwijzing", () => {
    expect(vindClubVoorTornooi({ clubnaam: "Heer", gemeente: "Heer", adres: "Salle des Minouches Rue des Douaniers 112" }, clubs)).toBeNull();
    expect(vindClubVoorTornooi({ clubnaam: "", gemeente: "Nivelles", adres: null }, clubs)).toBeNull();
  });

  it("zelfde straat zonder huisnummer telt niet als adres", () => {
    expect(vindClubVoorTornooi({ clubnaam: "Iets anders", gemeente: "Beyne-Heusay", adres: "rue Victor Yansenne" }, clubs)).toBeNull();
  });
});
