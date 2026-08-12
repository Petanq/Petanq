"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/language-context";
import { Idee } from "@/lib/types";
import { ideeIndienen, ideeAfgehandeldZetten } from "@/actions/ideeen";

export function IdeeenList({ ideeen, isAdmin = false }: { ideeen: Idee[]; isAdmin?: boolean }) {
  const { t, taal } = useTranslation();
  const router = useRouter();
  const [tekst, setTekst] = useState("");
  const [bezig, setBezig] = useState(false);
  const [bezigId, setBezigId] = useState<string | null>(null);
  const [melding, setMelding] = useState<string | null>(null);

  function toonMelding(bericht: string) {
    setMelding(bericht);
    setTimeout(() => setMelding(null), 3000);
  }

  async function versturen() {
    if (!tekst.trim()) return;
    setBezig(true);
    const resultaat = await ideeIndienen(tekst);
    setBezig(false);
    if (resultaat.succes) {
      setTekst("");
      toonMelding(t.beheer.ideeVerstuurdMelding);
      router.refresh();
    }
  }

  async function toggleAfgehandeld(idee: Idee) {
    setBezigId(idee.id);
    await ideeAfgehandeldZetten(idee.id, !idee.afgehandeld);
    setBezigId(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      {melding && (
        <div className="fixed right-6 top-6 z-50 rounded-md bg-groen px-4 py-2.5 text-sm font-bold text-white shadow-lg">
          {melding}
        </div>
      )}

      <div className="rounded-[10px] border-[1.5px] border-blauw-3 bg-white p-4">
        <label className="text-xs font-bold text-donker">{t.beheer.jouwIdee}</label>
        <textarea
          rows={3}
          value={tekst}
          onChange={(e) => setTekst(e.target.value)}
          placeholder={t.beheer.ideePlaceholder}
          className="veld-input mt-1.5 resize-none"
        />
        <button
          onClick={versturen}
          disabled={bezig || !tekst.trim()}
          className="mt-3 rounded-md bg-blauw px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-blauw-2 hover:shadow-md active:scale-[0.97] disabled:opacity-60 disabled:active:scale-100"
        >
          {t.beheer.ideeVersturen}
        </button>
      </div>

      {ideeen.length === 0 ? (
        <p className="rounded-lg border border-rand bg-white p-6 text-center text-sm text-grijs">
          {t.beheer.geenIdeeen}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {ideeen.map((idee) => (
            <div
              key={idee.id}
              className={`rounded-[10px] border-[1.5px] bg-white p-4 ${
                idee.afgehandeld ? "border-rand opacity-60" : "border-geel/60"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-donker">{idee.tekst}</p>
                  <p className="mt-1 text-xs text-grijs">
                    {t.beheer.ideeDoorNaam(idee.moderator_naam)} ·{" "}
                    {new Date(idee.aangemaakt_op).toLocaleDateString(taal === "fr" ? "fr-BE" : "nl-BE")}
                  </p>
                </div>
                <span
                  className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    idee.afgehandeld ? "bg-[#ecfdf5] text-groen" : "bg-[#fdf3d9] text-[#b8860b]"
                  }`}
                >
                  {idee.afgehandeld ? t.beheer.ideeAfgehandeld : t.beheer.ideeNietAfgehandeld}
                </span>
              </div>
              {isAdmin && (
                <button
                  onClick={() => toggleAfgehandeld(idee)}
                  disabled={bezigId === idee.id}
                  className="mt-3 whitespace-nowrap rounded-md border border-rand px-3 py-1.5 text-sm font-semibold text-donker transition-all hover:border-blauw-3 hover:bg-licht active:scale-[0.97] disabled:opacity-60"
                >
                  {idee.afgehandeld ? t.beheer.ideeMarkerenNietAfgehandeld : t.beheer.ideeMarkerenAfgehandeld}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
