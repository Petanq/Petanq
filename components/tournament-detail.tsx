"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/language-context";
import { Toernooi } from "@/lib/types";
import { dagVanWeekKort, dagNummer, maandVolledig, formatUur, countdownTekst, parseDatum } from "@/lib/datum";
import { vertaalProvincie } from "@/lib/provincies";
import { CATEGORIE_BADGE, FORMULE_BADGE } from "@/lib/stijlen";

export function TournamentDetail({ toernooi }: { toernooi: Toernooi }) {
  const { t, taal } = useTranslation();
  const naam = taal === "fr" ? toernooi.naam_fr : toernooi.naam_nl;
  const maandIndex = parseDatum(toernooi.datum).getMonth();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 lg:px-10">
      <Link href="/" className="mb-6 inline-block text-sm font-semibold text-blauw-2 hover:underline">
        ← {t.hero.bekijkAlle}
      </Link>

      <div className="rounded-xl border-[1.5px] border-rand bg-white p-8">
        <div className="mb-4 flex flex-wrap gap-2">
          <span className={`rounded px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${FORMULE_BADGE[toernooi.formule]}`}>
            {t.formule[toernooi.formule]}
          </span>
          <span className={`rounded px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${CATEGORIE_BADGE[toernooi.categorie]}`}>
            {t.categorie[toernooi.categorie]}
          </span>
        </div>

        <h1 className="mb-2 font-titel text-4xl tracking-wide text-blauw">{naam}</h1>
        <p className="mb-6 text-sm font-bold uppercase tracking-wide text-blauw-2">
          {toernooi.clubnaam}
        </p>

        <dl className="grid grid-cols-1 gap-4 border-t border-rand pt-6 sm:grid-cols-2">
          <Detail label={t.form.datum}>
            {dagVanWeekKort(toernooi.datum, taal)} {dagNummer(toernooi.datum)}{" "}
            {maandVolledig(maandIndex, taal)} · {countdownTekst(toernooi.datum, taal)}
          </Detail>
          <Detail label={t.form.uur}>{formatUur(toernooi.uur)}</Detail>
          <Detail label={t.form.gemeente}>
            {toernooi.gemeente}, {vertaalProvincie(toernooi.provincie, taal)}
          </Detail>
          <Detail label={t.form.aantalRonden}>
            {toernooi.aantal_ronden} {t.lijst.ronden}
          </Detail>
          <Detail label={t.filters.inschrijving}>
            {toernooi.gratis
              ? t.filters.gratis
              : toernooi.inschrijvingsprijs
              ? `€ ${toernooi.inschrijvingsprijs.toFixed(2)}`
              : t.filters.betalend}
          </Detail>
          {toernooi.max_ploegen && (
            <Detail label={t.form.maxPloegen}>{toernooi.max_ploegen}</Detail>
          )}
        </dl>

        {toernooi.opmerking && (
          <p className="mt-6 border-t border-rand pt-6 text-sm text-grijs">{toernooi.opmerking}</p>
        )}

        <div className="mt-8 flex flex-wrap gap-3 border-t border-rand pt-6">
          {toernooi.link_inschrijving && (
            <a
              href={toernooi.link_inschrijving}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-rood px-6 py-3 font-bold text-white transition-colors hover:bg-rood-2"
            >
              {t.hero.toernooiAanmelden}
            </a>
          )}
          <a
            href={`mailto:${toernooi.contact_email}`}
            className="rounded-lg border-[1.5px] border-rand px-6 py-3 font-semibold text-donker transition-colors hover:border-blauw-3"
          >
            {toernooi.contact_email}
          </a>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-grijs">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-donker">{children}</dd>
    </div>
  );
}
