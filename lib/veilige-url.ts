import { z } from "zod";

// Alleen gewone webadressen (http of https) mogen als link getoond of opgeslagen worden.
// Anders kan iemand een "javascript:..."-link insturen die code uitvoert zodra iemand (ook een
// moderator tijdens het nakijken) erop klikt. Daarom controleren we dit bij het opslaan (schema)
// én bij het tonen (veiligeUrl), want de databank kan ook rechtstreeks beschreven worden.
export function veiligeUrl(waarde: string | null | undefined): string | undefined {
  if (!waarde) return undefined;
  const getrimd = waarde.trim();
  try {
    const url = new URL(getrimd);
    return url.protocol === "http:" || url.protocol === "https:" ? getrimd : undefined;
  } catch {
    return undefined;
  }
}

export const httpUrl = z
  .string()
  .trim()
  .url()
  .refine((waarde) => /^https?:\/\//i.test(waarde), { message: "Enkel http(s)-adressen" });
