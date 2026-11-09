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
  const h = await headers();
  const regiocode = h.get("x-vercel-ip-country-region");
  const stad = h.get("x-vercel-ip-city");
  const provincie =
    provincieVoorRegiocode(regiocode) ?? provincieVoorStad(stad ? decodeURIComponent(stad) : null);
  await supabase.rpc("increment_bezoek_provincie", { p_provincie: provincie ?? "onbekend" });

  // Extra, anonieme kenmerken (migratie 0067): land, taal van de browser en bot of niet, zodat het
  // dashboard Belgen, buitenland en bots uit elkaar kan houden. Mislukt dit (tabel nog niet aangemaakt),
  // dan gebeurt er niets: de gewone tellers hierboven blijven werken.
  try {
    await supabase.rpc("increment_bezoek_kenmerk", {
      p_land: landVan(h.get("x-vercel-ip-country")),
      p_provincie: provincie ?? "onbekend",
      p_taal: taalVan(h.get("accept-language")),
      p_bot: isBot(h.get("user-agent")),
    });
  } catch {
    // negeren
  }
}

function landVan(code: string | null): string {
  const c = (code ?? "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(c) ? c : "onbekend";
}

// Eerste taal die de browser opgeeft (de taal van de bezoeker, los van waar hij woont).
function taalVan(acceptLanguage: string | null): string {
  const eerste = (acceptLanguage ?? "").split(",")[0]?.trim().toLowerCase().split("-")[0] ?? "";
  if (!eerste) return "onbekend";
  return ["nl", "fr", "en", "de"].includes(eerste) ? eerste : "overig";
}

// Robots en crawlers die toch JavaScript uitvoeren. Geen bezoeker zonder browsernaam.
const BOT_PATROON =
  /bot|crawl|spider|slurp|facebookexternalhit|facebot|preview|headless|lighthouse|pagespeed|gtmetrix|uptime|monitor|curl|wget|python-requests|axios|node-fetch|go-http|java\/|httpclient|bingpreview|embedly|slackbot|discordbot|ahrefs|semrush|mj12|dotbot|petalbot|yandex|baidu/i;

function isBot(userAgent: string | null): boolean {
  const ua = (userAgent ?? "").trim();
  return !ua || BOT_PATROON.test(ua);
}
