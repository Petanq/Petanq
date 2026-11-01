"use client";

import { useTranslation } from "@/lib/language-context";
import { Club } from "@/lib/types";
import { Plaats, plaatsLabel } from "@/lib/postcodes";
import { ClubCard } from "./club-card";

// Voorstellen onder de zoekbalk terwijl iemand een gemeente intikt
// ("Bedoel je: 9000 Gent"). `donker` = op de donkere gsm-kop.
export function PlaatsSuggesties({
  suggesties,
  onKies,
  donker,
}: {
  suggesties: Plaats[];
  onKies: (p: Plaats) => void;
  donker?: boolean;
}) {
  const { t } = useTranslation();
  if (suggesties.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      <span className={`text-xs ${donker ? "text-white/60" : "text-grijs"}`}>{t.clubsPagina.bedoelJe}</span>
      {suggesties.map((p) => (
        <button
          key={`${p.postcode}-${p.naam}`}
          type="button"
          onClick={() => onKies(p)}
          className={`rounded-full border px-3 py-1 text-xs font-bold transition-colors ${
            donker
              ? "border-geel/60 text-geel active:bg-geel active:text-[#1f1f1f]"
              : "border-geel bg-[#fdf3d9] text-[#7a5a00] hover:bg-geel hover:text-[#1f1f1f]"
          }`}
        >
          {plaatsLabel(p)}
        </button>
      ))}
    </div>
  );
}

// De dichtstbijzijnde clubs bij de gekozen plaats, met afstand in km.
export function NabijeClubs({
  plaats,
  resultaat,
  onSluit,
  donker,
}: {
  plaats: Plaats;
  resultaat: { club: Club; km: number }[];
  onSluit: () => void;
  donker?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className={`font-titel text-lg font-bold ${donker ? "text-white" : "text-donker"}`}>
          {t.clubsPagina.dichtstBijPlaats} <span className={donker ? "text-geel" : "text-[#b8860b]"}>{plaatsLabel(plaats)}</span>
        </h2>
        <button
          type="button"
          onClick={onSluit}
          aria-label="Sluiten"
          className={`text-xs font-semibold underline ${donker ? "text-white/60" : "text-grijs"}`}
        >
          ✕
        </button>
      </div>
      {resultaat.length === 0 ? (
        <p className={`text-sm ${donker ? "text-white/70" : "text-grijs"}`}>{t.clubsPagina.geenClubsPlaats}</p>
      ) : (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {resultaat.map(({ club, km }) => (
            <div key={club.id} className="relative [&>div]:pr-[4.2rem]">
              <ClubCard club={club} />
              <span className="absolute right-3 top-3 rounded-full bg-donker px-2 py-0.5 text-[0.65rem] font-bold text-geel">
                {km < 10 ? km.toFixed(1) : Math.round(km)} km
              </span>
            </div>
          ))}
        </div>
      )}
      <p className={`mt-2 text-[0.65rem] ${donker ? "text-white/40" : "text-grijs/70"}`}>
        Postcodes:{" "}
        <a href="https://www.geonames.org" target="_blank" rel="noopener noreferrer" className="underline">
          GeoNames
        </a>{" "}
        (CC BY 4.0)
      </p>
    </div>
  );
}
