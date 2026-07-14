"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/language-context";
import { BezoekStatistieken, ToernooiStatistieken } from "@/lib/data";

const MEDAILLES = ["🥇", "🥈", "🥉"];

export function StatistiekenPaneel({
  bezoeken,
  toernooien,
  isAdmin,
}: {
  bezoeken: BezoekStatistieken;
  toernooien: ToernooiStatistieken;
  isAdmin: boolean;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`mb-4 rounded-[10px] border-[1.5px] bg-white transition-shadow ${
        open ? "border-geel/60 shadow-[0_2px_10px_rgba(244,196,48,0.15)]" : "border-rand"
      }`}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="group flex w-full items-center justify-between gap-2 p-4 text-left"
      >
        <span className="text-[0.8rem] font-extrabold uppercase tracking-widest text-[#b8860b] transition-colors group-hover:text-donker">
          {t.beheer.statistieken}
        </span>
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs text-[#b8860b] transition-all ${
            open ? "rotate-90 bg-geel text-donker" : "bg-[#fdf3d9] group-hover:bg-geel group-hover:text-donker"
          }`}
          aria-hidden="true"
        >
          ›
        </span>
      </button>

      {open && (
        <div className="flex flex-col gap-4 p-4 pt-0">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatKaart label={t.beheer.bezoekersTotaal} waarde={bezoeken.totaal} />
            <StatKaart label={t.beheer.bezoekersDezeMaand} waarde={bezoeken.dezeMaand} />
            <StatKaart label={t.beheer.toernooienTotaalLabel} waarde={toernooien.totaalGoedgekeurd} />
            <StatKaart label={t.beheer.aanvragenDezeMaandLabel} waarde={toernooien.aanvragenDezeMaand} />
            <StatKaart label={t.beheer.goedgekeurdDezeMaandLabel} waarde={toernooien.goedgekeurdDezeMaand} kleur="text-groen" />
            <StatKaart label={t.beheer.geweigerdDezeMaandLabel} waarde={toernooien.geweigerdDezeMaand} kleur="text-rood" />
            <StatKaart label={t.beheer.actieveClubsLabel} waarde={toernooien.actieveClubs} />
          </div>

          {isAdmin && toernooien.perModerator.length > 0 && (
            <div className="border-t border-rand pt-4">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-donker">
                {t.beheer.moderatorRanglijst}
              </h3>
              <div className="flex flex-col gap-1.5">
                {toernooien.perModerator.map((mod, i) => (
                  <div
                    key={mod.naam}
                    className="flex items-center justify-between rounded-md bg-licht px-3 py-2 text-sm"
                  >
                    <span className="font-semibold text-donker">
                      {i < MEDAILLES.length ? `${MEDAILLES[i]} ` : ""}
                      {mod.naam}
                    </span>
                    <span className="font-bold text-[#b8860b]">{mod.aantal}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatKaart({ label, waarde, kleur = "text-blauw" }: { label: string; waarde: number; kleur?: string }) {
  return (
    <div className="rounded-[10px] border-[1.5px] border-rand bg-white p-4 transition-all hover:border-geel/60 hover:shadow-[0_2px_10px_rgba(244,196,48,0.15)]">
      <div className={`text-2xl font-extrabold ${kleur}`}>{waarde}</div>
      <div className="text-xs font-semibold text-grijs">{label}</div>
    </div>
  );
}
