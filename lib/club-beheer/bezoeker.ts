import { z } from "zod";
import { voorstelSchema } from "./uren";

// Voorstellen van bezoekers zonder account (zie actions/club-beheer.ts: dienBezoekerVoorstelIn).
export const bezoekerVoorstelSchema = z.object({
  voorstel: voorstelSchema,
  naam: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  taal: z.enum(["nl", "fr"]).default("nl"),
  // Verborgen veld: mensen laten het leeg, robots vullen het vaak in.
  website_bevestig: z.string().max(200).optional(),
  // Tijdstip waarop het formulier openging: een formulier dat in een paar seconden "ingevuld" is, is een robot.
  startMs: z.number().int().optional(),
});

export const MIN_INVUL_MS = 3000;
export const MAX_PER_CLUB_PER_DAG = 5;
export const MAX_WACHTEND_PER_CLUB = 10;
export const MAX_PER_EMAIL_PER_DAG = 3;
