"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/language-context";
import { Provincie, PROVINCIE_REGIO, Regio, vertaalProvincie, vertaalRegio } from "@/lib/provincies";
import { PROVINCIE_VLAKKEN } from "@/lib/belgium-map-data";

// Elke provincie krijgt een eigen kleur, maar uit de kleurfamilie van haar
// gewest (goud/amber = Vlaanderen, rood/koraal = Wallonië) zodat het gewest
// nog steeds in één oogopslag herkenbaar blijft; Brussel krijgt een eigen
// afwijkende kleur omdat het als enclave geen buren binnen zijn "familie" heeft.
const PROVINCIE_KLEUR: Record<Provincie, { normaal: string; actief: string; schaduw: string }> = {
  antwerpen: { normaal: "#F4C430", actief: "#ffd75e", schaduw: "rgba(244,196,48,0.55)" },
  "oost-vlaanderen": { normaal: "#FFB627", actief: "#ffca5c", schaduw: "rgba(255,182,39,0.55)" },
  "west-vlaanderen": { normaal: "#E8A33D", actief: "#f3ba69", schaduw: "rgba(232,163,61,0.55)" },
  limburg: { normaal: "#F7D060", actief: "#ffe08c", schaduw: "rgba(247,208,96,0.55)" },
  "vlaams-brabant": { normaal: "#C98A1B", actief: "#e0a545", schaduw: "rgba(201,138,27,0.55)" },
  henegouwen: { normaal: "#D62828", actief: "#e8534a", schaduw: "rgba(214,40,40,0.55)" },
  luik: { normaal: "#E85D4A", actief: "#f0816f", schaduw: "rgba(232,93,74,0.55)" },
  namen: { normaal: "#B8232A", actief: "#d1454c", schaduw: "rgba(184,35,42,0.55)" },
  "waals-brabant": { normaal: "#F2785C", actief: "#f79b85", schaduw: "rgba(242,120,92,0.55)" },
  luxemburg: { normaal: "#8C1D1D", actief: "#a83f3f", schaduw: "rgba(140,29,29,0.55)" },
  brussel: { normaal: "#6B3FA0", actief: "#8a5ec2", schaduw: "rgba(107,63,160,0.55)" },
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
          const kleur = PROVINCIE_KLEUR[provincie];
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

      <div className="flex w-full max-w-xl flex-wrap items-start justify-center gap-x-8 gap-y-4 rounded-2xl border-[1.5px] border-rand bg-white px-5 py-4 shadow-sm">
        {(["vlaanderen", "wallonie", "brussel"] as Regio[]).map((regio) => (
          <div key={regio} className="flex flex-col items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-grijs">
              {vertaalRegio(regio, taal)}
            </span>
            <div className="flex flex-wrap justify-center gap-1.5">
              {PROVINCIE_VLAKKEN.filter((v) => PROVINCIE_REGIO[v.provincie] === regio).map((v) => (
                <button
                  key={v.provincie}
                  type="button"
                  onClick={() => ga(v.provincie)}
                  onMouseEnter={() => setHover(v.provincie)}
                  onMouseLeave={() => setHover(null)}
                  className="flex items-center gap-1.5 rounded-full border border-rand bg-[#faf9f7] px-2.5 py-1 text-[0.7rem] font-semibold text-donker transition-colors hover:border-blauw-3"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: PROVINCIE_KLEUR[v.provincie].normaal }}
                  />
                  {vertaalProvincie(v.provincie, taal)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

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
