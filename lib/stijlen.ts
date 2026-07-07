import { Categorie, Formule } from "./types";

export const CATEGORIE_STREEP: Record<Categorie, string> = {
  heren: "bg-[#1a4480]",
  dames: "bg-[#be185d]",
  mix: "bg-[#6d28d9]",
  jeugd: "bg-[#059669]",
  kampioenschap: "bg-[#b45309]",
  circuit: "bg-[#64748b]",
};

export const CATEGORIE_BADGE: Record<Categorie, string> = {
  heren: "bg-[#eff6ff] text-[#1a4480]",
  dames: "bg-[#fdf2f8] text-[#be185d]",
  mix: "bg-[#f5f3ff] text-[#6d28d9]",
  jeugd: "bg-[#ecfdf5] text-[#059669]",
  kampioenschap: "bg-[#fef3c7] text-[#b45309]",
  circuit: "bg-[#f1f5f9] text-[#475569]",
};

export const CATEGORIE_PIP: Record<Categorie, string> = {
  heren: "bg-blauw-3",
  dames: "bg-[#be185d]",
  mix: "bg-paars",
  jeugd: "bg-[#059669]",
  kampioenschap: "bg-kamp",
  circuit: "bg-circuit",
};

export const FORMULE_BADGE: Record<Formule, string> = {
  "tete-a-tete": "bg-[#fff1f2] text-rood",
  doublette: "bg-[#fffbeb] text-[#92400e]",
  triplette: "bg-[#eff6ff] text-[#1a4480]",
  sextet: "bg-[#f0fdf4] text-[#166534]",
  quartet: "bg-[#fdf4ff] text-[#7e22ce]",
  kwintet: "bg-[#fdf4ff] text-[#7e22ce]",
  kleurentornooi: "bg-[#fff7ed] text-oranje",
};
