"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { TOERNOOI_ACTIES } from "@/lib/toernooi-acties";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Telt één doorklik op een tornooipagina (anoniem, enkel opgeteld per dag). Alles wat niet klopt
// wordt stil genegeerd; ontbreekt de tabel nog (migratie 0067), dan gebeurt er ook niets.
export async function registreerToernooiActie(toernooiId: string, actie: string): Promise<void> {
  if (!UUID.test(toernooiId)) return;
  if (!(TOERNOOI_ACTIES as readonly string[]).includes(actie)) return;
  try {
    const supabase = createServiceRoleClient();
    await supabase.rpc("registreer_toernooi_actie", { p_toernooi: toernooiId, p_actie: actie });
  } catch {
    // Een teller mag nooit een fout geven aan de bezoeker.
  }
}
