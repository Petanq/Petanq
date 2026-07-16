"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslation } from "@/lib/language-context";
import { PETANQUE_REIZEN } from "@/lib/reizen";
import { PaginaBezoekTeller } from "@/components/pagina-bezoek-teller";

export function ReizenContent() {
  const { t, taal } = useTranslation();
  const [geopendeAffiche, setGeopendeAffiche] = useState<{ url: string; alt: string } | null>(null);

  return (
    <div>
      <PaginaBezoekTeller pad="/petanque-reizen" />
      <div className="relative overflow-hidden bg-blauw">
        <div
          className="animatie-inzoomen pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage: "url('/images/reizen/claudy-hero.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-blauw via-blauw/80 to-blauw/40" />
        <div className="relative z-[2] mx-auto max-w-4xl px-6 py-20 lg:px-10">
          <h1 className="mb-4 font-titel text-4xl tracking-wide text-white sm:text-5xl">
            {t.reizenPagina.titel}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-white/75">{t.reizenPagina.intro}</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-12 lg:px-10">
        <div className="flex flex-col gap-4">
          {PETANQUE_REIZEN.map((reis) => {
            const email = reis.link.replace("mailto:", "");
            const affiches = (taal === "nl" && reis.afficheUrlsNl ? reis.afficheUrlsNl : reis.afficheUrls) ?? [];
            return (
              <div
                key={reis.id}
                className="rounded-[10px] border-[1.5px] border-rand bg-white p-5 transition-all hover:border-geel/60 hover:shadow-[0_2px_10px_rgba(244,196,48,0.15)]"
              >
                <div className="mb-2 text-xs font-bold uppercase tracking-wide text-blauw-2">
                  {t.reizenPagina.organisatorLabel}: {taal === "fr" ? reis.organisatorFr : reis.organisatorNl}
                </div>
                <h2 className="mb-3 font-titel text-xl tracking-wide text-donker">{reis.naam}</h2>

                {affiches.length > 0 && (
                  <div className="relative mb-4 overflow-hidden rounded-lg bg-licht">
                    <div
                      className="pointer-events-none absolute inset-0 opacity-[0.06]"
                      style={{
                        backgroundImage: "url('/images/logo-icon.png')",
                        backgroundSize: "150px",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                      }}
                    />
                    <div className="relative flex flex-wrap justify-center gap-3 p-4">
                      {affiches.map((affiche, i) => (
                        <button
                          key={affiche}
                          type="button"
                          onClick={() =>
                            setGeopendeAffiche({ url: affiche, alt: `${reis.naam} (${i + 1}/${affiches.length})` })
                          }
                          className="group inline-block cursor-zoom-in rounded-lg border-[3px] border-white bg-white shadow-[0_4px_20px_rgba(11,31,58,0.18)] ring-1 ring-rand transition-transform hover:-translate-y-0.5"
                        >
                          <Image
                            src={affiche}
                            alt={`${reis.naam} (${i + 1}/${affiches.length})`}
                            width={800}
                            height={1130}
                            className="h-auto w-full max-w-[9.5rem] rounded-[5px] object-contain sm:max-w-[11rem]"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
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

      {geopendeAffiche && (
        <div
          onClick={() => setGeopendeAffiche(null)}
          className="fixed inset-0 z-[400] flex cursor-zoom-out items-center justify-center bg-donker/90 p-6"
        >
          <button
            type="button"
            onClick={() => setGeopendeAffiche(null)}
            aria-label="Sluiten"
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/20"
          >
            ×
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={geopendeAffiche.url}
            alt={geopendeAffiche.alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-full cursor-default rounded-lg object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
