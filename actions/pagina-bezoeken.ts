"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";

export async function registreerPaginaBezoek(pad: string): Promise<void> {
  // Een lokale testversie schrijft naar dezelfde echte databank — dan niet meetellen.
  if (process.env.NODE_ENV !== "production") return;
  // Alleen een gewoon pad van een bestaande soort pagina; anders kan iemand de tabel vol schrijven.
  if (typeof pad !== "string" || pad.length > 120 || !/^\/[a-z0-9/_\-.]*$/i.test(pad)) return;
  const supabase = createServiceRoleClient();
  await supabase.rpc("increment_pagina_bezoek", { p_pad: pad });
}
