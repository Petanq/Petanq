"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Taal, Vertaling, vertalingen } from "./i18n";

export const OPSLAG_SLEUTEL = "le-bouliste-taal";

type LanguageContextType = {
  taal: Taal;
  setTaal: (taal: Taal) => void;
};

const LanguageContext = createContext<LanguageContextType>({
  taal: "nl",
  setTaal: () => {},
});

// `forceTaal`: de Franse pagina's (/fr) staan vast in het Frans, ook in de HTML die de server
// teruggeeft. Zo leest Google daar echt Franse tekst en niet eerst een Nederlandse pagina.
export function LanguageProvider({ children, forceTaal }: { children: ReactNode; forceTaal?: Taal }) {
  const [taal, setTaalState] = useState<Taal>(forceTaal ?? "nl");
  const pad = usePathname();

  useEffect(() => {
    if (forceTaal) {
      // Wie op /fr binnenkomt, krijgt ook op de andere pagina's Frans.
      try {
        window.localStorage.setItem(OPSLAG_SLEUTEL, forceTaal);
      } catch {}
      return;
    }
    const opgeslagen = window.localStorage.getItem(OPSLAG_SLEUTEL);
    if (opgeslagen === "nl" || opgeslagen === "fr") {
      setTaalState(opgeslagen);
      return;
    }
    // Nog geen eigen keuze gemaakt: gebruik de taalvoorkeur van de browser
    // zodat Franstalige bezoekers niet standaard Nederlands te zien krijgen.
    if (navigator.language.toLowerCase().startsWith("fr")) {
      setTaalState("fr");
    }
    // Bij elke paginawissel opnieuw lezen: de taalknop op /fr en /clubs verandert de opgeslagen keuze
    // en wisselt dan van pagina, en de buitenste provider blijft staan tussen pagina's door.
  }, [forceTaal, pad]);

  function setTaal(nieuweTaal: Taal) {
    if (forceTaal) return;
    setTaalState(nieuweTaal);
    window.localStorage.setItem(OPSLAG_SLEUTEL, nieuweTaal);
  }

  return (
    <LanguageContext.Provider value={{ taal, setTaal }}>
      <div lang={taal}>{children}</div>
    </LanguageContext.Provider>
  );
}

export function useTranslation(): { t: Vertaling; taal: Taal; setTaal: (taal: Taal) => void } {
  const { taal, setTaal } = useContext(LanguageContext);
  return { t: vertalingen[taal], taal, setTaal };
}
