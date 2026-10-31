"use client";

import { usePathname } from "next/navigation";
import { BeheerKaderRooster } from "@/components/logo-of-beheer";

// Navigatie binnen het beheer: dezelfde gouden kaders als de beheerband
// bovenaan de gewone pagina's, met het geopende onderdeel in het geel.
export function BeheerNav({
  wachtendeToernooien = 0,
  wachtendeClubs = 0,
  wachtendeVerwijderaanvragen = 0,
  isAdmin = false,
  heeftMatch13Toegang = false,
}: {
  wachtendeToernooien?: number;
  wachtendeClubs?: number;
  wachtendeVerwijderaanvragen?: number;
  isAdmin?: boolean;
  heeftMatch13Toegang?: boolean;
}) {
  const pathname = usePathname();

  return (
    <div className="border-b-4 border-geel bg-[#161616] px-4 py-4 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1140px]">
        <BeheerKaderRooster
          actiefHref={pathname}
          status={{
            moderator: true,
            admin: isAdmin,
            match13: heeftMatch13Toegang,
            inBehandeling: wachtendeToernooien,
            wachtendeClubs,
            verwijderaanvragen: wachtendeVerwijderaanvragen,
          }}
        />
      </div>
    </div>
  );
}
