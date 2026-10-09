"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/language-context";
import { BezoekStatistieken, BezoekPerProvincie, BezoekPerDag, ToernooiStatistieken } from "@/lib/data";
import { Provincie, vertaalProvincie } from "@/lib/provincies";
import { dagVanWeekKort, dagNummer, maandKort } from "@/lib/datum";
import { siteUrl } from "@/lib/site-url";

const MEDAILLES = ["🥇", "🥈", "🥉"];

export function StatistiekenPaneel({
  bezoeken,
  bezoekenPerProvincie,
  bezoekenPerDag,
  reizenPaginaBezoeken,
  boulesPaginaBezoeken,
  boulesDoorkliks,
  partnersBezoeken,
  dossierAanvragen,
  teambuildingDoorkliks,
  toernooien,
  isAdmin,
}: {
  bezoeken: BezoekStatistieken;
  bezoekenPerProvincie: BezoekPerProvincie[];
  bezoekenPerDag: BezoekPerDag[];
  reizenPaginaBezoeken: number;
  boulesPaginaBezoeken: number;
  boulesDoorkliks: number;
  partnersBezoeken: number;
  dossierAanvragen: number;
  teambuildingDoorkliks: number;
  toernooien: ToernooiStatistieken;
  isAdmin: boolean;
}) {
  const { t, taal } = useTranslation();
  const [open, setOpen] = useState(false);
  const maxBezoekProvincie = Math.max(1, ...bezoekenPerProvincie.map((p) => p.aantal));
  const maxBezoekDag = Math.max(1, ...bezoekenPerDag.map((d) => d.aantal));

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
            <StatKaart label={t.beheer.bezoekersVandaag} waarde={bezoeken.vandaag} />
            <StatKaart label={t.beheer.toernooienTotaalLabel} waarde={toernooien.totaalGoedgekeurd} />
            <StatKaart label={t.beheer.aanvragenDezeMaandLabel} waarde={toernooien.aanvragenDezeMaand} />
            <StatKaart label={t.beheer.goedgekeurdDezeMaandLabel} waarde={toernooien.goedgekeurdDezeMaand} kleur="text-groen" />
            <StatKaart label={t.beheer.geweigerdDezeMaandLabel} waarde={toernooien.geweigerdDezeMaand} kleur="text-rood" />
            <StatKaart label={t.beheer.actieveClubsLabel} waarde={toernooien.actieveClubs} />
            {isAdmin && (
              <StatKaart label={t.beheer.reizenPaginaBezoekenLabel} waarde={reizenPaginaBezoeken} />
            )}
            {isAdmin && <StatKaart label={t.beheer.boulesPaginaBezoekenLabel} waarde={boulesPaginaBezoeken} />}
            {isAdmin && <StatKaart label={t.beheer.boulesDoorkliksLabel} waarde={boulesDoorkliks} />}
            {isAdmin && <StatKaart label={t.beheer.partnersBezoekenLabel} waarde={partnersBezoeken} />}
            {isAdmin && <StatKaart label={t.beheer.dossierAanvragenLabel} waarde={dossierAanvragen} />}
            {isAdmin && <StatKaart label={t.beheer.teambuildingDoorkliksLabel} waarde={teambuildingDoorkliks} />}
          </div>

          {isAdmin && <DoorstuurLink label={t.beheer.boulesLinkLabel} url={`${siteUrl()}/boules`} />}

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
                    <span className="flex flex-col">
                      <span className="font-semibold text-donker">
                        {i < MEDAILLES.length ? `${MEDAILLES[i]} ` : ""}
                        {mod.naam}
                      </span>
                      {mod.laatsteBezoek && (
                        <span className="text-xs text-grijs">
                          {t.beheer.laatsteBezoek(
                            new Date(mod.laatsteBezoek).toLocaleDateString(taal === "fr" ? "fr-BE" : "nl-BE")
                          )}
                        </span>
                      )}
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

          {isAdmin && bezoekenPerDag.length > 0 && (
            <div className="border-t border-rand pt-4">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-donker">
                {t.beheer.bezoekenPerDag}
              </h3>
              <div className="flex flex-col gap-1.5">
                {bezoekenPerDag.map((rij) => (
                  <div key={rij.dag} className="flex items-center gap-2 text-sm">
                    <span className="w-16 shrink-0 text-donker">
                      {dagVanWeekKort(rij.dag, taal)} {dagNummer(rij.dag)} {maandKort(rij.dag, taal)}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-licht">
                      <div
                        className="h-full rounded-full bg-blauw-3"
                        style={{ width: `${Math.max(4, (rij.aantal / maxBezoekDag) * 100)}%` }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right font-bold text-blauw-3">{rij.aantal}</span>
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

function DoorstuurLink({ label, url }: { label: string; url: string }) {
  const { t } = useTranslation();
  const [gekopieerd, setGekopieerd] = useState(false);

  async function kopieer() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const veld = document.createElement("textarea");
      veld.value = url;
      document.body.appendChild(veld);
      veld.select();
      document.execCommand("copy");
      document.body.removeChild(veld);
    }
    setGekopieerd(true);
    setTimeout(() => setGekopieerd(false), 2000);
  }

  return (
    <div className="rounded-[10px] border-[1.5px] border-geel/60 bg-[#fffbeb] p-4">
      <div className="mb-2 text-xs font-semibold text-grijs">{label}</div>
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-0 flex-1 break-all text-sm font-bold text-blauw underline"
        >
          {url}
        </a>
        <button
          type="button"
          onClick={kopieer}
          className="shrink-0 rounded-md bg-geel px-4 py-2 text-sm font-bold text-donker shadow-sm transition-all hover:brightness-95 active:scale-95"
        >
          {gekopieerd ? t.beheer.boulesLinkGekopieerd : t.beheer.boulesLinkKopieer}
        </button>
      </div>
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
