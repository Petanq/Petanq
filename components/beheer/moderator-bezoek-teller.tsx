"use client";

import { useEffect } from "react";
import { registreerBeheerBezoek } from "@/actions/beheer-moderatoren";

// Telt 1x per browsersessie dat een vrijwilliger het beheerpaneel bezoekt,
// ongeacht of ze net moesten inloggen of al een geldige sessie hadden.
export function ModeratorBezoekTeller() {
  useEffect(() => {
    const sleutel = "p13_beheer_bezoek_geteld";
    if (sessionStorage.getItem(sleutel)) return;
    sessionStorage.setItem(sleutel, "1");
    registreerBeheerBezoek();
  }, []);

  return null;
}
