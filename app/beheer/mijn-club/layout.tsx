import { redirect } from "next/navigation";
import { isAdmin, heeftMatch13Toegang } from "@/lib/auth-helpers";
import "@/components/match13/match13.css";
import { MATCH13_THEMA } from "@/lib/match13/thema";
import { CLUBS_MOGEN_ZELF_BEHEREN } from "@/lib/club-beheer/instellingen";

// "Mijn club" is voor de admin of voor een club met een (actieve) pilootaccount.
// Dezelfde look als Match13, maar een eigen pagina: de gegevens van de club horen op de site thuis.
export default async function MijnClubLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAdmin();
  if (!admin && !(await heeftMatch13Toegang())) redirect("/beheer");
  // Zolang clubs nog niet vrijgegeven zijn, is deze pagina enkel voor de admin.
  if (!admin && !CLUBS_MOGEN_ZELF_BEHEREN) redirect("/beheer/match13");
  return <div className={"match13-scope " + (MATCH13_THEMA === "donker" ? "m13-donker" : "m13-licht")}>{children}</div>;
}
