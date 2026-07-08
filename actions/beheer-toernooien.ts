"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getResendClient, AFZENDER } from "@/lib/resend";
import {
  NieuwToernooiNieuwsbriefEmail,
  nieuwToernooiOnderwerp,
} from "@/lib/emails/nieuw-toernooi-nieuwsbrief";
import { WeigeringEmail, weigeringOnderwerp } from "@/lib/emails/weigering";
import { vertaalProvincie } from "@/lib/provincies";
import { Toernooi } from "@/lib/types";

export type BeheerActieResultaat = { succes: true } | { succes: false; fout: string };

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.petanq.be";

async function huidigeModeratorNaam(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("moderatoren")
    .select("naam")
    .eq("user_id", user.id)
    .single();
  return data?.naam ?? user.email ?? null;
}

export async function toernooiGoedkeuren(id: string): Promise<BeheerActieResultaat> {
  const supabase = createClient();
  const moderatorNaam = await huidigeModeratorNaam();

  const { data: toernooi, error } = await supabase
    .from("toernooien")
    .update({
      status: "goedgekeurd",
      goedgekeurd_door: moderatorNaam,
      goedgekeurd_op: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !toernooi) {
    console.error("Toernooi goedkeuren mislukt:", error?.message);
    return { succes: false, fout: "server_fout" };
  }

  try {
    await stuurNieuwsbriefVoorToernooi(toernooi as Toernooi);
  } catch (mailFout) {
    console.error("Nieuwsbriefmail versturen mislukt:", mailFout);
  }

  revalidatePath("/beheer");
  revalidatePath("/beheer/toernooien");
  revalidatePath("/");
  return { succes: true };
}

export async function toernooiWeigeren(id: string, reden: string | null): Promise<BeheerActieResultaat> {
  const supabase = createClient();
  const moderatorNaam = await huidigeModeratorNaam();

  const { data: toernooi, error } = await supabase
    .from("toernooien")
    .update({ status: "geweigerd", goedgekeurd_door: moderatorNaam, goedgekeurd_op: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error || !toernooi) {
    console.error("Toernooi weigeren mislukt:", error?.message);
    return { succes: false, fout: "server_fout" };
  }

  try {
    const resend = getResendClient();
    await resend.emails.send({
      from: AFZENDER,
      to: toernooi.contact_email,
      subject: weigeringOnderwerp,
      react: WeigeringEmail({ naam: toernooi.naam_nl, reden }),
    });
  } catch (mailFout) {
    console.error("Weigeringsmail versturen mislukt:", mailFout);
  }

  revalidatePath("/beheer");
  return { succes: true };
}

export async function toernooiVerwijderen(id: string): Promise<BeheerActieResultaat> {
  const supabase = createClient();
  const { error } = await supabase.from("toernooien").delete().eq("id", id);
  if (error) return { succes: false, fout: "server_fout" };
  revalidatePath("/beheer/toernooien");
  revalidatePath("/");
  return { succes: true };
}

export async function toernooiBewerken(
  id: string,
  wijzigingen: Partial<
    Pick<
      Toernooi,
      | "datum"
      | "uur"
      | "clubnaam"
      | "naam_nl"
      | "naam_fr"
      | "gemeente"
      | "provincie"
      | "categorie"
      | "formule"
      | "speelvorm"
      | "aantal_ronden"
      | "aantal_poules"
      | "inschrijvingsprijs"
      | "gratis"
      | "max_ploegen"
      | "vol"
      | "contact_email"
      | "link_inschrijving"
      | "opmerking"
    >
  >
): Promise<BeheerActieResultaat> {
  const supabase = createClient();
  const { error } = await supabase.from("toernooien").update(wijzigingen).eq("id", id);
  if (error) return { succes: false, fout: "server_fout" };
  revalidatePath("/beheer/toernooien");
  revalidatePath("/");
  return { succes: true };
}

async function stuurNieuwsbriefVoorToernooi(toernooi: Toernooi) {
  const serviceClient = createServiceRoleClient();
  const { data: abonnees } = await serviceClient
    .from("nieuwsbrief")
    .select("email, taal")
    .eq("actief", true)
    .or(`provincie.eq.${toernooi.provincie},provincie.is.null`);

  if (!abonnees || abonnees.length === 0) return;

  const resend = getResendClient();
  const toernooiLink = `${siteUrl()}/toernooien/${toernooi.id}`;

  await Promise.allSettled(
    abonnees.map((abonnee: { email: string; taal: "nl" | "fr" }) => {
      const provincieNaam = vertaalProvincie(toernooi.provincie, abonnee.taal);
      return resend.emails.send({
        from: AFZENDER,
        to: abonnee.email,
        subject: nieuwToernooiOnderwerp(abonnee.taal, provincieNaam),
        react: NieuwToernooiNieuwsbriefEmail({
          taal: abonnee.taal,
          naam: abonnee.taal === "fr" ? toernooi.naam_fr : toernooi.naam_nl,
          clubnaam: toernooi.clubnaam,
          datum: toernooi.datum,
          gemeente: toernooi.gemeente,
          provincieNaam,
          toernooiLink,
        }),
      });
    })
  );
}
