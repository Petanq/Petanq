import type { Metadata } from "next";
import { BoulesContent } from "@/components/boules-content";

export const metadata: Metadata = {
  title: "Pétanqueboules van Boulenciel",
  description:
    "Het volledige gamma FIPJP-gehomologeerde pétanqueboules van Boulenciel: Iris, Vartan, Mars, Mercure, Saturne, Venus en meer, met keuzehulp en prijzen.",
};

export default function BoulesPagina() {
  return <BoulesContent />;
}
