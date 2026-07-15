"use server";

import { headers } from "next/headers";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { provincieVoorStad } from "@/lib/stad-provincie";

export async function registreerBezoek(): Promise<void> {
  const supabase = createServiceRoleClient();
  await supabase.rpc("increment_bezoek");

  // Vercel zet deze header zelf op basis van het IP-adres — we bewaren geen
  // IP-adres, enkel de (geschatte) stadsnaam wordt meteen omgezet naar een
  // provincie of "onbekend", en enkel het geaggregeerde totaal wordt opgeslagen.
  const stad = headers().get("x-vercel-ip-city");
  const provincie = provincieVoorStad(stad ? decodeURIComponent(stad) : null);
  await supabase.rpc("increment_bezoek_provincie", { p_provincie: provincie ?? "onbekend" });
}
