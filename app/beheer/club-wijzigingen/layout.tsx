import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth-helpers";
import "@/components/match13/match13.css";
import { MATCH13_THEMA } from "@/lib/match13/thema";

// Alleen de admin keurt wijzigingen van clubs goed of af.
export default async function ClubWijzigingenLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/beheer");
  return <div className={"match13-scope " + (MATCH13_THEMA === "donker" ? "m13-donker" : "m13-licht")}>{children}</div>;
}
