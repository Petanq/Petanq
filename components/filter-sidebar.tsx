"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/language-context";
import { Categorie, Formule, Toernooi } from "@/lib/types";
import { ALLE_PROVINCIES, PROVINCIE_REGIO, Provincie, Regio, vertaalProvincie, vertaalRegio } from "@/lib/provincies";
import { CATEGORIE_PIP } from "@/lib/stijlen";

export type FilterState = {
  zoek: string;
  regio: Regio | null;
  provincie: Provincie | null;
  categorie: Categorie | null;
  formule: Formule | null;
  inschrijving: "gratis" | "betalend" | null;
  type: "officieel" | "open" | null;
  kwalificatie: boolean | null;
};

function heeftKwalificatiedata(tn: Toernooi): boolean {
  return !!tn.kwalificatiedata && tn.kwalificatiedata.length > 0;
}

const CATEGORIEEN: Categorie[] = ["heren", "dames", "mix", "jeugd", "kampioenschap", "circuit", "recreanten"];
const FORMULES: Formule[] = [
  "tete-a-tete",
  "doublette",
  "triplette",
  "sextet",
  "quartet",
  "kwintet",
  "kleurentornooi",
  "meli-melo",
];
const REGIOS: Regio[] = ["vlaanderen", "wallonie", "brussel"];

function FilterItem({
  actief,
  onClick,
  label,
  aantal,
  pip,
}: {
  actief: boolean;
  onClick: () => void;
  label: string;
  aantal: number;
  pip?: string;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-[0.42rem] text-left text-[0.83rem] font-medium transition-all ${
          actief
            ? "bg-gradient-to-r from-[#fdf3d9] to-[#fdf3d9]/40 font-bold text-donker shadow-[inset_2px_0_0_0_#f4c430]"
            : "text-[#475569] hover:bg-[#f8f6f0] hover:text-donker"
        }`}
      >
        {pip && <span className={`h-[9px] w-[9px] shrink-0 rounded-full ${pip}`} />}
        <span className="flex-1 truncate">{label}</span>
        <span
          className={`min-w-[20px] rounded-full px-1.5 py-[0.1rem] text-center text-[0.67rem] font-bold transition-colors ${
            actief ? "bg-geel text-donker" : "bg-[#f1f5f9] text-[#64748b]"
          }`}
        >
          {aantal}
        </span>
      </button>
    </li>
  );
}

// Anders dan de overige filters (die telkens tussen meerdere opties kiezen en
// dus een uitklap-lijst nodig hebben) is dit een directe aan/uit-schakelaar:
// 1 klik past het filter meteen toe. Een donkere kaart met gouden rand (i.p.v. het
// accordion-uiterlijk) maakt dat verschil in gedrag ook visueel duidelijk.
function KwalificatieToggle({
  actief,
  onClick,
  titel,
  label,
}: {
  actief: boolean;
  onClick: () => void;
  titel: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`mb-3.5 flex w-full items-center gap-3 rounded-xl border-2 p-3.5 text-left transition-all ${
        actief
          ? "border-geel bg-geel shadow-[0_0_18px_rgba(244,196,48,0.35)]"
          : "border-geel/70 bg-[#1b1b1b] shadow-[0_0_14px_rgba(244,196,48,0.12)] hover:border-geel hover:shadow-[0_0_18px_rgba(244,196,48,0.3)]"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          actief ? "bg-[#1f1f1f] text-geel" : "bg-geel text-[#1f1f1f]"
        }`}
        aria-hidden
      >
        <svg viewBox="0 0 24 24" width={19} height={19} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
          <path d="M3.5 10h17M8 3v4M16 3v4M8 14h.01M12 14h.01M16 14h.01M8 17.2h.01M12 17.2h.01" />
        </svg>
      </span>
      <span
        aria-label={titel}
        className={`min-w-0 flex-1 text-[0.9rem] font-bold leading-snug ${actief ? "text-[#1f1f1f]" : "text-white"}`}
      >
        {label}
      </span>
    </button>
  );
}

export function FilterSidebar({
  alleToernooien,
  filters,
  setFilters,
}: {
  alleToernooien: Toernooi[];
  filters: FilterState;
  setFilters: (f: FilterState) => void;
}) {
  const { t, taal } = useTranslation();
  const [mobielOpen, setMobielOpen] = useState(false);
  const aantalActieveFilters = [
    filters.regio,
    filters.provincie,
    filters.categorie,
    filters.formule,
    filters.type,
  ].filter(Boolean).length;

  function voldoetAanOverigeFilters(tn: Toernooi, exclusief: keyof FilterState) {
    if (exclusief !== "regio" && filters.regio && tn.regio !== filters.regio) return false;
    if (exclusief !== "provincie" && filters.provincie && tn.provincie !== filters.provincie) return false;
    if (exclusief !== "categorie" && filters.categorie && tn.categorie !== filters.categorie) return false;
    if (exclusief !== "formule" && filters.formule && tn.formule !== filters.formule) return false;
    if (exclusief !== "type" && filters.type === "open" && !tn.open_toernooi) return false;
    if (exclusief !== "type" && filters.type === "officieel" && tn.open_toernooi) return false;
    if (exclusief !== "kwalificatie" && filters.kwalificatie === true && !heeftKwalificatiedata(tn)) return false;
    return true;
  }

  function tel(exclusief: keyof FilterState, predicaat: (tn: Toernooi) => boolean) {
    return alleToernooien.filter((tn) => voldoetAanOverigeFilters(tn, exclusief) && predicaat(tn)).length;
  }

  return (
    <aside className="lg:sticky lg:top-20">
      <div className="relative mb-3.5 rounded-2xl border-[1.5px] border-rand bg-white p-3 shadow-sm">
        <span className="pointer-events-none absolute left-[1.45rem] top-1/2 -translate-y-1/2 text-[#b8860b]" aria-hidden>
          <FilterIcoon pad={ICOON.zoek} />
        </span>
        <input
          type="text"
          value={filters.zoek}
          onChange={(e) => setFilters({ ...filters, zoek: e.target.value })}
          placeholder={t.filters.zoekPlaceholder}
          className="w-full rounded-xl border-[1.5px] border-rand bg-licht py-2.5 pl-9 pr-3 font-body text-[0.85rem] outline-none transition-colors focus:border-geel focus:bg-white"
        />
      </div>

      <KwalificatieToggle
        actief={filters.kwalificatie === true}
        onClick={() => setFilters({ ...filters, kwalificatie: filters.kwalificatie === true ? null : true })}
        titel={t.filters.kwalificatie}
        label={t.filters.metKwalificatiedata}
      />

      <button
        onClick={() => setMobielOpen((v) => !v)}
        className="mb-3.5 flex w-full items-center justify-between gap-2 rounded-2xl border-[1.5px] border-rand bg-white p-[1.1rem] text-left shadow-sm lg:hidden"
      >
        <span className="flex items-center gap-2">
          <span className="text-[0.83rem] font-bold text-donker">{t.filters.meerFilters}</span>
          {aantalActieveFilters > 0 && (
            <span className="rounded-full bg-geel px-1.5 py-[0.1rem] text-[0.67rem] font-bold text-donker">
              {aantalActieveFilters}
            </span>
          )}
        </span>
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#fdf3d9] text-xs text-[#b8860b] transition-transform ${
            mobielOpen ? "rotate-180" : ""
          }`}
          aria-hidden
        >
          ▾
        </span>
      </button>

      <div className={`${mobielOpen ? "block" : "hidden"} overflow-hidden rounded-2xl border-[1.5px] border-rand bg-white shadow-sm lg:block`}>
        <FilterCard icoon={ICOON.regio} titel={t.filters.regio} actiefLabel={filters.regio ? vertaalRegio(filters.regio, taal) : null}>
          <FilterItem
            actief={filters.regio === null}
            onClick={() => setFilters({ ...filters, regio: null, provincie: null })}
            label={t.filters.heelBelgie}
            aantal={tel("regio", () => true)}
          />
          {REGIOS.map((regio) => (
            <FilterItem
              key={regio}
              actief={filters.regio === regio}
              onClick={() => setFilters({ ...filters, regio, provincie: null })}
              label={vertaalRegio(regio, taal)}
              aantal={tel("regio", (tn) => tn.regio === regio)}
            />
          ))}
        </FilterCard>

        <FilterCard
          icoon={ICOON.provincie}
          titel={t.filters.provincie}
          actiefLabel={filters.provincie ? vertaalProvincie(filters.provincie, taal) : null}
        >
          <FilterItem
            actief={filters.provincie === null}
            onClick={() => setFilters({ ...filters, provincie: null })}
            label={t.filters.alleProvincies}
            aantal={tel("provincie", () => true)}
          />
          {ALLE_PROVINCIES.filter((p) => !filters.regio || PROVINCIE_REGIO[p] === filters.regio).map((provincie) => (
            <FilterItem
              key={provincie}
              actief={filters.provincie === provincie}
              onClick={() => setFilters({ ...filters, provincie })}
              label={vertaalProvincie(provincie, taal)}
              aantal={tel("provincie", (tn) => tn.provincie === provincie)}
            />
          ))}
        </FilterCard>

        <FilterCard
          icoon={ICOON.categorie}
          titel={t.filters.categorie}
          actiefLabel={filters.categorie ? t.categorie[filters.categorie] : null}
        >
          <FilterItem
            actief={filters.categorie === null}
            onClick={() => setFilters({ ...filters, categorie: null })}
            label={t.filters.alleCategorieen}
            aantal={tel("categorie", () => true)}
          />
          {CATEGORIEEN.map((categorie) => (
            <FilterItem
              key={categorie}
              actief={filters.categorie === categorie}
              onClick={() => setFilters({ ...filters, categorie })}
              label={t.categorie[categorie]}
              aantal={tel("categorie", (tn) => tn.categorie === categorie)}
              pip={CATEGORIE_PIP[categorie]}
            />
          ))}
        </FilterCard>

        <FilterCard icoon={ICOON.formule} titel={t.filters.formule} actiefLabel={filters.formule ? t.formule[filters.formule] : null}>
          <FilterItem
            actief={filters.formule === null}
            onClick={() => setFilters({ ...filters, formule: null })}
            label={t.filters.alleFormules}
            aantal={tel("formule", () => true)}
          />
          {FORMULES.map((formule) => (
            <FilterItem
              key={formule}
              actief={filters.formule === formule}
              onClick={() => setFilters({ ...filters, formule })}
              label={t.formule[formule]}
              aantal={tel("formule", (tn) => tn.formule === formule)}
            />
          ))}
        </FilterCard>

        <FilterCard
          icoon={ICOON.type}
          titel={t.form.tornooiType}
          actiefLabel={
            filters.type === "officieel"
              ? t.form.officieelToernooi
              : filters.type === "open"
                ? t.form.openToernooi
                : null
          }
        >
          <FilterItem
            actief={filters.type === null}
            onClick={() => setFilters({ ...filters, type: null })}
            label={t.filters.alleTypes}
            aantal={tel("type", () => true)}
          />
          <FilterItem
            actief={filters.type === "officieel"}
            onClick={() => setFilters({ ...filters, type: "officieel" })}
            label={t.form.officieelToernooi}
            aantal={tel("type", (tn) => !tn.open_toernooi)}
          />
          <FilterItem
            actief={filters.type === "open"}
            onClick={() => setFilters({ ...filters, type: "open" })}
            label={t.form.openToernooi}
            aantal={tel("type", (tn) => tn.open_toernooi)}
          />
        </FilterCard>
      </div>
    </aside>
  );
}

const ICOON = {
  zoek: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm9 16-3.5-3.5",
  regio: "M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21zM12 7a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z",
  provincie: "m12 3 9 5-9 5-9-5 9-5zM3 13l9 5 9-5",
  categorie: "M9 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM3 20a6 6 0 0 1 12 0M17 6.5a2.5 2.5 0 1 1 0 5M16 14.5a5 5 0 0 1 6 5",
  formule: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  type: "M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8zM14 6v12",
};

function FilterIcoon({ pad }: { pad: string }) {
  return (
    <svg viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d={pad} />
    </svg>
  );
}

// Eén rij in het filterpaneel: dunne lijn erboven (behalve de eerste), icoontje,
// titel en een pijltje. Heeft de rij een actief filter, dan kleurt ze zacht goud.
function FilterCard({
  icoon,
  titel,
  actiefLabel,
  children,
}: {
  icoon: string;
  titel: string;
  actiefLabel?: string | null;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const heeftActieveFilter = Boolean(actiefLabel);

  return (
    <div className={`border-t border-rand first:border-t-0 ${heeftActieveFilter ? "bg-[#fdf3d9]/50" : ""}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="group flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left transition-colors hover:bg-[#faf8f2]"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="text-[#b8860b]" aria-hidden>
            <FilterIcoon pad={icoon} />
          </span>
          <span className="text-[0.7rem] font-extrabold uppercase tracking-widest text-donker">{titel}</span>
          {!open && actiefLabel && (
            <span className="truncate rounded-full bg-geel px-2 py-0.5 text-[0.68rem] font-bold text-donker shadow-sm">
              {actiefLabel}
            </span>
          )}
        </span>
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center text-[#b8860b] transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        >
          <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>
      {open && <ul className="flex flex-col gap-0.5 px-2.5 pb-3">{children}</ul>}
    </div>
  );
}
