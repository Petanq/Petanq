"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/language-context";

export function CtaBlock() {
  const { t } = useTranslation();

  return (
    <div className="mt-3 grid grid-cols-1 overflow-hidden rounded-xl border-[1.5px] border-white/[0.06] bg-[#1a1a2e] sm:grid-cols-[1fr_220px]">
      <div className="flex flex-wrap items-center justify-between gap-6 p-7">
        <div>
          <h3 className="mb-1 font-titel text-2xl tracking-wide text-white">{t.cta.titel}</h3>
          <p className="text-[0.84rem] text-white/50">{t.cta.subtitel}</p>
        </div>
        <Link
          href="/toernooi-toevoegen"
          className="whitespace-nowrap rounded-lg bg-rood px-6 py-3 font-bold text-white shadow-[0_4px_16px_rgba(192,57,43,0.35)] transition-all hover:-translate-y-px hover:bg-rood-2"
        >
          {t.cta.knop}
        </Link>
      </div>
      <div
        className="hidden bg-cover bg-center sm:block"
        style={{ backgroundImage: "url('/images/legs-petanque.jpg')" }}
      />
    </div>
  );
}
