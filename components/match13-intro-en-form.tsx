"use client";

import { useTranslation } from "@/lib/language-context";
import { Match13AanvraagForm } from "@/components/match13-aanvraag-form";

export function Match13IntroEnForm() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
      <span className="inline-block rounded-full bg-geel px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-donker">
        {t.match13Aanvraag.badge}
      </span>
      <h1 className="mb-4 mt-3 font-titel text-3xl tracking-wide text-blauw sm:text-4xl">{t.match13Aanvraag.titel}</h1>
      <p className="mb-4 text-[0.95rem] leading-relaxed text-grijs">{t.match13Aanvraag.intro}</p>
      <p className="mb-8 text-[0.95rem] leading-relaxed text-grijs">{t.match13Aanvraag.introVervolg}</p>

      <div className="mb-10 rounded-2xl bg-blauw p-6 sm:p-8">
        <h2 className="mb-4 font-titel text-lg tracking-wide text-geel">{t.match13Aanvraag.kenmerkenTitel}</h2>
        <ul className="flex flex-col gap-3">
          {t.match13Aanvraag.kenmerken.map((kenmerk) => (
            <li key={kenmerk} className="flex items-start gap-3 text-[0.9rem] text-white/85">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-geel text-[0.65rem] font-bold text-donker">
                ✓
              </span>
              {kenmerk}
            </li>
          ))}
        </ul>
      </div>

      <Match13AanvraagForm />
    </div>
  );
}
