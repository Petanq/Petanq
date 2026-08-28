import type { Metadata } from "next";
import { LoginForm } from "@/components/beheer/login-form";

export const metadata: Metadata = {
  title: "Beheer — Inloggen",
  robots: { index: false, follow: false },
};

export default async function BeheerLoginPagina({
  searchParams,
}: {
  searchParams: Promise<{ link?: string }>;
}) {
  const { link } = await searchParams;
  return <LoginForm linkVerlopen={link === "verlopen"} />;
}
