"use server";

import { createClient } from "@/lib/supabase/server";
import { clubSchema } from "@/lib/validations";

export type ClubActieResultaat = { succes: true } | { succes: false; fout: string };

export async function clubVoorstellen(input: unknown): Promise<ClubActieResultaat> {
  const parsed = clubSchema.safeParse(input);
  if (!parsed.success) {
    return { succes: false, fout: "ongeldige_invoer" };
  }

  const supabase = createClient();
  const { error } = await supabase.from("clubs").insert({
    naam: parsed.data.naam,
    gemeente: parsed.data.gemeente,
    provincie: parsed.data.provincie,
    website: parsed.data.website || null,
    contact_email: parsed.data.contact_email || null,
    actief: false,
  });

  if (error) {
    console.error("Club voorstellen mislukt:", error.message);
    return { succes: false, fout: "server_fout" };
  }

  return { succes: true };
}
