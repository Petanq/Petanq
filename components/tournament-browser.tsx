"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "@/lib/language-context";
import { Club, Toernooi } from "@/lib/types";
import { maandJaarKey, maandVolledig, parseDatum } from "@/lib/datum";
import { FilterSidebar, FilterState } from "./filter-sidebar";
import { MonthPills } from "./month-pills";
import { TournamentCard } from "./tournament-card";
import { ClubCard } from "./club-card";
import { NewsletterBlock } from "./newsletter-block";
import { CtaBlock } from "./cta-block";

const LEGE_FILTERS: FilterState = {
  zoek: "",
  regio: null,
  provincie: null,
  categorie: null,
  formule: null,
  inschrijving: null,
  type: null,
};

export function TournamentBrowser({ toernooien, clubs }: { toernooien: Toernooi[]; clubs: Club[] }) {
  const { t, taal } = useTranslation();
  const [filters, setFilters] = useState<FilterState>(LEGE_FILTERS);
  const [actieveMaand, setActieveMaand] = useState<string | null>(null);

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
      if (actieveMaand && maandJaarKey(tn.datum) !== actieveMaand) return false;
      if (zoekTerm) {
        const haystack = `${tn.clubnaam} ${tn.gemeente} ${tn.naam_nl} ${tn.naam_fr}`.toLowerCase();
        if (!haystack.includes(zoekTerm)) return false;
      }
      return true;
    });
  }, [toernooien, filters, actieveMaand, zoekTerm]);

  const maandSleutels = useMemo(() => {
    const sleutels = new Set(toernooien.map((tn) => maandJaarKey(tn.datum)));
    return Array.from(sleutels).sort();
  }, [toernooien]);

  const groepen = useMemo(() => {
    const map = new Map<string, Toernooi[]>();
    for (const tn of gefilterd) {
      const sleutel = maandJaarKey(tn.datum);
      if (!map.has(sleutel)) map.set(sleutel, []);
      map.get(sleutel)!.push(tn);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [gefilterd]);

  return (
    <div id="toernooien" className="mx-auto grid max-w-[1140px] grid-cols-1 gap-6 px-6 pb-12 pt-8 lg:grid-cols-[220px_1fr] lg:px-10">
      <FilterSidebar alleToernooien={toernooien} filters={filters} setFilters={setFilters} />

      <main>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-titel text-2xl tracking-wide text-blauw">{t.lijst.titel}</h2>
          <MonthPills
            maandSleutels={maandSleutels}
            actieveMaand={actieveMaand}
            setActieveMaand={setActieveMaand}
          />
        </div>

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

        <div className="flex flex-col gap-2">
          {groepen.length === 0 && (
            <p className="rounded-lg border border-rand bg-white p-6 text-center text-sm text-grijs">
              {t.lijst.geenResultaten}
            </p>
          )}
          {groepen.map(([sleutel, lijst]) => {
            const [jaar] = sleutel.split("-");
            const maandIndex = parseDatum(`${sleutel}-01`).getMonth();
            return (
              <div key={sleutel}>
                <div className="my-2 flex items-center gap-3 rounded-md bg-blauw px-4 py-2 font-titel text-lg tracking-widest text-white first:mt-0">
                  📅 <span className="text-geel">{maandVolledig(maandIndex, taal).toUpperCase()}</span> {jaar}
                </div>
                <div className="flex flex-col gap-2">
                  {lijst.map((tn) => (
                    <TournamentCard key={tn.id} toernooi={tn} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <NewsletterBlock />
        <CtaBlock />
      </main>
    </div>
  );
}
