"use client";

import { useTranslation } from "@/lib/language-context";
import { Knop } from "@/components/ui/knop";

export function CtaBlock() {
  const { t } = useTranslation();

  return (
    <div className="mt-3 grid grid-cols-1 overflow-hidden rounded-xl border-[1.5px] border-white/[0.06] bg-[#1a1a2e] sm:grid-cols-[1fr_220px]">
      <div className="flex flex-wrap items-center justify-between gap-6 p-7">
        <div>
          <h3 className="mb-1 font-titel text-2xl tracking-wide text-white">{t.cta.titel}</h3>
          <p className="text-[0.84rem] text-white/50">{t.cta.subtitel}</p>
        </div>
        <Knop href="/toernooi-toevoegen" variant="rood" className="whitespace-nowrap">
          {t.cta.knop}
        </Knop>
      </div>
      <div
        className="hidden bg-cover bg-center sm:block"
        style={{ backgroundImage: "url('/images/boules-koppel.jpg')" }}
      />
    </div>
  );
}
