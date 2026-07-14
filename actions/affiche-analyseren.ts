"use server";

import Anthropic from "@anthropic-ai/sdk";
import { ALLE_PROVINCIES } from "@/lib/provincies";

export type AfficheVelden = {
  datum: string | null;
  uur: string | null;
  clubnaam: string | null;
  naam_nl: string | null;
  naam_fr: string | null;
  gemeente: string | null;
  adres: string | null;
  provincie: string | null;
  categorie: string | null;
  formule: string | null;
  speelvorm: string | null;
  aantal_ronden: number | null;
  aantal_poules: number | null;
  contact_email: string | null;
  inschrijvingsprijs: number | null;
  gratis: boolean | null;
  max_ploegen: number | null;
  link_inschrijving: string | null;
  opmerking: string | null;
};

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
  ],
};

export async function afficheAnalyseren(
  afbeeldingBase64: string,
  mediaType: string
): Promise<AfficheVelden[] | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;

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
              text: `Dit is een affiche voor een petanquetoernooi in België. Lees de tekst op de affiche en vul het formulier zo goed mogelijk in. Vandaag is het ${vandaag} — als het jaartal op de affiche ontbreekt, kies dan het eerstvolgende jaar waarin die datum in de toekomst valt. Vul een veld in met null als je het echt niet met voldoende zekerheid uit de affiche kan halen. Verzin niets.

Let op: sommige affiches tonen meerdere afzonderlijke speeldata voor hetzelfde toernooi — bv. een reeks kwalificatierondes met telkens een andere datum, gevolgd door één finaledag, of een toernooi over meerdere dagen met elke dag een andere speelvorm (bv. dag 1 doublette, dag 2 triplette). Geef in dat geval elke datum/speeldag als een apart item in de lijst terug, met dezelfde club/locatiegegevens maar elk met zijn eigen datum, uur en (indien van toepassing) speelvorm. Verwerk het onderscheid ook in naam_nl/naam_fr, bv. "Grote Zomerpot - Kwalificatie 3" en "Grote Zomerpot - Finale", of "Toernooi - Dag 1" en "Toernooi - Dag 2". Toont de affiche maar één datum, geef dan gewoon één item terug.`,
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
    return input.toernooien;
  } catch (fout) {
    console.error("Affiche analyseren mislukt:", fout);
    return null;
  }
}
