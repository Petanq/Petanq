import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getResendClient, AFZENDER } from "@/lib/resend";
import { JaaroverzichtEmail, jaaroverzichtOnderwerp } from "@/lib/emails/jaaroverzicht";

// Draait via Vercel Cron elke 1 januari (zie vercel.json). Vercel voegt dan
// zelf de "Authorization: Bearer <CRON_SECRET>" header toe, dus deze route
// is niet publiek aanroepbaar zonder dat geheim te kennen.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ succes: false, fout: "niet_geautoriseerd" }, { status: 401 });
  }

  const vorigJaar = new Date().getUTCFullYear() - 1;
  const startVorigJaar = `${vorigJaar}-01-01T00:00:00.000Z`;
  const startDitJaar = `${vorigJaar + 1}-01-01T00:00:00.000Z`;

  const supabase = createServiceRoleClient();

  const [{ data: moderatoren }, { data: goedgekeurd }] = await Promise.all([
    supabase.from("moderatoren").select("naam, email").eq("goedgekeurd", true),
    supabase
      .from("toernooien")
      .select("goedgekeurd_door")
      .eq("status", "goedgekeurd")
      .not("goedgekeurd_door", "is", null)
      .gte("goedgekeurd_op", startVorigJaar)
      .lt("goedgekeurd_op", startDitJaar),
  ]);

  const tellingen = new Map<string, number>();
  for (const rij of (goedgekeurd ?? []) as { goedgekeurd_door: string }[]) {
    tellingen.set(rij.goedgekeurd_door, (tellingen.get(rij.goedgekeurd_door) ?? 0) + 1);
  }

  const resend = getResendClient();
  const verstuurd: string[] = [];

  for (const mod of (moderatoren ?? []) as { naam: string; email: string }[]) {
    const aantal = tellingen.get(mod.naam) ?? 0;
    if (aantal === 0) continue; // geen mail naar wie niets goedkeurde, dat voelt niet als bedankje

    try {
      await resend.emails.send({
        from: AFZENDER,
        to: mod.email,
        subject: jaaroverzichtOnderwerp(vorigJaar),
        react: JaaroverzichtEmail({ naam: mod.naam, aantal, jaar: vorigJaar }),
      });
      verstuurd.push(mod.naam);
    } catch (mailFout) {
      console.error(`Jaaroverzicht versturen mislukt voor ${mod.naam}:`, mailFout);
    }
  }

  return NextResponse.json({ succes: true, jaar: vorigJaar, verstuurdAan: verstuurd });
}
