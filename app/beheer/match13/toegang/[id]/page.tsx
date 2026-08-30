import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth-helpers";
import { haalMatch13GebruikerMetToernooien, haalEchteClubs } from "@/actions/match13-toegang";
import { Match13GebruikerDetail } from "@/components/match13/Match13GebruikerDetail";

export default async function Match13GebruikerPagina({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) redirect("/beheer/match13");

  const { id } = await params;
  const [gebruiker, echteClubs] = await Promise.all([haalMatch13GebruikerMetToernooien(id), haalEchteClubs()]);
  if (!gebruiker) redirect("/beheer/match13/toegang");

  return <Match13GebruikerDetail gebruiker={gebruiker} echteClubs={echteClubs} />;
}
