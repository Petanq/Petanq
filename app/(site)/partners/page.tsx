import type { Metadata } from "next";
import { PartnersContent } from "@/components/partners-content";

export const metadata: Metadata = {
  title: "Partners",
  description: "Word partner van Petanque13, de centrale petanquekalender voor België.",
};

export default function PartnersPagina() {
  return <PartnersContent />;
}
