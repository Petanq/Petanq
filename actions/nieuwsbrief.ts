"use server";

import { createClient } from "@/lib/supabase/server";
import { nieuwsbriefSchema } from "@/lib/validations";

export type NieuwsbriefResultaat = { succes: true } | { succes: false; fout: string };

export async function inschrijvenOpNieuwsbrief(input: {
  email: string;
  provincie: string | null;
  taal: "nl" | "fr";
}): Promise<NieuwsbriefResultaat> {
  const parsed = nieuwsbriefSchema.safeParse(input);
  if (!parsed.success) {
    return { succes: false, fout: "ongeldige_invoer" };
  }

  const supabase = createClient();
  const { error } = await supabase.from("nieuwsbrief").insert({
    email: parsed.data.email,
    provincie: parsed.data.provincie ?? null,
    taal: parsed.data.taal,
    actief: true,
  });

  if (error) {
    // Uniek e-mailadres bestaat al: behandel als succesvolle (idempotente) inschrijving.
    if (error.code === "23505") return { succes: true };
    console.error("Nieuwsbrief-inschrijving mislukt:", error.message);
    return { succes: false, fout: "server_fout" };
  }

  return { succes: true };
}
