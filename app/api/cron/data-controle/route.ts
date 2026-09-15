import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getResendClient, AFZENDER } from "@/lib/resend";
import {
  DataControleEmail,
  dataControleOnderwerp,
  DubbelBevinding,
  AdresBevinding,
  OpenstaandBevinding,
} from "@/lib/emails/data-controle";

// Draait via Vercel Cron, twee keer per week (zie vercel.json). Vercel voegt
// zelf de "Authorization: Bearer <CRON_SECRET>" header toe, dus deze route
// is niet publiek aanroepbaar zonder dat geheim te kennen.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ succes: false, fout: "niet_geautoriseerd" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();

  // 1. Mogelijk dubbel ingegeven: zelfde club, datum, categorie, formule,
  // speelvorm en rondes/poules (net als de dubbel-check bij het indienen).
  // Categorie "circuit" wordt bewust overgeslagen — zie migratie 0057.
  const { data: structureel } = await supabase
    .from("toernooien")
    .select("id, naam_nl, datum, clubnaam, club_id, categorie, formule, speelvorm, aantal_ronden, aantal_poules")
    .not("club_id", "is", null)
    .neq("status", "geweigerd")
    .neq("categorie", "circuit")
    .is("verwijderd_op", null);

  type StructureelRij = NonNullable<typeof structureel>[number];
  const groepen = new Map<string, StructureelRij[]>();
  for (const r of structureel ?? []) {
    const sleutel = [r.club_id, r.datum, r.categorie, r.formule, r.speelvorm, r.aantal_ronden ?? -1, r.aantal_poules ?? -1].join(
      "|"
    );
    const lijst = groepen.get(sleutel) ?? [];
    lijst.push(r);
    groepen.set(sleutel, lijst);
  }
  const dubbels: DubbelBevinding[] = [];
  for (const groep of groepen.values()) {
    if (groep.length > 1) {
      for (const r of groep) dubbels.push({ naam: r.naam_nl, datum: r.datum, club: r.clubnaam });
    }
  }

  // 2. Tornooi zonder eigen adres, terwijl de gekoppelde club er wél één
  // heeft — kans dat het adres per ongeluk niet werd overgenomen.
  const { data: zonderAdresRuw } = await supabase
    .from("toernooien")
    .select("id, naam_nl, datum, clubnaam, adres, club_id, clubs(adres)")
    .not("club_id", "is", null)
    .is("adres", null)
    .eq("status", "goedgekeurd")
    .is("verwijderd_op", null)
    .gte("datum", new Date().toISOString().slice(0, 10));

  const ontbrekendAdres: AdresBevinding[] = (zonderAdresRuw ?? [])
    .filter((r) => (r.clubs as unknown as { adres: string | null } | null)?.adres)
    .map((r) => ({ naam: r.naam_nl, datum: r.datum, club: r.clubnaam }));

  // 3. Al langer dan 3 dagen "in behandeling" — nog niet bekeken.
  const drieDagenGeleden = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const { data: openstaandRuw } = await supabase
    .from("toernooien")
    .select("id, naam_nl, clubnaam, aangemaakt_op")
    .eq("status", "in_behandeling")
    .lt("aangemaakt_op", drieDagenGeleden);

  const langOpenstaand: OpenstaandBevinding[] = (openstaandRuw ?? []).map((r) => ({
    naam: r.naam_nl,
    club: r.clubnaam,
    dagen: Math.floor((Date.now() - new Date(r.aangemaakt_op).getTime()) / (24 * 60 * 60 * 1000)),
  }));

  // 4. Nog niet aan een echte club uit de directory gekoppeld.
  const { count: aantalZonderClub } = await supabase
    .from("toernooien")
    .select("id", { count: "exact", head: true })
    .is("club_id", null)
    .neq("status", "geweigerd")
    .is("verwijderd_op", null);

  const resend = getResendClient();
  const { data: admins } = await supabase.from("moderatoren").select("naam, email").eq("rol", "admin");

  const verstuurd: string[] = [];
  for (const admin of (admins ?? []) as { naam: string; email: string }[]) {
    try {
      await resend.emails.send({
        from: AFZENDER,
        to: admin.email,
        subject: dataControleOnderwerp,
        react: DataControleEmail({
          dubbels,
          ontbrekendAdres,
          langOpenstaand,
          aantalZonderClub: aantalZonderClub ?? 0,
        }),
      });
      verstuurd.push(admin.naam);
    } catch (mailFout) {
      console.error(`Data-controle versturen mislukt voor ${admin.naam}:`, mailFout);
    }
  }

  return NextResponse.json({
    succes: true,
    verstuurdAan: verstuurd,
    dubbels: dubbels.length,
    ontbrekendAdres: ontbrekendAdres.length,
    langOpenstaand: langOpenstaand.length,
    aantalZonderClub: aantalZonderClub ?? 0,
  });
}
