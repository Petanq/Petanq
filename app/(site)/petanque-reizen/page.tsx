import type { Metadata } from "next";
import { ReizenContent } from "@/components/reizen-content";

export const metadata: Metadata = {
  title: "Op reis met Claudy Weibel",
  description: "Internationale petanque-reisweken met Claudy Weibel (Petank'Events): Costa Brava, Corsica en Thailand.",
};

export default function PetanqueReizenPagina() {
  return <ReizenContent />;
}
