"use client";

import { useTranslation } from "@/lib/language-context";
import { KwalificatieDatum } from "@/lib/types";
import { formatDatumKort, formatUur } from "@/lib/datum";

export function KwalificatieDataVeld({
  waarden,
  onChange,
  uur,
  onUurChange,
  hoofdDatum,
  hoofdUur,
}: {
  waarden: KwalificatieDatum[];
  onChange: (waarden: KwalificatieDatum[]) => void;
  uur: string;
  onUurChange: (uur: string) => void;
  hoofdDatum: string;
  hoofdUur: string;
}) {
  const { t } = useTranslation();

  function datumWijzigen(index: number, waarde: string) {
    const nieuw = [...waarden];
    nieuw[index] = { ...nieuw[index], datum: waarde };
    onChange(nieuw);
  }

  function eigenUurWijzigen(index: number, waarde: string) {
    const nieuw = [...waarden];
    nieuw[index] = { ...nieuw[index], uur: waarde || null };
    onChange(nieuw);
  }

  function datumVerwijderen(index: number) {
    onChange(waarden.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-donker">{t.form.kwalificatieData}</span>
      <p className="text-xs text-grijs">{t.form.kwalificatieDataUitleg}</p>
      {waarden.length > 0 && hoofdDatum && hoofdUur && (
        <div className="mb-1 flex items-center gap-2 rounded-md border-[1.5px] border-geel bg-[#fdf8ec] px-3 py-1.5 text-xs font-bold text-[#8a6d1f]">
          🏆 {t.form.kwalificatieFinaleLabel}
          <span className="font-normal">
            {formatDatumKort(hoofdDatum)} · {formatUur(hoofdUur)}
          </span>
        </div>
      )}
      {waarden.length > 0 && (
        <label className="mb-1 flex items-center gap-2 text-xs font-semibold text-donker">
          {t.form.kwalificatieUur}
          <input
            type="time"
            value={uur}
            onChange={(e) => onUurChange(e.target.value)}
            className="veld-input w-auto"
          />
        </label>
      )}
      {waarden.map((waarde, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="date"
            value={waarde.datum}
            onChange={(e) => datumWijzigen(index, e.target.value)}
            className="veld-input"
          />
          <input
            type="time"
            value={waarde.uur ?? ""}
            onChange={(e) => eigenUurWijzigen(index, e.target.value)}
            title={t.form.kwalificatieEigenUur}
            placeholder={uur || "--:--"}
            className="veld-input w-28"
          />
          <button
            type="button"
            onClick={() => datumVerwijderen(index)}
            aria-label={t.form.kwalificatieDatumVerwijderen}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-[1.5px] border-rand text-grijs transition-colors hover:border-rood-2 hover:text-rood-2"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...waarden, { datum: "", uur: null }])}
        className="mt-1 self-start rounded-md border-[1.5px] border-dashed border-blauw-3 px-3 py-1.5 text-xs font-semibold text-blauw-2 transition-colors hover:bg-blauw-3/10"
      >
        + {t.form.kwalificatieDatumToevoegen}
      </button>
    </div>
  );
}
