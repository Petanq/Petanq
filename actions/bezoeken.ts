"use server";

import { headers } from "next/headers";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { provincieVoorStad, provincieVoorRegiocode } from "@/lib/stad-provincie";

export async function registreerBezoek(): Promise<void> {
  const supabase = createServiceRoleClient();
  await supabase.rpc("increment_bezoek");

  // Vercel zet deze headers zelf op basis van het IP-adres — we bewaren geen
  // IP-adres. De regiocode (ISO 3166-2, bv. "VAN") is nauwkeurig en dekt alle
  // provincies; de stadsnaam is enkel een terugval als die header ontbreekt.
  // Enkel het geaggregeerde totaal per provincie wordt opgeslagen.
  const regiocode = headers().get("x-vercel-ip-country-region");
  const stad = headers().get("x-vercel-ip-city");
  const provincie =
    provincieVoorRegiocode(regiocode) ?? provincieVoorStad(stad ? decodeURIComponent(stad) : null);
  await supabase.rpc("increment_bezoek_provincie", { p_provincie: provincie ?? "onbekend" });
}
