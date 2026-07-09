import type { Metadata } from "next";
import { OverOnsContent } from "@/components/over-ons-content";

export const metadata: Metadata = {
  title: "Over ons",
  description: "Qpetanque is de centrale, vrijwilligersgecontroleerde kalender voor petanquetoernooien in België.",
};

export default function OverOnsPagina() {
  return <OverOnsContent />;
}
