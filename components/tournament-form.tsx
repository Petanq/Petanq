"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/language-context";
import { ALLE_PROVINCIES, Provincie, vertaalProvincie } from "@/lib/provincies";
import { Categorie, Formule, Speelvorm } from "@/lib/types";
import { toernooiIndienen } from "@/actions/toernooien";
import { uploadAffiche } from "@/lib/upload-affiche";
import { Knop } from "@/components/ui/knop";

const CATEGORIEEN: Categorie[] = ["heren", "dames", "mix", "jeugd", "kampioenschap", "circuit", "recreanten"];
const FORMULES: Formule[] = [
  "tete-a-tete",
  "doublette",
  "triplette",
  "sextet",
  "quartet",
  "kwintet",
  "kleurentornooi",
];

export function TournamentForm() {
  const { t, taal } = useTranslation();
  const [status, setStatus] = useState<"idle" | "bezig" | "ok" | "fout">("idle");
  const [foutReden, setFoutReden] = useState<string | null>(null);

  const [datum, setDatum] = useState("");
  const [uur, setUur] = useState("");
  const [openToernooi, setOpenToernooi] = useState(false);
  const [clubnaam, setClubnaam] = useState("");
  const [naamNl, setNaamNl] = useState("");
  const [naamFr, setNaamFr] = useState("");
  const [gemeente, setGemeente] = useState("");
  const [provincie, setProvincie] = useState<Provincie | "">("");
  const [categorie, setCategorie] = useState<Categorie | "">("");
  const [formule, setFormule] = useState<Formule | "">("");
  const [speelvorm, setSpeelvorm] = useState<Speelvorm>("rondes");
  const [aantalRonden, setAantalRonden] = useState("4");
  const [aantalPoules, setAantalPoules] = useState("4");
  const [finale, setFinale] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  const [gratis, setGratis] = useState(false);
  const [inschrijvingsprijs, setInschrijvingsprijs] = useState("");
  const [maxPloegen, setMaxPloegen] = useState("");
  const [linkInschrijving, setLinkInschrijving] = useState("");
  const [opmerking, setOpmerking] = useState("");
  const [afficheFile, setAfficheFile] = useState<File | null>(null);
  const [afficheBezig, setAfficheBezig] = useState(false);

  async function versturen(e: React.FormEvent) {
    e.preventDefault();
    setStatus("bezig");

    let afficheUrl: string | null = null;
    if (afficheFile) {
      setAfficheBezig(true);
      afficheUrl = await uploadAffiche(afficheFile);
      setAfficheBezig(false);
    }

    const resultaat = await toernooiIndienen(
      {
        datum,
        uur,
        clubnaam,
        naam_nl: naamNl,
        naam_fr: naamFr,
        gemeente,
        provincie,
        categorie,
        formule,
        speelvorm,
        aantal_ronden: speelvorm === "rondes" ? aantalRonden : null,
        aantal_poules: speelvorm === "poules" ? aantalPoules : null,
        contact_email: contactEmail,
        gratis,
        inschrijvingsprijs: gratis ? null : inschrijvingsprijs || null,
        max_ploegen: maxPloegen || null,
        link_inschrijving: linkInschrijving || null,
        opmerking: opmerking || null,
        affiche_url: afficheUrl || null,
        open_toernooi: openToernooi,
        finale,
      },
      taal
    );
    setFoutReden(resultaat.succes ? null : resultaat.fout);
    setStatus(resultaat.succes ? "ok" : "fout");
  }

  if (status === "ok") {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <p className="mb-6 text-lg font-semibold text-groen">{t.form.verzonden}</p>
        <Link href="/" className="text-blauw-2 underline">
          {t.hero.bekijkAlle}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 lg:px-10">
      <h1 className="mb-2 font-titel text-4xl tracking-wide text-blauw">{t.form.titel}</h1>
      <p className="mb-8 text-sm text-grijs">{t.form.beschrijving}</p>

      <form onSubmit={versturen} className="flex flex-col gap-6">
        <fieldset className="flex flex-col gap-4">
          <legend className="mb-1 text-xs font-extrabold uppercase tracking-widest text-[#94a3b8]">
            {t.form.sectieBasis}
          </legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Veld label={t.form.datum} verplicht>
              <input
                type="date"
                required
                value={datum}
                onChange={(e) => setDatum(e.target.value)}
                className="veld-input"
              />
            </Veld>
            <Veld label={t.form.uur} verplicht>
              <input
                type="time"
                required
                value={uur}
                onChange={(e) => setUur(e.target.value)}
                className="veld-input"
              />
            </Veld>
          </div>
          <Veld label={t.form.tornooiType} verplicht>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOpenToernooi(false)}
                className={`rounded-md border-[1.5px] px-4 py-2 text-sm font-semibold transition-colors ${
                  !openToernooi
                    ? "border-blauw bg-blauw text-white"
                    : "border-rand text-grijs hover:border-blauw-3"
                }`}
              >
                {t.form.officieelToernooi}
              </button>
              <button
                type="button"
                onClick={() => setOpenToernooi(true)}
                className={`rounded-md border-[1.5px] px-4 py-2 text-sm font-semibold transition-colors ${
                  openToernooi
                    ? "border-blauw bg-blauw text-white"
                    : "border-rand text-grijs hover:border-blauw-3"
                }`}
              >
                {t.form.openToernooi}
              </button>
            </div>
          </Veld>
          <Veld label={openToernooi ? t.form.organisator : t.form.clubnaam} verplicht>
            <input
              required
              value={clubnaam}
              onChange={(e) => setClubnaam(e.target.value)}
              className="veld-input"
            />
          </Veld>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Veld label={t.form.naamNl} verplicht>
              <input
                required
                value={naamNl}
                onChange={(e) => setNaamNl(e.target.value)}
                className="veld-input"
              />
            </Veld>
            <Veld label={t.form.naamFr} verplicht>
              <input
                required
                value={naamFr}
                onChange={(e) => setNaamFr(e.target.value)}
                className="veld-input"
              />
            </Veld>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Veld label={t.form.gemeente} verplicht>
              <input
                required
                value={gemeente}
                onChange={(e) => setGemeente(e.target.value)}
                className="veld-input"
              />
            </Veld>
            <Veld label={t.form.provincie} verplicht>
              <select
                required
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
            </Veld>
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-1 text-xs font-extrabold uppercase tracking-widest text-[#94a3b8]">
            {t.form.sectieDetails}
          </legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Veld label={t.form.categorie} verplicht>
              <select
                required
                value={categorie}
                onChange={(e) => setCategorie(e.target.value as Categorie)}
                className="veld-input"
              >
                <option value="" disabled>
                  {t.form.kiesCategorie}
                </option>
                {CATEGORIEEN.map((c) => (
                  <option key={c} value={c}>
                    {t.categorie[c]}
                  </option>
                ))}
              </select>
            </Veld>
            <Veld label={t.form.formule} verplicht>
              <select
                required
                value={formule}
                onChange={(e) => setFormule(e.target.value as Formule)}
                className="veld-input"
              >
                <option value="" disabled>
                  {t.form.kiesFormule}
                </option>
                {FORMULES.map((f) => (
                  <option key={f} value={f}>
                    {t.formule[f]}
                  </option>
                ))}
              </select>
            </Veld>
          </div>
          <Veld label={t.form.speelvorm} verplicht>
            <div className="flex gap-2">
              {(["rondes", "poules"] as Speelvorm[]).map((sv) => (
                <button
                  key={sv}
                  type="button"
                  onClick={() => setSpeelvorm(sv)}
                  className={`rounded-md border-[1.5px] px-4 py-2 text-sm font-semibold transition-colors ${
                    speelvorm === sv
                      ? "border-blauw bg-blauw text-white"
                      : "border-rand text-grijs hover:border-blauw-3"
                  }`}
                >
                  {t.speelvorm[sv]}
                </button>
              ))}
            </div>
          </Veld>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {speelvorm === "rondes" ? (
              <Veld label={t.form.aantalRonden} verplicht>
                <input
                  type="number"
                  min={1}
                  max={20}
                  required
                  value={aantalRonden}
                  onChange={(e) => setAantalRonden(e.target.value)}
                  className="veld-input"
                />
                <label className="mt-2 flex items-center gap-2 text-sm font-medium text-donker">
                  <input
                    type="checkbox"
                    checked={finale}
                    onChange={(e) => setFinale(e.target.checked)}
                    className="h-4 w-4"
                  />
                  {t.form.finale}
                </label>
              </Veld>
            ) : (
              <Veld label={t.form.aantalPoules} verplicht>
                <input
                  type="number"
                  min={1}
                  max={20}
                  required
                  value={aantalPoules}
                  onChange={(e) => setAantalPoules(e.target.value)}
                  className="veld-input"
                />
              </Veld>
            )}
            <Veld label={t.form.contactEmail} verplicht>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="veld-input"
              />
            </Veld>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-donker">
            <input
              type="checkbox"
              checked={gratis}
              onChange={(e) => setGratis(e.target.checked)}
              className="h-4 w-4"
            />
            {t.form.gratis}
          </label>

          {!gratis && (
            <Veld label={`${t.form.inschrijvingsprijs} (${t.form.optioneel})`}>
              <input
                type="number"
                min={0}
                step="0.5"
                value={inschrijvingsprijs}
                onChange={(e) => setInschrijvingsprijs(e.target.value)}
                className="veld-input"
              />
            </Veld>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Veld label={`${t.form.maxPloegen} (${t.form.optioneel})`}>
              <input
                type="number"
                min={1}
                value={maxPloegen}
                onChange={(e) => setMaxPloegen(e.target.value)}
                className="veld-input"
              />
            </Veld>
            <Veld label={`${t.form.linkInschrijving} (${t.form.optioneel})`}>
              <input
                type="url"
                placeholder="https://"
                value={linkInschrijving}
                onChange={(e) => setLinkInschrijving(e.target.value)}
                className="veld-input"
              />
            </Veld>
          </div>

          <Veld label={`${t.form.opmerking} (${t.form.optioneel})`}>
            <textarea
              rows={3}
              value={opmerking}
              onChange={(e) => setOpmerking(e.target.value)}
              className="veld-input resize-none"
            />
          </Veld>

          <Veld label={t.form.affiche}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAfficheFile(e.target.files?.[0] ?? null)}
              className="text-sm text-grijs file:mr-3 file:rounded-md file:border-0 file:bg-blauw file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blauw-2"
            />
            <p className="mt-1 text-xs text-grijs">{t.form.afficheHint}</p>
            {afficheFile && <p className="mt-1 text-xs font-semibold text-donker">{afficheFile.name}</p>}
          </Veld>
        </fieldset>

        {status === "fout" && (
          <p className="text-sm font-medium text-rood-2">
            {foutReden === "dubbel_toernooi" ? t.form.foutDubbel : t.form.fout}
          </p>
        )}

        <Knop type="submit" variant="rood" disabled={status === "bezig"} className="self-start">
          {afficheBezig
            ? t.form.afficheUploaden
            : status === "bezig"
            ? t.form.bezigMetVersturen
            : t.form.versturen}
        </Knop>
      </form>
    </div>
  );
}

function Veld({
  label,
  verplicht,
  children,
}: {
  label: string;
  verplicht?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[0.8rem] font-bold text-donker">
        {label} {verplicht && <span className="text-rood">*</span>}
      </span>
      {children}
    </label>
  );
}
