"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "@/lib/language-context";
import { Club } from "@/lib/types";
import { ALLE_PROVINCIES, Regio, vertaalProvincie, vertaalRegio } from "@/lib/provincies";
import { ClubCard } from "./club-card";
import { AddClubCard } from "./add-club-card";

const REGIOS: Regio[] = ["vlaanderen", "wallonie", "brussel"];

export function ClubsBrowser({ clubs }: { clubs: Club[] }) {
  const { t, taal } = useTranslation();
  const [zoek, setZoek] = useState("");
  const [regioFilter, setRegioFilter] = useState<Regio | null>(null);

  const gefilterd = useMemo(() => {
    const term = zoek.trim().toLowerCase();
    return clubs.filter((club) => {
      if (regioFilter && club.regio !== regioFilter) return false;
      if (term && !`${club.naam} ${club.gemeente}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [clubs, zoek, regioFilter]);

  const regiosMetData = REGIOS.filter((regio) => !regioFilter || regio === regioFilter);

  return (
    <div id="provincies" className="mx-auto max-w-[1140px] px-6 py-8 lg:px-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-titel text-4xl tracking-wide text-blauw">{t.clubsPagina.titel}</h1>
          <p className="text-sm text-grijs">{t.clubsPagina.beschrijving}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={zoek}
            onChange={(e) => setZoek(e.target.value)}
            placeholder={t.clubsPagina.zoekPlaceholder}
            className="w-56 rounded-md border-[1.5px] border-rand px-3 py-2 text-sm outline-none focus:border-blauw-3"
          />
          <select
            value={regioFilter ?? ""}
            onChange={(e) => setRegioFilter((e.target.value || null) as Regio | null)}
            className="rounded-md border-[1.5px] border-rand px-3 py-2 text-sm outline-none focus:border-blauw-3"
          >
            <option value="">{t.clubsPagina.alleRegios}</option>
            {REGIOS.map((regio) => (
              <option key={regio} value={regio}>
                {vertaalRegio(regio, taal)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {gefilterd.length === 0 && (
        <p className="rounded-lg border border-rand bg-white p-6 text-center text-sm text-grijs">
          {t.clubsPagina.geenResultaten}
        </p>
      )}

      {regiosMetData.map((regio) => {
        const zichtbareProvincies = ALLE_PROVINCIES.filter(
          (p) =>
            gefilterd.some((c) => c.provincie === p) &&
            gefilterd.find((c) => c.provincie === p)?.regio === regio
        );

        if (zichtbareProvincies.length === 0) return null;

        return (
          <section key={regio} className="mb-10">
            <h2 className="mb-4 font-titel text-2xl tracking-wide text-blauw-2">
              {vertaalRegio(regio, taal)}
            </h2>
            {zichtbareProvincies.map((provincie) => {
              const clubsInProvincie = gefilterd.filter((c) => c.provincie === provincie);
              return (
                <div key={provincie} className="mb-6">
                  <h3 className="mb-2.5 text-[0.7rem] font-extrabold uppercase tracking-widest text-[#94a3b8]">
                    {vertaalProvincie(provincie, taal)}
                  </h3>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                    {clubsInProvincie.map((club) => (
                      <ClubCard key={club.id} club={club} />
                    ))}
                    <AddClubCard provincie={provincie} />
                  </div>
                </div>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
