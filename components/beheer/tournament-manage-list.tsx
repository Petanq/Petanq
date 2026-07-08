"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/language-context";
import { Categorie, Formule, Speelvorm, Toernooi } from "@/lib/types";
import { ALLE_PROVINCIES, Provincie, vertaalProvincie } from "@/lib/provincies";
import { formatUur } from "@/lib/datum";
import { toernooiBewerken, toernooiVerwijderen } from "@/actions/beheer-toernooien";
import { uploadAffiche } from "@/lib/upload-affiche";

const CATEGORIEEN: Categorie[] = ["heren", "dames", "mix", "jeugd", "kampioenschap", "circuit"];
const FORMULES: Formule[] = [
  "tete-a-tete",
  "doublette",
  "triplette",
  "sextet",
  "quartet",
  "kwintet",
  "kleurentornooi",
];

export function TournamentManageList({ toernooien }: { toernooien: Toernooi[] }) {
  const { t, taal } = useTranslation();
  const router = useRouter();
  const [bewerkId, setBewerkId] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);

  async function verwijderen(id: string) {
    if (!window.confirm("Weet je zeker dat je dit toernooi wil verwijderen?")) return;
    setBezig(true);
    await toernooiVerwijderen(id);
    setBezig(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      {toernooien.map((tn) =>
        bewerkId === tn.id ? (
          <EditForm
            key={tn.id}
            toernooi={tn}
            onKlaar={() => {
              setBewerkId(null);
              router.refresh();
            }}
            onAnnuleren={() => setBewerkId(null)}
          />
        ) : (
          <div key={tn.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border-[1.5px] border-rand bg-white p-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-blauw-2">{tn.clubnaam}</div>
              <div className="font-bold text-donker">{tn.naam_nl}</div>
              <div className="text-sm text-grijs">
                {tn.datum} · {formatUur(tn.uur)} · {tn.gemeente}, {vertaalProvincie(tn.provincie, taal)}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setBewerkId(tn.id)}
                className="rounded-md border border-rand px-4 py-2 text-sm font-semibold text-donker hover:border-blauw-3"
              >
                {t.beheer.bewerken}
              </button>
              <button
                onClick={() => verwijderen(tn.id)}
                disabled={bezig}
                className="rounded-md bg-rood px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
              >
                {t.beheer.verwijderen}
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}

function EditForm({
  toernooi,
  onKlaar,
  onAnnuleren,
}: {
  toernooi: Toernooi;
  onKlaar: () => void;
  onAnnuleren: () => void;
}) {
  const { t, taal } = useTranslation();
  const [naamNl, setNaamNl] = useState(toernooi.naam_nl);
  const [naamFr, setNaamFr] = useState(toernooi.naam_fr);
  const [datum, setDatum] = useState(toernooi.datum);
  const [uur, setUur] = useState(toernooi.uur);
  const [gemeente, setGemeente] = useState(toernooi.gemeente);
  const [provincie, setProvincie] = useState<Provincie>(toernooi.provincie);
  const [categorie, setCategorie] = useState<Categorie>(toernooi.categorie);
  const [formule, setFormule] = useState<Formule>(toernooi.formule);
  const [speelvorm, setSpeelvorm] = useState<Speelvorm>(toernooi.speelvorm ?? "rondes");
  const [aantalRonden, setAantalRonden] = useState(String(toernooi.aantal_ronden ?? ""));
  const [aantalPoules, setAantalPoules] = useState(String(toernooi.aantal_poules ?? ""));
  const [vol, setVol] = useState(toernooi.vol);
  const [afficheUrl, setAfficheUrl] = useState(toernooi.affiche_url);
  const [afficheBezig, setAfficheBezig] = useState(false);
  const [bezig, setBezig] = useState(false);

  async function afficheGekozen(bestand: File | null) {
    if (!bestand) return;
    setAfficheBezig(true);
    const url = await uploadAffiche(bestand);
    if (url) setAfficheUrl(url);
    setAfficheBezig(false);
  }

  async function opslaan() {
    setBezig(true);
    await toernooiBewerken(toernooi.id, {
      naam_nl: naamNl,
      naam_fr: naamFr,
      datum,
      uur,
      gemeente,
      provincie,
      categorie,
      formule,
      speelvorm,
      aantal_ronden: speelvorm === "rondes" ? Number(aantalRonden) || null : null,
      aantal_poules: speelvorm === "poules" ? Number(aantalPoules) || null : null,
      vol,
      affiche_url: afficheUrl,
    });
    setBezig(false);
    onKlaar();
  }

  return (
    <div className="rounded-[10px] border-[1.5px] border-blauw-3 bg-white p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs font-bold text-donker">
          {t.form.naamNl}
          <input value={naamNl} onChange={(e) => setNaamNl(e.target.value)} className="veld-input" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-donker">
          {t.form.naamFr}
          <input value={naamFr} onChange={(e) => setNaamFr(e.target.value)} className="veld-input" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-donker">
          {t.form.datum}
          <input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} className="veld-input" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-donker">
          {t.form.uur}
          <input type="time" value={uur} onChange={(e) => setUur(e.target.value)} className="veld-input" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-donker">
          {t.form.gemeente}
          <input value={gemeente} onChange={(e) => setGemeente(e.target.value)} className="veld-input" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-donker">
          {t.form.provincie}
          <select
            value={provincie}
            onChange={(e) => setProvincie(e.target.value as Provincie)}
            className="veld-input"
          >
            {ALLE_PROVINCIES.map((p) => (
              <option key={p} value={p}>
                {vertaalProvincie(p, taal)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-donker">
          {t.form.categorie}
          <select
            value={categorie}
            onChange={(e) => setCategorie(e.target.value as Categorie)}
            className="veld-input"
          >
            {CATEGORIEEN.map((c) => (
              <option key={c} value={c}>
                {t.categorie[c]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-donker">
          {t.form.formule}
          <select
            value={formule}
            onChange={(e) => setFormule(e.target.value as Formule)}
            className="veld-input"
          >
            {FORMULES.map((f) => (
              <option key={f} value={f}>
                {t.formule[f]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3 flex flex-col gap-1.5">
        <span className="text-xs font-bold text-donker">{t.form.speelvorm}</span>
        <div className="flex gap-2">
          {(["rondes", "poules"] as Speelvorm[]).map((sv) => (
            <button
              key={sv}
              type="button"
              onClick={() => setSpeelvorm(sv)}
              className={`rounded-md border-[1.5px] px-3 py-1.5 text-sm font-semibold transition-colors ${
                speelvorm === sv
                  ? "border-blauw bg-blauw text-white"
                  : "border-rand text-grijs hover:border-blauw-3"
              }`}
            >
              {t.speelvorm[sv]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {speelvorm === "rondes" ? (
          <label className="flex flex-col gap-1 text-xs font-bold text-donker">
            {t.form.aantalRonden}
            <input
              type="number"
              min={1}
              value={aantalRonden}
              onChange={(e) => setAantalRonden(e.target.value)}
              className="veld-input"
            />
          </label>
        ) : (
          <label className="flex flex-col gap-1 text-xs font-bold text-donker">
            {t.form.aantalPoules}
            <input
              type="number"
              min={1}
              value={aantalPoules}
              onChange={(e) => setAantalPoules(e.target.value)}
              className="veld-input"
            />
          </label>
        )}
      </div>

      <label className="mt-3 flex items-center gap-2 text-sm font-medium text-donker">
        <input type="checkbox" checked={vol} onChange={(e) => setVol(e.target.checked)} className="h-4 w-4" />
        {t.form.vol}
      </label>

      <div className="mt-3 flex flex-col gap-1.5">
        <span className="text-xs font-bold text-donker">{t.form.affiche}</span>
        {afficheUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={afficheUrl} alt="" className="mb-1 h-32 w-auto rounded-md border border-rand object-contain" />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => afficheGekozen(e.target.files?.[0] ?? null)}
          className="text-sm text-grijs file:mr-3 file:rounded-md file:border-0 file:bg-blauw file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-blauw-2"
        />
        <p className="text-xs text-grijs">{t.form.afficheHint}</p>
        {afficheBezig && <p className="text-xs text-grijs">{t.form.afficheUploaden}</p>}
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={opslaan}
          disabled={bezig}
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
