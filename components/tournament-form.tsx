"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/language-context";
import { ALLE_PROVINCIES, Provincie, vertaalProvincie } from "@/lib/provincies";
import { Categorie, Formule, Speelvorm, Club, KwalificatieDatum } from "@/lib/types";
import { toernooiIndienen, checkDubbelToernooi, BestaandDubbelTornooi } from "@/actions/toernooien";
import { uploadNaarStorage } from "@/lib/upload-bestand";
import { verwerkAfficheAfbeelding } from "@/lib/verwerk-affiche-afbeelding";
import { afficheAnalyseren, AfficheVelden } from "@/actions/affiche-analyseren";
import { bestandNaarBase64 } from "@/lib/bestand-naar-base64";
import { Knop } from "@/components/ui/knop";
import { createClient } from "@/lib/supabase/client";
import { vindClubBijNaam } from "@/lib/club-opzoeken";
import { ClubKiezer } from "@/components/ui/club-kiezer";
import { KwalificatieDataVeld } from "@/components/ui/kwalificatie-data-veld";
import { normaliseerUrl } from "@/lib/normaliseer-url";
import { afficheItemLabel } from "@/lib/affiche-item-label";

// Onderscheidt een herhalende reeks (exact hetzelfde tornooi, enkel andere
// datums — bv. "elke laatste vrijdag van de maand") van echt verschillende
// concours (bv. een apart dames- en herenconcours). De AI-prompt garandeert
// dat een reeks overal dezelfde naam_nl meekrijgt, dus dat is voldoende om
// het onderscheid betrouwbaar te maken zonder elk veld te moeten vergelijken.
function isHerhalendeReeks(items: AfficheVelden[]): boolean {
  // Bewust NIET op naam_nl vergelijken — de AI voegt daar soms toch een
  // maandnaam aan toe (bv. "... - oktober", "... - november"), ook al is
  // het exact dezelfde reeks. Deze structurele velden verschillen wél
  // betrouwbaar tussen ECHT aparte concours (bv. een dames-/herenconcours).
  const sleutel = (item: AfficheVelden) =>
    [item.clubnaam, item.categorie, item.formule, item.speelvorm, item.aantal_ronden, item.aantal_poules]
      .map((v) => (v ?? "").toString().trim().toLowerCase())
      .join("|");
  const eersteSleutel = sleutel(items[0]);
  if (!eersteSleutel.replace(/\|/g, "")) return false;
  return items.every((item) => sleutel(item) === eersteSleutel);
}

const CATEGORIEEN: Categorie[] = ["heren", "dames", "mix", "jeugd", "kampioenschap", "circuit", "recreanten"];
const FORMULES: Formule[] = [
  "tete-a-tete",
  "doublette",
  "triplette",
  "sextet",
  "quartet",
  "kwintet",
  "kleurentornooi",
  "meli-melo",
];

export function TournamentForm() {
  const { t, taal } = useTranslation();
  const [status, setStatus] = useState<"idle" | "bezig" | "ok" | "fout">("idle");
  const [foutReden, setFoutReden] = useState<string | null>(null);
  const [bestaandDubbel, setBestaandDubbel] = useState<BestaandDubbelTornooi | null>(null);

  const [naamIndiener, setNaamIndiener] = useState("");
  const [datum, setDatum] = useState("");
  const [uur, setUur] = useState("");
  const [openToernooi, setOpenToernooi] = useState(true);
  const [clubnaam, setClubnaam] = useState("");
  const [clubId, setClubId] = useState<string | null>(null);
  const [naamNl, setNaamNl] = useState("");
  const [naamFr, setNaamFr] = useState("");
  const [gemeente, setGemeente] = useState("");
  const [adres, setAdres] = useState("");
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
  const [kwalificatieData, setKwalificatieData] = useState<KwalificatieDatum[]>([]);
  const [kwalificatieUur, setKwalificatieUur] = useState("");
  const [afficheUrl, setAfficheUrl] = useState<string | null>(null);
  const [afficheNaam, setAfficheNaam] = useState<string | null>(null);
  const [afficheBezig, setAfficheBezig] = useState(false);
  const [afficheFout, setAfficheFout] = useState(false);
  const [aiBezig, setAiBezig] = useState(false);
  const [autoIngevuld, setAutoIngevuld] = useState(false);
  const [verzendPoging, setVerzendPoging] = useState(false);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [adresVanClub, setAdresVanClub] = useState(false);
  // Als één affiche meerdere tornooien oplevert die ECHT van elkaar
  // verschillen (bv. een dames-/herenconcours), verwerken we ze één voor één
  // na elkaar — net als in het beheerpaneel — i.p.v. de rest stilzwijgend te
  // laten vallen.
  const [wachtrij, setWachtrij] = useState<AfficheVelden[]>([]);
  const [alleAfficheVelden, setAlleAfficheVelden] = useState<AfficheVelden[]>([]);
  const [huidigeIndex, setHuidigeIndex] = useState(0);
  // Herkent de affiche net een HERHALENDE reeks (exact hetzelfde tornooi,
  // enkel andere datums)? Dan vullen we meteen alle datums samen in — één
  // gedeeld formulier, één keer versturen — i.p.v. een wachtrij.
  const [reeksModus, setReeksModus] = useState(false);
  const [herhaalDatums, setHerhaalDatums] = useState<{ datum: string; naamNl: string; naamFr: string }[]>([]);
  // Meestal is een reeks exact hetzelfde tornooi op andere datums, maar soms
  // staat er per datum een eigen volgnummer op de affiche (bv. "Challenge 1",
  // "Challenge 2", ...) — dan moet die naam per datum bewaard blijven i.p.v.
  // overal hetzelfde te tonen.
  const [reeksNamenVariëren, setReeksNamenVariëren] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("clubs")
      .select("*")
      .eq("actief", true)
      .then(({ data }) => setClubs((data as Club[]) ?? []));
  }, []);

  function veldFout(waarde: string): string {
    return verzendPoging && !waarde ? "!border-rood-2" : "";
  }

  // Voor het volgende item uit de wachtrij: alles resetten behalve de affiche
  // zelf (die blijft dezelfde, gewoon een volgend tornooi van dezelfde foto).
  function resetVeldenVoorVolgende() {
    setOpenToernooi(true);
    setClubnaam("");
    setClubId(null);
    setNaamNl("");
    setNaamFr("");
    setDatum("");
    setUur("");
    setGemeente("");
    setAdres("");
    setProvincie("");
    setCategorie("");
    setFormule("");
    setSpeelvorm("rondes");
    setAantalRonden("4");
    setAantalPoules("4");
    setFinale(false);
    setContactEmail("");
    setGratis(false);
    setInschrijvingsprijs("");
    setMaxPloegen("");
    setLinkInschrijving("");
    setOpmerking("");
    setKwalificatieData([]);
    setKwalificatieUur("");
    setAdresVanClub(false);
    setAutoIngevuld(false);
    setVerzendPoging(false);
  }

  function vulVeldenInVanAffiche(velden: AfficheVelden) {
    if (velden.datum) setDatum(velden.datum);
    if (velden.uur) setUur(velden.uur);

    // Duidelijke match op een bestaande club: automatisch koppelen en haar
    // eigen, betrouwbare gegevens gebruiken i.p.v. de gok van de AI — dan
    // moet er niets meer manueel opgezocht worden. Geen match? Dan gewoon de
    // tekst van de affiche overnemen zoals voorheen.
    const matchClub = velden.clubnaam ? vindClubBijNaam(velden.clubnaam, clubs) : undefined;
    if (matchClub) {
      setClubnaam(matchClub.naam);
      setClubId(matchClub.id);
      setOpenToernooi(false);
      if (matchClub.adres) setAdres(matchClub.adres);
      setGemeente(matchClub.gemeente);
      setProvincie(matchClub.provincie);
      setAdresVanClub(true);
    } else {
      if (velden.clubnaam) setClubnaam(velden.clubnaam);
      setClubId(null);
      if (velden.gemeente) setGemeente(velden.gemeente);
      if (velden.adres) setAdres(velden.adres);
      if (velden.provincie && (ALLE_PROVINCIES as string[]).includes(velden.provincie)) {
        setProvincie(velden.provincie as Provincie);
      }
    }

    if (velden.naam_nl) setNaamNl(velden.naam_nl);
    if (velden.naam_fr) setNaamFr(velden.naam_fr);
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
    if (velden.kwalificatiedata && velden.kwalificatiedata.length > 0) {
      setKwalificatieData(
        velden.kwalificatiedata
          .filter((k): k is { datum: string; uur: string | null; opmerking: string | null } => !!k.datum)
          .map((k) => ({ datum: k.datum, uur: k.uur ?? null, opmerking: k.opmerking ?? null }))
      );
    }
    if (velden.kwalificatie_uur) setKwalificatieUur(velden.kwalificatie_uur);
    setAutoIngevuld(true);
  }

  async function afficheGekozen(bestand: File | null) {
    if (!bestand) return;
    setAfficheNaam(bestand.name);
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
    const resultaten = await afficheAnalyseren(base64, verwerkt.type);
    setAiBezig(false);
    if (!resultaten || resultaten.length === 0) return;

    vulVeldenInVanAffiche(resultaten[0]);

    // Meteen na het scannen al checken op een mogelijke dubbel — met enkel de
    // AI-gegevens, nog vóór de indiener de rest van het formulier invult. Zo
    // hoeft die niet voor niets tijd te steken in een tornooi dat achteraf
    // toch al blijkt te bestaan.
    const eersteItem = resultaten[0];
    const matchClub = eersteItem.clubnaam ? vindClubBijNaam(eersteItem.clubnaam, clubs) : undefined;
    const vroegeDubbel = await checkDubbelToernooi({
      datum: eersteItem.datum ?? "",
      categorie: eersteItem.categorie ?? "",
      formule: eersteItem.formule ?? "",
      speelvorm: eersteItem.speelvorm ?? "",
      aantal_ronden: eersteItem.aantal_ronden ?? null,
      aantal_poules: eersteItem.aantal_poules ?? null,
      club_id: matchClub?.id ?? null,
      clubnaam: matchClub?.naam ?? eersteItem.clubnaam ?? "",
    });
    setBestaandDubbel(vroegeDubbel);

    if (resultaten.length > 1 && isHerhalendeReeks(resultaten)) {
      // Exact hetzelfde tornooi, enkel andere datums: meteen alle datums
      // samen invullen i.p.v. een wachtrij van aparte inzendingen.
      setReeksModus(true);
      const paren = resultaten
        .map((r) => ({ datum: r.datum ?? "", naamNl: r.naam_nl ?? "", naamFr: r.naam_fr ?? "" }))
        .filter((p) => p.datum);
      const eersteNaam = paren[0]?.naamNl ?? "";
      setReeksNamenVariëren(paren.some((p) => p.naamNl && p.naamNl !== eersteNaam));
      setHerhaalDatums(paren);
    } else if (resultaten.length > 1) {
      // Echt verschillende tornooien (bv. dames-/herenconcours) — die
      // verwerken we één voor één na elkaar in.
      setWachtrij(resultaten.slice(1));
      setAlleAfficheVelden(resultaten);
      setHuidigeIndex(0);
    }
  }

  function gedeeldeVelden(voorDatum: string, reeksItem?: { naamNl: string; naamFr: string }) {
    const gebruikNaamNl = reeksModus && reeksNamenVariëren && reeksItem?.naamNl ? reeksItem.naamNl : naamNl;
    const gebruikNaamFr = reeksModus && reeksNamenVariëren && reeksItem?.naamFr ? reeksItem.naamFr : naamFr;
    return {
      ingediend_door: naamIndiener,
      datum: voorDatum,
      uur,
      clubnaam,
      club_id: clubId,
      naam_nl: gebruikNaamNl,
      naam_fr: gebruikNaamFr,
      gemeente,
      adres: adres || null,
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
      kwalificatiedata: reeksModus ? [] : kwalificatieData.filter((k) => k.datum),
      kwalificatie_uur: reeksModus ? null : kwalificatieUur || null,
      affiche_url: afficheUrl || null,
      open_toernooi: openToernooi,
      finale,
    };
  }

  async function versturen(e: React.FormEvent) {
    e.preventDefault();

    const verplichteVelden = [
      naamIndiener,
      reeksModus ? (herhaalDatums.filter((d) => d.datum).length > 0 ? "ok" : "") : datum,
      uur,
      openToernooi ? clubnaam : clubId,
      openToernooi ? adres : "ok",
      naamNl,
      gemeente,
      provincie,
      categorie,
      formule,
      speelvorm === "rondes" ? aantalRonden : aantalPoules,
    ];
    if (verplichteVelden.some((veld) => !veld)) {
      setVerzendPoging(true);
      return;
    }

    setStatus("bezig");
    setBestaandDubbel(null);

    if (reeksModus) {
      const items = herhaalDatums.filter((d) => d.datum);
      for (const item of items) {
        const resultaat = await toernooiIndienen(gedeeldeVelden(item.datum, item), taal);
        if (!resultaat.succes) {
          setFoutReden(resultaat.fout);
          setBestaandDubbel(resultaat.bestaand ?? null);
          setStatus("fout");
          return;
        }
      }
      setFoutReden(null);
      setStatus("ok");
      return;
    }

    const resultaat = await toernooiIndienen(gedeeldeVelden(datum), taal);
    if (!resultaat.succes) {
      setFoutReden(resultaat.fout);
      setBestaandDubbel(resultaat.bestaand ?? null);
      setStatus("fout");
      return;
    }
    if (wachtrij.length > 0) {
      const [volgende, ...rest] = wachtrij;
      resetVeldenVoorVolgende();
      vulVeldenInVanAffiche(volgende);
      setWachtrij(rest);
      setHuidigeIndex((i) => i + 1);
      setStatus("idle");
      return;
    }
    setFoutReden(null);
    setStatus("ok");
  }

  // Enkel voor de gewone (niet-reeks) inzending: de indiener heeft de
  // bestaande affiche bekeken en bevestigt dat het toch om een ander
  // tornooi gaat, dus verstuur zonder de dubbel-check.
  async function verstuurTochOndanksDubbel() {
    setStatus("bezig");
    const resultaat = await toernooiIndienen(gedeeldeVelden(datum), taal, true);
    if (!resultaat.succes) {
      setFoutReden(resultaat.fout);
      setBestaandDubbel(resultaat.bestaand ?? null);
      setStatus("fout");
      return;
    }
    setFoutReden(null);
    setBestaandDubbel(null);
    setStatus("ok");
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

      <form onSubmit={versturen} noValidate className="flex flex-col gap-6">
        <fieldset className="flex flex-col gap-4 rounded-lg border-[1.5px] border-dashed border-blauw-3 bg-blauw-3/5 p-4">
          <legend className="mb-1 text-xs font-extrabold uppercase tracking-widest text-[#94a3b8]">
            {t.form.affiche}
          </legend>
          <Veld label={t.form.affiche}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => afficheGekozen(e.target.files?.[0] ?? null)}
              className="text-sm text-grijs file:mr-3 file:rounded-md file:border-0 file:bg-blauw file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blauw-2"
            />
            <p className="mt-1 text-xs text-grijs">{t.form.afficheHint}</p>
            {afficheNaam && !afficheBezig && !afficheFout && (
              <p className="mt-1 text-xs font-semibold text-donker">{afficheNaam}</p>
            )}
            {afficheBezig && <p className="mt-1 text-xs font-semibold text-blauw-2">{t.form.afficheUploaden}</p>}
            {aiBezig && <p className="mt-1 text-xs font-semibold text-[#b8860b]">{t.form.afficheAnalyseren}</p>}
            {afficheFout && <p className="mt-1 text-xs font-semibold text-rood-2">{t.form.afficheFout}</p>}
            {autoIngevuld && !aiBezig && (
              <p className="mt-1 text-xs font-semibold text-groen">{t.form.afficheAutoIngevuld}</p>
            )}
            {alleAfficheVelden.length > 1 && (
              <div className="mt-1 rounded-md border border-[#fde68a] bg-[#fffbeb] p-2.5 text-xs text-[#92400e]">
                <p className="font-bold">{t.form.afficheOverzicht(alleAfficheVelden.length)}</p>
                <ul className="mt-1 flex flex-col gap-0.5">
                  {alleAfficheVelden.map((item, i) => (
                    <li key={i} className={i === huidigeIndex ? "font-bold" : i < huidigeIndex ? "text-groen" : ""}>
                      {i < huidigeIndex ? "✓ " : i === huidigeIndex ? "→ " : "· "}
                      {afficheItemLabel(item, taal)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {reeksModus && (
              <p className="mt-1 text-xs font-semibold text-groen">
                {t.form.reeksHerkend(herhaalDatums.length)}
              </p>
            )}
            {bestaandDubbel && (
              <div className="mt-2 rounded-md border border-[#fecaca] bg-[#fef2f2] p-3 text-sm text-rood-2">
                <p className="font-semibold">{t.form.foutDubbel}</p>
                <p className="mt-1 text-donker">
                  {(taal === "fr" ? bestaandDubbel.naam_fr : bestaandDubbel.naam_nl) || bestaandDubbel.naam_nl}
                  {" — "}
                  {new Date(bestaandDubbel.datum).toLocaleDateString(taal === "fr" ? "fr-BE" : "nl-BE")}
                  {" — "}
                  {bestaandDubbel.clubnaam}
                </p>
                {bestaandDubbel.affiche_url && (
                  <a
                    href={bestaandDubbel.affiche_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block"
                  >
                    <img src={bestaandDubbel.affiche_url} alt="" className="max-h-48 rounded-md border border-rand" />
                  </a>
                )}
                {!reeksModus && status === "fout" && (
                  <button
                    type="button"
                    onClick={verstuurTochOndanksDubbel}
                    className="mt-3 rounded-md border border-rood-2 px-3 py-1.5 text-sm font-semibold text-rood-2 transition-all hover:bg-[#fecaca] active:scale-95"
                  >
                    {t.form.knopTochVersturen}
                  </button>
                )}
              </div>
            )}
          </Veld>
        </fieldset>

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-1 text-xs font-extrabold uppercase tracking-widest text-[#94a3b8]">
            {t.form.sectieBasis}
          </legend>
          <Veld label={t.form.jouwNaam} verplicht>
            <input
              required
              value={naamIndiener}
              onChange={(e) => setNaamIndiener(e.target.value)}
              className={`veld-input ${veldFout(naamIndiener)}`}
            />
            <p className="mt-1 text-xs text-grijs">{t.form.jouwNaamHint}</p>
          </Veld>
          {reeksModus && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[0.8rem] font-bold text-donker">
                {t.form.herhaalDatums} <span className="text-rood">*</span>
              </span>
              {reeksNamenVariëren && (
                <p className="text-xs text-grijs">{t.form.reeksEigenNamen}</p>
              )}
              <div className="flex flex-col gap-2">
                {herhaalDatums.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="date"
                      value={item.datum}
                      onChange={(e) =>
                        setHerhaalDatums((lijst) =>
                          lijst.map((v, j) => (j === i ? { ...v, datum: e.target.value } : v))
                        )
                      }
                      className="veld-input"
                    />
                    {reeksNamenVariëren && item.naamNl && (
                      <span className="text-xs text-grijs">{item.naamNl}</span>
                    )}
                    {herhaalDatums.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setHerhaalDatums((lijst) => lijst.filter((_, j) => j !== i))}
                        className="shrink-0 rounded-md border border-rand px-2.5 py-2 text-sm font-bold text-grijs transition-all hover:border-rood-2 hover:text-rood-2 active:scale-95"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setHerhaalDatums((lijst) => [...lijst, { datum: "", naamNl: "", naamFr: "" }])}
                className="mt-1 self-start rounded-md border border-rand px-3 py-1.5 text-sm font-semibold text-donker transition-all hover:border-blauw-3 hover:bg-licht active:scale-95"
              >
                {t.beheer.datumToevoegen}
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {!reeksModus && (
              <Veld label={t.form.datum} verplicht>
                <input
                  type="date"
                  required
                  value={datum}
                  onChange={(e) => setDatum(e.target.value)}
                  className={`veld-input ${veldFout(datum)}`}
                />
              </Veld>
            )}
            <Veld label={t.form.uur} verplicht>
              <input
                type="time"
                required
                value={uur}
                onChange={(e) => setUur(e.target.value)}
                className={`veld-input ${veldFout(uur)}`}
              />
            </Veld>
          </div>
          <Veld label={t.form.tornooiType} verplicht>
            <div className="flex gap-2">
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
            </div>
          </Veld>
          {openToernooi ? (
            <Veld label={t.form.organisator} verplicht>
              <input
                required
                value={clubnaam}
                onChange={(e) => setClubnaam(e.target.value)}
                className={`veld-input ${veldFout(clubnaam)}`}
              />
            </Veld>
          ) : (
            <Veld label={t.form.clubnaam} verplicht>
              <ClubKiezer
                waarde={clubnaam}
                onWaardeChange={(v) => {
                  setClubnaam(v);
                  setClubId(null);
                }}
                onClubGekozen={(club) => {
                  setClubnaam(club.naam);
                  setClubId(club.id);
                  if (club.adres) setAdres(club.adres);
                  setGemeente(club.gemeente);
                  setProvincie(club.provincie);
                  setAdresVanClub(true);
                }}
                clubs={clubs}
                fout={veldFout(clubId ?? "")}
              />
              {adresVanClub && <p className="mt-1 text-xs font-semibold text-groen">{t.form.adresVanClubIngevuld}</p>}
              {clubnaam.trim() && !clubId && (
                <p className="mt-1 text-xs font-semibold text-rood-2">{t.form.clubNietGekoppeld}</p>
              )}
              <p className="mt-1 text-xs text-grijs">
                {t.form.clubStaatErNietBij}{" "}
                <Link href="/clubs/toevoegen" target="_blank" className="font-semibold text-blauw-2 underline">
                  {t.form.clubHierAanmelden}
                </Link>
              </p>
            </Veld>
          )}
          <Veld label={t.form.naamToernooi} verplicht>
            <input
              required
              value={naamNl}
              onChange={(e) => {
                setNaamNl(e.target.value);
                setNaamFr(e.target.value);
              }}
              className={`veld-input ${veldFout(naamNl)}`}
            />
          </Veld>
          <Veld label={openToernooi ? t.form.adres : `${t.form.adres} (${t.form.optioneel})`} verplicht={openToernooi}>
            <input
              required={openToernooi}
              value={adres}
              onChange={(e) => setAdres(e.target.value)}
              className={`veld-input ${openToernooi ? veldFout(adres) : ""}`}
            />
          </Veld>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Veld label={t.form.gemeente} verplicht>
              <input
                required
                value={gemeente}
                onChange={(e) => setGemeente(e.target.value)}
                className={`veld-input ${veldFout(gemeente)}`}
              />
            </Veld>
            <Veld label={t.form.provincie} verplicht>
              <select
                required
                value={provincie}
                onChange={(e) => setProvincie(e.target.value as Provincie)}
                className={`veld-input ${veldFout(provincie)}`}
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
                className={`veld-input ${veldFout(categorie)}`}
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
                className={`veld-input ${veldFout(formule)}`}
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
                  className={`veld-input ${veldFout(aantalRonden)}`}
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
                  className={`veld-input ${veldFout(aantalPoules)}`}
                />
              </Veld>
            )}
            <Veld label={`${t.form.contactEmail} (${t.form.optioneel})`}>
              <input
                type="email"
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
                onBlur={(e) => setLinkInschrijving(normaliseerUrl(e.target.value))}
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

          <KwalificatieDataVeld
            waarden={kwalificatieData}
            onChange={setKwalificatieData}
            uur={kwalificatieUur}
            onUurChange={setKwalificatieUur}
            hoofdDatum={datum}
            hoofdUur={uur}
          />
        </fieldset>

        {verzendPoging &&
          [
            naamIndiener,
            reeksModus ? (herhaalDatums.filter((d) => d.datum).length > 0 ? "ok" : "") : datum,
            uur,
            openToernooi ? clubnaam : clubId,
            openToernooi ? adres : "ok",
            naamNl,
            gemeente,
            provincie,
            categorie,
            formule,
            speelvorm === "rondes" ? aantalRonden : aantalPoules,
          ].some((v) => !v) && <p className="text-sm font-medium text-rood-2">{t.form.foutVerplichteVelden}</p>}

        {status === "fout" && !bestaandDubbel && (
          <p className="text-sm font-medium text-rood-2">
            {foutReden === "ongeldige_invoer" ? t.form.foutOngeldigeInvoer : t.form.fout}
          </p>
        )}

        <Knop
          type="submit"
          variant="rood"
          disabled={status === "bezig" || afficheBezig || aiBezig}
          className="self-start"
        >
          {afficheBezig
            ? t.form.afficheUploaden
            : aiBezig
            ? t.form.afficheAnalyseren
            : status === "bezig"
            ? t.form.bezigMetVersturen
            : reeksModus
            ? t.form.verstuurReeks(herhaalDatums.filter((d) => d.datum).length)
            : wachtrij.length > 0
            ? t.form.verstuurEnVolgende(wachtrij.length)
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
