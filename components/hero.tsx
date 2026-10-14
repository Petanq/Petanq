"use client";

import Link from "next/link";
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
          <p className="mb-6 text-[0.78rem] font-semibold uppercase tracking-[0.25em] text-white/70">
            {t.hero.label}
          </p>
          <p className="mb-2 font-titel text-2xl font-bold text-geel sm:text-3xl">{t.hero.slogan}</p>
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
