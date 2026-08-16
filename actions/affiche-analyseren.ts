"use server";

import Anthropic from "@anthropic-ai/sdk";
import { ALLE_PROVINCIES } from "@/lib/provincies";
import { magAiAfbeeldingAnalyseren } from "@/lib/rate-limit";
import { AfficheVelden, corrigeerJaartallen } from "@/lib/datum-correctie";

export type { AfficheVelden };

const CATEGORIEEN = ["heren", "dames", "mix", "jeugd", "kampioenschap", "circuit", "recreanten"];
const FORMULES = [
  "tete-a-tete",
  "doublette",
  "triplette",
  "sextet",
  "quartet",
  "kwintet",
  "kleurentornooi",
];

const TOOL_NAAM = "affiche_gegevens";

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

const TOERNOOI_ITEM_SCHEMA = {
  type: "object",
  properties: {
    datum: { type: ["string", "null"], description: "ISO-formaat JJJJ-MM-DD" },
    uur: { type: ["string", "null"], description: "24-uursformaat UU:MM" },
    clubnaam: { type: ["string", "null"] },
    naam_nl: { type: ["string", "null"], description: "Naam van het toernooi (Nederlands)" },
    naam_fr: { type: ["string", "null"], description: "Naam van het toernooi (Frans)" },
    gemeente: { type: ["string", "null"] },
    adres: { type: ["string", "null"], description: "Straat en huisnummer van de locatie, indien vermeld" },
    provincie: { type: ["string", "null"], enum: [...ALLE_PROVINCIES, null] },
    categorie: { type: ["string", "null"], enum: [...CATEGORIEEN, null] },
    formule: { type: ["string", "null"], enum: [...FORMULES, null] },
    speelvorm: { type: ["string", "null"], enum: ["rondes", "poules", null] },
    aantal_ronden: { type: ["integer", "null"] },
    aantal_poules: { type: ["integer", "null"] },
    contact_email: { type: ["string", "null"] },
    inschrijvingsprijs: { type: ["number", "null"] },
    gratis: { type: ["boolean", "null"] },
    max_ploegen: { type: ["integer", "null"] },
    link_inschrijving: { type: ["string", "null"] },
    opmerking: {
      type: ["string", "null"],
      description: "Overige relevante info op de affiche die nergens anders past",
    },
    kwalificatiedata: {
      type: ["array", "null"],
      description:
        "Enkel bij een schiftingensysteem: de datums van de schiftingen/kwalificaties die naar de finale leiden (de finale zelf hoort NIET in deze lijst, die staat in datum/uur). Null of leeg als er geen schiftingensysteem is.",
      items: {
        type: "object",
        properties: {
          datum: { type: ["string", "null"], description: "ISO-formaat JJJJ-MM-DD" },
          uur: {
            type: ["string", "null"],
            description: "24-uursformaat UU:MM, enkel invullen als deze datum een ander uur heeft dan de meeste schiftingen (zie kwalificatie_uur), anders null",
          },
        },
        required: ["datum", "uur"],
      },
    },
    kwalificatie_uur: {
      type: ["string", "null"],
      description:
        "Enkel bij een schiftingensysteem: het uur (24-uursformaat UU:MM) dat voor de meeste/alle schiftingen geldt. Null als er geen schiftingensysteem is.",
    },
  },
  required: [
    "datum",
    "uur",
    "clubnaam",
    "naam_nl",
    "naam_fr",
    "gemeente",
    "adres",
    "provincie",
    "categorie",
    "formule",
    "speelvorm",
    "aantal_ronden",
    "aantal_poules",
    "contact_email",
    "inschrijvingsprijs",
    "gratis",
    "max_ploegen",
    "link_inschrijving",
    "opmerking",
    "kwalificatiedata",
    "kwalificatie_uur",
  ],
};

export async function afficheAnalyseren(
  afbeeldingBase64: string,
  mediaType: string
): Promise<AfficheVelden[] | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!(await magAiAfbeeldingAnalyseren())) return null;

  const vandaag = new Date().toISOString().slice(0, 10);
  const GELDIGE_MEDIA_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
  // Sommige GSM-browsers geven een leeg/onbekend mediatype door (bv. bij een
  // rechtstreekse camera-foto) terwijl de bytes wel degelijk een gewone foto
  // zijn — in dat geval gokken we op jpeg i.p.v. de aanvraag te laten falen.
  const veiligMediaType = (GELDIGE_MEDIA_TYPES as readonly string[]).includes(mediaType)
    ? (mediaType as (typeof GELDIGE_MEDIA_TYPES)[number])
    : "image/jpeg";

  try {
    const anthropic = getClient();
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 8192,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: veiligMediaType,
                data: afbeeldingBase64,
              },
            },
            {
              type: "text",
              text: `Dit is een affiche voor een petanquetoernooi in België. Lees de tekst op de affiche en vul het formulier zo goed mogelijk in. Vandaag is het ${vandaag} — als het jaartal op de affiche ontbreekt, reken dan per datum apart uit wat het eerstvolgende jaar is waarin die dag-en-maand nog in de toekomst valt t.o.v. ${vandaag}. Gebruik NOOIT een datum die al voorbij is — ook niet als de affiche een schifting/kwalificatiereeks toont die een jaargrens overschrijdt (bv. schiftingen in oktober-december gevolgd door een finale in januari: reken dan uit in welk jaar die oktober-december-reeks nog moet komen, en de finale valt in het jaar daarna). Vul een veld in met null als je het echt niet met voldoende zekerheid uit de affiche kan halen. Verzin niets.

Let op — er zijn twee verschillende situaties met meerdere datums op een affiche, die je niet mag verwarren:

A. Schiftingensysteem: een reeks schiftings-/kwalificatiedatums die ALLEMAAL naar dezelfde ÉÉN finale leiden (je herkent dit meestal aan woorden als "schifting(en)", "kwalificatie(s)", "éliminatoire(s)" gevolgd door één "finale"-datum). Dit is GEEN aparte inzending per datum — geef dit terug als ÉÉN enkel item: datum/uur = de finaledatum en -uur, kwalificatiedata = de overige schiftingsdatums (elk met hun eigen uur enkel als dat afwijkt van de rest), kwalificatie_uur = het uur dat voor de meeste schiftingen geldt. Vermeld in opmerking eventuele bijzonderheden (bv. als een bepaalde schiftingsdatum enkel toegankelijk is voor al geplaatste ploegen).

B. Losse, onafhankelijke concours: meerdere ECHT verschillende toernooien die niets met elkaar te maken hebben, elk met een eigen doel — bv. een dagprogramma met 's ochtends een damesconcours en apart een herenconcours, een jeugd- en seniorenconcours op dezelfde dag, of een toernooi over meerdere dagen met elke dag een andere speelvorm (dag 1 doublette, dag 2 triplette). Geef elk van deze als een APART item terug (elk met eigen datum, uur, categorie, formule, en kwalificatiedata/kwalificatie_uur op null). Verwerk het onderscheid ook in naam_nl/naam_fr, bv. "Toernooi - Dag 1" en "Toernooi - Dag 2", of "Toernooi - Dames" en "Toernooi - Heren".

Toont de affiche maar één concours op één datum zonder schiftingensysteem, geef dan gewoon één item terug met kwalificatiedata/kwalificatie_uur op null.`,
            },
          ],
        },
      ],
      tools: [
        {
          name: TOOL_NAAM,
          description: "Geef de toernooien terug die je op de affiche hebt gevonden (één of meerdere).",
          input_schema: {
            type: "object",
            properties: {
              toernooien: {
                type: "array",
                items: TOERNOOI_ITEM_SCHEMA,
              },
            },
            required: ["toernooien"],
          },
        },
      ],
      tool_choice: { type: "tool", name: TOOL_NAAM },
    });

    const toolUse = response.content.find(
      (blok): blok is Anthropic.ToolUseBlock => blok.type === "tool_use"
    );
    if (!toolUse) return null;

    const input = toolUse.input as { toernooien: AfficheVelden[] };
    if (!input.toernooien || input.toernooien.length === 0) return null;
    return corrigeerJaartallen(input.toernooien, vandaag);
  } catch (fout) {
    console.error("Affiche analyseren mislukt:", fout);
    return null;
  }
}
