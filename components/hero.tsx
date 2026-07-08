"use client";

import { useTranslation } from "@/lib/language-context";
import { Knop } from "@/components/ui/knop";

type HeroProps = {
  aantalToernooien: number;
  aantalClubs: number;
};

export function Hero({ aantalToernooien, aantalClubs }: HeroProps) {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden bg-blauw">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage: "url('/images/hero-petanque.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center 35%",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blauw via-blauw/90 to-blauw/50" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 80% 50%, rgba(37,99,174,0.35) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 20% 80%, rgba(192,57,43,0.15) 0%, transparent 60%)",
        }}
      />
      <div className="relative z-[2] mx-auto max-w-[1140px] px-6 py-20 lg:px-10">
        <div className="max-w-[600px]">
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
            <Knop href="#toernooien" variant="rood">
              {t.hero.bekijkKalender}
            </Knop>
            <Knop href="/toernooi-toevoegen" variant="outline">
              {t.hero.toernooiAanmelden}
            </Knop>
          </div>
          <div className="flex flex-wrap gap-8 border-t border-white/10 pt-6">
            <Stat waarde={`${aantalToernooien}+`} label={t.hero.statToernooien} />
            <Stat waarde={`${aantalClubs}+`} label={t.hero.statClubs} />
            <Stat waarde="11" label={t.hero.statProvincies} />
            <Stat waarde="8" label={t.hero.statControleurs} />
          </div>
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
