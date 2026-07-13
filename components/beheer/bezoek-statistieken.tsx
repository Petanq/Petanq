"use client";

import { useTranslation } from "@/lib/language-context";
import { BezoekStatistieken } from "@/lib/data";

export function BezoekStatistiekenKaarten({ statistieken }: { statistieken: BezoekStatistieken }) {
  const { t } = useTranslation();

  return (
    <div className="mb-4 grid grid-cols-2 gap-3">
      <div className="rounded-[10px] border-[1.5px] border-rand bg-white p-4">
        <div className="text-2xl font-extrabold text-blauw">{statistieken.totaal}</div>
        <div className="text-xs font-semibold text-grijs">{t.beheer.bezoekersTotaal}</div>
      </div>
      <div className="rounded-[10px] border-[1.5px] border-rand bg-white p-4">
        <div className="text-2xl font-extrabold text-blauw">{statistieken.dezeMaand}</div>
        <div className="text-xs font-semibold text-grijs">{t.beheer.bezoekersDezeMaand}</div>
      </div>
    </div>
  );
}
