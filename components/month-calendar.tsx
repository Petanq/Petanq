"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "@/lib/language-context";
import { Toernooi } from "@/lib/types";
import { maandVolledig, parseDatum, vandaag } from "@/lib/datum";
import { TournamentCard } from "./tournament-card";

const ACHTERGRONDEN = ["/images/boules-vrienden.jpg", "/images/petanque-speler.jpg", "/images/boules-koppel.jpg"];

function datumSleutel(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function MonthCalendar({ toernooien }: { toernooien: Toernooi[] }) {
  const { t, taal } = useTranslation();
  const vandaagDatum = vandaag();
  const [maandOffset, setMaandOffset] = useState(0);
  const [geselecteerdeDag, setGeselecteerdeDag] = useState<string | null>(null);

  const weergegevenMaand = new Date(vandaagDatum.getFullYear(), vandaagDatum.getMonth() + maandOffset, 1);
  const jaar = weergegevenMaand.getFullYear();
  const maandIndex = weergegevenMaand.getMonth();

  const perDag = useMemo(() => {
    const map = new Map<string, Toernooi[]>();
    for (const tn of toernooien) {
      const sleutel = tn.datum;
      if (!map.has(sleutel)) map.set(sleutel, []);
      map.get(sleutel)!.push(tn);
    }
    return map;
  }, [toernooien]);

  const dagen = useMemo(() => {
    const eersteVanMaand = new Date(jaar, maandIndex, 1);
    const laatsteVanMaand = new Date(jaar, maandIndex + 1, 0);
    // Maandag = 0 t/m zondag = 6
    const startOffset = (eersteVanMaand.getDay() + 6) % 7;
    const cellen: Array<{ datum: Date | null; sleutel: string | null }> = [];
    for (let i = 0; i < startOffset; i++) cellen.push({ datum: null, sleutel: null });
    for (let dag = 1; dag <= laatsteVanMaand.getDate(); dag++) {
      const d = new Date(jaar, maandIndex, dag);
      cellen.push({ datum: d, sleutel: datumSleutel(d) });
    }
    return cellen;
  }, [jaar, maandIndex]);

  const achtergrond = ACHTERGRONDEN[(jaar * 12 + maandIndex) % ACHTERGRONDEN.length];
  const toernooienVanDag = geselecteerdeDag ? perDag.get(geselecteerdeDag) ?? [] : [];

  return (
    <div className="overflow-hidden rounded-[18px] border-[1.5px] border-rand bg-white">
      <div
        className="relative flex items-center justify-between px-6 py-8 sm:px-8"
        style={{
          backgroundImage: `linear-gradient(rgba(31,31,31,0.72), rgba(31,31,31,0.72)), url('${achtergrond}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <button
          onClick={() => {
            setMaandOffset((v) => v - 1);
            setGeselecteerdeDag(null);
          }}
          className="rounded-full border border-white/30 bg-white/10 px-3 py-2 text-white transition-colors hover:bg-white/20"
          aria-label="vorige maand"
        >
          ←
        </button>
        <h3 className="font-titel text-2xl tracking-wide text-white sm:text-3xl">
          {maandVolledig(maandIndex, taal)} {jaar}
        </h3>
        <button
          onClick={() => {
            setMaandOffset((v) => v + 1);
            setGeselecteerdeDag(null);
          }}
          className="rounded-full border border-white/30 bg-white/10 px-3 py-2 text-white transition-colors hover:bg-white/20"
          aria-label="volgende maand"
        >
          →
        </button>
      </div>

      <div className="p-4 sm:p-6">
        <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-[0.7rem] font-bold uppercase tracking-wide text-grijs">
          {[1, 2, 3, 4, 5, 6, 0].map((i) => (
            <div key={i}>{t.dagen[i]}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {dagen.map((cel, i) => {
            if (!cel.datum || !cel.sleutel) return <div key={i} />;
            const tornooienVanCel = perDag.get(cel.sleutel) ?? [];
            const isVandaag = datumSleutel(vandaagDatum) === cel.sleutel;
            const isGeselecteerd = geselecteerdeDag === cel.sleutel;
            return (
              <button
                key={i}
                onClick={() => setGeselecteerdeDag(isGeselecteerd ? null : cel.sleutel)}
                className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-md border-[1.5px] text-sm font-semibold transition-colors ${
                  isGeselecteerd
                    ? "border-rood bg-rood text-white"
                    : tornooienVanCel.length > 0
                      ? "border-geel/50 bg-[#fffaf0] text-donker hover:border-rood"
                      : "border-transparent text-grijs hover:border-rand"
                } ${isVandaag && !isGeselecteerd ? "ring-2 ring-blauw-3" : ""}`}
              >
                <span>{cel.datum.getDate()}</span>
                {tornooienVanCel.length > 0 && (
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${isGeselecteerd ? "bg-white" : "bg-rood"}`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {geselecteerdeDag && (
          <div className="mt-5 flex flex-col gap-2 border-t border-rand pt-5">
            {toernooienVanDag.length === 0 ? (
              <p className="text-center text-sm text-grijs">{t.lijst.geenResultaten}</p>
            ) : (
              toernooienVanDag.map((tn) => <TournamentCard key={tn.id} toernooi={tn} />)
            )}
          </div>
        )}
      </div>
    </div>
  );
}
