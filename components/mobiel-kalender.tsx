"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

// Op gsm (onder md) blijft de tornooienlijst op de homepage dicht tot de
// bezoeker op "Tornooien" tikt (of via #toernooien/#kalender binnenkomt) —
// zo staat er geen enkel tornooi bovenaan en scrol je rustig door de hero.
// Op pc is de lijst altijd zichtbaar: daar doet dit niets.
type KalenderContext = { open: boolean; toon: () => void };

// Het Tornooien-kader opent de lijst meteen in kalenderweergave.
export const TOON_KALENDER_EVENT = "p13-toon-kalender";

const Context = createContext<KalenderContext>({ open: true, toon: () => {} });

export function useMobielKalender() {
  return useContext(Context);
}

export function MobielKalenderProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [scrollNaarLijst, setScrollNaarLijst] = useState(false);

  const toon = useCallback(() => {
    setOpen(true);
    setScrollNaarLijst(true);
    window.dispatchEvent(new Event(TOON_KALENDER_EVENT));
  }, []);

  useEffect(() => {
    function checkHash() {
      if (window.location.hash === "#toernooien" || window.location.hash === "#kalender") setOpen(true);
    }
    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, []);

  useEffect(() => {
    if (!open || !scrollNaarLijst) return;
    (document.getElementById("toernooien-weergave") ?? document.getElementById("toernooien"))?.scrollIntoView({
      behavior: "smooth",
    });
    setScrollNaarLijst(false);
  }, [open, scrollNaarLijst]);

  return <Context.Provider value={{ open, toon }}>{children}</Context.Provider>;
}

export function MobielKalenderPoort({ children }: { children: ReactNode }) {
  const { open } = useMobielKalender();
  return <div className={open ? undefined : "max-md:hidden"}>{children}</div>;
}
