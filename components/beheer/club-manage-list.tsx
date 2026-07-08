"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/language-context";
import { Club } from "@/lib/types";
import { ALLE_PROVINCIES, Provincie, vertaalProvincie } from "@/lib/provincies";
import { uploadClubFoto } from "@/lib/upload-club-foto";
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

  const wachtend = clubs.filter((c) => !c.actief);
  const overige = clubs.filter((c) => c.actief);

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

  function renderClub(club: Club) {
    return bewerkId === club.id ? (
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
        className={`flex flex-wrap items-center justify-between gap-3 rounded-[10px] border-[1.5px] bg-white p-3.5 ${
          club.actief ? "border-rand" : "border-geel"
        }`}
      >
        <div className="flex items-center gap-3">
          {club.foto_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={club.foto_url}
              alt=""
              className="h-11 w-11 shrink-0 rounded-full border border-rand object-cover"
            />
          )}
          <div>
            <div className="font-bold text-donker">{club.naam}</div>
            <div className="text-sm text-grijs">
              {club.gemeente}, {vertaalProvincie(club.provincie, "nl")}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
              club.actief ? "bg-[#ecfdf5] text-groen" : "bg-[#fffbeb] text-[#b45309]"
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
            className={`rounded-md px-3 py-1.5 text-sm font-semibold disabled:opacity-60 ${
              club.actief
                ? "border border-rand text-donker hover:border-blauw-3"
                : "bg-groen text-white"
            }`}
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
    );
  }

  return (
    <div className="flex flex-col gap-6">
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
        <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-widest text-donker">
          {t.beheer.nieuweClubaanvragen}
          {wachtend.length > 0 && (
            <span className="rounded-full bg-rood px-2 py-0.5 text-xs font-bold text-white">
              {wachtend.length}
            </span>
          )}
        </h2>
        {wachtend.length === 0 ? (
          <p className="text-sm text-grijs">{t.beheer.geenNieuweClubaanvragen}</p>
        ) : (
          <div className="flex flex-col gap-2">{wachtend.map(renderClub)}</div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-extrabold uppercase tracking-widest text-donker">
          {t.beheer.alleClubs}
        </h2>
        <div className="flex flex-col gap-2">{overige.map(renderClub)}</div>
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
  const [fotoUrl, setFotoUrl] = useState(club?.foto_url ?? null);
  const [fotoBezig, setFotoBezig] = useState(false);
  const [fotoFout, setFotoFout] = useState(false);
  const [bezig, setBezig] = useState(false);

  async function fotoGekozen(bestand: File | null) {
    if (!bestand) return;
    setFotoBezig(true);
    setFotoFout(false);
    const url = await uploadClubFoto(bestand);
    if (url) {
      setFotoUrl(url);
    } else {
      setFotoFout(true);
    }
    setFotoBezig(false);
  }

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
        foto_url: fotoUrl,
      });
    } else {
      await clubToevoegen({
        naam,
        gemeente,
        provincie,
        adres,
        website,
        contact_email: contactEmail,
        foto_url: fotoUrl,
      });
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

      <div className="mt-3 flex flex-col gap-1.5">
        <span className="text-xs font-bold text-donker">{t.clubForm.foto}</span>
        {fotoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={fotoUrl} alt="" className="mb-1 h-24 w-24 rounded-full border border-rand object-cover" />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => fotoGekozen(e.target.files?.[0] ?? null)}
          className="text-sm text-grijs file:mr-3 file:rounded-md file:border-0 file:bg-blauw file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-blauw-2"
        />
        <p className="text-xs text-grijs">{t.clubForm.fotoHint}</p>
        {fotoBezig && <p className="text-xs text-grijs">{t.form.afficheUploaden}</p>}
        {fotoFout && <p className="text-xs font-semibold text-rood-2">{t.clubForm.fotoFout}</p>}
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
