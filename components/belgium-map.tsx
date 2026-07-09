"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/language-context";
import { Provincie, PROVINCIE_REGIO, Regio, vertaalProvincie } from "@/lib/provincies";
import { PROVINCIE_VLAKKEN } from "@/lib/belgium-map-data";

const REGIO_KLEUR: Record<Regio, { normaal: string; actief: string; schaduw: string }> = {
  vlaanderen: { normaal: "#F4C430", actief: "#ffd75e", schaduw: "rgba(244,196,48,0.55)" },
  wallonie: { normaal: "#D62828", actief: "#e8534a", schaduw: "rgba(214,40,40,0.55)" },
  brussel: { normaal: "#3D3D3D", actief: "#54545c", schaduw: "rgba(61,61,61,0.55)" },
};

export function BelgiumMap({ aantalPerProvincie }: { aantalPerProvincie: Record<string, number> }) {
  const { t, taal } = useTranslation();
  const router = useRouter();
  const [hover, setHover] = useState<Provincie | null>(null);

  function ga(provincie: Provincie) {
    router.push(`/clubs#${provincie}`);
  }

  return (
    <div className="relative flex flex-col items-center gap-4">
      <style>{`
        @keyframes qp-inklap {
          from { opacity: 0; transform: scale(0.4); }
          to { opacity: 1; transform: scale(1); }
        }
        .qp-vlak {
          transform-box: fill-box;
          transform-origin: center;
          animation: qp-inklap 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
        }
        .qp-vlak:hover {
          transform: scale(1.045) translateY(-4px);
        }
        .qp-badge {
          transform-box: fill-box;
          transform-origin: center;
          transition: transform 0.2s ease;
        }
      `}</style>

      {/* zonnestralen achtergrond, knipoog naar het logo */}
      <div
        className="pointer-events-none absolute left-1/2 top-8 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full opacity-[0.06]"
        style={{
          background:
            "repeating-conic-gradient(#F4C430 0deg 8deg, transparent 8deg 24deg)",
        }}
      />

      <svg viewBox="0 0 1136 988" className="mx-auto w-full max-w-[620px] overflow-visible">
        <defs>
          <filter id="qp-schaduw" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodOpacity="0.35" />
          </filter>
        </defs>
        {PROVINCIE_VLAKKEN.map(({ provincie, points }, i) => {
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
              filter={actief ? "url(#qp-schaduw)" : undefined}
              className="qp-vlak cursor-pointer transition-[fill,transform] duration-200"
              style={{ animationDelay: `${i * 45}ms` }}
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

        {PROVINCIE_VLAKKEN.map(({ provincie, labelX, labelY }) => {
          const aantal = aantalPerProvincie[provincie] ?? 0;
          if (aantal === 0) return null;
          const isBrussel = provincie === "brussel";
          const y = isBrussel ? labelY - 22 : labelY + 20;
          const actief = hover === provincie;
          return (
            <g
              key={`badge-${provincie}`}
              className="qp-badge pointer-events-none"
              style={{ transform: actief ? "scale(1.15)" : "scale(1)" }}
            >
              <rect
                x={labelX - 15}
                y={y - 12}
                width={30}
                height={20}
                rx={10}
                fill="#ffffff"
                stroke="#1F1F1F"
                strokeWidth={1.2}
              />
              <text
                x={labelX}
                y={y + 3}
                textAnchor="middle"
                fill="#1F1F1F"
                style={{ fontSize: 13, fontWeight: 800, userSelect: "none" }}
              >
                {aantal}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="flex min-h-[4rem] w-full max-w-sm flex-col items-center justify-center rounded-2xl border-[1.5px] border-rand bg-white px-5 py-3 text-center shadow-sm transition-all">
        {hover ? (
          <>
            <span className="font-titel text-xl tracking-wide text-blauw">
              {vertaalProvincie(hover, taal)}
            </span>
            <span className="text-sm text-grijs">
              🎯 {aantalPerProvincie[hover] ?? 0} {t.provinciesPagina.clubsInProvincie} · {t.provinciesPagina.klikOm}
            </span>
          </>
        ) : (
          <span className="text-sm text-grijs">☀️ {t.provinciesPagina.hint}</span>
        )}
      </div>
    </div>
  );
}
