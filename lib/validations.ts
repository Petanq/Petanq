import { z } from "zod";
import { ALLE_PROVINCIES } from "./provincies";

const provincieEnum = z.enum(ALLE_PROVINCIES as [string, ...string[]]);

const huidigJaar = new Date().getFullYear();

// Een half ingetypt jaartal in het datumveld (bv. "6" i.p.v. "2026") wordt door
// de browser soms toch als geldige datum doorgestuurd — dit vangt dat af.
const datumVeld = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Ongeldige datum")
  .refine((datum) => {
    const jaar = Number(datum.slice(0, 4));
    return jaar >= huidigJaar - 1 && jaar <= huidigJaar + 5;
  }, "Ongeldig jaartal");

const toernooiBaseSchema = z.object({
  datum: datumVeld,
  uur: z.string().min(1),
  clubnaam: z.string().trim().min(2).max(120),
  naam_nl: z.string().trim().min(2).max(160),
  naam_fr: z.string().trim().min(2).max(160),
  gemeente: z.string().trim().min(2).max(120),
  adres: z.string().trim().max(200).nullable().optional().or(z.literal("")),
  provincie: provincieEnum,
  categorie: z.enum(["heren", "dames", "mix", "jeugd", "kampioenschap", "circuit", "recreanten"]),
  formule: z.enum([
    "tete-a-tete",
    "doublette",
    "triplette",
    "sextet",
    "quartet",
    "kwintet",
    "kleurentornooi",
  ]),
  speelvorm: z.enum(["rondes", "poules"]).default("rondes"),
  aantal_ronden: z.coerce.number().int().min(1).max(20).nullable().optional(),
  aantal_poules: z.coerce.number().int().min(1).max(20).nullable().optional(),
  contact_email: z.string().trim().email().nullable().optional().or(z.literal("")),
  inschrijvingsprijs: z.coerce.number().min(0).max(1000).nullable().optional(),
  gratis: z.boolean().optional().default(false),
  max_ploegen: z.coerce.number().int().min(1).max(500).nullable().optional(),
  link_inschrijving: z.string().trim().url().nullable().optional().or(z.literal("")),
  opmerking: z.string().trim().max(1000).nullable().optional(),
  affiche_url: z.string().trim().url().nullable().optional().or(z.literal("")),
  open_toernooi: z.boolean().optional().default(false),
  finale: z.boolean().optional().default(false),
});

export const toernooiSchema = toernooiBaseSchema.superRefine((data, ctx) => {
  if (data.speelvorm === "rondes" && !data.aantal_ronden) {
    ctx.addIssue({ code: "custom", path: ["aantal_ronden"], message: "verplicht" });
  }
  if (data.speelvorm === "poules" && !data.aantal_poules) {
    ctx.addIssue({ code: "custom", path: ["aantal_poules"], message: "verplicht" });
  }
});

export type ToernooiFormData = z.infer<typeof toernooiSchema>;

// Voor het bewerken van een bestaand toernooi: elk veld optioneel (enkel de
// meegegeven velden worden gecontroleerd/aangepast). `.partial()` maakt elk
// veld optioneel zonder de defaults uit de basisschema toe te passen op
// ontbrekende velden — een niet-meegestuurd veld blijft dus onaangeroerd.
export const toernooiWijzigenSchema = toernooiBaseSchema.extend({ vol: z.boolean().optional() }).partial();

export const clubSchema = z.object({
  naam: z.string().trim().min(2).max(120),
  gemeente: z.string().trim().min(2).max(120),
  provincie: provincieEnum,
  adres: z.string().trim().max(200).nullable().optional().or(z.literal("")),
  website: z.string().trim().url().nullable().optional().or(z.literal("")),
  contact_email: z.string().trim().email().nullable().optional().or(z.literal("")),
  telefoon: z.string().trim().max(30).nullable().optional().or(z.literal("")),
  openingsuren: z.string().trim().max(300).nullable().optional().or(z.literal("")),
  foto_url: z.string().trim().url().nullable().optional().or(z.literal("")),
});

export type ClubFormData = z.infer<typeof clubSchema>;

// Voor het bewerken van een bestaande club: elk veld optioneel.
export const clubWijzigenSchema = clubSchema.partial();

export const nieuwsbriefSchema = z.object({
  email: z.string().trim().email(),
  provincie: provincieEnum.nullable().optional(),
  taal: z.enum(["nl", "fr"]),
});

export type NieuwsbriefFormData = z.infer<typeof nieuwsbriefSchema>;

export const vrijwilligerAanmeldenSchema = z.object({
  naam: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  wachtwoord: z.string().min(8).max(72),
  // Verplicht (i.t.t. het admin-uitnodigingsformulier): een vrijwilliger kan
  // enkel toernooien in zijn eigen provincie goedkeuren, dus zonder provincie
  // zou een nieuwe aanmelding meteen niets kunnen goedkeuren.
  provincie: provincieEnum,
});
