"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/language-context";
import { maandVolledig } from "@/lib/datum";
import { Confetti } from "./confetti";

const MIJLPALEN = [10, 25, 50, 75, 100, 150, 200, 300, 500, 750, 1000];

export function VrijwilligerWelkom({
  naam,
  aangemaaktOp,
  eigenAantal,
  vrijwilligerVanDeMaand,
}: {
  naam: string;
  aangemaaktOp: string;
  eigenAantal: number;
  vrijwilligerVanDeMaand: { naam: string; aantal: number } | null;
}) {
  const { t, taal } = useTranslation();
  const isMijlpaal = MIJLPALEN.includes(eigenAantal);
  const [toonConfetti, setToonConfetti] = useState(false);

  useEffect(() => {
    if (!isMijlpaal) return;
    const sleutel = `p13_mijlpaal_${naam}_${eigenAantal}`;
    if (sessionStorage.getItem(sleutel)) return;
    sessionStorage.setItem(sleutel, "1");
    setToonConfetti(true);
    const timer = setTimeout(() => setToonConfetti(false), 3500);
    return () => clearTimeout(timer);
  }, [isMijlpaal, naam, eigenAantal]);

  const sindsDatum = new Date(aangemaaktOp);
  const sindsTekst = `${maandVolledig(sindsDatum.getMonth(), taal)} ${sindsDatum.getFullYear()}`;
  const isZelfVanDeMaand = vrijwilligerVanDeMaand?.naam === naam;

  return (
    <div className="mb-4 rounded-[10px] border-[1.5px] border-geel/60 bg-[#fdf3d9] p-4">
      {toonConfetti && <Confetti />}
      <p className="text-sm font-semibold text-donker">
        {isMijlpaal
          ? t.beheer.mijlpaalBericht(eigenAantal, naam)
          : t.beheer.persoonlijkBedankje(naam, eigenAantal)}
      </p>
      <p className="mt-1 text-xs text-[#92742a]">{t.beheer.vrijwilligerSinds(sindsTekst)}</p>
      {vrijwilligerVanDeMaand && vrijwilligerVanDeMaand.aantal > 0 && (
        <p className="mt-2 border-t border-geel/40 pt-2 text-xs font-semibold text-[#b8860b]">
          🏆{" "}
          {isZelfVanDeMaand
            ? t.beheer.vrijwilligerVanDeMaandZelf(vrijwilligerVanDeMaand.aantal)
            : t.beheer.vrijwilligerVanDeMaand(vrijwilligerVanDeMaand.naam, vrijwilligerVanDeMaand.aantal)}
        </p>
      )}
    </div>
  );
}
