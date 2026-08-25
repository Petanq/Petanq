import { redirect } from "next/navigation";
import { haalMatch13Toernooi } from "@/actions/match13";
import { Match13App } from "@/components/match13/Match13App";

export default async function Match13ToernooiPagina({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const initialState = await haalMatch13Toernooi(id);
  if (!initialState) redirect("/beheer/match13");

  return <Match13App tournamentId={id} initialState={initialState} />;
}
