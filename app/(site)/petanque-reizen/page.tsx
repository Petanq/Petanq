import type { Metadata } from "next";
import { ReizenContent } from "@/components/reizen-content";

export const metadata: Metadata = {
  title: "Petanque-reizen",
  description: "Internationale petanque-reisweken van Petank'Events: Costa Brava, Corsica en Thailand.",
};

export default function PetanqueReizenPagina() {
  return <ReizenContent />;
}
