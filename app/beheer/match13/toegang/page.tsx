import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth-helpers";
import { haalMatch13Gebruikers, haalEchteClubs } from "@/actions/match13-toegang";
import { Match13ToegangList } from "@/components/match13/Match13ToegangList";

export default async function Match13ToegangPagina() {
  if (!(await isAdmin())) redirect("/beheer/match13");

  const [gebruikers, echteClubs] = await Promise.all([haalMatch13Gebruikers(), haalEchteClubs()]);

  return <Match13ToegangList gebruikers={gebruikers} echteClubs={echteClubs} />;
}
