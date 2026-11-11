import type { Metadata } from "next";
import { NieuwsbriefBevestigen } from "@/components/nieuwsbrief-bevestigen";

export const metadata: Metadata = {
  title: "Nieuwsbrief bevestigen",
  robots: { index: false, follow: false },
};

export default async function NieuwsbriefBevestigenPagina(props: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await props.searchParams;
  return <NieuwsbriefBevestigen token={typeof token === "string" ? token : ""} />;
}
