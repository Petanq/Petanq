"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/language-context";
import { BezoekStatistieken, BezoekPerProvincie, ToernooiStatistieken } from "@/lib/data";
import { Provincie, vertaalProvincie } from "@/lib/provincies";

const MEDAILLES = ["🥇", "🥈", "🥉"];

export function StatistiekenPaneel({
  bezoeken,
  bezoekenPerProvincie,
  reizenPaginaBezoeken,
  toernooien,
  isAdmin,
}: {
  bezoeken: BezoekStatistieken;
  bezoekenPerProvincie: BezoekPerProvincie[];
  reizenPaginaBezoeken: number;
  toernooien: ToernooiStatistieken;
  isAdmin: boolean;
}) {
  const { t, taal } = useTranslation();
  const [open, setOpen] = useState(false);
  const maxBezoekProvincie = Math.max(1, ...bezoekenPerProvincie.map((p) => p.aantal));

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
            {isAdmin && (
              <StatKaart label={t.beheer.reizenPaginaBezoekenLabel} waarde={reizenPaginaBezoeken} />
            )}
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

          {isAdmin && bezoekenPerProvincie.length > 0 && (
            <div className="border-t border-rand pt-4">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-donker">
                {t.beheer.bezoekenPerProvincie}
              </h3>
              <div className="flex flex-col gap-1.5">
                {bezoekenPerProvincie.map((rij) => (
                  <div key={rij.provincie} className="flex items-center gap-2 text-sm">
                    <span className="w-28 shrink-0 truncate text-donker">
                      {rij.provincie === "onbekend"
                        ? t.beheer.onbekendeLocatie
                        : vertaalProvincie(rij.provincie as Provincie, taal)}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-licht">
                      <div
                        className="h-full rounded-full bg-geel"
                        style={{ width: `${Math.max(4, (rij.aantal / maxBezoekProvincie) * 100)}%` }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right font-bold text-[#b8860b]">{rij.aantal}</span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-grijs">{t.beheer.bezoekenPerProvincieUitleg}</p>
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
