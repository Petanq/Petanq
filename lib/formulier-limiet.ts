import { createHash } from "crypto";
import { headers } from "next/headers";
import { createServiceRoleClient } from "@/lib/supabase/server";

// Een grens op de publieke formulieren, zodat de site niet gebruikt kan worden om te spammen of om
// iemand met bevestigingsmails te overstelpen. We bewaren per poging alleen een soort en een sleutel
// (het IP-adres, of bij mails een afgekorte hash van het adres) en wissen alles na twee dagen.
//
// Bewust "fail-open": ontbreekt de tabel (SQL 0069 nog niet gedraaid) of is de databank even niet
// bereikbaar, dan laten we de inzending toe. Een echte bezoeker mag nooit geblokkeerd worden door een fout
// in de grensbewaking zelf.

export type FormulierSoort = "toernooi" | "club" | "match13_aanvraag" | "nieuwsbrief" | "vrijwilliger" | "mail";

async function clientIp(): Promise<string> {
  try {
    const forwarded = (await headers()).get("x-forwarded-for");
    return forwarded?.split(",")[0]?.trim() || "onbekend";
  } catch {
    return "onbekend";
  }
}

function hashAdres(email: string): string {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex").slice(0, 24);
}

async function telEnNoteer(soort: FormulierSoort, sleutel: string, max: number, venstermin: number): Promise<boolean> {
  try {
    const service = createServiceRoleClient();
    const sinds = new Date(Date.now() - venstermin * 60_000).toISOString();
    const { count, error } = await service
      .from("formulier_pogingen")
      .select("id", { count: "exact", head: true })
      .eq("soort", soort)
      .eq("sleutel", sleutel)
      .gte("aangemaakt_op", sinds);
    if (error) return true; // tabel ontbreekt of fout: niet blokkeren
    if ((count ?? 0) >= max) return false;

    await service.from("formulier_pogingen").insert({ soort, sleutel });
    // Af en toe oude rijen opruimen (twee dagen).
    if (Math.random() < 0.02) {
      await service.from("formulier_pogingen").delete().lt("aangemaakt_op", new Date(Date.now() - 2 * 24 * 3600_000).toISOString());
    }
    return true;
  } catch {
    return true;
  }
}

// Mag deze bezoeker (IP-adres) nu nog een formulier van deze soort insturen?
export async function magFormulierIndienen(soort: Exclude<FormulierSoort, "mail">, max: number, venstermin = 60): Promise<boolean> {
  return telEnNoteer(soort, await clientIp(), max, venstermin);
}

// Mag er nu nog een mail naar dit adres verstuurd worden? Zo krijgt een slachtoffer niet tientallen
// bevestigingsmails via onze site. De inzending zelf wordt dan wel gewoon verwerkt.
export async function magMailVersturenNaar(email: string, max = 3, venstermin = 60): Promise<boolean> {
  return telEnNoteer("mail", hashAdres(email), max, venstermin);
}
