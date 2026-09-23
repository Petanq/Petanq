const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  Header, Footer, ExternalHyperlink, ImageRun,
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
    children: [new TextRun({ text: t, size: 22, color: ZWART, ...opts })],
  });
}

function bullet(t) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 80 },
    children: [new TextRun({ text: t, size: 22, color: ZWART })],
  });
}

function link(tekstLabel, url) {
  return new ExternalHyperlink({
    link: url,
    children: [new TextRun({ text: tekstLabel, size: 20, color: "1a4480", underline: {} })],
  });
}

function bedrijfRij(naam, waarom, siteLabel, siteUrl) {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 26, type: WidthType.PERCENTAGE },
        margins: { top: 120, bottom: 120, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: naam, bold: true, size: 21, color: ZWART })] })],
      }),
      new TableCell({
        width: { size: 52, type: WidthType.PERCENTAGE },
        margins: { top: 120, bottom: 120, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: waarom, size: 20, color: ZWART })] })],
      }),
      new TableCell({
        width: { size: 22, type: WidthType.PERCENTAGE },
        margins: { top: 120, bottom: 120, left: 120, right: 120 },
        children: [new Paragraph({ children: [link(siteLabel, siteUrl)] })],
      }),
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
        children: [
          new TableCell({
            width: { size: 26, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: "1F1F1F" },
            margins: { top: 100, bottom: 100, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: "Bedrijf", bold: true, size: 18, color: "FFFFFF" })] })],
          }),
          new TableCell({
            width: { size: 52, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: "1F1F1F" },
            margins: { top: 100, bottom: 100, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: "Waarom een goede match", bold: true, size: 18, color: "FFFFFF" })] })],
          }),
          new TableCell({
            width: { size: 22, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: "1F1F1F" },
            margins: { top: 100, bottom: 100, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: "Website", bold: true, size: 18, color: "FFFFFF" })] })],
          }),
        ],
      }),
      ...rijen,
    ],
  });
}

const doc = new Document({
  sections: [
    {
      properties: {
        page: { size: { width: 11906, height: 16838 }, margin: { top: 900, bottom: 900, left: 1000, right: 1000 } },
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
            new ImageRun({ data: logoData, type: "png", transformation: { width: 40, height: 40 } }),
            new TextRun({ text: "  Petanque", bold: true, size: 56, color: ZWART }),
            new TextRun({ text: "13", bold: true, size: 56, color: GOUD }),
          ],
        }),
        new Paragraph({
          spacing: { before: 60, after: 300 },
          children: [new TextRun({ text: "KANDIDAAT-SPONSORS", bold: true, size: 20, color: ROOD })],
        }),
        new Paragraph({
          heading: HeadingLevel.TITLE,
          spacing: { after: 200 },
          children: [new TextRun({ text: "Wie zou Petanque13 realistisch kunnen sponsoren?", bold: true, size: 30, color: ZWART })],
        }),
        tekst(
          "Dit is een vertreklijst met kandidaten — geen bevestigde interesse. Niemand hierin weet nog dat Petanque13 bestaat als sponsormogelijkheid. Het is aan jou (of via het sponsordossier) om ze te contacteren. Begin het best bij de eerste 2-3 categorieën — dat zijn de meest voor de hand liggende en makkelijkst te bereiken."
        ),

        subtitel("1. Petanque-merken & -winkels"),
        tekst(
          "De meest voor de hand liggende kandidaten: zij verkopen rechtstreeks aan jouw volledige doelgroep."
        ),
        bedrijvenTabel([
          bedrijfRij(
            "Obut",
            "Marktleider in petanqueballen, wereldwijd bekend bij elke petanquespeler. Groot merk, dus wellicht via een Belgische verdeler te benaderen (zie JDC Sport hieronder) i.p.v. rechtstreeks.",
            "obut.com",
            "https://www.obut.com/en/"
          ),
          bedrijfRij(
            "JDC Sport BV",
            "Officiële Benelux-verdeler van Obut, MS Pétanque, Toro Petank en Unibloc bronzen ballen — bevoorraadt sportwinkels in België en Nederland. Eén contact kan dus meerdere merken vertegenwoordigen.",
            "jdcsport.nl",
            "https://www.jdcsport.nl/"
          ),
          bedrijfRij(
            "Petanque Center",
            "Belgische webshop, gespecialiseerd puur in petanque (Obut, Boulenciel, La Boule Bleue, MS Pétanque). Kleiner en lokaler dan Decathlon — waarschijnlijk makkelijker om iemand rechtstreeks te bereiken.",
            "petanquecenter.be",
            "https://petanquecenter.be/"
          ),
          bedrijfRij(
            "Decathlon België",
            "Grote sportketen, verkoopt petanquemateriaal in bijna elke vestiging. Groot bedrijf — contacteer bij voorkeur een lokale vestiging in de buurt van veel tornooien, niet de hoofdzetel.",
            "decathlon.be",
            "https://www.decathlon.be/nl/alle-sporten/petanque"
          ),
        ]),

        subtitel("2. Toerisme"),
        tekst(
          "Sluit rechtstreeks aan bij \"Op reis met Claudy\" — petanquevakanties en -reizen zijn letterlijk al een onderdeel van de site."
        ),
        bedrijvenTabel([
          bedrijfRij(
            "Toerisme Vlaanderen",
            "Vlaamse toeristische overheidsdienst — heeft zelfs een aparte pagina met subsidiemogelijkheden voor toeristische initiatieven, dus mogelijks ook een aanknopingspunt voor samenwerking.",
            "toerismevlaanderen.be",
            "https://toerismevlaanderen.be/nl/subsidies"
          ),
          bedrijfRij(
            "Wallonie Belgique Tourisme (WBT)",
            "Het officiële toerismeorgaan van Wallonië — relevant omdat veel van je tornooien en clubs in Wallonië liggen.",
            "visitwallonia.be",
            "https://visitwallonia.be/"
          ),
          bedrijfRij(
            "visit.brussels",
            "Toeristische dienst van het Brussels Hoofdstedelijk Gewest.",
            "visit.brussels",
            "https://visit.brussels/"
          ),
        ]),

        subtitel("3. Drank & horeca"),
        tekst(
          "Petanque en een terrasje gaan hand in hand — bierhuizen en cafés bij boulodromes zijn een natuurlijke match. Grote merken zijn een langere weg (corporate sponsoring), maar de lokale invalshoek werkt vaak sneller."
        ),
        bullet(
          "Grote Belgische bierhuizen (AB InBev/Jupiler, Duvel Moortgat, ...) — realistisch enkel haalbaar via een lokale vertegenwoordiger/distributeur, niet via het hoofdkantoor. Goed als lange-termijndoel, niet als eerste stap."
        ),
        bullet(
          "Lokale cafés/frituren/slagerijen bij populaire boulodromes — kleine budgetten, maar makkelijk te overtuigen omdat ze de clubs vaak al kennen. Ideaal voor het \"Vriend van Petanque13\"-pakket."
        ),

        subtitel("4. Via de clubs zelf — de warmste lead"),
        tekst(
          "Dit is waarschijnlijk je snelste weg naar een eerste \"ja\": op affiches van tornooien staan vaak al lokale sponsors vermeld (cafés, slagerijen, garages, ...). Die kennen petanque al, steunen het al lokaal, en zijn dus een warme introductie — vraag gewoon aan een paar moderatoren of clubbestuurders of ze een contact kunnen doorgeven."
        ),

        subtitel("Hoe hiermee starten?"),
        bullet("Begin met 3-5 realistische, persoonlijke contacten — niet iedereen tegelijk aanschrijven."),
        bullet("Petanque Center en JDC Sport BV zijn waarschijnlijk het makkelijkst te bereiken (kleiner, petanque-specifiek)."),
        bullet("Voor toerisme: leg de link met \"Op reis met Claudy\" — dat bestaat al, dus het is geen nieuw idee dat je moet verkopen."),
        bullet("Vraag je moderatoren/clubs naar hun eigen lokale sponsors — de kortste weg naar een eerste sponsor."),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("Petanque13 Kandidaat-sponsors.docx", buffer);
  console.log("Klaar: Petanque13 Kandidaat-sponsors.docx");
});
