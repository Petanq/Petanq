"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { Moderator, ModeratorRol } from "@/lib/types";
import { Provincie } from "@/lib/provincies";
import { isModerator, isAdmin } from "@/lib/auth-helpers";

export type BeheerActieResultaat = { succes: true } | { succes: false; fout: string };

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.petanq.be";

export async function moderatorUitnodigen(input: {
  email: string;
  naam: string;
  rol: ModeratorRol;
  provincie: Provincie | null;
}): Promise<BeheerActieResultaat> {
  if (!(await isAdmin())) return { succes: false, fout: "niet_geautoriseerd" };

  const serviceClient = createServiceRoleClient();
  const { data, error } = await serviceClient.auth.admin.inviteUserByEmail(input.email, {
    redirectTo: `${siteUrl()}/beheer/wachtwoord-resetten`,
  });

  if (error || !data.user) {
    if (error?.message.toLowerCase().includes("already been registered")) {
      return { succes: false, fout: "al_geregistreerd" };
    }
    console.error("Vrijwilliger uitnodigen mislukt:", error?.message);
    return { succes: false, fout: "server_fout" };
  }

  const { error: invoegFout } = await serviceClient.from("moderatoren").insert({
    user_id: data.user.id,
    naam: input.naam,
    email: input.email,
    rol: input.rol,
    provincie: input.provincie,
  });

  if (invoegFout) {
    // Best-effort: de net aangemaakte auth-user weer opruimen als de moderatoren-rij mislukt.
    await serviceClient.auth.admin.deleteUser(data.user.id);
    console.error("Vrijwilliger-rij toevoegen mislukt:", invoegFout.message);
    return { succes: false, fout: "server_fout" };
  }

  revalidatePath("/beheer/moderatoren");
  return { succes: true };
}

export async function moderatorBewerken(
  id: string,
  wijzigingen: Partial<Pick<Moderator, "naam" | "provincie">>
): Promise<BeheerActieResultaat> {
  if (!(await isModerator())) return { succes: false, fout: "niet_geautoriseerd" };

  const supabase = createClient();
  const { error } = await supabase.from("moderatoren").update(wijzigingen).eq("id", id);
  if (error) return { succes: false, fout: "server_fout" };
  revalidatePath("/beheer/moderatoren");
  return { succes: true };
}

export async function moderatorVerwijderen(id: string): Promise<BeheerActieResultaat> {
  if (!(await isModerator())) return { succes: false, fout: "niet_geautoriseerd" };

  const supabase = createClient();
  const { error } = await supabase.from("moderatoren").delete().eq("id", id);
  if (error) return { succes: false, fout: "server_fout" };
  revalidatePath("/beheer/moderatoren");
  return { succes: true };
}
