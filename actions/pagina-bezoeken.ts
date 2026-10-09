"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";

export async function registreerPaginaBezoek(pad: string): Promise<void> {
  // Een lokale testversie schrijft naar dezelfde echte databank — dan niet meetellen.
  if (process.env.NODE_ENV !== "production") return;
  const supabase = createServiceRoleClient();
  await supabase.rpc("increment_pagina_bezoek", { p_pad: pad });
}
