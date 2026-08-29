import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth-helpers";
import { haalMatch13Archief } from "@/actions/match13-archief";
import { Match13ArchiefList } from "@/components/match13/Match13ArchiefList";

export default async function Match13ArchiefPagina() {
  if (!(await isAdmin())) redirect("/beheer/match13");

  const items = await haalMatch13Archief();

  return <Match13ArchiefList items={items} />;
}
