"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/language-context";
import { Categorie, Formule, Speelvorm, Toernooi } from "@/lib/types";
import { ALLE_PROVINCIES, Provincie, vertaalProvincie } from "@/lib/provincies";
import { formatUur } from "@/lib/datum";
import { toernooiBewerken, toernooiToevoegenAlsAdmin, toernooiVerwijderen } from "@/actions/beheer-toernooien";
import { uploadAffiche } from "@/lib/upload-affiche";
import { uploadNaarStorage } from "@/lib/upload-bestand";
import { verwerkAfficheAfbeelding } from "@/lib/verwerk-affiche-afbeelding";
import { afficheAnalyseren, AfficheVelden } from "@/actions/affiche-analyseren";
import { bestandNaarBase64 } from "@/lib/bestand-naar-base64";

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

export function TournamentManageList({ toernooien }: { toernooien: Toernooi[] }) {
  const { t, taal } = useTranslation();
  const router = useRouter();
  const [toevoegenOpen, setToevoegenOpen] = useState(false);
  const [bewerkId, setBewerkId] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);
  const [filterCategorie, setFilterCategorie] = useState<Categorie | "">("");
  const [filterProvincie, setFilterProvincie] = useState<Provincie | "">("");

  async function verwijderen(id: string) {
    if (!window.confirm("Weet je zeker dat je dit toernooi wil verwijderen?")) return;
    setBezig(true);
    await toernooiVerwijderen(id);
    setBezig(false);
    router.refresh();
  }

  const zichtbareToernooien = toernooien
    .filter((tn) => !filterCategorie || tn.categorie === filterCategorie)
    .filter((tn) => !filterProvincie || tn.provincie === filterProvincie)
    .sort((a, b) => (a.datum + a.uur).localeCompare(b.datum + b.uur));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <select
            value={filterCategorie}
            onChange={(e) => setFilterCategorie(e.target.value as Categorie | "")}
            className="veld-input w-auto"
          >
            <option value="">{t.filters.alleCategorieen}</option>
            {CATEGORIEEN.map((c) => (
              <option key={c} value={c}>
                {t.categorie[c]}
              </option>
            ))}
          </select>
          <select
            value={filterProvincie}
            onChange={(e) => setFilterProvincie(e.target.value as Provincie | "")}
            className="veld-input w-auto"
          >
            <option value="">{t.filters.alleProvincies}</option>
            {ALLE_PROVINCIES.map((p) => (
              <option key={p} value={p}>
                {vertaalProvincie(p, taal)}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setToevoegenOpen((v) => !v)}
          className="rounded-md bg-blauw px-4 py-2 text-sm font-bold text-white"
        >
          {t.beheer.nieuwToernooi}
        </button>
      </div>

      {toevoegenOpen && (
        <AddForm
          onKlaar={() => {
            setToevoegenOpen(false);
            router.refresh();
          }}
          onAnnuleren={() => setToevoegenOpen(false)}
        />
      )}

      {zichtbareToernooien.map((tn) =>
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
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-blauw-2">
                {tn.clubnaam}
                {tn.open_toernooi && (
                  <span className="rounded-full bg-[#f0fdfa] px-2 py-0.5 text-[0.65rem] font-bold text-[#0d9488]">
                    {t.lijst.openBadge}
                  </span>
                )}
              </div>
              <div className="font-bold text-donker">{tn.naam_nl}</div>
              <div className="text-sm text-grijs">
                {tn.datum} · {formatUur(tn.uur)} · {tn.gemeente}, {vertaalProvincie(tn.provincie, taal)}
                {tn.finale && ` · ${t.lijst.metFinale}`}
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

function AddForm({ onKlaar, onAnnuleren }: { onKlaar: () => void; onAnnuleren: () => void }) {
  const { t, taal } = useTranslation();
  const [openToernooi, setOpenToernooi] = useState(false);
  const [clubnaam, setClubnaam] = useState("");
  const [naamNl, setNaamNl] = useState("");
  const [naamFr, setNaamFr] = useState("");
  const [datum, setDatum] = useState("");
  const [uur, setUur] = useState("");
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
  const [afficheUrl, setAfficheUrl] = useState<string | null>(null);
  const [afficheBezig, setAfficheBezig] = useState(false);
  const [afficheFout, setAfficheFout] = useState(false);
  const [aiBezig, setAiBezig] = useState(false);
  const [autoIngevuld, setAutoIngevuld] = useState(false);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  function vulVeldenInVanAffiche(velden: AfficheVelden) {
    if (velden.datum) setDatum(velden.datum);
    if (velden.uur) setUur(velden.uur);
    if (velden.clubnaam) setClubnaam(velden.clubnaam);
    if (velden.naam_nl) setNaamNl(velden.naam_nl);
    if (velden.naam_fr) setNaamFr(velden.naam_fr);
    if (velden.gemeente) setGemeente(velden.gemeente);
    if (velden.provincie && (ALLE_PROVINCIES as string[]).includes(velden.provincie)) {
      setProvincie(velden.provincie as Provincie);
    }
    if (velden.categorie && CATEGORIEEN.includes(velden.categorie as Categorie)) {
      setCategorie(velden.categorie as Categorie);
    }
    if (velden.formule && FORMULES.includes(velden.formule as Formule)) {
      setFormule(velden.formule as Formule);
    }
    if (velden.speelvorm === "rondes" || velden.speelvorm === "poules") {
      setSpeelvorm(velden.speelvorm);
    }
    if (velden.aantal_ronden) setAantalRonden(String(velden.aantal_ronden));
    if (velden.aantal_poules) setAantalPoules(String(velden.aantal_poules));
    if (velden.contact_email) setContactEmail(velden.contact_email);
    if (velden.gratis) setGratis(true);
    if (velden.inschrijvingsprijs != null) setInschrijvingsprijs(String(velden.inschrijvingsprijs));
    if (velden.max_ploegen) setMaxPloegen(String(velden.max_ploegen));
    if (velden.link_inschrijving) setLinkInschrijving(velden.link_inschrijving);
    if (velden.opmerking) setOpmerking(velden.opmerking);
    setAutoIngevuld(true);
  }

  async function afficheGekozen(bestand: File | null) {
    if (!bestand) return;
    setAfficheFout(false);
    setAfficheBezig(true);
    const verwerkt = await verwerkAfficheAfbeelding(bestand);
    const url = await uploadNaarStorage("affiches", verwerkt);
    setAfficheBezig(false);

    if (!url) {
      setAfficheFout(true);
      return;
    }
    setAfficheUrl(url);

    setAiBezig(true);
    const base64 = await bestandNaarBase64(verwerkt);
    const velden = await afficheAnalyseren(base64, verwerkt.type);
    setAiBezig(false);
    if (velden) vulVeldenInVanAffiche(velden);
  }

  async function toevoegen() {
    setBezig(true);
    setFout(null);
    const resultaat = await toernooiToevoegenAlsAdmin({
      clubnaam,
      naam_nl: naamNl,
      naam_fr: naamFr,
      datum,
      uur,
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
      affiche_url: afficheUrl,
      open_toernooi: openToernooi,
      finale,
    });
    setBezig(false);
    if (resultaat.succes) {
      onKlaar();
    } else {
      setFout(resultaat.fout);
    }
  }

  return (
    <div className="rounded-[10px] border-[1.5px] border-blauw-3 bg-white p-4">
      <div className="mb-3 flex flex-col gap-1.5">
        <span className="text-xs font-bold text-donker">{t.form.tornooiType}</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setOpenToernooi(false)}
            className={`rounded-md border-[1.5px] px-3 py-1.5 text-sm font-semibold transition-colors ${
              !openToernooi ? "border-blauw bg-blauw text-white" : "border-rand text-grijs hover:border-blauw-3"
            }`}
          >
            {t.form.officieelToernooi}
          </button>
          <button
            type="button"
            onClick={() => setOpenToernooi(true)}
            className={`rounded-md border-[1.5px] px-3 py-1.5 text-sm font-semibold transition-colors ${
              openToernooi ? "border-blauw bg-blauw text-white" : "border-rand text-grijs hover:border-blauw-3"
            }`}
          >
            {t.form.openToernooi}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs font-bold text-donker">
          {openToernooi ? t.form.organisator : t.form.clubnaam}
          <input value={clubnaam} onChange={(e) => setClubnaam(e.target.value)} className="veld-input" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-donker">
          {t.form.contactEmail}
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="veld-input"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-donker sm:col-span-2">
          {t.form.naamToernooi}
          <input
            value={naamNl}
            onChange={(e) => {
              setNaamNl(e.target.value);
              setNaamFr(e.target.value);
            }}
            className="veld-input"
          />
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
          {t.form.categorie}
          <select
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
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-donker">
          {t.form.formule}
          <select
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
        {speelvorm === "rondes" && (
          <label className="mt-2 flex items-center gap-2 text-sm font-medium text-donker">
            <input type="checkbox" checked={finale} onChange={(e) => setFinale(e.target.checked)} className="h-4 w-4" />
            {t.form.finale}
          </label>
        )}
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
        <label className="flex flex-col gap-1 text-xs font-bold text-donker">
          {t.form.maxPloegen}
          <input
            type="number"
            min={1}
            value={maxPloegen}
            onChange={(e) => setMaxPloegen(e.target.value)}
            className="veld-input"
          />
        </label>
      </div>

      <label className="mt-3 flex items-center gap-2 text-sm font-medium text-donker">
        <input type="checkbox" checked={gratis} onChange={(e) => setGratis(e.target.checked)} className="h-4 w-4" />
        {t.form.gratis}
      </label>

      {!gratis && (
        <label className="mt-3 flex flex-col gap-1 text-xs font-bold text-donker">
          {t.form.inschrijvingsprijs}
          <input
            type="number"
            min={0}
            step="0.5"
            value={inschrijvingsprijs}
            onChange={(e) => setInschrijvingsprijs(e.target.value)}
            className="veld-input"
          />
        </label>
      )}

      <label className="mt-3 flex flex-col gap-1 text-xs font-bold text-donker">
        {t.form.linkInschrijving}
        <input
          type="url"
          placeholder="https://"
          value={linkInschrijving}
          onChange={(e) => setLinkInschrijving(e.target.value)}
          className="veld-input"
        />
      </label>

      <label className="mt-3 flex flex-col gap-1 text-xs font-bold text-donker">
        {t.form.opmerking}
        <textarea
          rows={3}
          value={opmerking}
          onChange={(e) => setOpmerking(e.target.value)}
          className="veld-input resize-none"
        />
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
        {aiBezig && <p className="text-xs font-semibold text-blauw-2">{t.form.afficheAnalyseren}</p>}
        {afficheFout && <p className="text-xs font-semibold text-rood-2">{t.form.afficheFout}</p>}
        {autoIngevuld && !aiBezig && (
          <p className="text-xs font-semibold text-groen">{t.form.afficheAutoIngevuld}</p>
        )}
      </div>

      {fout && (
        <p className="mt-3 text-sm font-medium text-rood-2">
          {fout === "dubbel_toernooi" ? t.form.foutDubbel : t.form.fout}
        </p>
      )}

      <div className="mt-3 flex gap-2">
        <button
          onClick={toevoegen}
          disabled={
            bezig ||
            !clubnaam ||
            !naamNl ||
            !naamFr ||
            !datum ||
            !uur ||
            !gemeente ||
            !provincie ||
            !categorie ||
            !formule
          }
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
  const [openToernooi, setOpenToernooi] = useState(toernooi.open_toernooi);
  const [clubnaam, setClubnaam] = useState(toernooi.clubnaam);
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
  const [finale, setFinale] = useState(toernooi.finale);
  const [contactEmail, setContactEmail] = useState(toernooi.contact_email ?? "");
  const [gratis, setGratis] = useState(toernooi.gratis);
  const [inschrijvingsprijs, setInschrijvingsprijs] = useState(String(toernooi.inschrijvingsprijs ?? ""));
  const [maxPloegen, setMaxPloegen] = useState(String(toernooi.max_ploegen ?? ""));
  const [linkInschrijving, setLinkInschrijving] = useState(toernooi.link_inschrijving ?? "");
  const [opmerking, setOpmerking] = useState(toernooi.opmerking ?? "");
  const [vol, setVol] = useState(toernooi.vol);
  const [afficheUrl, setAfficheUrl] = useState(toernooi.affiche_url);
  const [afficheBezig, setAfficheBezig] = useState(false);
  const [afficheFout, setAfficheFout] = useState(false);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  async function afficheGekozen(bestand: File | null) {
    if (!bestand) return;
    setAfficheBezig(true);
    setAfficheFout(false);
    const url = await uploadAffiche(bestand);
    if (url) {
      setAfficheUrl(url);
    } else {
      setAfficheFout(true);
    }
    setAfficheBezig(false);
  }

  async function opslaan() {
    setBezig(true);
    setFout(null);
    const resultaat = await toernooiBewerken(toernooi.id, {
      clubnaam,
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
      contact_email: contactEmail,
      gratis,
      inschrijvingsprijs: gratis ? null : Number(inschrijvingsprijs) || null,
      max_ploegen: Number(maxPloegen) || null,
      link_inschrijving: linkInschrijving || null,
      opmerking: opmerking || null,
      vol,
      affiche_url: afficheUrl,
      open_toernooi: openToernooi,
      finale,
    });
    setBezig(false);
    if (!resultaat.succes) {
      setFout(resultaat.fout);
      return;
    }
    onKlaar();
  }

  return (
    <div className="rounded-[10px] border-[1.5px] border-blauw-3 bg-white p-4">
      <div className="mb-3 flex flex-col gap-1.5">
        <span className="text-xs font-bold text-donker">{t.form.tornooiType}</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setOpenToernooi(false)}
            className={`rounded-md border-[1.5px] px-3 py-1.5 text-sm font-semibold transition-colors ${
              !openToernooi ? "border-blauw bg-blauw text-white" : "border-rand text-grijs hover:border-blauw-3"
            }`}
          >
            {t.form.officieelToernooi}
          </button>
          <button
            type="button"
            onClick={() => setOpenToernooi(true)}
            className={`rounded-md border-[1.5px] px-3 py-1.5 text-sm font-semibold transition-colors ${
              openToernooi ? "border-blauw bg-blauw text-white" : "border-rand text-grijs hover:border-blauw-3"
            }`}
          >
            {t.form.openToernooi}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs font-bold text-donker">
          {openToernooi ? t.form.organisator : t.form.clubnaam}
          <input value={clubnaam} onChange={(e) => setClubnaam(e.target.value)} className="veld-input" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-donker">
          {t.form.contactEmail}
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="veld-input"
          />
        </label>
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
        {speelvorm === "rondes" && (
          <label className="mt-2 flex items-center gap-2 text-sm font-medium text-donker">
            <input type="checkbox" checked={finale} onChange={(e) => setFinale(e.target.checked)} className="h-4 w-4" />
            {t.form.finale}
          </label>
        )}
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
        <label className="flex flex-col gap-1 text-xs font-bold text-donker">
          {t.form.maxPloegen}
          <input
            type="number"
            min={1}
            value={maxPloegen}
            onChange={(e) => setMaxPloegen(e.target.value)}
            className="veld-input"
          />
        </label>
      </div>

      <label className="mt-3 flex items-center gap-2 text-sm font-medium text-donker">
        <input type="checkbox" checked={gratis} onChange={(e) => setGratis(e.target.checked)} className="h-4 w-4" />
        {t.form.gratis}
      </label>

      {!gratis && (
        <label className="mt-3 flex flex-col gap-1 text-xs font-bold text-donker">
          {t.form.inschrijvingsprijs}
          <input
            type="number"
            min={0}
            step="0.5"
            value={inschrijvingsprijs}
            onChange={(e) => setInschrijvingsprijs(e.target.value)}
            className="veld-input"
          />
        </label>
      )}

      <label className="mt-3 flex flex-col gap-1 text-xs font-bold text-donker">
        {t.form.linkInschrijving}
        <input
          type="url"
          placeholder="https://"
          value={linkInschrijving}
          onChange={(e) => setLinkInschrijving(e.target.value)}
          className="veld-input"
        />
      </label>

      <label className="mt-3 flex flex-col gap-1 text-xs font-bold text-donker">
        {t.form.opmerking}
        <textarea
          rows={3}
          value={opmerking}
          onChange={(e) => setOpmerking(e.target.value)}
          className="veld-input resize-none"
        />
      </label>

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
        {afficheFout && <p className="text-xs font-semibold text-rood-2">{t.form.afficheFout}</p>}
      </div>

      {fout && (
        <p className="mt-3 text-sm font-medium text-rood-2">
          {fout === "dubbel_toernooi" ? t.form.foutDubbel : t.form.fout}
        </p>
      )}

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
