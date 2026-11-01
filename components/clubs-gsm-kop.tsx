"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/language-context";
import { Club } from "@/lib/types";
import { PROVINCIE_REGIO, Provincie, Regio, vertaalProvincie, vertaalRegio } from "@/lib/provincies";
import { PROVINCIE_VLAKKEN } from "@/lib/belgium-map-data";
import { ClubCard } from "./club-card";
import { NabijeClubs, PlaatsSuggesties } from "./clubs-nabij";
import { Plaats, dichtstbijzijndeClubs, laadPostcodes } from "@/lib/postcodes";

const REGIOS: Regio[] = ["vlaanderen", "wallonie", "brussel"];

// Kop van de clubs-pagina op gsm (onder md): grote titel, zoekbalk met "In
// mijn buurt", een donkere kaart met gele pinnen en drie regio-kaarten. Op
// pc blijft de gewone kop staan (zie clubs-browser.tsx).
export function ClubsGsmKop({
  clubs,
  aantalPerProvincie,
  zoek,
  setZoek,
  regioFilter,
  setRegioFilter,
  onProvincieKiezen,
  onRegioKiezen,
  onZoekKeyDown,
  suggesties,
  onPlaatsKiezen,
  nabij,
  onNabijSluiten,
}: {
  clubs: Club[];
  aantalPerProvincie: Record<string, number>;
  zoek: string;
  setZoek: (s: string) => void;
  regioFilter: Regio | null;
  setRegioFilter: (r: Regio | null) => void;
  onProvincieKiezen: (p: Provincie) => void;
  onRegioKiezen: (r: Regio) => void;
  onZoekKeyDown: (e: React.KeyboardEvent) => void;
  suggesties: Plaats[];
  onPlaatsKiezen: (p: Plaats) => void;
  nabij: { plaats: Plaats; resultaat: { club: Club; km: number }[] } | null;
  onNabijSluiten: () => void;
}) {
  const { t, taal } = useTranslation();
  const [weergave, setWeergave] = useState<"kaart" | "lijst">("kaart");
  const [buurt, setBuurt] = useState<{ club: Club; km: number }[] | null>(null);
  const [buurtStatus, setBuurtStatus] = useState<"idle" | "bezig" | "geweigerd">("idle");

  function inMijnBuurt() {
    if (!("geolocation" in navigator)) {
      setBuurtStatus("geweigerd");
      return;
    }
    setBuurtStatus("bezig");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        // Ook clubs zonder eigen coördinaten tellen mee (afgeleid van hun postcode).
        const index = await laadPostcodes();
        setBuurt(dichtstbijzijndeClubs(index, clubs, latitude, longitude, 5));
        setBuurtStatus("idle");
      },
      () => setBuurtStatus("geweigerd"),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }

  return (
    <div>
      <h1 className="font-titel text-[2.4rem] font-extrabold leading-[1.05] tracking-tight text-white">
        {t.clubsPagina.gsmTitelRegel1}
        <span className="block text-geel">{t.clubsPagina.gsmTitelRegel2}</span>
      </h1>
      <p className="mb-5 mt-2 text-[0.95rem] text-white/80">{t.clubsPagina.gsmOndertitel}</p>

      <div className="flex gap-2">
        <label className="flex min-w-0 flex-1 items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.08] px-2.5">
          <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} className="shrink-0 text-white/60" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={zoek}
            onChange={(e) => setZoek(e.target.value)}
            onKeyDown={onZoekKeyDown}
            enterKeyHint="search"
            autoComplete="off"
            placeholder={t.clubsPagina.gsmZoek}
            className="w-full min-w-0 bg-transparent py-3 text-[0.82rem] text-white outline-none placeholder:text-white/50"
          />
        </label>
        <button
          type="button"
          onClick={inMijnBuurt}
          className="flex shrink-0 items-center gap-1 rounded-xl bg-geel px-3 text-[0.82rem] font-bold text-donker active:brightness-95"
        >
          <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
            <circle cx="12" cy="12" r="3.5" />
            <circle cx="12" cy="12" r="8" />
            <path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3" strokeLinecap="round" />
          </svg>
          {buurtStatus === "bezig" ? "…" : t.clubsPagina.inMijnBuurt}
        </button>
      </div>
      {buurtStatus === "geweigerd" && (
        <p className="mt-2 text-xs text-white/70">{t.clubsPagina.locatieGeweigerd}</p>
      )}

      <PlaatsSuggesties suggesties={suggesties} onKies={onPlaatsKiezen} donker />
      {nabij && (
        <div data-nabij className="scroll-mt-20">
          <NabijeClubs plaats={nabij.plaats} resultaat={nabij.resultaat} onSluit={onNabijSluiten} donker />
        </div>
      )}

      {buurt && (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-titel text-lg font-bold text-white">{t.clubsPagina.dichtstBij}</h2>
            <button type="button" onClick={() => setBuurt(null)} className="text-xs font-semibold text-white/60 underline">
              ✕
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {buurt.map(({ club, km }) => (
              <div key={club.id} className="relative">
                <ClubCard club={club} />
                <span className="absolute right-3 top-3 rounded-full bg-donker px-2 py-0.5 text-[0.65rem] font-bold text-geel">
                  {km < 10 ? km.toFixed(1) : Math.round(km)} km
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-3 mt-5 flex justify-end">
        <div className="flex overflow-hidden rounded-full border border-white/15 !bg-white/[0.06] text-xs font-bold">
          {(["kaart", "lijst"] as const).map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setWeergave(w)}
              className={`px-4 py-2 ${weergave === w ? "bg-geel text-donker" : "text-white/80"}`}
            >
              {w === "kaart" ? t.clubsPagina.kaart : t.clubsPagina.lijst}
            </button>
          ))}
        </div>
      </div>

      {weergave === "kaart" && (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
          <svg viewBox="60 80 980 820" className="mx-auto h-auto w-full overflow-visible" role="img" aria-label="Kaart van België">
            {PROVINCIE_VLAKKEN.map(({ provincie, points }) => {
              const actief = regioFilter != null && PROVINCIE_REGIO[provincie] === regioFilter;
              return (
                <polygon
                  key={provincie}
                  points={points}
                  fill={actief ? "#3a2f0c" : "#1d1d1d"}
                  stroke="#F4C430"
                  strokeWidth={4}
                  strokeLinejoin="round"
                  className="cursor-pointer"
                  onClick={() => onProvincieKiezen(provincie)}
                >
                  <title>{vertaalProvincie(provincie, taal)}</title>
                </polygon>
              );
            })}
            {PROVINCIE_VLAKKEN.map(({ provincie, labelX, labelY }) => {
              const aantal = aantalPerProvincie[provincie] ?? 0;
              if (aantal === 0) return null;
              return (
                <g
                  key={`pin-${provincie}`}
                  transform={`translate(${labelX - 30}, ${labelY - 66}) scale(5)`}
                  onClick={() => onProvincieKiezen(provincie)}
                  className="cursor-pointer"
                >
                  <path
                    d="M6 .8C3.4.8 1.4 2.8 1.4 5.3c0 3.4 4.6 8.4 4.6 8.4s4.6-5 4.6-8.4C10.6 2.8 8.600.8 6 .8Z"
                    fill="#F4C430"
                    stroke="#1F1F1F"
                    strokeWidth={0.5}
                  />
                  <circle cx="6" cy="5.3" r="1.9" fill="#1F1F1F" />
                  <title>{`${vertaalProvincie(provincie, taal)} · ${aantal}`}</title>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      <h2 className="mb-3 mt-7 font-titel text-xl font-bold text-white">{t.clubsPagina.verkenPerRegio}</h2>
      <div className="grid grid-cols-3 gap-2">
        {REGIOS.map((regio) => (
          <button
            key={regio}
            type="button"
            onClick={() => onRegioKiezen(regio)}
            className={`flex flex-col overflow-hidden rounded-xl border text-left transition-colors ${
              regioFilter === regio ? "border-geel" : "border-white/10"
            } bg-gradient-to-b from-white/[0.09] to-black/50`}
          >
            <span className="flex h-20 items-center justify-center px-2 pt-2">
              <svg viewBox="70 100 960 790" className="h-full w-auto" aria-hidden>
                {PROVINCIE_VLAKKEN.map(({ provincie, points }) => (
                  <polygon
                    key={provincie}
                    points={points}
                    fill={PROVINCIE_REGIO[provincie] === regio ? "#F4C430" : "#3a3a3a"}
                    stroke="#1a1a1a"
                    strokeWidth={6}
                  />
                ))}
              </svg>
            </span>
            <span className="flex flex-col gap-1 p-2.5 pt-1">
              <span className="block text-[0.78rem] font-bold leading-tight text-white">{vertaalRegio(regio, taal)}</span>
              <span className="flex items-center justify-between gap-1">
                <span className="text-[0.68rem] text-white/60">
                  {clubs.filter((c) => c.regio === regio).length} {t.clubsPagina.clubsTelwoord}
                </span>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-geel text-sm text-donker" aria-hidden>
                  ›
                </span>
              </span>
            </span>
          </button>
        ))}
      </div>
      {regioFilter && (
        <button
          type="button"
          onClick={() => setRegioFilter(null)}
          className="mt-3 rounded-full border border-geel/60 px-3 py-1 text-xs font-bold text-geel"
        >
          {vertaalRegio(regioFilter, taal)} ✕
        </button>
      )}
    </div>
  );
}
