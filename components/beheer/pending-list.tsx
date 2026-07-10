"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/language-context";
import { Toernooi } from "@/lib/types";
import { vertaalProvincie } from "@/lib/provincies";
import { formatUur } from "@/lib/datum";
import { toernooiGoedkeuren, toernooiWeigeren } from "@/actions/beheer-toernooien";

export function PendingList({ toernooien }: { toernooien: Toernooi[] }) {
  const { t, taal } = useTranslation();
  const router = useRouter();
  const [weigerId, setWeigerId] = useState<string | null>(null);
  const [reden, setReden] = useState("");
  const [bezigId, setBezigId] = useState<string | null>(null);

  async function goedkeuren(id: string) {
    setBezigId(id);
    await toernooiGoedkeuren(id);
    setBezigId(null);
    router.refresh();
  }

  async function weigerenBevestigen() {
    if (!weigerId) return;
    setBezigId(weigerId);
    await toernooiWeigeren(weigerId, reden || null);
    setBezigId(null);
    setWeigerId(null);
    setReden("");
    router.refresh();
  }

  if (toernooien.length === 0) {
    return (
      <p className="rounded-lg border border-rand bg-white p-6 text-center text-sm text-grijs">
        {t.beheer.geenInBehandeling}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {toernooien.map((tn) => (
        <div key={tn.id} className="rounded-[10px] border-[1.5px] border-rand bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-blauw-2">{tn.clubnaam}</div>
              <div className="font-bold text-donker">{tn.naam_nl}</div>
              <div className="text-sm text-grijs">
                {tn.datum} · {formatUur(tn.uur)} · {tn.gemeente}, {vertaalProvincie(tn.provincie, taal)}
              </div>
              <div className="mt-1 text-xs text-grijs">{tn.contact_email}</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => goedkeuren(tn.id)}
                disabled={bezigId === tn.id}
                className="rounded-md bg-groen px-4 py-2 text-sm font-bold text-white transition-opacity disabled:opacity-60"
              >
                {t.beheer.goedkeuren}
              </button>
              <button
                onClick={() => setWeigerId(tn.id)}
                disabled={bezigId === tn.id}
                className="rounded-md bg-rood px-4 py-2 text-sm font-bold text-white transition-opacity disabled:opacity-60"
              >
                {t.beheer.weigeren}
              </button>
            </div>
          </div>

          {weigerId === tn.id && (
            <div className="mt-3 flex flex-col gap-2 border-t border-rand pt-3">
              <label className="text-xs font-bold text-donker">{t.beheer.commentaarWeigering}</label>
              <div className="flex flex-wrap gap-1.5">
                {[t.beheer.redenOnvolledig, t.beheer.redenDubbel, t.beheer.redenVerkeerdeCategorie].map(
                  (snelReden) => (
                    <button
                      key={snelReden}
                      type="button"
                      onClick={() => setReden(snelReden)}
                      className="rounded-full border border-rand px-3 py-1 text-xs font-semibold text-grijs hover:border-blauw-3 hover:text-donker"
                    >
                      {snelReden}
                    </button>
                  )
                )}
              </div>
              <textarea
                rows={2}
                value={reden}
                onChange={(e) => setReden(e.target.value)}
                className="veld-input resize-none"
              />
              {!reden.trim() && <p className="text-xs text-grijs">{t.beheer.redenVerplicht}</p>}
              <div className="flex gap-2">
                <button
                  onClick={weigerenBevestigen}
                  disabled={bezigId === tn.id || !reden.trim()}
                  className="rounded-md bg-rood px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                >
                  {t.beheer.bevestigen}
                </button>
                <button
                  onClick={() => setWeigerId(null)}
                  className="rounded-md border border-rand px-4 py-2 text-sm font-semibold text-donker"
                >
                  {t.beheer.annuleren}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
