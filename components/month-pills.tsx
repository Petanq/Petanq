"use client";

import { useTranslation } from "@/lib/language-context";
import { maandVolledig, parseDatum } from "@/lib/datum";

export function MonthPills({
  maandSleutels,
  actieveMaand,
  setActieveMaand,
}: {
  maandSleutels: string[];
  actieveMaand: string | null;
  setActieveMaand: (m: string | null) => void;
}) {
  const { t, taal } = useTranslation();

  // Meerdere jaren in dezelfde lijst (bv. oude testdata naast lopende toernooien)
  // geven anders identiek ogende pillen zoals twee keer "Juli" zonder onderscheid.
  const jaren = new Set(maandSleutels.map((sleutel) => sleutel.slice(0, 4)));
  const toonJaar = jaren.size > 1;

  return (
    <div className="flex flex-wrap gap-1.5">
      {maandSleutels.map((sleutel) => {
        const maandIndex = parseDatum(`${sleutel}-01`).getMonth();
        const jaar = sleutel.slice(0, 4);
        return (
          <button
            key={sleutel}
            onClick={() => setActieveMaand(sleutel)}
            className={`rounded-full border-[1.5px] px-3.5 py-[0.3rem] text-[0.75rem] font-semibold transition-all active:scale-95 ${
              actieveMaand === sleutel
                ? "border-geel bg-geel text-donker shadow-sm"
                : "border-rand bg-white text-grijs hover:border-geel/60 hover:bg-[#fdf3d9] hover:text-[#b8860b]"
            }`}
          >
            {maandVolledig(maandIndex, taal)}
            {toonJaar && ` ${jaar}`}
          </button>
        );
      })}
      <button
        onClick={() => setActieveMaand(null)}
        className={`rounded-full border-[1.5px] px-3.5 py-[0.3rem] text-[0.75rem] font-semibold transition-all active:scale-95 ${
          actieveMaand === null
            ? "border-geel bg-geel text-donker shadow-sm"
            : "border-rand bg-white text-grijs hover:border-geel/60 hover:bg-[#fdf3d9] hover:text-[#b8860b]"
        }`}
      >
        {t.lijst.alle}
      </button>
    </div>
  );
}
