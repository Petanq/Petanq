"use client";

import { useSyncExternalStore } from "react";
import { afstandKm, clubPositie, laadPostcodes, PostcodeIndex } from "./postcodes";
import type { Club } from "./types";

// "Mijn plaats": waar de bezoeker zit, om bij elk tornooi de afstand te tonen.
// Enkel bewaard op het eigen toestel (localStorage), nooit naar de server gestuurd.

export type MijnPlaats = { label: string | null; lat: number; lng: number };

type Staat = { plaats: MijnPlaats | null; index: PostcodeIndex | null };

const SLEUTEL = "p13-mijn-plaats";
const LEEG: Staat = { plaats: null, index: null };

let staat: Staat = LEEG;
let gestart = false;
const luisteraars = new Set<() => void>();

function melden() {
  luisteraars.forEach((l) => l());
}

function leesOpslag(): MijnPlaats | null {
  try {
    const ruw = window.localStorage.getItem(SLEUTEL);
    if (!ruw) return null;
    const p = JSON.parse(ruw);
    if (typeof p?.lat !== "number" || typeof p?.lng !== "number") return null;
    return { label: typeof p.label === "string" ? p.label : null, lat: p.lat, lng: p.lng };
  } catch {
    return null;
  }
}

// De postcodelijst is zwaar: pas laden als er echt een plaats is ingesteld
// (nodig voor tornooien zonder eigen coördinaten).
function laadIndex() {
  if (staat.index) return;
  laadPostcodes().then((index) => {
    staat = { ...staat, index };
    melden();
  });
}

function start() {
  if (gestart || typeof window === "undefined") return;
  gestart = true;
  const plaats = leesOpslag();
  if (plaats) {
    staat = { ...staat, plaats };
    laadIndex();
    melden();
  }
  window.addEventListener("storage", (e) => {
    if (e.key !== SLEUTEL) return;
    staat = { ...staat, plaats: leesOpslag() };
    if (staat.plaats) laadIndex();
    melden();
  });
}

export function zetMijnPlaats(plaats: MijnPlaats | null) {
  staat = { ...staat, plaats };
  try {
    if (plaats) window.localStorage.setItem(SLEUTEL, JSON.stringify(plaats));
    else window.localStorage.removeItem(SLEUTEL);
  } catch {
    // Privévenster of opslag geblokkeerd: werkt dan enkel tot de pagina sluit.
  }
  if (plaats) laadIndex();
  melden();
}

function subscribe(l: () => void) {
  start();
  luisteraars.add(l);
  return () => {
    luisteraars.delete(l);
  };
}

function momentopname() {
  return staat;
}

function serverMomentopname() {
  return LEEG;
}

export function useMijnPlaatsStaat(): Staat {
  return useSyncExternalStore(subscribe, momentopname, serverMomentopname);
}

type MetPositie = Pick<Club, "lat" | "lng" | "adres" | "gemeente">;

// Afstand in vogelvlucht (km) van de gekozen plaats naar een tornooi, of null
// als er geen plaats gekozen is of het tornooi niet te situeren valt.
export function afstandTot(s: Staat, item: MetPositie): number | null {
  if (!s.plaats) return null;
  let pos: { lat: number; lng: number } | null = null;
  if (item.lat != null && item.lng != null) pos = { lat: item.lat, lng: item.lng };
  else if (s.index) pos = clubPositie(s.index, item);
  return pos ? afstandKm(s.plaats.lat, s.plaats.lng, pos.lat, pos.lng) : null;
}

export function useAfstandTot(item: MetPositie): number | null {
  return afstandTot(useMijnPlaatsStaat(), item);
}
