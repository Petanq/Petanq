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

  return (
    <div className="flex flex-wrap gap-1.5">
      {maandSleutels.map((sleutel) => {
        const maandIndex = parseDatum(`${sleutel}-01`).getMonth();
        return (
          <button
            key={sleutel}
            onClick={() => setActieveMaand(sleutel)}
            className={`rounded-full border-[1.5px] px-3.5 py-[0.3rem] text-[0.75rem] font-semibold transition-colors ${
              actieveMaand === sleutel
                ? "border-blauw bg-blauw text-white"
                : "border-rand bg-white text-grijs hover:border-blauw-3"
            }`}
          >
            {maandVolledig(maandIndex, taal)}
          </button>
        );
      })}
      <button
        onClick={() => setActieveMaand(null)}
        className={`rounded-full border-[1.5px] px-3.5 py-[0.3rem] text-[0.75rem] font-semibold transition-colors ${
          actieveMaand === null
            ? "border-blauw bg-blauw text-white"
            : "border-rand bg-white text-grijs hover:border-blauw-3"
        }`}
      >
        {t.lijst.alle}
      </button>
    </div>
  );
}
