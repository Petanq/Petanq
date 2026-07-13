"use client";

import { useEffect } from "react";
import { registreerBezoek } from "@/actions/bezoeken";

const SESSIE_SLEUTEL = "p13_bezoek_geteld";

export function BezoekTeller() {
  useEffect(() => {
    if (sessionStorage.getItem(SESSIE_SLEUTEL)) return;
    sessionStorage.setItem(SESSIE_SLEUTEL, "1");
    registreerBezoek();
  }, []);

  return null;
}
