const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  Header, Footer, PageBreak, ImageRun,
} = require("docx");
const fs = require("fs");

const logoData = fs.readFileSync("../public/images/logo-icon.png");

const GOUD = "F4C430";
const ZWART = "1F1F1F";
const ROOD = "D62828";
const GRIJS = "555555";
const LICHTGRIJS = "E5E5E5";
const BRONS = "AD7F4B";
const ZILVER = "8B909A";

function titel(tekst) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    children: [new TextRun({ text: tekst, color: ZWART, bold: true })],
  });
}

function subtitel(tekst) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 120 },
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

function statCel(cijfer, label) {
  return new TableCell({
    width: { size: 25, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, fill: "F5F5F5" },
    margins: { top: 200, bottom: 200, left: 100, right: 100 },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 6, color: GOUD },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: GOUD },
      left: { style: BorderStyle.SINGLE, size: 6, color: GOUD },
      right: { style: BorderStyle.SINGLE, size: 6, color: GOUD },
    },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: cijfer, bold: true, size: 32, color: ZWART })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40 },
        children: [new TextRun({ text: label, size: 16, bold: true, color: "6b4e00" })],
      }),
    ],
  });
}

// tier: "brons" | "zilver" | "goud" | undefined (undefined = zwart, voor het
// exclusieve 4e pakket — dezelfde "medaille"-logica als de webversie.
function pakketTabel({ nummer, naam, prijs, punten, note, tier }) {
  const TIER_KLEUREN = { brons: BRONS, zilver: ZILVER, goud: GOUD };
  const kopFill = TIER_KLEUREN[tier] ?? ZWART;
  const kopKleur = tier === "goud" ? ZWART : "FFFFFF";
  const randKleur = TIER_KLEUREN[tier] ?? LICHTGRIJS;
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: randKleur },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: randKleur },
      left: { style: BorderStyle.SINGLE, size: 4, color: randKleur },
      right: { style: BorderStyle.SINGLE, size: 4, color: randKleur },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: LICHTGRIJS },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: LICHTGRIJS },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: kopFill },
            margins: { top: 160, bottom: 160, left: 160, right: 160 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `${nummer} — `, bold: true, size: 18, color: kopKleur }),
                  new TextRun({ text: naam.toUpperCase(), bold: true, size: 24, color: kopKleur }),
                ],
              }),
              new Paragraph({
                spacing: { before: 60 },
                children: [new TextRun({ text: prijs, bold: true, size: 30, color: kopKleur })],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            margins: { top: 160, bottom: 120, left: 200, right: 200 },
            children: [
              ...punten.map(
                (p) =>
                  new Paragraph({
                    bullet: { level: 0 },
                    spacing: { after: 60 },
                    children: [new TextRun({ text: p, size: 20, color: ZWART })],
                  })
              ),
              new Paragraph({
                spacing: { before: 100 },
                children: [new TextRun({ text: note, italics: true, size: 18, color: GRIJS })],
              }),
            ],
          }),
        ],
      }),
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
              children: [new TextRun({ text: "PETANQUE13 · SPONSORDOSSIER", size: 14, color: GRIJS })],
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
          children: [new TextRun({ text: "SPONSORDOSSIER — 2026-2027", bold: true, size: 20, color: ROOD })],
        }),
        new Paragraph({
          heading: HeadingLevel.TITLE,
          spacing: { after: 200 },
          children: [new TextRun({ text: "Het enige platform van dit soort in België. Geen vergelijkbaar alternatief.", bold: true, size: 30, color: ZWART })],
        }),
        tekst(
          "Petanque13 is dé centrale kalender voor petanquetoernooien in Vlaanderen, Wallonië en Brussel — en met Match13 ook het tool waarmee clubs hun tornooidag effectief runnen. Geen enkele andere site in België combineert beide."
        ),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
            insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
          },
          rows: [
            new TableRow({
              children: [
                statCel("475+", "Tornooien dit seizoen"),
                statCel("208+", "Actieve clubs"),
                statCel("50.000+", "Bezoeken per jaar"),
                statCel("11", "Provincies gedekt"),
              ],
            }),
          ],
        }),

        subtitel("Waarom Petanque13"),
        tekst(
          "Wie op Petanque13 landt, is geen toevallige voorbijganger — het is iemand die op dat moment actief zoekt naar een petanquetornooi in zijn of haar buurt. Dat is precies het moment waarop een merk, winkel of streek zich wil tonen."
        ),
        bullet("Actieve spelers zoeken zelf naar een tornooi om aan deel te nemen — vaak wekelijks."),
        bullet("Clubbestuurders beheren tornooien en zien de site geregeld terug."),
        bullet("Volledig tweetalig (NL/FR) — het bereik stopt niet aan de taalgrens."),
        bullet("27 vrijwilligers controleren elk tornooi — dat vertrouwen straalt af op wie ernaast staat."),
        bullet("Actief op Facebook met filmpjes en sfeerbeelden van tornooien — ook daar kan een sponsor mee in beeld komen."),

        subtitel("Meer dan een kalender: Match13"),
        tekst(
          "Naast de kalender heeft Petanque13 ook Match13 — het tool waarmee clubs hun tornooidag zelf runnen: automatische rondes en loting (Tête-à-tête, Doublet, Triplet, Kwartet, Sextet, Meli-Melo, Poules), live scoreverwerking, een klassement dat zichzelf berekent, en een \"Zaalscherm\" dat op een groot scherm in de zaal geprojecteerd wordt met de rondes en pleinindeling."
        ),
        tekst(
          "En daar zit de échte troef: elke ronde krijgt elk team een eigen gedrukte wedstrijdkaart — met de spelersnamen, het plein, een scoreschijf tot 13, en een vast logovak onderaan. Dat is fysieke zichtbaarheid die letterlijk van hand tot hand gaat, ronde na ronde, tornooi na tornooi. Geen enkele andere petanquesite in België biedt dat.",
          { bold: true }
        ),
        tekst(
          "Match13 wordt vandaag al gebruikt door een groeiende groep pilootclubs. Een sponsorlogo op deze kaartjes bestaat nog niet, maar is een kleine technische toevoeging die meteen gebouwd wordt voor de juiste partner.",
          { italics: true, size: 20, color: GRIJS }
        ),

        new Paragraph({ children: [new PageBreak()] }),

        subtitel("Sponsorpakketten"),
        tekst(
          "Prijzen per jaar. Petanque13 heeft geen vergelijkbaar alternatief in België — deze tarieven weerspiegelen die unieke, landelijke positie."
        ),

        new Paragraph({ spacing: { after: 200 }, children: [] }),
        pakketTabel({
          nummer: "01 — BASIS",
          naam: "Vriend van Petanque13",
          prijs: "€250 / jaar",
          punten: [
            "Logo + link op de partnerpagina",
            "Eén vermelding op de Facebookpagina",
            "Vermeld als \"steunt Petanque13\"",
          ],
          note: "Ideaal om laagdrempelig te starten.",
          tier: "brons",
        }),
        new Paragraph({ spacing: { after: 200 }, children: [] }),
        pakketTabel({
          nummer: "02 — PARTNER",
          naam: "Partner",
          prijs: "€600 / jaar",
          punten: [
            "Alles uit \"Vriend van Petanque13\"",
            "Logo zichtbaar op de homepage",
            "Vermelding bij lancering + halverwege het jaar in de nieuwsbrief",
            "Vermeld/getagd in minstens 1 sfeervideo op Facebook",
          ],
          note: "Het meest gekozen pakket voor regionale spelers.",
          tier: "zilver",
        }),
        new Paragraph({ spacing: { after: 200 }, children: [] }),
        pakketTabel({
          nummer: "03 — HOOFDSPONSOR",
          naam: "Hoofdsponsor",
          prijs: "€1.500 / jaar",
          punten: [
            "Alles uit \"Partner\"",
            "Prominente banner bovenaan de homepage",
            "Eigen pagina, zoals \"Op reis met Claudy\"",
            "Vermelding in élke nieuwsbriefeditie",
            "Eigen vermelding/shoutout in elke tornooivideo op Facebook",
            "Exclusief: max. 2 hoofdsponsors per jaar",
          ],
          note: "Voor wie écht herkend wil worden door elke petanquespeler.",
          tier: "goud",
        }),
        new Paragraph({ spacing: { after: 200 }, children: [] }),
        pakketTabel({
          nummer: "04 — EXCLUSIEF, MAX. 1 PER JAAR",
          naam: "Match13-hoofdpartner",
          prijs: "€2.500 / jaar",
          punten: [
            "Alles uit \"Hoofdsponsor\"",
            "Logo op élke gedrukte wedstrijdkaart, elke ronde, bij élk tornooi via Match13",
            "Logo op het Zaalscherm tijdens het tornooi",
            "Fysieke, herhaalde zichtbaarheid — nergens anders in België beschikbaar",
          ],
          note: "Het logovak op de kaartjes en het Zaalscherm wordt gebouwd zodra deze partner instapt.",
        }),

        new Paragraph({ spacing: { before: 300, after: 400 }, children: [
          new TextRun({ text: "Dit zijn founding sponsor-prijzen voor het allereerste jaar. Zodra het bereik verder groeit, kunnen latere jaren anders geprijsd worden.", italics: true, size: 20, color: GRIJS }),
        ] }),

        subtitel("Interesse?"),
        tekst("Stuur een mailtje en we bekijken samen welk pakket het beste bij je past — ook maatwerk is bespreekbaar."),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "info@petanque13.be", bold: true, size: 26, color: ROOD })],
        }),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("Petanque13 Sponsordossier.docx", buffer);
  console.log("Klaar: Petanque13 Sponsordossier.docx");
});
