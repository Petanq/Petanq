"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/lib/language-context";
import { isOpgeslagen, getNotitie, toernooiOpslaan, toernooiVerwijderen, notitieBijwerken } from "@/lib/opgeslagen-toernooien";

export function ToernooiOpslaanKnop({ toernooiId }: { toernooiId: string }) {
  const { t } = useTranslation();
  const [opgeslagen, setOpgeslagen] = useState(false);
  const [notitie, setNotitie] = useState("");
  const [notitieBewaard, setNotitieBewaard] = useState(false);
  const [melding, setMelding] = useState("");
  const bewaardTimer = useRef<ReturnType<typeof setTimeout>>();
  const meldingTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setOpgeslagen(isOpgeslagen(toernooiId));
    setNotitie(getNotitie(toernooiId));
  }, [toernooiId]);

  useEffect(() => {
    return () => {
      clearTimeout(bewaardTimer.current);
      clearTimeout(meldingTimer.current);
    };
  }, []);

  function toonMelding(tekst: string) {
    setMelding(tekst);
    clearTimeout(meldingTimer.current);
    meldingTimer.current = setTimeout(() => setMelding(""), 2500);
  }

  function toggelen() {
    if (opgeslagen) {
      toernooiVerwijderen(toernooiId);
      setOpgeslagen(false);
      setNotitie("");
      toonMelding(t.lijst.toernooiVerwijderdMelding);
    } else {
      toernooiOpslaan(toernooiId);
      setOpgeslagen(true);
      toonMelding(t.lijst.toernooiToegevoegdMelding);
    }
  }

  return (
    <div
      className={`mb-6 rounded-xl border-[1.5px] p-4 transition-colors ${
        opgeslagen ? "border-geel bg-[#fdf3d9]" : "border-blauw-3/50 bg-licht"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-bold text-donker">
            {opgeslagen ? `★ ${t.lijst.toernooiOpgeslagenTitel}` : `☆ ${t.lijst.toernooiOpslaanTitel}`}
          </p>
          <p className="mt-0.5 text-xs text-grijs">{t.lijst.toernooiOpslaanUitleg}</p>
        </div>
        <button
          onClick={toggelen}
          className={`shrink-0 whitespace-nowrap rounded-lg px-5 py-2.5 text-sm font-bold shadow-[0_4px_16px_rgba(244,196,48,0.4)] transition-all active:scale-95 ${
            opgeslagen
              ? "border-[1.5px] border-geel bg-white text-[#92742a] shadow-none hover:bg-[#fdf3d9]"
              : "bg-geel text-donker hover:brightness-105"
          }`}
        >
          {opgeslagen ? t.lijst.toernooiVerwijderenUitLijst : `☆ ${t.lijst.toernooiOpslaan}`}
        </button>
      </div>
      {melding && <p className="mt-2 text-xs font-semibold text-groen">✓ {melding}</p>}
      {opgeslagen && (
        <div className="mt-4 border-t border-geel/40 pt-4">
          <label className="mb-1 block text-xs font-bold text-grijs">{t.lijst.notitieLabel}</label>
          <textarea
            value={notitie}
            onChange={(e) => {
              setNotitie(e.target.value);
              notitieBijwerken(toernooiId, e.target.value);
              setNotitieBewaard(false);
              clearTimeout(bewaardTimer.current);
              bewaardTimer.current = setTimeout(() => setNotitieBewaard(true), 600);
            }}
            placeholder={t.lijst.notitiePlaceholder}
            rows={2}
            className="veld-input w-full resize-none"
          />
          {notitieBewaard && notitie && (
            <p className="mt-1 text-xs font-semibold text-groen">✓ {t.lijst.notitieBewaard}</p>
          )}
        </div>
      )}
    </div>
  );
}
