"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/language-context";
import { Club } from "@/lib/types";
import { ALLE_PROVINCIES, Provincie, vertaalProvincie } from "@/lib/provincies";
import {
  clubActiefZetten,
  clubBewerken,
  clubToevoegen,
  clubVerwijderen,
} from "@/actions/beheer-clubs";

export function ClubManageList({ clubs }: { clubs: Club[] }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [toevoegenOpen, setToevoegenOpen] = useState(false);
  const [bewerkId, setBewerkId] = useState<string | null>(null);
  const [bezig, setBezig] = useState<string | null>(null);

  async function toggleActief(club: Club) {
    setBezig(club.id);
    await clubActiefZetten(club.id, !club.actief);
    setBezig(null);
    router.refresh();
  }

  async function verwijderen(id: string) {
    if (!window.confirm("Weet je zeker dat je deze club wil verwijderen?")) return;
    setBezig(id);
    await clubVerwijderen(id);
    setBezig(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          onClick={() => setToevoegenOpen((v) => !v)}
          className="rounded-md bg-blauw px-4 py-2 text-sm font-bold text-white"
        >
          {t.beheer.nieuweClub}
        </button>
      </div>

      {toevoegenOpen && (
        <ClubFormulier
          onKlaar={() => {
            setToevoegenOpen(false);
            router.refresh();
          }}
          onAnnuleren={() => setToevoegenOpen(false)}
        />
      )}

      <div className="flex flex-col gap-2">
        {clubs.map((club) =>
          bewerkId === club.id ? (
            <ClubFormulier
              key={club.id}
              club={club}
              onKlaar={() => {
                setBewerkId(null);
                router.refresh();
              }}
              onAnnuleren={() => setBewerkId(null)}
            />
          ) : (
            <div
              key={club.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border-[1.5px] border-rand bg-white p-3.5"
            >
              <div>
                <div className="font-bold text-donker">{club.naam}</div>
                <div className="text-sm text-grijs">
                  {club.gemeente}, {vertaalProvincie(club.provincie, "nl")}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    club.actief ? "bg-[#ecfdf5] text-groen" : "bg-[#f1f5f9] text-grijs"
                  }`}
                >
                  {club.actief ? t.beheer.actief : t.beheer.inactief}
                </span>
                <button
                  onClick={() => setBewerkId(club.id)}
                  className="rounded-md border border-rand px-3 py-1.5 text-sm font-semibold text-donker hover:border-blauw-3"
                >
                  {t.beheer.bewerken}
                </button>
                <button
                  onClick={() => toggleActief(club)}
                  disabled={bezig === club.id}
                  className="rounded-md border border-rand px-3 py-1.5 text-sm font-semibold text-donker hover:border-blauw-3 disabled:opacity-60"
                >
                  {club.actief ? t.beheer.deactiveren : t.beheer.activeren}
                </button>
                <button
                  onClick={() => verwijderen(club.id)}
                  disabled={bezig === club.id}
                  className="rounded-md bg-rood px-3 py-1.5 text-sm font-bold text-white disabled:opacity-60"
                >
                  {t.beheer.verwijderen}
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function ClubFormulier({
  club,
  onKlaar,
  onAnnuleren,
}: {
  club?: Club;
  onKlaar: () => void;
  onAnnuleren: () => void;
}) {
  const { t, taal } = useTranslation();
  const [naam, setNaam] = useState(club?.naam ?? "");
  const [gemeente, setGemeente] = useState(club?.gemeente ?? "");
  const [adres, setAdres] = useState(club?.adres ?? "");
  const [provincie, setProvincie] = useState<Provincie | "">(club?.provincie ?? "");
  const [website, setWebsite] = useState(club?.website ?? "");
  const [contactEmail, setContactEmail] = useState(club?.contact_email ?? "");
  const [bezig, setBezig] = useState(false);

  async function opslaan() {
    setBezig(true);
    if (club) {
      await clubBewerken(club.id, {
        naam,
        gemeente,
        provincie: provincie as Provincie,
        adres: adres || null,
        website: website || null,
        contact_email: contactEmail || null,
      });
    } else {
      await clubToevoegen({ naam, gemeente, provincie, adres, website, contact_email: contactEmail });
    }
    setBezig(false);
    onKlaar();
  }

  return (
    <div className="rounded-[10px] border-[1.5px] border-blauw-3 bg-white p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs font-bold text-donker">
          {t.clubForm.naam}
          <input value={naam} onChange={(e) => setNaam(e.target.value)} className="veld-input" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-donker">
          {t.clubForm.gemeente}
          <input value={gemeente} onChange={(e) => setGemeente(e.target.value)} className="veld-input" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-donker">
          {t.clubForm.provincie}
          <select
            value={provincie}
            onChange={(e) => setProvincie(e.target.value as Provincie)}
            className="veld-input"
          >
            <option value="" disabled>
              {t.form.kiesProvincie}
            </option>
            {ALLE_PROVINCIES.map((p) => (
              <option key={p} value={p}>
                {vertaalProvincie(p, taal)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-donker">
          {t.clubForm.adres}
          <input value={adres} onChange={(e) => setAdres(e.target.value)} className="veld-input" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-donker">
          {t.clubForm.website}
          <input value={website} onChange={(e) => setWebsite(e.target.value)} className="veld-input" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-donker">
          {t.clubForm.contactEmail}
          <input
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="veld-input"
          />
        </label>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={opslaan}
          disabled={bezig || !naam || !gemeente || !provincie}
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
