"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Taal, Vertaling, vertalingen } from "./i18n";

const OPSLAG_SLEUTEL = "le-bouliste-taal";

type LanguageContextType = {
  taal: Taal;
  setTaal: (taal: Taal) => void;
};

const LanguageContext = createContext<LanguageContextType>({
  taal: "nl",
  setTaal: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [taal, setTaalState] = useState<Taal>("nl");

  useEffect(() => {
    const opgeslagen = window.localStorage.getItem(OPSLAG_SLEUTEL);
    if (opgeslagen === "nl" || opgeslagen === "fr") {
      setTaalState(opgeslagen);
    }
  }, []);

  function setTaal(nieuweTaal: Taal) {
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
