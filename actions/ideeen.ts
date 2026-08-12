"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { isModerator, isAdmin } from "@/lib/auth-helpers";
import { getResendClient, AFZENDER } from "@/lib/resend";
import { NieuwIdeeEmail, nieuwIdeeOnderwerp } from "@/lib/emails/nieuw-idee";

export type BeheerActieResultaat = { succes: true } | { succes: false; fout: string };

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? "https://petanque13.be";

async function huidigeModeratorNaam(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("moderatoren").select("naam").eq("user_id", user.id).single();
  return data?.naam ?? user.email ?? null;
}

export async function ideeIndienen(tekst: string): Promise<BeheerActieResultaat> {
  if (!(await isModerator())) return { succes: false, fout: "niet_geautoriseerd" };
  if (!tekst.trim()) return { succes: false, fout: "tekst_verplicht" };

  const supabase = createClient();
  const moderatorNaam = (await huidigeModeratorNaam()) ?? "Een vrijwilliger";
  const { error } = await supabase.from("ideeen").insert({
    moderator_naam: moderatorNaam,
    tekst: tekst.trim(),
  });

  if (error) {
    console.error("Idee indienen mislukt:", error.message);
    return { succes: false, fout: "server_fout" };
  }

  try {
    const serviceClient = createServiceRoleClient();
    const { data: admins } = await serviceClient.from("moderatoren").select("email").eq("rol", "admin");
    const adminEmails = (admins ?? []).map((a: { email: string }) => a.email);
    if (adminEmails.length > 0) {
      const resend = getResendClient();
      await resend.emails.send({
        from: AFZENDER,
        to: adminEmails,
        subject: nieuwIdeeOnderwerp,
        react: NieuwIdeeEmail({
          moderatorNaam,
          tekst: tekst.trim(),
          beheerLink: `${siteUrl()}/beheer/ideeen`,
        }),
      });
    }
  } catch (mailFout) {
    console.error("Idee-mail versturen mislukt:", mailFout);
  }

  revalidatePath("/beheer/ideeen");
  return { succes: true };
}

export async function ideeAfgehandeldZetten(id: string, afgehandeld: boolean): Promise<BeheerActieResultaat> {
  if (!(await isAdmin())) return { succes: false, fout: "niet_geautoriseerd" };

  const supabase = createClient();
  const { error } = await supabase.from("ideeen").update({ afgehandeld }).eq("id", id);
  if (error) return { succes: false, fout: "server_fout" };
  revalidatePath("/beheer/ideeen");
  return { succes: true };
}
