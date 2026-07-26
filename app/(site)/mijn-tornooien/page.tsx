import type { Metadata } from "next";
import { MijnTornooienContent } from "@/components/mijn-tornooien-content";

export const metadata: Metadata = {
  title: "Mijn tornooien",
  description: "Jouw persoonlijk overzicht van opgeslagen petanquetornooien, met eigen notities.",
};

export default function MijnTornooienPagina() {
  return <MijnTornooienContent />;
}
