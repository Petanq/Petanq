const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  Header, Footer, ExternalHyperlink, ImageRun, PageOrientation,
} = require("docx");
const fs = require("fs");

const logoData = fs.readFileSync("../public/images/logo-icon.png");

const GOUD = "F4C430";
const ZWART = "1F1F1F";
const ROOD = "D62828";
const GRIJS = "555555";
const LICHTGRIJS = "E5E5E5";

function subtitel(tekst) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 120 },
    children: [new TextRun({ text: tekst, color: ROOD, bold: true })],
  });
}

function tekst(t, opts = {}) {
  return new Paragraph({
    spacing: { after: 160 },
    children: [new TextRun({ text: t, size: 20, color: ZWART, ...opts })],
  });
}

function bullet(t) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 80 },
    children: [new TextRun({ text: t, size: 20, color: ZWART })],
  });
}

function link(tekstLabel, url) {
  return new ExternalHyperlink({
    link: url,
    children: [new TextRun({ text: tekstLabel, size: 16, color: "1a4480", underline: {} })],
  });
}

function cel(children, width, shading) {
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    shading: shading ? { type: ShadingType.CLEAR, fill: shading } : undefined,
    children,
  });
}

const KOLOMBREEDTES = [13, 22, 11, 21, 14, 19];
const KOLOMLABELS = ["Bedrijf", "Adres (hoofdzetel)", "Telefoon", "E-mail / contact", "Website", "Sponsoring (indien gekend)"];

function rij(bedrijf, adres, telefoon, contact, siteLabel, siteUrl, opmerking) {
  return new TableRow({
    children: [
      cel([new Paragraph({ children: [new TextRun({ text: bedrijf, bold: true, size: 17, color: ZWART })] })], KOLOMBREEDTES[0]),
      cel([new Paragraph({ children: [new TextRun({ text: adres, size: 16, color: ZWART })] })], KOLOMBREEDTES[1]),
      cel([new Paragraph({ children: [new TextRun({ text: telefoon, size: 16, color: ZWART })] })], KOLOMBREEDTES[2]),
      cel([new Paragraph({ children: [new TextRun({ text: contact, size: 15, color: ZWART })] })], KOLOMBREEDTES[3]),
      cel([new Paragraph({ children: [link(siteLabel, siteUrl)] })], KOLOMBREEDTES[4]),
      cel([new Paragraph({ children: [new TextRun({ text: opmerking || "—", size: 15, color: GRIJS })] })], KOLOMBREEDTES[5]),
    ],
  });
}

function bedrijvenTabel(rijen) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: LICHTGRIJS },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: LICHTGRIJS },
      left: { style: BorderStyle.SINGLE, size: 4, color: LICHTGRIJS },
      right: { style: BorderStyle.SINGLE, size: 4, color: LICHTGRIJS },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: LICHTGRIJS },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: LICHTGRIJS },
    },
    rows: [
      new TableRow({
        tableHeader: true,
        children: KOLOMLABELS.map((label, i) =>
          cel([new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 15, color: "FFFFFF" })] })], KOLOMBREEDTES[i], "1F1F1F")
        ),
      }),
      ...rijen,
    ],
  });
}

const doc = new Document({
  sections: [
    {
      properties: {
        page: {
          size: { width: 16838, height: 11906, orientation: PageOrientation.LANDSCAPE },
          margin: { top: 700, bottom: 700, left: 700, right: 700 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: "PETANQUE13 · KANDIDAAT-SPONSORS", size: 14, color: GRIJS })],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "Petanque13 — de Belgische petanquekalender · petanque13.be", size: 14, color: GRIJS })],
            }),
          ],
        }),
      },
      children: [
        new Paragraph({
          children: [
            new ImageRun({ data: logoData, type: "png", transformation: { width: 36, height: 36 } }),
            new TextRun({ text: "  Petanque", bold: true, size: 48, color: ZWART }),
            new TextRun({ text: "13", bold: true, size: 48, color: GOUD }),
          ],
        }),
        new Paragraph({
          spacing: { before: 60, after: 240 },
          children: [new TextRun({ text: "KANDIDAAT-SPONSORS — GROTE BELGISCHE BEDRIJVEN", bold: true, size: 18, color: ROOD })],
        }),
        new Paragraph({
          heading: HeadingLevel.TITLE,
          spacing: { after: 200 },
          children: [new TextRun({ text: "90 grote, bekende bedrijven om te benaderen", bold: true, size: 26, color: ZWART })],
        }),
        tekst(
          "Dit zijn allemaal echte, bestaande bedrijven, met hun officiële hoofdzetel-adres en algemeen telefoonnummer/contactkanaal — nagekeken via live opzoekingen op het internet. Belangrijk: nergens in deze lijst staat een verzonnen naam van een specifieke contactpersoon. Zo'n naam kan niet betrouwbaar worden opgezocht (functies en personen veranderen voortdurend) en zou je op het verkeerde spoor kunnen zetten. Bel of mail dus het algemene nummer/adres en vraag concreet naar de sponsoring- of marketingafdeling — dat is de gangbare en betrouwbare manier om bij de juiste persoon te geraken."
        ),
        tekst(
          "Nog niemand hier weet dat Petanque13 bestaat als sponsormogelijkheid — dit is een vertreklijst, geen bevestigde interesse. Begin realistisch: 5 tot 10 gerichte contacten per maand is haalbaarder (en effectiever) dan alle 90 tegelijk aanschrijven."
        ),

        subtitel("0. Petanque-fabrikant"),
        tekst("De enige petanquespecifieke naam in deze lijst — bewust behouden omdat het een grote, wereldwijd bekende fabrikant is, geen winkel."),
        bedrijvenTabel([
          rij("Obut (La Boule Obut SAS)", "5 Che du Cros, 42380 Saint-Bonnet-le-Château (Frankrijk)", "+33 4 77 45 57 00", "via laventureobut.com/informations-pratiques", "obut.com", "https://www.obut.com/", "Wereldmarktleider petanqueballen; benader bij voorkeur via hun Belux-verdeler voor lokale sponsoring"),
        ]),

        subtitel("1. Telecom, media & technologie"),
        bedrijvenTabel([
          rij("Telenet Group NV", "Liersesteenweg 4, 2800 Mechelen", "015 66 66 66", "telenet.be/corporate/nl/contact.html", "telenet.be", "https://www2.telenet.be/corporate/nl/contact.html", "Sponsor Windrose Giants Antwerp (basketbal), sinds 2017"),
          rij("Proximus NV", "Koning Albert II-laan 27, 1030 Brussel", "0800 22 800", "proximus.com/nl/our-company/contact.html", "proximus.be", "https://www.proximus.com/nl/our-company/contact.html", "Top Premium Partner KBVB (Rode Duivels & Red Flames), tot 2028"),
          rij("Orange Belgium NV", "Bourgetlaan 3, 1140 Evere", "+32 2 745 71 11", "orange.be/nl/contact", "orange.be", "https://www.orange.be/nl/contact", ""),
          rij("VOO (Orange Belgium)", "Rue Louvrex 95, 4000 Luik", "078 50 50 50", "voo.be/fr/coordonnees", "voo.be", "https://www.voo.be/fr/coordonnees", ""),
          rij("DPG Media Group NV", "Mediaplein 1, 2018 Antwerpen", "02 454 22 11", "dpgmediagroup.com/contact", "dpgmediagroup.com", "https://www.dpgmediagroup.com/contact", "Eigenaar van VTM"),
          rij("Mediahuis NV", "Katwilgweg 2, 2050 Antwerpen", "+32 3 210 02 10", "mediahuis.be", "mediahuis.be", "https://www.mediahuis.be", ""),
          rij("Microsoft NV (Belux)", "Leonardo Da Vincilaan 3, 1935 Zaventem", "02 503 31 13", "microsoft.com/nl-be (kantorenlijst)", "microsoft.com/nl-be", "https://www.microsoft.com/nl-be/about/officelocator/all-offices", ""),
          rij("IBM Belgium NV", "Bourgetlaan 42, 1130 Brussel", "+32 2 339 21 11", "blueline@be.ibm.com", "ibm.com/be", "https://www.ibm.com/be", ""),
          rij("Cegeka NV", "Universiteitslaan 9, 3500 Hasselt", "+32 11 24 02 34", "cegeka.group@cegeka.be", "cegeka.com", "https://www.cegeka.com", "Naamsponsor Cegeka Arena, stadion KRC Genk"),
          rij("Barco NV", "President Kennedypark 35, 8500 Kortrijk", "+32 56 23 32 11", "barco.com/en/about/investors/contact", "barco.com", "https://www.barco.com/en/about/investors/contact", ""),
          rij("Agfa-Gevaert NV", "Septestraat 27, 2640 Mortsel", "+32 3 444 21 11", "agfa.com/corporate/contact", "agfa.com", "https://www.agfa.com/corporate/contact", ""),
          rij("Umicore NV", "Broekstraat 31, 1000 Brussel", "+32 2 227 71 11", "umicore.be/nl/contact", "umicore.com", "https://www.umicore.com", ""),
          rij("Ontex Group NV", "Korte Keppestraat 21, 9320 Aalst", "+32 53 333 600", "ontexgroupnv@ontexglobal.com", "ontex.com", "https://www.ontex.com", ""),
          rij("Econocom België", "Leuvensesteenweg 510, 1930 Zaventem", "+32 2 790 81 11", "econocom.be/nl", "econocom.be", "https://www.econocom.be/nl", ""),
          rij("Materialise NV", "Technologielaan 15, 3001 Leuven", "+32 16 39 66 11", "investors@materialise.com", "materialise.com", "https://www.materialise.com", ""),
          rij("Melexis NV", "Rozendaalstraat 12, 8900 Ieper", "+32 57 22 61 31", "reception_iep@melexis.com", "melexis.com", "https://www.melexis.com", ""),
        ]),

        subtitel("2. Banken & verzekeringen"),
        bedrijvenTabel([
          rij("KBC Groep NV", "Havenlaan 2, 1080 Brussel", "+32 2 307 14 00", "kbc.be/particulieren/nl/contact.html", "kbc.be", "https://www.kbc.be", "Sponsor Flanders Classics (wielerklassiekers), samen met Proximus"),
          rij("BNP Paribas Fortis NV", "Warandeberg 3, 1000 Brussel", "+32 2 433 40 34", "bnpparibasfortis.be/nl/Openbaar/Contacteer-ons-Unauth", "bnpparibasfortis.be", "https://www.bnpparibasfortis.be", "Sponsoringportaal sponsoring.bnpparibasfortis.com; o.a. tennis"),
          rij("Belfius Bank & Verzekeringen NV", "Karel Rogierplein 11, 1210 Brussel", "+32 2 222 11 11", "info@belfius.be", "belfius.be", "https://www.belfius.be", "Sponsor hockey (Red Lions/Red Panthers, Team Belgium)"),
          rij("ING België NV", "Marnixlaan 24, 1000 Brussel", "+32 2 547 21 11", "info@ing.be", "ing.be", "https://www.ing.be", ""),
          rij("AXA Belgium NV", "Troonplein 1, 1000 Brussel", "+32 2 678 61 11", "axa.be (contactpagina)", "axa.be", "https://www.axa.be/nl/over-axa/wie-zijn-wij/Pages/contact.aspx", ""),
          rij("Ethias NV", "Rue des Croisiers 24, 4000 Luik", "+32 4 220 31 11", "info@ethias.be", "ethias.be", "https://www.ethias.be", ""),
          rij("P&V Verzekeringen CV", "Koningsstraat 151, 1210 Brussel", "+32 2 250 91 11", "infonl@pv.be", "pv.be", "https://www.pv.be", ""),
          rij("Baloise Insurance Belgium NV", "Posthofbrug 16, 2600 Berchem", "+32 3 247 21 11", "info@baloise.be", "baloise.be", "https://www.baloise.be", "Titelsponsor Baloise Belgium Tour & Ladies Tour (wielrennen)"),
          rij("Allianz Benelux NV", "Lakensestraat 35, 1000 Brussel", "+32 2 214 61 11", "allianz.com/.../belgium (contact)", "allianz.be", "https://www.allianz.be", "Titelsponsor Memorial Van Damme (atletiek) sinds 2021"),
          rij("NN Insurance Belgium NV", "Fonsnylaan 38, 1060 Brussel", "+32 2 238 88 11", "client@nn.be", "nn.be", "https://www.nn.be", ""),
          rij("Argenta Bank- en Verzekeringsgroep", "Belgiëlei 49-53, 2018 Antwerpen", "+32 3 285 51 11", "info@argenta.be", "argenta.be", "https://www.argenta.be", ""),
          rij("Crelan NV", "Sylvain Dupuislaan 251, 1070 Brussel", "+32 2 558 71 11", "info@crelan.be", "crelan.be", "https://www.crelan.be", "Bankpartner wielerploeg Alpecin-Deceuninck sinds 2022"),
          rij("Vivium NV", "Koningsstraat 151, 1210 Brussel", "+32 2 406 35 11", "vivium.be/contact-pagina", "vivium.be", "https://www.vivium.be", ""),
          rij("DVV Verzekeringen", "Livingstonelaan 6, 1000 Brussel", "+32 2 286 61 11", "dvv.be/nl/contact.html", "dvv.be", "https://www.dvv.be", ""),
          rij("Euromex NV", "Generaal Lemanstraat 82-92, 2600 Berchem", "+32 3 451 45 51", "info@euromex.be", "euromex.be", "https://www.euromex.be", ""),
          rij("Federale Verzekering", "Stoofstraat 12, 1000 Brussel", "+32 2 509 04 11", "federale.be/nl/contact", "federale.be", "https://www.federale.be", ""),
        ]),

        new Paragraph({ children: [new TextRun({ break: 1 })], pageBreakBefore: true }),

        subtitel("3. Retail, supermarkten & mode"),
        tekst("Bewust géén petanquewinkels — dit zijn de grote, generieke ketens, in lijn met je vraag."),
        bedrijvenTabel([
          rij("Colruyt Group", "Edingensesteenweg 196, 1500 Halle", "+32 2 363 55 45", "colruyt.be/nl/contact", "colruyt.be", "https://www.colruyt.be", ""),
          rij("Delhaize Belgium", "Brusselsesteenweg 347, 1730 Asse", "+32 2 412 21 11", "delhaize.be/nl/find-us", "delhaize.be", "https://www.delhaize.be", ""),
          rij("Carrefour Belgium", "Olympiadenlaan 20, 1140 Evere", "+32 2 745 03 11", "newsroom.carrefour.be", "carrefour.be", "https://www.carrefour.be", "10 jaar (2014-2024) sponsor Rode Duivels & Red Flames"),
          rij("Aldi Belgium", "Keerstraat 4, 9420 Erpe-Mere", "geen telefoonlijn — contactformulier", "aldi.be (contactformulier)", "aldi.be", "https://www.aldi.be", ""),
          rij("Lidl Belgium", "Guldensporenpark 90 blok J, 9820 Merelbeke", "0800 977 7766", "corporate.lidl.be/contact", "lidl.be", "https://www.lidl.be", "Hoofdsponsor wielerteam Lidl-Trek en officiële UEFA-partner"),
          rij("Decathlon Belgium", "Jules Bordetlaan 1, 1140 Evere", "+32 2 701 96 00", "decathlon.be/nl/c/legal", "decathlon.be", "https://www.decathlon.be", "Officiële partner Pro League; co-titelsponsor Decathlon-AG2R La Mondiale"),
          rij("Krëfel", "Steenstraat 44, 1851 Humbeek", "02 255 00 00", "krefel.my.site.com/s/contact", "krefel.be", "https://www.krefel.be", ""),
          rij("Schoenen Torfs", "Industriepark-West 50, 9100 Sint-Niklaas", "03 780 98 68", "torfs.be (contact)", "torfs.be", "https://www.torfs.be", ""),
          rij("JBC", "Centrum-Zuid 3401, 3530 Houthalen-Helchteren", "011 60 88 06", "jobs.jbc.be/contacteer-ons", "jbc.be", "https://www.jbc.be", ""),
          rij("Bel&Bo", "Theo Nuyttenslaan 5, 8540 Deerlijk", "051 42 30 50", "info@bel-bo.be", "bel-bo.be", "https://www.bel-bo.be", ""),
          rij("Zeeman Belgium", "Boulevard Saint-Lazare 4-10, 1210 Brussel", "0800 29 556", "service@zeeman.com", "zeeman.com", "https://www.zeeman.com/nl_be", ""),
          rij("Makro/Metro Cash & Carry Belgium", "Nijverheidsstraat 70, 2160 Wommelgem", "078 150 330", "makro.be (contact)", "makro.be", "https://www.makro.be", ""),
          rij("Intersport Belgium", "Kunstlaan 56, 1000 Brussel", "02 474 01 70", "contact@intersport.be", "intersport.be", "https://www.intersport.be", ""),
          rij("Coolblue Belgium", "Borsbeeksebrug 28, 2600 Berchem", "03 808 27 44 (zakelijk)", "zakelijk@coolblue.be", "coolblue.be", "https://www.coolblue.be", ""),
          rij("MediaMarkt Belgium", "Boechoutlaan 105, 1853 Strombeek-Bever", "02 465 55 00", "contact@mediamarkt.be", "mediamarkt.be", "https://www.mediamarkt.be", ""),
          rij("Veritas", "De Villermontstraat 9, 2550 Kontich", "+32 3 450 11 11", "veritas.be/nl_be/contactgegevens", "veritas.be", "https://www.veritas.be", ""),
          rij("Standaard Boekhandel", "Industriepark-Noord 28A, 9100 Sint-Niklaas", "078 100 078", "klantendienst@standaardboekhandel.be", "standaardboekhandel.be", "https://www.standaardboekhandel.be", ""),
          rij("Brico Belgium", "Alfons Gossetlaan 46, 1702 Groot-Bijgaarden", "0800 12 365", "customerservice@brico.be", "brico.be", "https://www.brico.be", ""),
          rij("Hubo Belgium", "Koralenhoeve 35, 2160 Wommelgem", "03 541 74 29", "info@hubo.be", "hubo.be", "https://www.hubo.be", ""),
        ]),

        new Paragraph({ children: [new TextRun({ break: 1 })], pageBreakBefore: true }),

        subtitel("4. Energie, industrie & bouw"),
        bedrijvenTabel([
          rij("Engie Electrabel NV", "Simon Bolivarlaan 34, 1000 Brussel", "078 35 33 33", "engie.be/nl/contact", "engie.be", "https://www.engie.be", ""),
          rij("Luminus NV", "postbus 4800, 1000 Brussel", "078 150 210", "info@service.luminus.be", "luminus.be", "https://www.luminus.be", "Voormalig hoofdsponsor Rode Duivels (als EDF Luminus, 2014-2016)"),
          rij("Eneco Belgium NV", "Blarenberglaan 2C, 2800 Mechelen", "015 25 66 66", "info@eneco.be", "eneco.be", "https://www.eneco.be", ""),
          rij("Fluvius System Operator", "Brusselsesteenweg 199, 9090 Melle", "078 35 35 34", "fluvius.be/nl/contact", "fluvius.be", "https://www.fluvius.be", ""),
          rij("TotalEnergies Marketing Belgium", "Handelsstraat 93, 1040 Brussel", "02 486 48 62", "services.totalenergies.be/nl/contact", "totalenergies.be", "https://www.totalenergies.be", ""),
          rij("Kuwait Petroleum Belgium (Q8)", "Brusselstraat 59, 2018 Antwerpen", "+32 3 241 33 00", "q8.be (contact)", "q8.be", "https://www.q8.be", ""),
          rij("Soudal NV", "Everdongenlaan 18-20, 2300 Turnhout", "+32 14 42 42 31", "soudalgroup.com/nl/contact", "soudalgroup.com", "https://www.soudalgroup.com", "Hoofdsponsor wielerploeg Soudal Quick-Step"),
          rij("Deceuninck NV", "Bruggesteenweg 360, 8830 Hooglede-Gits", "+32 51 239 211", "deceuninck.com/en/contact.aspx", "deceuninck.com", "https://www.deceuninck.com", "Sponsor wielerploeg Alpecin-Deceuninck"),
          rij("Bekaert NV", "Bekaertstraat 2, 8550 Zwevegem", "056 76 61 11", "info@bekaert.com", "bekaert.com", "https://www.bekaert.com", ""),
          rij("Katoen Natie NV", "Van Aerdtstraat 33, 2060 Antwerpen", "+32 3 221 68 11", "info@katoennatie.com", "katoennatie.com", "https://www.katoennatie.com", ""),
          rij("Jan De Nul Group NV", "Tragel 60, 9308 Hofstade-Aalst", "+32 53 73 15 11", "info@jandenul.com", "jandenul.com", "https://www.jandenul.com", ""),
          rij("Besix Group NV", "Av. des Communautés 100, 1200 Brussel", "+32 2 402 62 11", "communication@besix.com", "besix.com", "https://www.besix.com", ""),
          rij("CFE NV", "Edmond Van Nieuwenhuyselaan 30, 1160 Brussel", "+32 2 661 12 11", "info@cfe.be", "cfe.be", "https://www.cfe.be", ""),
          rij("Aliaxis NV", "Arnaud Fraiteurlaan 15-23, 1050 Brussel", "+32 2 775 50 50", "aliaxis.be/nl/contact", "aliaxis.be", "https://www.aliaxis.be", ""),
          rij("Etex Group NV", "Gebouw 1K, Luchthaven Brussel Nationaal, 1930 Zaventem", "+32 2 778 12 11", "etexgroup.com/en-us/contact", "etexgroup.com", "https://www.etexgroup.com", ""),
          rij("Recticel NV", "Bourgetlaan 42, 1130 Brussel", "+32 2 775 18 11", "recticel.com/contact-us.html", "recticel.com", "https://www.recticel.com", ""),
          rij("Agristo NV", "Ridder de Ghellinckstraat 9, 8710 Wielsbeke", "+32 56 54 09 00", "jobs.agristo.com/nl/contact", "agristo.com", "https://www.agristo.com", ""),
          rij("Puratos NV", "Industrialaan 25, 1702 Groot-Bijgaarden", "+32 2 481 44 44", "info@puratos.com", "puratos.com", "https://www.puratos.com", ""),
        ]),

        new Paragraph({ children: [new TextRun({ break: 1 })], pageBreakBefore: true }),

        subtitel("5. Voeding, dranken, logistiek & automotive"),
        bedrijvenTabel([
          rij("AB InBev SA/NV", "Brouwerijplein 1, 3000 Leuven", "+32 16 276 111", "ab-inbev.be/contact", "ab-inbev.com", "https://www.ab-inbev.com", "Jupiler (AB InBev) al 30+ jaar hoofdsponsor Jupiler Pro League & Rode Duivels"),
          rij("Duvel Moortgat NV", "Breendonk-Dorp 58, 2870 Puurs-Sint-Amands", "+32 3 860 94 00", "duvelmoortgat.com/en/contact", "duvelmoortgat.com", "https://www.duvelmoortgat.com", ""),
          rij("Alken-Maes NV", "Blarenberglaan 3C bus 2, 2800 Mechelen", "+32 15 30 90 11", "info@alken-maes.com", "alken-maes.be", "https://www.alken-maes.be", ""),
          rij("Spadel NV", "Av. des Communautés 110, 1200 Brussel", "+32 2 702 38 11", "spadel.com/en/contact", "spadel.com", "https://www.spadel.com", ""),
          rij("Coca-Cola Europacific Partners Belgium", "Bergensesteenweg 1424, 1070 Anderlecht", "+32 2 559 20 00", "hello@ccep.com", "cocacolabelgium.be", "https://www.cocacolabelgium.be", ""),
          rij("Lotus Bakeries België NV", "Gentstraat 52, 9971 Lembeke", "+32 9 376 26 11", "info@lotusbakeries.com", "lotusbakeries.com", "https://www.lotusbakeries.com", ""),
          rij("Brouwerij Haacht NV", "Provinciesteenweg 28, 3190 Boortmeerbeek", "+32 16 60 15 01", "info@haacht.com", "haacht.com", "https://www.haacht.com", "Hoofdsponsor wielerklassieker in Haacht (Flandrien 0.0 Classic)"),
          rij("Nationale Loterij NV", "Belliardstraat 25-33, 1040 Brussel", "+32 2 238 45 11", "nationale-loterij.be/info/contact", "nationale-loterij.be", "https://www.nationale-loterij.be", "'Lotto' is al decennialang naamsponsor van een WorldTour-wielerploeg"),
          rij("bpost NV", "Muntcentrum 1, 1000 Brussel", "+32 2 201 23 45", "bpost.be (contactformulier)", "bpost.be", "https://www.bpost.be", "Was hoofdsponsor Belgische veldrijtrofee (cyclocross)"),
          rij("PostNL Belgium", "Generaal de Wittelaan 11 bus C, 2800 Mechelen", "+32 15 480 285", "postnl.be/contact", "postnl.be", "https://www.postnl.be", ""),
          rij("DHL Express Belgium", "Leopoldlaan 1, 1930 Zaventem", "+32 2 2001 199", "dhlexpress.be (contact)", "dhl.be", "https://www.dhl.be", ""),
          rij("D'Ieteren Group", "Rue du Mail 50, 1050 Brussel", "+32 2 536 66 11", "dieterengroup.com/contact", "dieterengroup.com", "https://www.dieterengroup.com", ""),
          rij("Renault Belgique Luxembourg", "Avenue Mozart 20B, 1620 Drogenbos", "+32 2 334 76 11", "contact-client.be@renault.be", "renault.be", "https://www.renault.be", ""),
          rij("BMW Belgium Luxembourg NV", "Lodderstraat 16, 2880 Bornem", "+32 3 890 97 11", "bmw.be (contactcenter)", "bmw.be", "https://www.bmw.be", ""),
          rij("Toyota Belgium NV", "Leuvensesteenweg 369, 1932 Zaventem", "+32 2 745 20 99", "toyota.be (contact)", "toyota.be", "https://www.toyota.be", ""),
          rij("Volkswagen Import (D'Ieteren Automotive)", "Leuvensesteenweg 639, 3071 Kortenberg", "+32 2 754 02 00", "volkswagen.be/nl/footer/contact.html", "volkswagen.be", "https://www.volkswagen.be", ""),
          rij("Ford Motor Company (Belgium) NV", "Hunderenveldlaan 10, 1082 Brussel", "+32 2 482 20 00", "custfobe@ford.com", "ford.be", "https://www.ford.be", ""),
          rij("Mercedes-Benz Belgium Luxembourg", "Avenue du Péage 68, 1200 Brussel", "+32 2 724 12 11", "mercedes-benz.be (support-contact)", "mercedes-benz.be", "https://www.mercedes-benz.be", ""),
          rij("Van Marcke NV", "LAR Blok Z 5, 8511 Kortrijk", "+32 89 72 39 78", "vanmarcke.com/nl/contacteer-ons", "vanmarcke.com", "https://www.vanmarcke.com", "Sponsort lokale wielerwedstrijden (o.a. Ruddervoorde Koers)"),
        ]),

        subtitel("Hoe hiermee starten?"),
        bullet("Bel of mail het algemene nummer/adres en vraag expliciet naar de sponsoring- of marketingafdeling — er bestaat geen betrouwbare, publiek opzoekbare lijst van individuele namen, dus dit is de juiste eerste stap."),
        bullet("Begin bij de bedrijven met een reeds bekend sport-sponsoringprofiel (kolom rechts) — zij hebben al een budget en een team dat sponsordossiers behandelt, dus makkelijker om een 'ja' of tenminste een luisterend oor te krijgen."),
        bullet("Kies 5 à 10 bedrijven per maand, persoonlijk en goed voorbereid, in plaats van alles tegelijk — dat werkt beter dan een massamailing."),
        bullet("Voeg het sponsordossier (PDF) toe aan je eerste mail, en verwijs naar de website en Match13 als bewijs dat Petanque13 een serieus, actief platform is."),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("Petanque13 Kandidaat-sponsors (groot).docx", buffer);
  console.log("Klaar: Petanque13 Kandidaat-sponsors (groot).docx");
});
