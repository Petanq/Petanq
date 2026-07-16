"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";

export async function registreerPaginaBezoek(pad: string): Promise<void> {
  const supabase = createServiceRoleClient();
  await supabase.rpc("increment_pagina_bezoek", { p_pad: pad });
}
