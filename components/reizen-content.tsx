"use client";

import Image from "next/image";
import { useTranslation } from "@/lib/language-context";
import { PETANQUE_REIZEN } from "@/lib/reizen";

export function ReizenContent() {
  const { t, taal } = useTranslation();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 lg:px-10">
      <h1 className="mb-4 font-titel text-4xl tracking-wide text-blauw">{t.reizenPagina.titel}</h1>
      <p className="mb-10 max-w-2xl text-sm leading-relaxed text-donker">{t.reizenPagina.intro}</p>

      <div className="flex flex-col gap-4">
        {PETANQUE_REIZEN.map((reis) => {
          const email = reis.link.replace("mailto:", "");
          return (
            <div
              key={reis.id}
              className="rounded-[10px] border-[1.5px] border-rand bg-white p-5 transition-all hover:border-geel/60 hover:shadow-[0_2px_10px_rgba(244,196,48,0.15)]"
            >
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-blauw-2">
                {t.reizenPagina.organisatorLabel}: {taal === "fr" ? reis.organisatorFr : reis.organisatorNl}
              </div>
              <h2 className="mb-3 font-titel text-xl tracking-wide text-donker">{reis.naam}</h2>

              {reis.afficheUrl && (
                <Image
                  src={reis.afficheUrl}
                  alt={reis.naam}
                  width={800}
                  height={1130}
                  className="mb-3 h-auto w-full max-w-xs rounded-md border border-rand object-contain"
                />
              )}

              <p className="mb-3 text-sm leading-relaxed text-grijs">
                {taal === "fr" ? reis.beschrijvingFr : reis.beschrijvingNl}
              </p>
              <dl className="mb-4 grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs font-bold text-donker">{t.reizenPagina.periodeLabel}</dt>
                  <dd className="text-grijs">{taal === "fr" ? reis.periodeFr : reis.periodeNl}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-donker">{t.reizenPagina.locatieLabel}</dt>
                  <dd className="text-grijs">{taal === "fr" ? reis.locatieFr : reis.locatieNl}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-donker">{t.reizenPagina.prijsVanafLabel}</dt>
                  <dd className="font-semibold text-[#b8860b]">
                    {taal === "fr" ? reis.prijsVanafFr : reis.prijsVanafNl}
                  </dd>
                </div>
              </dl>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={reis.link}
                  className="inline-flex items-center gap-2 rounded-md bg-blauw px-4 py-2 text-sm font-bold text-white transition-all hover:bg-blauw-2 active:scale-[0.97]"
                >
                  {t.reizenPagina.infoKnop} →
                </a>
                <a href={reis.link} className="text-sm text-grijs underline hover:text-blauw">
                  {t.reizenPagina.mailKnop} {email}
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-sm text-grijs">{t.reizenPagina.contactTekst}</p>
    </div>
  );
}
