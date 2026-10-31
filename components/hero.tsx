"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useTranslation } from "@/lib/language-context";
import { Knop } from "@/components/ui/knop";

type HeroProps = {
  aantalToernooien: number;
  aantalClubs: number;
  aantalControleurs: number;
};

export function Hero({ aantalToernooien, aantalClubs, aantalControleurs }: HeroProps) {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden bg-blauw">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "url('/images/boules-vrienden.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center 70%",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blauw via-blauw/80 to-blauw/10 max-sm:from-blauw/85 max-sm:via-blauw/80 max-sm:to-blauw/70" />
      <div className="relative z-[2] mx-auto max-w-[1140px] px-6 py-20 lg:px-10">
        <div className="max-w-[640px] lg:max-w-[920px]">
          <h1 className="mb-4 font-titel text-[2.4rem] font-bold leading-[1.05] tracking-wide text-white min-[400px]:text-5xl sm:text-6xl [text-shadow:0_2px_14px_rgba(0,0,0,0.45)]">
            {t.hero.titelRegel1}
            <br />
            {t.hero.titelRegel2} <span className="text-geel">{t.hero.titelAccent}</span>
          </h1>
          <p className="mb-6 hidden text-[0.78rem] font-semibold uppercase tracking-[0.25em] text-white/70 md:block">
            {t.hero.label}
          </p>
          <p className="mb-2 font-titel text-2xl font-bold text-geel sm:text-3xl">{t.hero.slogan}</p>
          <p className="mb-6 max-w-[460px] text-base leading-relaxed text-white/80 md:mb-8">
            {t.hero.beschrijving}
          </p>
          <div className="mb-8 flex flex-wrap gap-3 md:mb-10">
            <Knop href="#kalender" variant="geel">
              {t.hero.bekijkKalender}
            </Knop>
            <Knop href="/toernooi-toevoegen" variant="outline" className="max-md:hidden">
              {t.hero.toernooiAanmelden}
            </Knop>
          </div>
          <div className="grid grid-cols-2 gap-3 md:hidden">
            <Tegel href="#kalender" label={t.nav.toernooien} icoon={<IcoonKalender />} />
            <Tegel href="/clubs" label={t.nav.clubs} icoon={<IcoonClubs />} />
            <Tegel href="/match13" label={t.nav.match13} icoon={<IcoonMatch />} />
            <Tegel href="/mijn-tornooien" label={t.nav.mijnTornooien} icoon={<IcoonAgenda />} />
          </div>
          <div className="hidden flex-wrap gap-8 border-t border-white/10 pt-6 md:flex">
            <Stat href="#toernooien" waarde={`${aantalToernooien}+`} label={t.hero.statToernooien} />
            <Stat href="/clubs" waarde={`${aantalClubs}+`} label={t.hero.statClubs} />
            <Stat href="/clubs" waarde="11" label={t.hero.statProvincies} />
            <Stat href="/over-ons" waarde={`${aantalControleurs}`} label={t.hero.statControleurs} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Tegel({ href, label, icoon }: { href: string; label: string; icoon: ReactNode }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-black/45 px-3 py-5 text-center backdrop-blur-sm transition-colors active:bg-black/60"
    >
      <span className="text-geel">{icoon}</span>
      <span className="text-[0.8rem] font-bold uppercase tracking-wide text-white">{label}</span>
    </Link>
  );
}

const ICOON = {
  width: 34,
  height: 34,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

function IcoonKalender() {
  return (
    <svg {...ICOON}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01" strokeWidth={2.4} />
    </svg>
  );
}

function IcoonClubs() {
  return (
    <svg {...ICOON}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 19.5c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
      <circle cx="17" cy="9" r="2.6" />
      <path d="M17.5 14.2c2.4.2 4 1.9 4 4.3" />
    </svg>
  );
}

function IcoonMatch() {
  return (
    <svg {...ICOON}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 3.5c-2.6 2.4-4 5.2-4 8.5s1.4 6.1 4 8.5M12 3.5c2.6 2.4 4 5.2 4 8.5s-1.4 6.1-4 8.5M3.5 12h17" />
    </svg>
  );
}

function IcoonAgenda() {
  return (
    <svg {...ICOON}>
      <path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2Z" />
    </svg>
  );
}

function Stat({ href, waarde, label }: { href: string; waarde: string; label: string }) {
  return (
    <Link href={href} className="group">
      <div className="font-titel text-3xl leading-none text-geel transition-colors group-hover:text-white">
        {waarde}
      </div>
      <div className="mt-1 whitespace-pre-line text-[0.72rem] font-semibold uppercase tracking-wide text-white/45 underline decoration-transparent underline-offset-4 transition-colors group-hover:text-white/70 group-hover:decoration-white/40">
        {label}
      </div>
    </Link>
  );
}
