"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/lib/language-context";
import { isOpgeslagen, getNotitie, toernooiOpslaan, toernooiVerwijderen, notitieBijwerken } from "@/lib/opgeslagen-toernooien";
import { volgToernooiActie } from "@/lib/toernooi-acties";

// Opvallende kaart in de rechterkolom van de tornooipagina: voor het opslaan
// vol goud met een donkere knop, daarna donker met een gouden ster.
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
      volgToernooiActie(toernooiId, "opslaan");
      setOpgeslagen(true);
      toonMelding(t.lijst.toernooiToegevoegdMelding);
    }
  }

  return (
    <div
      className={`rounded-2xl border-2 p-5 shadow-[0_2px_4px_rgba(0,0,0,0.18),0_10px_30px_rgba(0,0,0,0.2)] transition-colors ${
        opgeslagen ? "border-[#f8d55a] bg-[#1f1f1f]" : "border-[#f8d55a] bg-[#f8d55a]"
      }`}
    >
      <p className={`text-base font-extrabold leading-snug ${opgeslagen ? "text-geel" : "text-[#1f1f1f]"}`}>
        {opgeslagen ? `★ ${t.lijst.toernooiOpgeslagenTitel}` : `☆ ${t.lijst.toernooiOpslaanTitel}`}
      </p>
      <p className={`mt-1 text-[0.8rem] leading-snug ${opgeslagen ? "text-white/75" : "text-[#3d3c38]"}`}>
        {t.lijst.toernooiOpslaanUitleg}
      </p>
      <button
        onClick={toggelen}
        className={`mt-4 w-full rounded-xl px-5 py-3 text-sm font-extrabold transition-all active:scale-[0.98] ${
          opgeslagen
            ? "border-2 border-[#f8d55a] bg-transparent text-geel hover:bg-[#f8d55a] hover:text-[#1f1f1f]"
            : "bg-[#1f1f1f] text-geel shadow-[0_6px_18px_rgba(0,0,0,0.35)] hover:bg-black"
        }`}
      >
        {opgeslagen ? t.lijst.toernooiVerwijderenUitLijst : `☆ ${t.lijst.toernooiOpslaan}`}
      </button>
      {melding && (
        <p className={`mt-2 text-xs font-bold ${opgeslagen ? "text-geel" : "text-[#14532d]"}`}>✓ {melding}</p>
      )}
      {opgeslagen && (
        <div className="mt-4 border-t border-geel/40 pt-4">
          <label className="mb-1 block text-xs font-bold text-white/80">{t.lijst.notitieLabel}</label>
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
            <p className="mt-1 text-xs font-bold text-geel">✓ {t.lijst.notitieBewaard}</p>
          )}
        </div>
      )}
    </div>
  );
}
