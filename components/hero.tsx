"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useTranslation } from "@/lib/language-context";
import { Knop } from "@/components/ui/knop";
import { useMobielKalender } from "@/components/mobiel-kalender";

type HeroProps = {
  aantalToernooien: number;
  aantalClubs: number;
  aantalControleurs: number;
};

export function Hero({ aantalToernooien, aantalClubs, aantalControleurs }: HeroProps) {
  return (
    <>
      <HeroGsm />
      <HeroPc
        aantalToernooien={aantalToernooien}
        aantalClubs={aantalClubs}
        aantalControleurs={aantalControleurs}
      />
    </>
  );
}

// Gsm (onder md): foto met korte titel en één knop, plus vier snelkoppelingen.
// Er staat bewust geen enkel tornooi bovenaan: de lijst zit onder
// "Tornooien" en gaat pas open als je erop tikt (zie mobiel-kalender.tsx).
// De volledige hero met slogan en cijfers blijft op pc.
function HeroGsm() {
  const { t } = useTranslation();
  const { toon } = useMobielKalender();

  return (
    <div className="relative overflow-hidden bg-blauw md:hidden">
      {/* Foto over de hele hero (titel bovenaan op de donkere bomen, boules in
          het midden, kaders onderaan). hero-gsm.jpg staat bovenaan; ontbreekt
          die, dan schijnt de oude foto er nog doorheen. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "url('/images/hero-gsm.jpg'), url('/images/boules-vrienden.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blauw/70 via-transparent via-45% to-blauw/90" />
      <div className="relative z-[2]">
        <div className="px-6 pb-6 pt-9">
          <h1 className="mb-3 font-titel text-[2.5rem] font-extrabold leading-[1.05] tracking-tight text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.55)]">
            {t.hero.gsmTitelRegel1}
            <br />
            {t.hero.gsmTitelRegel2}
            <span className="block text-geel">{t.hero.gsmTitelAccent}</span>
          </h1>
          <p className="mb-6 text-[1.05rem] leading-snug text-white/90 [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]">
            {t.hero.gsmOndertitel}
          </p>
          <button
            type="button"
            onClick={toon}
            className="inline-flex items-center gap-2 rounded-lg bg-geel px-5 py-3.5 text-base font-bold text-donker shadow-[0_4px_20px_rgba(244,196,48,0.35)] active:brightness-95"
          >
            {t.hero.bekijkKalender}
            <span aria-hidden>›</span>
          </button>
        </div>

        <div className="h-40" aria-hidden />

        <div className="grid grid-cols-2 gap-3 px-4 pb-6">
          <Tegel href="/clubs" label={t.nav.clubs} icoon={<IcoonClubs />} />
          <Tegel href="/match13" label={t.nav.match13} icoon={<IcoonMatch />} />
          <Tegel href="/toernooi-toevoegen" label={t.hero.gsmTegelToevoegen} icoon={<IcoonToevoegen />} />
          <Tegel href="/mijn-tornooien" label={t.nav.mijnTornooien} icoon={<IcoonKalender />} />
        </div>
      </div>
    </div>
  );
}

function HeroPc({
  aantalToernooien,
  aantalClubs,
  aantalControleurs,
}: Pick<HeroProps, "aantalToernooien" | "aantalClubs" | "aantalControleurs">) {
  const { t } = useTranslation();

  return (
    <div className="relative hidden overflow-hidden bg-blauw md:block">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "url('/images/boules-vrienden.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center 70%",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blauw via-blauw/80 to-blauw/10" />
      <div className="relative z-[2] mx-auto max-w-[1140px] px-6 py-20 lg:px-10">
        <div className="max-w-[640px] lg:max-w-[920px]">
          <h1 className="mb-4 font-titel text-6xl font-bold leading-[1.05] tracking-wide text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.45)]">
            {t.hero.titelRegel1}
            <br />
            {t.hero.titelRegel2} <span className="text-geel">{t.hero.titelAccent}</span>
          </h1>
          <p className="mb-6 text-[0.78rem] font-semibold uppercase tracking-[0.25em] text-white/70">
            {t.hero.label}
          </p>
          <p className="mb-2 font-titel text-3xl font-bold text-geel">{t.hero.slogan}</p>
          <p className="mb-8 max-w-[460px] text-base leading-relaxed text-white/80">
            {t.hero.beschrijving}
          </p>
          <div className="mb-10 flex flex-wrap gap-3">
            <Knop href="#kalender" variant="geel">
              {t.hero.bekijkKalender}
            </Knop>
            <Knop href="/toernooi-toevoegen" variant="outline">
              {t.hero.toernooiAanmelden}
            </Knop>
          </div>
          <div className="flex flex-wrap gap-8 border-t border-white/10 pt-6">
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
      className="flex min-h-[7.5rem] w-full flex-col justify-between rounded-xl bg-black/55 p-4 text-left backdrop-blur-sm transition-colors active:bg-black/70"
    >
      <span className="text-geel">{icoon}</span>
      <span className="flex items-center justify-between gap-2 text-[1.05rem] font-semibold text-white">
        {label}
        <span aria-hidden className="text-xl text-white/60">
          ›
        </span>
      </span>
    </Link>
  );
}

const ICOON = {
  width: 40,
  height: 40,
  viewBox: "0 0 24 24",
  fill: "currentColor",
  "aria-hidden": true,
} as const;

function IcoonKalender() {
  return (
    <svg {...ICOON}>
      <path d="M7 2.500a1 1 0 0 1 1 1V5h8V3.500a1 1 0 1 1 2 0V5h.5A2.500 2.500 0 0 1 21 7.500v11a2.500 2.500 0 0 1-2.500 2.500h-13A2.500 2.500 0 0 1 3 18.500v-11A2.500 2.500 0 0 1 5.500 5H6V3.500a1 1 0 0 1 1-1ZM5 10v8.500c0 .3.200.5.500.5h13c.3 0 .5-.2.500-.5V10H5Zm2.500 2h2v2h-2v-2Zm3.500 0h2v2h-2v-2Zm3.500 0h2v2h-2v-2Zm-7 3.500h2v2h-2v-2Zm3.500 0h2v2h-2v-2Z" />
    </svg>
  );
}

function IcoonClubs() {
  return (
    <svg {...ICOON}>
      <circle cx="12" cy="7.500" r="3.200" />
      <circle cx="5.500" cy="9.500" r="2.500" />
      <circle cx="18.500" cy="9.500" r="2.500" />
      <path d="M6.500 20v-2.500a5.500 5.500 0 0 1 11 0V20h-11Z" />
      <path d="M1.500 18.500v-1.300a3.700 3.700 0 0 1 4.600-3.600 7 7 0 0 0-1.600 4.900H1.500Zm21 0h-3a7 7 0 0 0-1.600-4.900 3.700 3.700 0 0 1 4.600 3.600v1.300Z" />
    </svg>
  );
}

function IcoonMatch() {
  return (
    <svg {...ICOON}>
      <circle cx="12" cy="7.500" r="4.700" />
      <circle cx="7" cy="16" r="4.700" />
      <circle cx="17" cy="16" r="4.700" />
    </svg>
  );
}

function IcoonToevoegen() {
  return (
    <svg {...ICOON}>
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 5.500v3.500h3.500a1 1 0 1 1 0 2H13v3.500a1 1 0 1 1-2 0V13H7.500a1 1 0 1 1 0-2H11V7.500a1 1 0 1 1 2 0Z" />
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
