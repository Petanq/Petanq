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
import { toernooiSchema, toernooiWijzigenSchema } from "@/lib/validations";
import { Toernooi } from "@/lib/types";
import { isModerator } from "@/lib/auth-helpers";

export type BeheerActieResultaat = { succes: true } | { succes: false; fout: string };

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? "https://petanque13.be";

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

type ModeratorScope = { rol: "moderator" | "admin"; provincie: string | null; mag_heel_belgie: boolean };

async function huidigeModeratorScope(): Promise<ModeratorScope | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("moderatoren")
    .select("rol, provincie, mag_heel_belgie")
    .eq("user_id", user.id)
    .single();
  return (data as ModeratorScope) ?? null;
}

// Buiten hun eigen provincie mag een gewone moderator niets goed- of afkeuren,
// tenzij een admin hen expliciet toegang tot heel België gaf (mag_heel_belgie).
// Dit is een extra check bovenop de RLS-policy, zodat de foutmelding hier
// specifiek genoeg is om in de UI uit te leggen waarom het niet lukte.
function magToernooiBeheren(scope: ModeratorScope, toernooiProvincie: string): boolean {
  if (scope.rol === "admin" || scope.mag_heel_belgie) return true;
  return scope.provincie === toernooiProvincie;
}

export async function toernooiGoedkeuren(id: string): Promise<BeheerActieResultaat> {
  if (!(await isModerator())) return { succes: false, fout: "niet_geautoriseerd" };

  const supabase = createClient();
  const scope = await huidigeModeratorScope();
  const { data: bestaand } = await supabase.from("toernooien").select("provincie").eq("id", id).single();
  if (!scope || !bestaand || !magToernooiBeheren(scope, bestaand.provincie)) {
    return { succes: false, fout: "niet_geautoriseerd_regio" };
  }

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

export async function toernooiToevoegenAlsAdmin(input: unknown): Promise<BeheerActieResultaat> {
  if (!(await isModerator())) return { succes: false, fout: "niet_geautoriseerd" };

  const parsed = toernooiSchema.safeParse(input);
  if (!parsed.success) {
    return { succes: false, fout: "ongeldige_invoer" };
  }
  const data = parsed.data;

  const supabase = createClient();
  const moderatorNaam = await huidigeModeratorNaam();

  const { data: toernooi, error } = await supabase
    .from("toernooien")
    .insert({
      datum: data.datum,
      uur: data.uur,
      clubnaam: data.clubnaam,
      naam_nl: data.naam_nl,
      naam_fr: data.naam_fr,
      gemeente: data.gemeente,
      adres: data.adres || null,
      provincie: data.provincie,
      categorie: data.categorie,
      formule: data.formule,
      speelvorm: data.speelvorm,
      aantal_ronden: data.speelvorm === "rondes" ? data.aantal_ronden ?? null : null,
      aantal_poules: data.speelvorm === "poules" ? data.aantal_poules ?? null : null,
      inschrijvingsprijs: data.gratis ? null : data.inschrijvingsprijs || null,
      gratis: data.gratis ?? false,
      max_ploegen: data.max_ploegen || null,
      contact_email: data.contact_email || null,
      link_inschrijving: data.link_inschrijving || null,
      opmerking: data.opmerking || null,
      affiche_url: data.affiche_url || null,
      open_toernooi: data.open_toernooi ?? false,
      finale: data.speelvorm === "rondes" ? data.finale ?? false : false,
      status: "goedgekeurd",
      ingediend_door: data.contact_email || null,
      goedgekeurd_door: moderatorNaam,
      goedgekeurd_op: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !toernooi) {
    console.error("Toernooi toevoegen (admin) mislukt:", error?.message);
    if (error?.code === "23505") return { succes: false, fout: "dubbel_toernooi" };
    return { succes: false, fout: "server_fout" };
  }

  try {
    await stuurNieuwsbriefVoorToernooi(toernooi as Toernooi);
  } catch (mailFout) {
    console.error("Nieuwsbriefmail versturen mislukt:", mailFout);
  }

  revalidatePath("/beheer/toernooien");
  revalidatePath("/");
  return { succes: true };
}

export async function toernooiWeigeren(id: string, reden: string | null): Promise<BeheerActieResultaat> {
  if (!(await isModerator())) return { succes: false, fout: "niet_geautoriseerd" };

  const supabase = createClient();
  const scope = await huidigeModeratorScope();
  const { data: bestaand } = await supabase.from("toernooien").select("provincie").eq("id", id).single();
  if (!scope || !bestaand || !magToernooiBeheren(scope, bestaand.provincie)) {
    return { succes: false, fout: "niet_geautoriseerd_regio" };
  }

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

  if (toernooi.contact_email) {
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
  }

  revalidatePath("/beheer");
  return { succes: true };
}

export async function toernooiVerwijderen(id: string): Promise<BeheerActieResultaat> {
  if (!(await isModerator())) return { succes: false, fout: "niet_geautoriseerd" };

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
      | "adres"
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
      | "affiche_url"
      | "open_toernooi"
      | "finale"
    >
  >
): Promise<BeheerActieResultaat> {
  if (!(await isModerator())) return { succes: false, fout: "niet_geautoriseerd" };

  const parsed = toernooiWijzigenSchema.safeParse(wijzigingen);
  if (!parsed.success) return { succes: false, fout: "ongeldige_invoer" };

  const supabase = createClient();
  const { error } = await supabase.from("toernooien").update(parsed.data).eq("id", id);
  if (error) {
    if (error.code === "23505") return { succes: false, fout: "dubbel_toernooi" };
    return { succes: false, fout: "server_fout" };
  }
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
