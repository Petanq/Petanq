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
              children: [new TextRun({ text: "Petanque13 — le calendrier belge de la pétanque · petanque13.be", size: 14, color: GRIJS })],
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
          children: [new TextRun({ text: "DOSSIER DE SPONSORING — 2026-2027", bold: true, size: 20, color: ROOD })],
        }),
        new Paragraph({
          heading: HeadingLevel.TITLE,
          spacing: { after: 200 },
          children: [new TextRun({ text: "La seule plateforme de ce genre en Belgique. Aucune alternative comparable.", bold: true, size: 30, color: ZWART })],
        }),
        tekst(
          "Petanque13 est LE calendrier central des tournois de pétanque en Flandre, en Wallonie et à Bruxelles — et avec Match13, aussi l'outil avec lequel les clubs gèrent efficacement leur journée de tournoi. Aucun autre site en Belgique ne combine les deux."
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
                statCel("475+", "Tournois cette saison"),
                statCel("208+", "Clubs actifs"),
                statCel("50.000+", "Visites par an"),
                statCel("11", "Provinces couvertes"),
              ],
            }),
          ],
        }),

        subtitel("Pourquoi Petanque13"),
        tekst(
          "Qui arrive sur Petanque13 n'est pas un visiteur occasionnel — c'est quelqu'un qui, à ce moment précis, recherche activement un tournoi de pétanque près de chez lui. C'est exactement le moment où une marque, un commerce ou une région veut se montrer."
        ),
        bullet("Joueurs actifs : cherchent eux-mêmes un tournoi auquel participer — souvent chaque semaine."),
        bullet("Dirigeants de clubs : gèrent des tournois et reviennent régulièrement sur le site."),
        bullet("Entièrement bilingue (NL/FR) — votre portée ne s'arrête pas à la frontière linguistique."),
        bullet("27 bénévoles vérifient chaque tournoi — cette confiance rejaillit sur qui s'y associe."),
        bullet("Actif sur Facebook avec des vidéos et images d'ambiance des tournois — un sponsor peut aussi y apparaître."),

        subtitel("Plus qu'un calendrier : Match13"),
        tekst(
          "En plus du calendrier, Petanque13 propose aussi Match13 — l'outil avec lequel les clubs gèrent eux-mêmes leur journée de tournoi : tirages et tours automatiques (Tête-à-tête, Doublette, Triplette, Quadrette, Sextet, Meli-Melo, Poules), traitement des scores en direct, un classement calculé automatiquement, et un « écran de salle » projeté en grand avec les tours et l'attribution des terrains."
        ),
        tekst(
          "Et voilà le véritable atout : à chaque tour, chaque équipe reçoit sa propre fiche de match imprimée — avec les noms des joueurs, le terrain, un cadran de score jusqu'à 13, et un emplacement logo fixe en bas. Une visibilité physique qui passe littéralement de main en main, tour après tour, tournoi après tournoi. Aucun autre site de pétanque en Belgique n'offre cela.",
          { bold: true }
        ),
        tekst(
          "Match13 est déjà utilisé aujourd'hui par un nombre croissant de clubs pilotes. Un logo sponsor sur ces fiches n'existe pas encore, mais c'est un petit ajout technique que nous réalisons immédiatement pour le bon partenaire.",
          { italics: true, size: 20, color: GRIJS }
        ),

        new Paragraph({ children: [new PageBreak()] }),

        subtitel("Formules de sponsoring"),
        tekst(
          "Prix par an (des tournois toute l'année, pas seulement une saison estivale). Petanque13 n'a pas d'équivalent en Belgique — ces tarifs reflètent cette position unique à l'échelle nationale."
        ),

        new Paragraph({ spacing: { after: 200 }, children: [] }),
        pakketTabel({
          nummer: "01 — DE BASE",
          naam: "Ami de Petanque13",
          prijs: "€250 / an",
          punten: [
            "Logo + lien sur la page partenaires",
            "Une mention sur la page Facebook",
            "Mention « Soutient Petanque13 »",
          ],
          note: "Idéal pour démarrer sans grand engagement.",
          tier: "brons",
        }),
        new Paragraph({ spacing: { after: 200 }, children: [] }),
        pakketTabel({
          nummer: "02 — PARTENAIRE",
          naam: "Partenaire",
          prijs: "€600 / an",
          punten: [
            "Tout ce qui est inclus dans « Ami de Petanque13 »",
            "Logo visible sur la page d'accueil",
            "Mention au lancement + à mi-année dans la newsletter",
            "Mentionné/identifié dans au moins 1 vidéo d'ambiance sur Facebook",
          ],
          note: "La formule la plus choisie par les acteurs régionaux.",
          tier: "zilver",
        }),
        new Paragraph({ spacing: { after: 200 }, children: [] }),
        pakketTabel({
          nummer: "03 — SPONSOR PRINCIPAL",
          naam: "Sponsor principal",
          prijs: "€1.500 / an",
          punten: [
            "Tout ce qui est inclus dans « Partenaire »",
            "Bannière bien visible en haut de la page d'accueil",
            "Page dédiée, comme « En voyage avec Claudy »",
            "Mention dans chaque édition de la newsletter",
            "Mention dédiée dans chaque vidéo de tournoi sur Facebook",
            "Exclusif : max. 2 sponsors principaux par an",
          ],
          note: "Pour qui veut vraiment être reconnu par chaque joueur de pétanque.",
          tier: "goud",
        }),
        new Paragraph({ spacing: { after: 200 }, children: [] }),
        pakketTabel({
          nummer: "04 — EXCLUSIF, MAX. 1 PAR AN",
          naam: "Partenaire principal Match13",
          prijs: "€2.500 / an",
          punten: [
            "Tout ce qui est inclus dans « Sponsor principal »",
            "Logo sur chaque fiche de match imprimée, à chaque tour, pour chaque tournoi via Match13",
            "Logo sur l'écran de salle pendant le tournoi",
            "Visibilité physique et répétée — disponible nulle part ailleurs en Belgique",
          ],
          note: "L'emplacement logo sur les fiches et l'écran de salle est réalisé dès que ce partenaire s'engage.",
        }),

        new Paragraph({ spacing: { before: 300, after: 400 }, children: [
          new TextRun({ text: "Ce sont les tarifs fondateurs pour la toute première année. Une fois la portée du site en croissance, les tarifs pourront évoluer les années suivantes.", italics: true, size: 20, color: GRIJS }),
        ] }),

        subtitel("Intéressé(e) ?"),
        tekst("Envoyez un e-mail et nous verrons ensemble quelle formule vous convient le mieux — le sur-mesure est aussi possible."),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "info@petanque13.be", bold: true, size: 26, color: ROOD })],
        }),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("Petanque13 Dossier de sponsoring.docx", buffer);
  console.log("Klaar: Petanque13 Dossier de sponsoring.docx");
});
