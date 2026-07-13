import { randomUUID } from "crypto";
import { createServiceRoleClient } from "@/lib/supabase/server";

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.petanq.be";

export async function maakKorteLink(doelLink: string): Promise<string> {
  const serviceClient = createServiceRoleClient();
  const code = randomUUID().replace(/-/g, "").slice(0, 8);
  const vervaltOp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  await serviceClient.from("korte_links").insert({ code, doel_link: doelLink, vervalt_op: vervaltOp });

  return `${siteUrl()}/u/${code}`;
}
