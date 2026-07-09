"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/language-context";
import { Moderator } from "@/lib/types";
import { ALLE_PROVINCIES, Provincie, vertaalProvincie } from "@/lib/provincies";
import { moderatorBewerken, moderatorVerwijderen } from "@/actions/beheer-moderatoren";

export function ModeratorManageList({
  moderatoren,
  huidigUserId,
  isAdmin,
}: {
  moderatoren: Moderator[];
  huidigUserId: string | null;
  isAdmin: boolean;
}) {
  const { t, taal } = useTranslation();
  const router = useRouter();
  const [bewerkId, setBewerkId] = useState<string | null>(null);
  const [bezig, setBezig] = useState<string | null>(null);

  async function verwijderen(mod: Moderator) {
    if (!window.confirm(`${t.beheer.verwijderenBevestiging} ${mod.naam}?`)) return;
    setBezig(mod.id);
    await moderatorVerwijderen(mod.id);
    setBezig(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {!isAdmin && <p className="text-sm text-grijs">{t.beheer.enkelEigenGegevens}</p>}

      <div className="flex flex-col gap-2">
        {moderatoren.map((mod) =>
          bewerkId === mod.id ? (
            <ModeratorFormulier
              key={mod.id}
              moderator={mod}
              onKlaar={() => {
                setBewerkId(null);
                router.refresh();
              }}
              onAnnuleren={() => setBewerkId(null)}
            />
          ) : (
            <div
              key={mod.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border-[1.5px] border-rand bg-white p-3.5"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-donker">{mod.naam}</span>
                  {mod.user_id === huidigUserId && (
                    <span className="rounded-full bg-[#eff6ff] px-2 py-0.5 text-[0.65rem] font-bold text-blauw-2">
                      {t.beheer.jijzelf}
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide ${
                      mod.rol === "admin" ? "bg-[#fef3c7] text-[#92400e]" : "bg-[#f1f5f9] text-[#475569]"
                    }`}
                  >
                    {mod.rol === "admin" ? t.beheer.rolAdmin : t.beheer.rolModerator}
                  </span>
                </div>
                <div className="text-sm text-grijs">
                  {mod.email}
                  {mod.provincie && <> · {vertaalProvincie(mod.provincie, taal)}</>}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setBewerkId(mod.id)}
                  className="rounded-md border border-rand px-3 py-1.5 text-sm font-semibold text-donker hover:border-blauw-3"
                >
                  {t.beheer.bewerken}
                </button>
                {isAdmin && (
                  <button
                    onClick={() => verwijderen(mod)}
                    disabled={bezig === mod.id}
                    className="rounded-md bg-rood px-3 py-1.5 text-sm font-bold text-white disabled:opacity-60"
                  >
                    {t.beheer.verwijderen}
                  </button>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function ModeratorFormulier({
  moderator,
  onKlaar,
  onAnnuleren,
}: {
  moderator: Moderator;
  onKlaar: () => void;
  onAnnuleren: () => void;
}) {
  const { t, taal } = useTranslation();
  const [naam, setNaam] = useState(moderator.naam);
  const [provincie, setProvincie] = useState<Provincie | "">(moderator.provincie ?? "");
  const [bezig, setBezig] = useState(false);

  async function opslaan() {
    setBezig(true);
    await moderatorBewerken(moderator.id, { naam, provincie: provincie || null });
    setBezig(false);
    onKlaar();
  }

  return (
    <div className="rounded-[10px] border-[1.5px] border-blauw-3 bg-white p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs font-bold text-donker">
          {t.beheer.naam}
          <input value={naam} onChange={(e) => setNaam(e.target.value)} className="veld-input" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-donker">
          {t.clubForm.provincie} ({t.form.optioneel})
          <select
            value={provincie}
            onChange={(e) => setProvincie(e.target.value as Provincie)}
            className="veld-input"
          >
            <option value="">{t.beheer.geenProvincie}</option>
            {ALLE_PROVINCIES.map((p) => (
              <option key={p} value={p}>
                {vertaalProvincie(p, taal)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={opslaan}
          disabled={bezig || !naam}
          className="rounded-md bg-blauw px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
        >
          {t.beheer.opslaan}
        </button>
        <button
          onClick={onAnnuleren}
          className="rounded-md border border-rand px-4 py-2 text-sm font-semibold text-donker"
        >
          {t.beheer.annuleren}
        </button>
      </div>
    </div>
  );
}
