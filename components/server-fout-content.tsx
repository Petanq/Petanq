"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/language-context";
import { Logo } from "@/components/logo";

export function ServerFoutContent({ reset }: { reset?: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 py-20 text-center">
      <Logo className="mb-6 h-14 w-14 opacity-80" />
      <h1 className="mb-3 font-titel text-3xl tracking-wide text-blauw">{t.serverFout.titel}</h1>
      <p className="mb-8 text-sm text-grijs">{t.serverFout.beschrijving}</p>
      <div className="flex items-center gap-5">
        {reset && (
          <button
            onClick={reset}
            className="rounded-full bg-blauw px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blauw-2 hover:shadow-md active:scale-[0.97]"
          >
            {t.serverFout.probeerOpnieuw}
          </button>
        )}
        <Link href="/" className="font-bold text-blauw-2 underline">
          {t.serverFout.terugNaarKalender}
        </Link>
      </div>
    </div>
  );
}
