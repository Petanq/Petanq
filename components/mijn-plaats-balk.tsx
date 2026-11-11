"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/language-context";
import { Plaats, PostcodeIndex, laadPostcodes, plaatsLabel, zoekPlaatsen } from "@/lib/postcodes";
import { useMijnPlaatsStaat, zetMijnPlaats } from "@/lib/mijn-plaats";
import { PlaatsSuggesties } from "./clubs-nabij";

export type Sortering = "datum" | "afstand";

// Boven de tornooilijst: de bezoeker geeft eenmalig zijn postcode (of gebruikt
// zijn gps) en ziet daarna bij elk tornooi hoe ver het ligt.
export function MijnPlaatsBalk({
  sortering,
  setSortering,
}: {
  sortering: Sortering;
  setSortering: (s: Sortering) => void;
}) {
  const { t } = useTranslation();
  const { plaats } = useMijnPlaatsStaat();
  const [zoek, setZoek] = useState("");
  const [index, setIndex] = useState<PostcodeIndex | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "bezig" | "geweigerd">("idle");

  const suggesties: Plaats[] = index && zoek.trim().length >= 2 ? zoekPlaatsen(index, zoek) : [];

  function kies(p: Plaats) {
    zetMijnPlaats({ label: plaatsLabel(p), lat: p.lat, lng: p.lng });
    setZoek("");
    setGpsStatus("idle");
  }

  function wijzig() {
    zetMijnPlaats(null);
    setSortering("datum");
  }

  // Een volledige postcode (4 cijfers) hoeft geen extra klik.
  useEffect(() => {
    if (/^\d{4}$/.test(zoek.trim()) && suggesties[0]) kies(suggesties[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoek, index]);

  function gebruikGps() {
    if (!("geolocation" in navigator)) {
      setGpsStatus("geweigerd");
      return;
    }
    setGpsStatus("bezig");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Afgerond op ± 1 km: meer precisie is hier niet nodig.
        zetMijnPlaats({
          label: null,
          lat: Math.round(pos.coords.latitude * 100) / 100,
          lng: Math.round(pos.coords.longitude * 100) / 100,
        });
        setGpsStatus("idle");
      },
      () => setGpsStatus("geweigerd"),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }

  return (
    <div className="mb-4 rounded-2xl border-2 border-geel/60 bg-[#161616] p-3.5 shadow-[0_0_14px_rgba(244,196,48,0.12)]">
      {plaats ? (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5">
          <div className="min-w-0 text-[0.85rem] text-white">
            <span aria-hidden>📍</span> {t.lijst.afstandVanaf}{" "}
            <strong className="break-words text-geel">{plaats.label ?? t.lijst.mijnLocatie}</strong>{" "}
            <button type="button" onClick={wijzig} className="ml-1 text-xs font-semibold text-white/60 underline">
              {t.lijst.afstandWijzig}
            </button>
          </div>
          <div className="flex shrink-0 overflow-hidden rounded-full border border-geel/60 !bg-white/[0.06] text-xs font-bold">
            {(["datum", "afstand"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSortering(s)}
                className={`px-3 py-1.5 transition-colors ${
                  sortering === s ? "bg-geel text-[#1f1f1f]" : "bg-transparent text-white/80 hover:text-geel"
                }`}
              >
                {s === "datum" ? t.lijst.sorteerDatum : t.lijst.sorteerAfstand}
              </button>
            ))}
          </div>
          <p className="w-full text-[0.7rem] text-white/65">{t.lijst.afstandHemelsbreed}</p>
        </div>
      ) : (
        <>
          <div className="text-[0.9rem] font-bold text-white">
            <span aria-hidden>📍</span> {t.lijst.afstandTitel}
          </div>
          <p className="mb-2.5 mt-0.5 text-xs text-white/65">{t.lijst.afstandUitleg}</p>
          <div className="flex flex-wrap gap-2">
            <label className="flex min-w-full flex-[1_1_100%] items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.08] px-2.5 min-[420px]:min-w-0 min-[420px]:flex-1">
              <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} className="shrink-0 text-white/60" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={zoek}
                onChange={(e) => {
                  setZoek(e.target.value);
                  if (e.target.value.trim().length >= 2 && !index) laadPostcodes().then(setIndex);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && suggesties[0]) {
                    e.preventDefault();
                    kies(suggesties[0]);
                  }
                }}
                enterKeyHint="search"
                autoComplete="off"
                placeholder={t.lijst.afstandPlaceholder}
                aria-label={t.lijst.afstandPlaceholder}
                className="w-full min-w-0 bg-transparent py-2.5 text-[0.82rem] text-white outline-none placeholder:text-white/50"
              />
            </label>
            <button
              type="button"
              onClick={gebruikGps}
              className="flex shrink-0 items-center justify-center gap-1 rounded-xl bg-geel px-3 py-2.5 text-[0.82rem] font-bold text-[#1f1f1f] active:brightness-95 max-[419px]:w-full"
            >
              <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                <circle cx="12" cy="12" r="3.5" />
                <circle cx="12" cy="12" r="8" />
                <path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3" strokeLinecap="round" />
              </svg>
              {gpsStatus === "bezig" ? "…" : t.clubsPagina.inMijnBuurt}
            </button>
          </div>
          {gpsStatus === "geweigerd" && (
            <p className="mt-2 text-xs text-white/70">{t.clubsPagina.locatieGeweigerd}</p>
          )}
          <PlaatsSuggesties suggesties={suggesties} onKies={kies} donker />
        </>
      )}
    </div>
  );
}
