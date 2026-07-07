"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/language-context";
import { Toernooi } from "@/lib/types";
import { dagNummer, maandKort } from "@/lib/datum";
import { CATEGORIE_BADGE } from "@/lib/stijlen";

type HeroProps = {
  previewToernooien: Toernooi[];
  aantalToernooien: number;
  aantalClubs: number;
};

export function Hero({ previewToernooien, aantalToernooien, aantalClubs }: HeroProps) {
  const { t, taal } = useTranslation();

  return (
    <div className="relative overflow-hidden bg-blauw">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 80% 50%, rgba(37,99,174,0.35) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 20% 80%, rgba(192,57,43,0.15) 0%, transparent 60%)",
        }}
      />
      <div className="relative z-[2] mx-auto grid max-w-[1140px] grid-cols-1 gap-12 px-6 py-16 lg:grid-cols-[1fr_380px] lg:px-10">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.08] px-3.5 py-1.5 text-[0.75rem] font-semibold uppercase tracking-wide text-white/75">
            <span className="h-1.5 w-1.5 rounded-full bg-geel" />
            {t.hero.label}
          </div>
          <h1 className="mb-5 font-titel text-6xl leading-[0.95] tracking-wide text-white sm:text-7xl">
            {t.hero.titelRegel1}
            <br />
            {t.hero.titelRegel2}
            <br />
            <span className="text-geel">{t.hero.titelAccent}</span>
          </h1>
          <p className="mb-8 max-w-[430px] text-base leading-relaxed text-white/60">
            {t.hero.beschrijving}
          </p>
          <div className="mb-10 flex flex-wrap gap-3">
            <a
              href="#toernooien"
              className="rounded-lg bg-rood px-6 py-3 font-bold text-white shadow-[0_4px_16px_rgba(192,57,43,0.35)] transition-all hover:-translate-y-px hover:bg-rood-2"
            >
              {t.hero.bekijkKalender}
            </a>
            <Link
              href="/toernooi-toevoegen"
              className="rounded-lg border-[1.5px] border-white/20 bg-white/10 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/[0.16]"
            >
              {t.hero.toernooiAanmelden}
            </Link>
          </div>
          <div className="flex flex-wrap gap-8 border-t border-white/10 pt-6">
            <Stat waarde={`${aantalToernooien}+`} label={t.hero.statToernooien} />
            <Stat waarde={`${aantalClubs}+`} label={t.hero.statClubs} />
            <Stat waarde="11" label={t.hero.statProvincies} />
            <Stat waarde="8" label={t.hero.statControleurs} />
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {previewToernooien.map((toernooi) => (
            <Link
              key={toernooi.id}
              href={`/toernooien/${toernooi.id}`}
              className="flex items-center gap-3.5 rounded-[10px] border border-white/10 bg-white/[0.07] p-3.5 backdrop-blur-sm transition-colors hover:bg-white/[0.11]"
            >
              <div className="min-w-[44px] rounded-lg bg-white/10 px-1 py-1.5 text-center">
                <div className="font-titel text-2xl leading-none text-white">
                  {dagNummer(toernooi.datum)}
                </div>
                <div className="text-[0.6rem] font-bold uppercase tracking-wide text-white/50">
                  {maandKort(toernooi.datum, taal)}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 truncate text-[0.82rem] font-bold text-white">
                  {taal === "fr" ? toernooi.naam_fr : toernooi.naam_nl}
                </div>
                <div className="truncate text-[0.73rem] text-white/50">
                  📍 {toernooi.clubnaam}
                </div>
              </div>
              <span
                className={`whitespace-nowrap rounded px-2 py-0.5 text-[0.65rem] font-bold uppercase ${CATEGORIE_BADGE[toernooi.categorie]}`}
              >
                {t.categorie[toernooi.categorie]}
              </span>
            </Link>
          ))}
          <a
            href="#toernooien"
            className="p-2 text-center text-[0.78rem] font-medium text-white/40 transition-colors hover:text-geel"
          >
            {t.hero.bekijkAlle}
          </a>
        </div>
      </div>
    </div>
  );
}

function Stat({ waarde, label }: { waarde: string; label: string }) {
  return (
    <div>
      <div className="font-titel text-3xl leading-none text-geel">{waarde}</div>
      <div className="mt-1 whitespace-pre-line text-[0.72rem] font-semibold uppercase tracking-wide text-white/45">
        {label}
      </div>
    </div>
  );
}
