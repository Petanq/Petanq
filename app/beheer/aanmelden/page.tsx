import type { Metadata } from "next";
import { AanmeldenForm } from "@/components/beheer/aanmelden-form";

export const metadata: Metadata = {
  title: "Beheer — Vrijwilliger worden",
  robots: { index: false, follow: false },
};

export default function AanmeldenPagina() {
  return <AanmeldenForm />;
}
