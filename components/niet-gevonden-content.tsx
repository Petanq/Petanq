"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/language-context";
import { Logo } from "@/components/logo";

export function NietGevondenContent() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 py-20 text-center">
      <Logo className="mb-6 h-14 w-14 opacity-80" />
      <h1 className="mb-3 font-titel text-3xl tracking-wide text-blauw">{t.nietGevonden.titel}</h1>
      <p className="mb-8 text-sm text-grijs">{t.nietGevonden.beschrijving}</p>
      <Link href="/" className="font-bold text-blauw-2 underline">
        {t.nietGevonden.terugNaarKalender}
      </Link>
    </div>
  );
}
