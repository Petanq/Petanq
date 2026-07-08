"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/language-context";
import { Toernooi } from "@/lib/types";
import { dagVanWeekKort, dagNummer, maandKort, formatUur, countdownTekst } from "@/lib/datum";
import { vertaalProvincie } from "@/lib/provincies";
import { CATEGORIE_STREEP, CATEGORIE_BADGE, FORMULE_BADGE } from "@/lib/stijlen";

export function TournamentCard({ toernooi }: { toernooi: Toernooi }) {
  const { t, taal } = useTranslation();
  const naam = taal === "fr" ? toernooi.naam_fr : toernooi.naam_nl;

  return (
    <Link
      href={`/toernooien/${toernooi.id}`}
      className="group relative grid grid-cols-[52px_1fr_auto] items-center gap-3.5 overflow-hidden rounded-[10px] border-[1.5px] border-rand bg-white p-3.5 px-4 transition-all hover:translate-x-[3px] hover:border-blauw-3/40 hover:shadow-[0_4px_20px_rgba(26,68,128,0.09)]"
    >
      <span
        className={`absolute left-0 top-0 h-full w-1 rounded-l-[10px] ${CATEGORIE_STREEP[toernooi.categorie]}`}
      />

      <div className="rounded-lg bg-licht px-0.5 py-1.5 text-center">
        <div className="font-body text-[0.58rem] font-bold uppercase tracking-wide text-grijs">
          {dagVanWeekKort(toernooi.datum, taal)}
        </div>
        <div className="font-titel text-2xl leading-none text-blauw">
          {dagNummer(toernooi.datum)}
        </div>
        <div className="font-body text-[0.58rem] font-bold uppercase tracking-wider text-grijs">
          {maandKort(toernooi.datum, taal)}
        </div>
      </div>

      <div className="min-w-0">
        <div className="mb-0.5 truncate text-[0.72rem] font-bold uppercase tracking-wide text-blauw-2">
          {toernooi.clubnaam}
        </div>
        <div className="mb-1 truncate text-[0.88rem] font-bold leading-tight text-donker">
          {naam}
        </div>
        <div className="flex flex-wrap gap-3">
          <span className="text-[0.74rem] text-grijs">
            📍 {toernooi.gemeente}, {vertaalProvincie(toernooi.provincie, taal)}
          </span>
          <span className="text-[0.74rem] text-grijs">🕐 {formatUur(toernooi.uur)}</span>
          {toernooi.speelvorm === "rondes" && toernooi.aantal_ronden && (
            <span className="text-[0.74rem] text-grijs">
              {toernooi.aantal_ronden} {t.lijst.ronden}
            </span>
          )}
          {toernooi.speelvorm === "poules" && toernooi.aantal_poules && (
            <span className="text-[0.74rem] text-grijs">
              {toernooi.aantal_poules} {t.lijst.poules}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        {toernooi.vol && (
          <span className="whitespace-nowrap rounded bg-rood px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-white">
            {t.lijst.volBadge}
          </span>
        )}
        <span
          className={`whitespace-nowrap rounded px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide ${FORMULE_BADGE[toernooi.formule]}`}
        >
          {t.formule[toernooi.formule]}
        </span>
        <span
          className={`whitespace-nowrap rounded px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide ${CATEGORIE_BADGE[toernooi.categorie]}`}
        >
          {t.categorie[toernooi.categorie]}
        </span>
        <span className="whitespace-nowrap text-[0.68rem] font-semibold text-grijs">
          {countdownTekst(toernooi.datum, taal)}
        </span>
      </div>
    </Link>
  );
}
