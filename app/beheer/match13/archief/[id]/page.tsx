import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth-helpers";
import { haalMatch13ArchiefItem } from "@/actions/match13-archief";
import { Match13ArchiefDetail } from "@/components/match13/Match13ArchiefDetail";

export default async function Match13ArchiefItemPagina({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) redirect("/beheer/match13");

  const { id } = await params;
  const item = await haalMatch13ArchiefItem(id);
  if (!item) redirect("/beheer/match13/archief");

  return <Match13ArchiefDetail item={item} />;
}
