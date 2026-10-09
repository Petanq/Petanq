"use client";

import { useEffect } from "react";
import { registreerPaginaBezoek } from "@/actions/pagina-bezoeken";

export function PaginaBezoekTeller({ pad }: { pad: string }) {
  useEffect(() => {
    const sessieSleutel = `p13_pagina_bezoek_${pad}`;
    if (sessionStorage.getItem(sessieSleutel)) return;
    sessionStorage.setItem(sessieSleutel, "1");
    registreerPaginaBezoek(pad);
  }, [pad]);

  return null;
}

// Telt een klik (bv. op een knop of externe link), één keer per bezoek.
export function telDoorklik(pad: string) {
  try {
    const sleutel = `p13_doorklik_${pad}`;
    if (sessionStorage.getItem(sleutel)) return;
    sessionStorage.setItem(sleutel, "1");
  } catch {}
  registreerPaginaBezoek(pad);
}
