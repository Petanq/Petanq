import { redirect } from "next/navigation";
import { isAdmin, heeftMatch13Toegang } from "@/lib/auth-helpers";
import "@/components/match13/match13.css";

// Match13 leeft bewust naast (niet binnen) de gewone (dashboard)-groep: het is
// de volledig geportte, eigen-gestylede toernooitool, niet nog een tabblad
// in de bestaande Beheer-navigatie. Bereikbaar voor de admin, of voor een
// pilootclub die expliciet Match13-toegang kreeg (nooit gewone moderatoren).
export default async function Match13Layout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin()) && !(await heeftMatch13Toegang())) redirect("/beheer");

  return <div className="match13-scope">{children}</div>;
}
