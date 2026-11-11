"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ClubUren } from "@/lib/club-beheer/uren";
import { ClubUrenKnop, type VandaagMelding } from "@/components/club-beheer/ClubUrenKnop";

export interface ClubBeheerData {
  uren: Record<string, ClubUren>;
  vandaag: Record<string, VandaagMelding>;
}

const LeegData: ClubBeheerData = { uren: {}, vandaag: {} };
const ClubBeheerContext = createContext<ClubBeheerData>(LeegData);

// Een pagina die clubkaartjes toont, geeft hier de uren en meldingen van alle clubs mee.
// Zonder provider (of zonder gegevens voor een club) verschijnt er gewoon geen uren-knop.
export function ClubBeheerProvider({ data, children }: { data: ClubBeheerData; children: ReactNode }) {
  return <ClubBeheerContext.Provider value={data}>{children}</ClubBeheerContext.Provider>;
}

// De uren die nu online staan voor een club (of null), bv. om ze in een formulier voor te vullen.
export function useClubUren(clubId: string): ClubUren | null {
  return useContext(ClubBeheerContext).uren[clubId] ?? null;
}

export function ClubUrenVoorClub({ clubId }: { clubId: string }) {
  const data = useContext(ClubBeheerContext);
  const uren = data.uren[clubId] ?? null;
  const vandaag = data.vandaag[clubId] ?? null;
  if (!uren && !vandaag) return null;
  return <ClubUrenKnop uren={uren} vandaag={vandaag} />;
}
