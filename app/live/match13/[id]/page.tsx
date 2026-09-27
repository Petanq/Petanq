import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { haalMatch13ToernooiVoorPubliek } from "@/actions/match13";
import { Match13LiveView } from "@/components/match13/Match13LiveView";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { id } = await props.params;
  const live = await haalMatch13ToernooiVoorPubliek(id);
  if (!live) return { title: "Live volgen" };
  return { title: `Live: ${live.club || live.naam} — Petanque13` };
}

// Publieke, niet-ingelogde pagina — enkel bereikbaar als de club dit
// specifieke toernooi zelf op "live delen" heeft gezet (zie
// haalMatch13ToernooiVoorPubliek + de RLS-policy op match13_toernooien).
export default async function Match13LivePagina(props: Props) {
  const { id } = await props.params;
  const live = await haalMatch13ToernooiVoorPubliek(id);
  if (!live) notFound();

  return <Match13LiveView id={id} initieel={live} />;
}
