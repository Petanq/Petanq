import { z } from "zod";
import { ALLE_PROVINCIES } from "./provincies";

const provincieEnum = z.enum(ALLE_PROVINCIES as [string, ...string[]]);

export const toernooiSchema = z
  .object({
    datum: z.string().min(1),
    uur: z.string().min(1),
    clubnaam: z.string().trim().min(2).max(120),
    naam_nl: z.string().trim().min(2).max(160),
    naam_fr: z.string().trim().min(2).max(160),
    gemeente: z.string().trim().min(2).max(120),
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
    contact_email: z.string().trim().email(),
    inschrijvingsprijs: z.coerce.number().min(0).max(1000).nullable().optional(),
    gratis: z.boolean().optional().default(false),
    max_ploegen: z.coerce.number().int().min(1).max(500).nullable().optional(),
    link_inschrijving: z.string().trim().url().nullable().optional().or(z.literal("")),
    opmerking: z.string().trim().max(1000).nullable().optional(),
    affiche_url: z.string().trim().url().nullable().optional().or(z.literal("")),
    open_toernooi: z.boolean().optional().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.speelvorm === "rondes" && !data.aantal_ronden) {
      ctx.addIssue({ code: "custom", path: ["aantal_ronden"], message: "verplicht" });
    }
    if (data.speelvorm === "poules" && !data.aantal_poules) {
      ctx.addIssue({ code: "custom", path: ["aantal_poules"], message: "verplicht" });
    }
  });

export type ToernooiFormData = z.infer<typeof toernooiSchema>;

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

export const nieuwsbriefSchema = z.object({
  email: z.string().trim().email(),
  provincie: provincieEnum.nullable().optional(),
  taal: z.enum(["nl", "fr"]),
});

export type NieuwsbriefFormData = z.infer<typeof nieuwsbriefSchema>;
