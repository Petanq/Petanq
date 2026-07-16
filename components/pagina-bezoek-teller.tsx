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
