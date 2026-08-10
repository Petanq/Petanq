"use client";

import { useTranslation } from "@/lib/language-context";

export function KwalificatieDataVeld({
  waarden,
  onChange,
}: {
  waarden: string[];
  onChange: (waarden: string[]) => void;
}) {
  const { t } = useTranslation();

  function datumWijzigen(index: number, waarde: string) {
    const nieuw = [...waarden];
    nieuw[index] = waarde;
    onChange(nieuw);
  }

  function datumVerwijderen(index: number) {
    onChange(waarden.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-donker">{t.form.kwalificatieData}</span>
      <p className="text-xs text-grijs">{t.form.kwalificatieDataUitleg}</p>
      {waarden.map((waarde, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="date"
            value={waarde}
            onChange={(e) => datumWijzigen(index, e.target.value)}
            className="veld-input"
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
        onClick={() => onChange([...waarden, ""])}
        className="mt-1 self-start rounded-md border-[1.5px] border-dashed border-blauw-3 px-3 py-1.5 text-xs font-semibold text-blauw-2 transition-colors hover:bg-blauw-3/10"
      >
        + {t.form.kwalificatieDatumToevoegen}
      </button>
    </div>
  );
}
