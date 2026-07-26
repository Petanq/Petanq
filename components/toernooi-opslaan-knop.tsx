"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/lib/language-context";
import { isOpgeslagen, getNotitie, toernooiOpslaan, toernooiVerwijderen, notitieBijwerken } from "@/lib/opgeslagen-toernooien";

export function ToernooiOpslaanKnop({ toernooiId }: { toernooiId: string }) {
  const { t } = useTranslation();
  const [opgeslagen, setOpgeslagen] = useState(false);
  const [notitie, setNotitie] = useState("");
  const [notitieBewaard, setNotitieBewaard] = useState(false);
  const bewaardTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setOpgeslagen(isOpgeslagen(toernooiId));
    setNotitie(getNotitie(toernooiId));
  }, [toernooiId]);

  useEffect(() => {
    return () => clearTimeout(bewaardTimer.current);
  }, []);

  function toggelen() {
    if (opgeslagen) {
      toernooiVerwijderen(toernooiId);
      setOpgeslagen(false);
      setNotitie("");
    } else {
      toernooiOpslaan(toernooiId);
      setOpgeslagen(true);
    }
  }

  return (
    <div className="mt-6 border-t border-rand pt-6">
      <button
        onClick={toggelen}
        className={`rounded-lg border-[1.5px] px-4 py-2 text-sm font-bold transition-all active:scale-95 ${
          opgeslagen ? "border-geel bg-[#fdf3d9] text-[#92742a]" : "border-rand text-donker hover:border-blauw-3"
        }`}
      >
        {opgeslagen ? `★ ${t.lijst.toernooiOpgeslagen}` : `☆ ${t.lijst.toernooiOpslaan}`}
      </button>
      {opgeslagen && (
        <div className="mt-3">
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
