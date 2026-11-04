"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/lib/language-context";
import { Club, Toernooi } from "@/lib/types";
import { maandJaarKey, weekBereik, weekKey, weekStart, wekenVanNu } from "@/lib/datum";
import { vertaalProvincie } from "@/lib/provincies";
import { FilterSidebar, FilterState } from "./filter-sidebar";
import { MonthPills } from "./month-pills";
import { TournamentCard } from "./tournament-card";
import { ClubCard } from "./club-card";
import { MonthCalendar } from "./month-calendar";
import { NewsletterBlock } from "./newsletter-block";
import { CtaBlock } from "./cta-block";
import { ZoekIcoon } from "./ui/zoek-icoon";
import { TOON_KALENDER_EVENT } from "@/components/mobiel-kalender";
import { MijnPlaatsBalk, Sortering } from "./mijn-plaats-balk";
import { afstandTot, useMijnPlaatsStaat } from "@/lib/mijn-plaats";

const LEGE_FILTERS: FilterState = {
  zoek: "",
  regio: null,
  provincie: null,
  categorie: null,
  formule: null,
  inschrijving: null,
  type: null,
  kwalificatie: null,
};

// Zoveel tornooien staan er meteen; met de knop rollen er telkens zoveel bij uit.
const STAP = 8;

const MEER_KNOP =
  "rounded-xl bg-geel px-7 py-3 text-sm font-extrabold text-donker shadow-sm transition-all hover:brightness-105 active:scale-95";

export function TournamentBrowser({
  toernooien,
  clubs,
  liveToernooiIds,
}: {
  toernooien: Toernooi[];
  clubs: Club[];
  liveToernooiIds: string[];
}) {
  const { t, taal } = useTranslation();
  const liveIds = useMemo(() => new Set(liveToernooiIds), [liveToernooiIds]);
  const [filters, setFilters] = useState<FilterState>(LEGE_FILTERS);
  const [actieveMaand, setActieveMaand] = useState<string | null>(null);
  const [weergave, setWeergave] = useState<"lijst" | "kalender">("lijst");
  const [sorteringKeuze, setSortering] = useState<Sortering>("datum");
  const [zichtbaar, setZichtbaar] = useState(STAP);
  // Vanaf welke plaats in de lijst de net getoonde tornooien beginnen (voor het uitrollen).
  const [nieuwVanaf, setNieuwVanaf] = useState<number | null>(null);
  const mijnPlaats = useMijnPlaatsStaat();
  const opAfstand = sorteringKeuze === "afstand" && mijnPlaats.plaats !== null;

  useEffect(() => {
    function checkHash() {
      if (window.location.hash === "#kalender") {
        setWeergave("kalender");
        document.getElementById("toernooien")?.scrollIntoView();
      }
    }
    // "Tornooien" op de gsm-homepage (zie mobiel-kalender.tsx) opent de lijst
    // meteen in de kalenderweergave.
    function toonKalender() {
      setWeergave("kalender");
    }
    checkHash();
    window.addEventListener("hashchange", checkHash);
    window.addEventListener(TOON_KALENDER_EVENT, toonKalender);
    return () => {
      window.removeEventListener("hashchange", checkHash);
      window.removeEventListener(TOON_KALENDER_EVENT, toonKalender);
    };
  }, []);

  const zoekTerm = filters.zoek.trim().toLowerCase();

  const gevondenClubs = useMemo(() => {
    if (!zoekTerm) return [];
    return clubs.filter(
      (c) => c.naam.toLowerCase().includes(zoekTerm) || c.gemeente.toLowerCase().includes(zoekTerm)
    );
  }, [clubs, zoekTerm]);

  const gefilterd = useMemo(() => {
    return toernooien.filter((tn) => {
      if (filters.regio && tn.regio !== filters.regio) return false;
      if (filters.provincie && tn.provincie !== filters.provincie) return false;
      if (filters.categorie && tn.categorie !== filters.categorie) return false;
      if (filters.formule && tn.formule !== filters.formule) return false;
      if (filters.inschrijving === "gratis" && !tn.gratis) return false;
      if (filters.inschrijving === "betalend" && tn.gratis) return false;
      if (filters.type === "open" && !tn.open_toernooi) return false;
      if (filters.type === "officieel" && tn.open_toernooi) return false;
      if (filters.kwalificatie === true && !(tn.kwalificatiedata && tn.kwalificatiedata.length > 0)) return false;
      if (actieveMaand && maandJaarKey(tn.datum) !== actieveMaand) return false;
      if (zoekTerm) {
        const haystack = `${tn.clubnaam} ${tn.gemeente} ${tn.naam_nl} ${tn.naam_fr} ${vertaalProvincie(
          tn.provincie,
          taal
        )} ${t.categorie[tn.categorie]} ${t.formule[tn.formule]}`.toLowerCase();
        if (!haystack.includes(zoekTerm)) return false;
      }
      return true;
    });
  }, [toernooien, filters, actieveMaand, zoekTerm]);

  const maandSleutels = useMemo(() => {
    const sleutels = new Set(toernooien.map((tn) => maandJaarKey(tn.datum)));
    return Array.from(sleutels).sort();
  }, [toernooien]);

  // Op datum; de weekbalken worden getoond waar een nieuwe week begint (maandag tot zondag).
  const datumLijst = useMemo(() => [...gefilterd].sort((a, b) => a.datum.localeCompare(b.datum)), [gefilterd]);
  const weekAantal = useMemo(() => {
    const map = new Map<string, number>();
    for (const tn of datumLijst) {
      const sleutel = weekKey(tn.datum);
      map.set(sleutel, (map.get(sleutel) ?? 0) + 1);
    }
    return map;
  }, [datumLijst]);

  // "Dichtstbij": één lijst van dichtbij naar ver (zelfde afstand: eerst de vroegste datum);
  // tornooien die niet te situeren zijn komen achteraan.
  const opAfstandLijst = useMemo(() => {
    if (!opAfstand) return [];
    return gefilterd
      .map((tn) => ({ tn, km: afstandTot(mijnPlaats, tn) }))
      .sort((a, b) => {
        if (a.km === null || b.km === null) return a.km === b.km ? 0 : a.km === null ? 1 : -1;
        return Math.round(a.km) - Math.round(b.km) || a.tn.datum.localeCompare(b.tn.datum);
      })
      .map((x) => x.tn);
  }, [opAfstand, gefilterd, mijnPlaats]);

  // Nieuwe zoekopdracht, filter of sortering: begin weer bij de eerste tornooien.
  useEffect(() => {
    setZichtbaar(STAP);
    setNieuwVanaf(null);
  }, [gefilterd, opAfstand]);

  const volgorde = opAfstand ? opAfstandLijst : datumLijst;
  const zichtbareLijst = volgorde.slice(0, zichtbaar);
  const nogOver = volgorde.length - zichtbareLijst.length;

  function toonMeer() {
    setNieuwVanaf(zichtbareLijst.length);
    setZichtbaar((n) => n + STAP);
  }

  return (
    <div id="toernooien" className="mx-auto grid max-w-[1140px] grid-cols-1 gap-6 px-6 pb-12 pt-8 lg:grid-cols-[220px_1fr] lg:px-10">
      <FilterSidebar alleToernooien={toernooien} filters={filters} setFilters={setFilters} />

      <main id="toernooien-weergave" className="min-w-0 scroll-mt-20">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-titel text-2xl tracking-wide text-blauw">{t.lijst.titel}</h2>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {weergave === "lijst" && (
              <MonthPills
                maandSleutels={maandSleutels}
                actieveMaand={actieveMaand}
                setActieveMaand={setActieveMaand}
              />
            )}
            <div className="flex shrink-0 overflow-hidden rounded-full border-[1.5px] border-[#e3cb87] bg-white">
              <button
                onClick={() => setWeergave("lijst")}
                className={`px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                  weergave === "lijst" ? "bg-geel text-donker" : "text-grijs hover:bg-[#fdf3d9] hover:text-[#b8860b]"
                }`}
              >
                {t.lijst.weergaveLijst}
              </button>
              <button
                onClick={() => setWeergave("kalender")}
                className={`px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                  weergave === "kalender" ? "bg-geel text-donker" : "text-grijs hover:bg-[#fdf3d9] hover:text-[#b8860b]"
                }`}
              >
                {t.lijst.weergaveKalender}
              </button>
            </div>
          </div>
        </div>

        <MijnPlaatsBalk sortering={opAfstand ? "afstand" : "datum"} setSortering={setSortering} />

        {gevondenClubs.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-2 text-xs font-extrabold uppercase tracking-widest text-grijs">
              {t.lijst.gevondenClubs}
            </h3>
            <div className="flex flex-col gap-2">
              {gevondenClubs.map((club) => (
                <ClubCard key={club.id} club={club} />
              ))}
            </div>
          </div>
        )}

        {weergave === "kalender" ? (
          <MonthCalendar toernooien={gefilterd} liveIds={liveIds} />
        ) : (
          <div className="flex flex-col gap-2">
            {gefilterd.length === 0 && (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-rand bg-white p-8 text-center text-sm text-grijs">
                <ZoekIcoon />
                {t.lijst.geenResultaten}
              </div>
            )}
            {zichtbareLijst.map((tn, i) => {
              const sleutel = weekKey(tn.datum);
              const nieuweWeek = !opAfstand && (i === 0 || sleutel !== weekKey(zichtbareLijst[i - 1].datum));
              const uitrollen = nieuwVanaf !== null && i >= nieuwVanaf;
              const vertraging = uitrollen ? { animationDelay: `${(i - nieuwVanaf) * 70}ms` } : undefined;
              const start = weekStart(tn.datum);
              const wekenAfstand = wekenVanNu(start);
              const label =
                wekenAfstand === 0 ? t.lijst.dezeWeek : wekenAfstand === 1 ? t.lijst.volgendeWeek : null;
              const bereik = weekBereik(start, taal);
              return (
                <Fragment key={tn.id}>
                  {nieuweWeek && (
                    <div
                      className={`my-2 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md bg-blauw px-4 py-2 font-titel text-lg tracking-widest text-white first:mt-0${uitrollen ? " uitrollen" : ""}`}
                      style={vertraging}
                    >
                      <span aria-hidden="true">📅</span>
                      <span className="text-geel">{(label ?? bereik).toUpperCase()}</span>
                      {label && <span className="text-base text-white/80">{bereik}</span>}
                      <span className="ml-auto font-body text-xs font-semibold tracking-normal text-white/70">
                        {t.lijst.aantalToernooien(weekAantal.get(sleutel) ?? 0)}
                      </span>
                    </div>
                  )}
                  <div className={uitrollen ? "uitrollen" : undefined} style={vertraging}>
                    <TournamentCard toernooi={tn} live={liveIds.has(tn.id)} />
                  </div>
                </Fragment>
              );
            })}
            {nogOver > 0 && (
              <div className="mt-3 flex flex-col items-center gap-1.5">
                <button type="button" onClick={toonMeer} className={MEER_KNOP}>
                  {t.lijst.meerToernooien}
                </button>
                <span className="text-xs text-grijs">{t.lijst.nogToernooien(nogOver)}</span>
              </div>
            )}
          </div>
        )}

        <NewsletterBlock />
        <CtaBlock />
      </main>
    </div>
  );
}
