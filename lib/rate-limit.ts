import { headers } from "next/headers";
import { createServiceRoleClient } from "@/lib/supabase/server";

function clientIp(): string {
  const forwarded = headers().get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "onbekend";
}

// Voorkomt dat één IP-adres de (betaalde) AI-affichelezer kan spammen.
export async function magAiAfbeeldingAnalyseren(): Promise<boolean> {
  const MAX_POGINGEN = 20;
  const VENSTER_MINUTEN = 60;

  const ip = clientIp();
  const supabase = createServiceRoleClient();
  const sinds = new Date(Date.now() - VENSTER_MINUTEN * 60_000).toISOString();

  const { count } = await supabase
    .from("ai_afbeelding_pogingen")
    .select("*", { count: "exact", head: true })
    .eq("ip", ip)
    .gte("aangemaakt_op", sinds);

  if ((count ?? 0) >= MAX_POGINGEN) return false;

  await supabase.from("ai_afbeelding_pogingen").insert({ ip });
  return true;
}
