"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { clubSchema, clubWijzigenSchema } from "@/lib/validations";
import { Club } from "@/lib/types";
import { isModerator, isAdmin, huidigeModeratorNaam } from "@/lib/auth-helpers";
import { getResendClient, AFZENDER } from "@/lib/resend";
import { VerwijderAanvraagEmail, verwijderAanvraagOnderwerp } from "@/lib/emails/verwijder-aanvraag";
import { siteUrl } from "@/lib/site-url";

export type BeheerActieResultaat = { succes: true } | { succes: false; fout: string };

export async function clubToevoegen(input: unknown): Promise<BeheerActieResultaat> {
  if (!(await isModerator())) return { succes: false, fout: "niet_geautoriseerd" };

  const parsed = clubSchema.safeParse(input);
  if (!parsed.success) return { succes: false, fout: "ongeldige_invoer" };

  const supabase = await createClient();
  const { error } = await supabase.from("clubs").insert({
    naam: parsed.data.naam,
    gemeente: parsed.data.gemeente,
    provincie: parsed.data.provincie,
    adres: parsed.data.adres || null,
    website: parsed.data.website || null,
    contact_email: parsed.data.contact_email || null,
    telefoon: parsed.data.telefoon || null,
    openingsuren: parsed.data.openingsuren || null,
    foto_url: parsed.data.foto_url || null,
    actief: true,
  });

  if (error) return { succes: false, fout: error.message };
  revalidatePath("/beheer/clubs");
  revalidatePath("/clubs");
  return { succes: true };
}

export async function clubBewerken(
  id: string,
  wijzigingen: Partial<
    Pick<
      Club,
      | "naam"
      | "gemeente"
      | "provincie"
      | "adres"
      | "website"
      | "contact_email"
      | "telefoon"
      | "openingsuren"
      | "foto_url"
    >
  >
): Promise<BeheerActieResultaat> {
  if (!(await isModerator())) return { succes: false, fout: "niet_geautoriseerd" };

  const parsed = clubWijzigenSchema.safeParse(wijzigingen);
  if (!parsed.success) return { succes: false, fout: "ongeldige_invoer" };

  const supabase = await createClient();
  const { error } = await supabase.from("clubs").update(parsed.data).eq("id", id);
  if (error) return { succes: false, fout: error.message };
  revalidatePath("/beheer/clubs");
  revalidatePath("/clubs");
  return { succes: true };
}

export async function clubActiefZetten(id: string, actief: boolean): Promise<BeheerActieResultaat> {
  if (!(await isModerator())) return { succes: false, fout: "niet_geautoriseerd" };

  const supabase = await createClient();
  const { error } = await supabase.from("clubs").update({ actief }).eq("id", id);
  if (error) return { succes: false, fout: "server_fout" };
  revalidatePath("/beheer/clubs");
  revalidatePath("/clubs");
  return { succes: true };
}

// Enkel admins mogen definitief (zacht) verwijderen. Een gewone vrijwilliger
// kan enkel een aanvraag met verplichte reden indienen — zie
// clubVerwijderingAanvragen hieronder. "Verwijderen" is altijd zacht: het
// record blijft in de databank staan (verwijderd_op), dus herstelbaar.
export async function clubVerwijderen(id: string): Promise<BeheerActieResultaat> {
  if (!(await isAdmin())) return { succes: false, fout: "niet_geautoriseerd" };

  const supabase = await createClient();
  const { error } = await supabase.from("clubs").update({ verwijderd_op: new Date().toISOString() }).eq("id", id);
  if (error) {
    console.error("Club verwijderen mislukt:", error.message);
    return { succes: false, fout: "server_fout" };
  }
  revalidatePath("/beheer/clubs");
  revalidatePath("/beheer/verwijderaanvragen");
  revalidatePath("/clubs");
  return { succes: true };
}

export async function clubVerwijderingAanvragen(id: string, reden: string): Promise<BeheerActieResultaat> {
  if (!(await isModerator())) return { succes: false, fout: "niet_geautoriseerd" };
  if (!reden.trim()) return { succes: false, fout: "reden_verplicht" };

  const supabase = await createClient();
  const moderatorNaam = await huidigeModeratorNaam();
  const { data: club, error } = await supabase
    .from("clubs")
    .update({
      verwijder_aanvraag_door: moderatorNaam,
      verwijder_aanvraag_reden: reden.trim(),
      verwijder_aanvraag_op: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !club) {
    console.error("Verwijderingsaanvraag (club) mislukt:", error?.message);
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
        subject: verwijderAanvraagOnderwerp("club"),
        react: VerwijderAanvraagEmail({
          soort: "club",
          naam: club.naam,
          aanvragerNaam: moderatorNaam ?? "Een vrijwilliger",
          reden: reden.trim(),
          beheerLink: `${siteUrl()}/beheer/verwijderaanvragen`,
        }),
      });
    }
  } catch (mailFout) {
    console.error("Verwijderaanvraag-mail (club) versturen mislukt:", mailFout);
  }

  revalidatePath("/beheer/clubs");
  revalidatePath("/beheer/verwijderaanvragen");
  return { succes: true };
}

export async function clubVerwijderAanvraagAfwijzen(id: string): Promise<BeheerActieResultaat> {
  if (!(await isAdmin())) return { succes: false, fout: "niet_geautoriseerd" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("clubs")
    .update({ verwijder_aanvraag_door: null, verwijder_aanvraag_reden: null, verwijder_aanvraag_op: null })
    .eq("id", id);
  if (error) return { succes: false, fout: "server_fout" };
  revalidatePath("/beheer/verwijderaanvragen");
  revalidatePath("/beheer/clubs");
  return { succes: true };
}
