"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/language-context";
import { Provincie, PROVINCIE_REGIO, Regio, vertaalProvincie } from "@/lib/provincies";
import { PROVINCIE_VLAKKEN } from "@/lib/belgium-map-data";

const REGIO_KLEUR: Record<Regio, { normaal: string; actief: string }> = {
  vlaanderen: { normaal: "#F4C430", actief: "#ffd75e" },
  wallonie: { normaal: "#D62828", actief: "#e8534a" },
  brussel: { normaal: "#3D3D3D", actief: "#54545c" },
};

export function BelgiumMap({ aantalPerProvincie }: { aantalPerProvincie: Record<string, number> }) {
  const { t, taal } = useTranslation();
  const router = useRouter();
  const [hover, setHover] = useState<Provincie | null>(null);

  function ga(provincie: Provincie) {
    router.push(`/clubs#${provincie}`);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 1136 988" className="mx-auto w-full max-w-[620px]">
        {PROVINCIE_VLAKKEN.map(({ provincie, points }) => {
          const regio = PROVINCIE_REGIO[provincie];
          const kleur = REGIO_KLEUR[regio];
          const actief = hover === provincie;
          return (
            <polygon
              key={provincie}
              points={points}
              onClick={() => ga(provincie)}
              onMouseEnter={() => setHover(provincie)}
              onMouseLeave={() => setHover(null)}
              fill={actief ? kleur.actief : kleur.normaal}
              stroke="#ffffff"
              strokeWidth={3}
              className="cursor-pointer transition-colors duration-150"
            >
              <title>{vertaalProvincie(provincie, taal)}</title>
            </polygon>
          );
        })}
        {PROVINCIE_VLAKKEN.filter((v) => v.provincie !== "brussel").map(({ provincie, labelX, labelY }) => (
          <text
            key={provincie}
            x={labelX}
            y={labelY}
            textAnchor="middle"
            paintOrder="stroke"
            stroke="#ffffff"
            strokeWidth={4}
            fill="#1F1F1F"
            style={{ fontSize: 20, fontWeight: 700, pointerEvents: "none", userSelect: "none" }}
          >
            {vertaalProvincie(provincie, taal)}
          </text>
        ))}
      </svg>

      <div className="flex min-h-[3.5rem] flex-col items-center text-center">
        {hover ? (
          <>
            <span className="font-titel text-xl tracking-wide text-blauw">
              {vertaalProvincie(hover, taal)}
            </span>
            <span className="text-sm text-grijs">
              {aantalPerProvincie[hover] ?? 0} {t.provinciesPagina.clubsInProvincie} — {t.provinciesPagina.klikOm}
            </span>
          </>
        ) : (
          <span className="text-sm text-grijs">{t.provinciesPagina.hint}</span>
        )}
      </div>
    </div>
  );
}
