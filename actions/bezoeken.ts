"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";

export async function registreerBezoek(): Promise<void> {
  const supabase = createServiceRoleClient();
  await supabase.rpc("increment_bezoek");
}
