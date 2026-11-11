"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useTranslation } from "@/lib/language-context";
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
      {/* Foto (titel bovenaan op de donkere bomen, boules en spelers in het
          midden). De foto stopt een stuk boven de onderkant en vervaagt daar,
          zodat de boules en de spelers boven de kaders staan i.p.v. erachter.
          hero-gsm.jpg staat bovenaan; ontbreekt die, dan schijnt de oude foto
          er nog doorheen. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 bottom-[7.5rem] [-webkit-mask-image:linear-gradient(to_bottom,#000_70%,transparent)] [mask-image:linear-gradient(to_bottom,#000_70%,transparent)]"
        style={{
          backgroundImage: "url('/images/hero-gsm.jpg'), url('/images/boules-vrienden.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blauw/70 via-transparent via-40% to-transparent" />
      <div className="relative z-[2]">
        <div className="px-6 pb-6 pt-9">
          <h1 className="mb-3 font-titel text-[2.5rem] font-extrabold leading-[1.05] tracking-tight text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.55)]">
            {t.hero.gsmTitelRegel1}
            <br />
            {t.hero.gsmTitelRegel2}
            <span className="block text-geel">{t.hero.gsmTitelAccent}</span>
          </h1>
          <p className="text-[1.05rem] leading-snug text-white/90 [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]">
            {t.hero.gsmOndertitel}
          </p>
        </div>

        <div className="h-40" aria-hidden />

        <div className="grid grid-cols-2 gap-3 px-4 pb-6">
          <Tegel onClick={toon} label={t.hero.gsmTegelToernooien} icoon={<IcoonTrofee />} accent />
          <Tegel href="/clubs" label={t.nav.clubs} icoon={<IcoonClubs />} />
          <Tegel href="/mijn-tornooien" label={t.nav.mijnTornooien} icoon={<IcoonKalender />} />
          <Tegel href="/toernooi-toevoegen" label={t.hero.gsmTegelToevoegen} icoon={<IcoonToevoegen />} />
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
        <div className="lg:max-w-[1060px]">
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
          {/* Dezelfde vier gouden kaders als op gsm. */}
          <div className="mb-10 grid grid-cols-4 gap-4">
            <Tegel href="#kalender" label={t.hero.gsmTegelToernooien} icoon={<IcoonTrofee />} accent />
            <Tegel href="/clubs" label={t.nav.clubs} icoon={<IcoonClubs />} />
            <Tegel href="/mijn-tornooien" label={t.nav.mijnTornooien} icoon={<IcoonKalender />} />
            <Tegel href="/toernooi-toevoegen" label={t.hero.gsmTegelToevoegen} icoon={<IcoonToevoegen />} />
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

function Tegel({
  href,
  onClick,
  label,
  icoon,
  accent,
}: {
  href?: string;
  onClick?: () => void;
  label: string;
  icoon: ReactNode;
  accent?: boolean;
}) {
  const klassen = `flex min-h-[7.5rem] w-full flex-col justify-between rounded-xl bg-black/55 p-4 text-left backdrop-blur-sm transition-colors active:bg-black/70 ${
    accent
      ? "border-2 border-geel shadow-[0_0_18px_rgba(244,196,48,0.3)]"
      : "border-2 border-geel/60 shadow-[0_0_14px_rgba(244,196,48,0.12)]"
  }`;
  const inhoud = (
    <>
      <span className="text-geel">{icoon}</span>
      <span className="flex items-center justify-between gap-2 text-[1.05rem] font-semibold text-white">
        {label}
        <span aria-hidden className="text-xl text-white/60">
          ›
        </span>
      </span>
    </>
  );
  if (href) {
    return (
      <Link href={href} className={klassen}>
        {inhoud}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={klassen}>
      {inhoud}
    </button>
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

function IcoonTrofee() {
  return (
    <svg {...ICOON}>
      <path d="M7 3h10v2.500h3.200c.4 0 .8.4.7.9-.4 2.600-1.900 4.500-4.400 4.900a5.200 5.200 0 0 1-3.300 2.400V16h3v2.200H8.800V16h3v-2.300a5.200 5.200 0 0 1-3.300-2.400C5 10.900 3.500 9 3.100 6.400c-.1-.5.300-.9.700-.9H7V3Zm-1.600 4.500c.3 1.300 1 2.200 2.100 2.600-.3-.9-.5-1.800-.5-2.600H5.400Zm13.200 0h-1.600c0 .8-.2 1.700-.5 2.600 1.100-.4 1.800-1.300 2.100-2.600ZM7.500 19.500h9V22h-9v-2.500Z" />
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
      <div className="mt-1 whitespace-pre-line text-[0.72rem] font-semibold uppercase tracking-wide text-white/65 underline decoration-transparent underline-offset-4 transition-colors group-hover:text-white/70 group-hover:decoration-white/40">
        {label}
      </div>
    </Link>
  );
}
