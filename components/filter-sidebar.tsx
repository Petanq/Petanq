"use client";

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
};

const CATEGORIEEN: Categorie[] = ["heren", "dames", "mix", "jeugd", "kampioenschap", "circuit", "recreanten"];
const FORMULES: Formule[] = [
  "tete-a-tete",
  "doublette",
  "triplette",
  "sextet",
  "quartet",
  "kwintet",
  "kleurentornooi",
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
        className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-[0.42rem] text-left text-[0.83rem] font-medium transition-colors ${
          actief ? "bg-[#eff6ff] font-bold text-blauw-2" : "text-[#475569] hover:bg-[#f1f5f9]"
        }`}
      >
        {pip && <span className={`h-[9px] w-[9px] shrink-0 rounded-full ${pip}`} />}
        <span className="flex-1 truncate">{label}</span>
        <span
          className={`min-w-[20px] rounded-full px-1.5 py-[0.1rem] text-center text-[0.67rem] font-bold ${
            actief ? "bg-blauw-2 text-white" : "bg-[#f1f5f9] text-[#64748b]"
          }`}
        >
          {aantal}
        </span>
      </button>
    </li>
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

  function voldoetAanOverigeFilters(tn: Toernooi, exclusief: keyof FilterState) {
    if (exclusief !== "regio" && filters.regio && tn.regio !== filters.regio) return false;
    if (exclusief !== "provincie" && filters.provincie && tn.provincie !== filters.provincie) return false;
    if (exclusief !== "categorie" && filters.categorie && tn.categorie !== filters.categorie) return false;
    if (exclusief !== "formule" && filters.formule && tn.formule !== filters.formule) return false;
    if (exclusief !== "type" && filters.type === "open" && !tn.open_toernooi) return false;
    if (exclusief !== "type" && filters.type === "officieel" && tn.open_toernooi) return false;
    return true;
  }

  function tel(exclusief: keyof FilterState, predicaat: (tn: Toernooi) => boolean) {
    return alleToernooien.filter((tn) => voldoetAanOverigeFilters(tn, exclusief) && predicaat(tn)).length;
  }

  return (
    <aside className="lg:sticky lg:top-20">
      <div className="mb-3.5 rounded-[10px] border-[1.5px] border-rand bg-white p-[1.1rem]">
        <input
          type="text"
          value={filters.zoek}
          onChange={(e) => setFilters({ ...filters, zoek: e.target.value })}
          placeholder={t.filters.zoekPlaceholder}
          className="w-full rounded-md border-[1.5px] border-rand bg-licht px-3 py-2 font-body text-[0.85rem] outline-none focus:border-blauw-3 focus:bg-white"
        />
      </div>

      <FilterCard titel={t.filters.regio}>
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

      <FilterCard titel={t.filters.provincie}>
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

      <FilterCard titel={t.filters.categorie}>
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

      <FilterCard titel={t.filters.formule}>
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

      <FilterCard titel={t.form.tornooiType}>
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
    </aside>
  );
}

function FilterCard({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <div className="mb-3.5 rounded-[10px] border-[1.5px] border-rand bg-white p-[1.1rem]">
      <div className="mb-3 text-[0.66rem] font-extrabold uppercase tracking-widest text-[#94a3b8]">
        {titel}
      </div>
      <ul className="flex flex-col gap-0.5">{children}</ul>
    </div>
  );
}
