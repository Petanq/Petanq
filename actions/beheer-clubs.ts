"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { clubSchema, clubWijzigenSchema } from "@/lib/validations";
import { Club } from "@/lib/types";
import { isModerator } from "@/lib/auth-helpers";

export type BeheerActieResultaat = { succes: true } | { succes: false; fout: string };

export async function clubToevoegen(input: unknown): Promise<BeheerActieResultaat> {
  if (!(await isModerator())) return { succes: false, fout: "niet_geautoriseerd" };

  const parsed = clubSchema.safeParse(input);
  if (!parsed.success) return { succes: false, fout: "ongeldige_invoer" };

  const supabase = createClient();
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

  const supabase = createClient();
  const { error } = await supabase.from("clubs").update(parsed.data).eq("id", id);
  if (error) return { succes: false, fout: error.message };
  revalidatePath("/beheer/clubs");
  revalidatePath("/clubs");
  return { succes: true };
}

export async function clubActiefZetten(id: string, actief: boolean): Promise<BeheerActieResultaat> {
  if (!(await isModerator())) return { succes: false, fout: "niet_geautoriseerd" };

  const supabase = createClient();
  const { error } = await supabase.from("clubs").update({ actief }).eq("id", id);
  if (error) return { succes: false, fout: "server_fout" };
  revalidatePath("/beheer/clubs");
  revalidatePath("/clubs");
  return { succes: true };
}

export async function clubVerwijderen(id: string): Promise<BeheerActieResultaat> {
  if (!(await isModerator())) return { succes: false, fout: "niet_geautoriseerd" };

  const supabase = createClient();
  const { error } = await supabase.from("clubs").delete().eq("id", id);
  if (error) return { succes: false, fout: "server_fout" };
  revalidatePath("/beheer/clubs");
  revalidatePath("/clubs");
  return { succes: true };
}
