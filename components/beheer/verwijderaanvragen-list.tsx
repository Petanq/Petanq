"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/language-context";
import { Toernooi, Club } from "@/lib/types";
import { vertaalProvincie } from "@/lib/provincies";
import { formatDatumKort, formatUur } from "@/lib/datum";
import {
  toernooiVerwijderen,
  toernooiVerwijderAanvraagAfwijzen,
} from "@/actions/beheer-toernooien";
import { clubVerwijderen, clubVerwijderAanvraagAfwijzen } from "@/actions/beheer-clubs";

export function VerwijderaanvragenList({
  toernooien,
  clubs,
}: {
  toernooien: Toernooi[];
  clubs: Club[];
}) {
  const { t, taal } = useTranslation();
  const router = useRouter();
  const [bezigId, setBezigId] = useState<string | null>(null);

  async function toernooiBevestigen(id: string) {
    setBezigId(id);
    await toernooiVerwijderen(id);
    setBezigId(null);
    router.refresh();
  }

  async function toernooiAfwijzen(id: string) {
    setBezigId(id);
    await toernooiVerwijderAanvraagAfwijzen(id);
    setBezigId(null);
    router.refresh();
  }

  async function clubBevestigen(id: string) {
    setBezigId(id);
    await clubVerwijderen(id);
    setBezigId(null);
    router.refresh();
  }

  async function clubAfwijzen(id: string) {
    setBezigId(id);
    await clubVerwijderAanvraagAfwijzen(id);
    setBezigId(null);
    router.refresh();
  }

  if (toernooien.length === 0 && clubs.length === 0) {
    return (
      <p className="rounded-lg border border-rand bg-white p-6 text-center text-sm text-grijs">
        {t.beheer.geenVerwijderaanvragen}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {toernooien.map((tn) => (
        <div key={tn.id} className="rounded-[10px] border-[1.5px] border-rood-2/40 bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-blauw-2">{tn.clubnaam}</div>
              <div className="font-bold text-donker">{tn.naam_nl}</div>
              <div className="text-sm text-grijs">
                {formatDatumKort(tn.datum)} · {formatUur(tn.uur)} · {tn.gemeente},{" "}
                {vertaalProvincie(tn.provincie, taal)}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => toernooiBevestigen(tn.id)}
                disabled={bezigId === tn.id}
                className="whitespace-nowrap rounded-md bg-rood px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-rood-2 hover:shadow-md active:scale-[0.97] disabled:opacity-60 disabled:active:scale-100"
              >
                {t.beheer.verwijderingBevestigen}
              </button>
              <button
                onClick={() => toernooiAfwijzen(tn.id)}
                disabled={bezigId === tn.id}
                className="whitespace-nowrap rounded-md border border-rand px-4 py-2 text-sm font-semibold text-donker transition-all hover:border-blauw-3 hover:bg-licht active:scale-[0.97]"
              >
                {t.beheer.verwijderingAfwijzen}
              </button>
            </div>
          </div>
          <div className="mt-3 border-t border-rand pt-3 text-sm">
            <p className="font-semibold text-donker">
              {t.beheer.aanvraagVanLabel(tn.verwijder_aanvraag_door ?? "?")}
            </p>
            <p className="mt-0.5 text-grijs">
              {t.beheer.redenLabel}: {tn.verwijder_aanvraag_reden}
            </p>
          </div>
        </div>
      ))}

      {clubs.map((club) => (
        <div key={club.id} className="rounded-[10px] border-[1.5px] border-rood-2/40 bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="font-bold text-donker">{club.naam}</div>
              <div className="text-sm text-grijs">
                {club.gemeente}, {vertaalProvincie(club.provincie, taal)}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => clubBevestigen(club.id)}
                disabled={bezigId === club.id}
                className="whitespace-nowrap rounded-md bg-rood px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-rood-2 hover:shadow-md active:scale-[0.97] disabled:opacity-60 disabled:active:scale-100"
              >
                {t.beheer.verwijderingBevestigen}
              </button>
              <button
                onClick={() => clubAfwijzen(club.id)}
                disabled={bezigId === club.id}
                className="whitespace-nowrap rounded-md border border-rand px-4 py-2 text-sm font-semibold text-donker transition-all hover:border-blauw-3 hover:bg-licht active:scale-[0.97]"
              >
                {t.beheer.verwijderingAfwijzen}
              </button>
            </div>
          </div>
          <div className="mt-3 border-t border-rand pt-3 text-sm">
            <p className="font-semibold text-donker">
              {t.beheer.aanvraagVanLabel(club.verwijder_aanvraag_door ?? "?")}
            </p>
            <p className="mt-0.5 text-grijs">
              {t.beheer.redenLabel}: {club.verwijder_aanvraag_reden}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
