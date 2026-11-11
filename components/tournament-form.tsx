"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/language-context";
import { ALLE_PROVINCIES, Provincie, vertaalProvincie } from "@/lib/provincies";
import { Categorie, Formule, Speelvorm, Club, KwalificatieDatum } from "@/lib/types";
import { toernooiIndienen, checkDubbelToernooi, controleerPlaats, BestaandDubbelTornooi } from "@/actions/toernooien";
import { uploadNaarStorage } from "@/lib/upload-bestand";
import { verwerkAfficheAfbeelding } from "@/lib/verwerk-affiche-afbeelding";
import { afficheAnalyseren, AfficheVelden } from "@/actions/affiche-analyseren";
import { bestandNaarBase64 } from "@/lib/bestand-naar-base64";
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
  const [stap, setStap] = useState(1);
  const [foutReden, setFoutReden] = useState<string | null>(null);
  const [bestaandDubbel, setBestaandDubbel] = useState<BestaandDubbelTornooi | null>(null);
  const [buitenland, setBuitenland] = useState<"postcode" | "plaats" | null>(null);

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
  const [schiftingHint, setSchiftingHint] = useState(false);
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

  // Zachte waarschuwing (geen blokkade) als adres of gemeente buiten België lijkt te liggen.
  async function controleerBuitenland(nieuwAdres: string, nieuweGemeente: string) {
    if (!nieuweGemeente.trim() && !nieuwAdres.trim()) {
      setBuitenland(null);
      return;
    }
    setBuitenland(await controleerPlaats(nieuwAdres, nieuweGemeente));
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

    // Een schiftingen-toernooi (kwalificatiedagen die naar 1 finale leiden)
    // vermeldt op de affiche zelf zelden een categorie of een rondes/poules-
    // indeling — dat concept bestaat daar gewoon niet.
    const isSchifting = !!(velden.kwalificatiedata && velden.kwalificatiedata.length > 0);

    if (velden.naam_nl) setNaamNl(velden.naam_nl);
    if (velden.naam_fr) setNaamFr(velden.naam_fr);
    if (velden.categorie && CATEGORIEEN.includes(velden.categorie as Categorie)) {
      setCategorie(velden.categorie as Categorie);
    } else {
      // Geen categorie op de affiche te herkennen: "heren" is verreweg de
      // meest voorkomende, dus dat is een veiliger startpunt dan het veld
      // leeg en rood laten staan — de indiener past dit anders wel aan.
      setCategorie("heren");
    }
    if (velden.formule && FORMULES.includes(velden.formule as Formule)) {
      setFormule(velden.formule as Formule);
    }
    if (velden.speelvorm === "rondes" || velden.speelvorm === "poules") {
      setSpeelvorm(velden.speelvorm);
    }
    if (velden.aantal_ronden) {
      setAantalRonden(String(velden.aantal_ronden));
    } else if (isSchifting) {
      // In tegenstelling tot categorie is hier geen veilige gok mogelijk —
      // laat het veld bewust leeg (en dus rood) staan zodat de indiener zelf
      // een speelvorm kiest i.p.v. de generieke standaardwaarde "4 rondes"
      // ongemerkt mee te sturen voor een toernooi dat geen rondes speelt.
      setAantalRonden("");
    }
    if (velden.aantal_poules) {
      setAantalPoules(String(velden.aantal_poules));
    } else if (isSchifting) {
      setAantalPoules("");
    }
    setSchiftingHint(isSchifting && !velden.aantal_ronden && !velden.aantal_poules);
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

  async function afficheGekozen(bestanden: FileList | null) {
    if (!bestanden || bestanden.length === 0) return;
    const lijst = Array.from(bestanden);
    setAfficheNaam(lijst.map((b) => b.name).join(", "));
    setAfficheFout(false);
    setAfficheBezig(true);

    const verwerkt = await Promise.all(lijst.map((b) => verwerkAfficheAfbeelding(b)));
    // Enkel de eerste affiche bewaren we als "de" affiche van het tornooi —
    // een eventuele tweede (bv. enkel reglement/prijzengeld) dient alleen om
    // de AI meer context te geven, niet om apart getoond te worden.
    const url = await uploadNaarStorage("affiches", verwerkt[0]);
    setAfficheBezig(false);

    if (!url) {
      setAfficheFout(true);
      return;
    }
    setAfficheUrl(url);

    setAiBezig(true);
    const afbeeldingen = await Promise.all(
      verwerkt.map(async (b) => ({ data: await bestandNaarBase64(b), mediaType: b.type }))
    );
    const resultaten = await afficheAnalyseren(afbeeldingen);
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

  function verplichteVeldenLijst(): { waarde: string; id: string }[] {
    return [
      { waarde: naamIndiener, id: "veld-naamIndiener" },
      reeksModus
        ? { waarde: herhaalDatums.filter((d) => d.datum).length > 0 ? "ok" : "", id: "veld-herhaaldatums" }
        : { waarde: datum, id: "veld-datum" },
      { waarde: uur, id: "veld-uur" },
      openToernooi ? { waarde: clubnaam, id: "veld-organisator" } : { waarde: clubId ?? "", id: "veld-club" },
      { waarde: openToernooi ? adres : "ok", id: "veld-adres" },
      { waarde: naamNl, id: "veld-naamNl" },
      { waarde: gemeente, id: "veld-gemeente" },
      { waarde: provincie, id: "veld-provincie" },
      { waarde: categorie, id: "veld-categorie" },
      { waarde: formule, id: "veld-formule" },
      speelvorm === "rondes"
        ? { waarde: aantalRonden, id: "veld-aantalRonden" }
        : { waarde: aantalPoules, id: "veld-aantalPoules" },
    ];
  }

  // Formulier in 4 stappen: alle velden blijven gewoon bestaan (enkel de
  // niet-actieve stappen zijn verborgen), zodat de bestaande logica (affiche
  // scannen, reeksen, dubbel-check, controle) ongewijzigd blijft werken.
  const VELD_STAP: Record<string, number> = {
    "veld-naamNl": 1,
    "veld-organisator": 1,
    "veld-club": 1,
    "veld-formule": 1,
    "veld-datum": 2,
    "veld-herhaaldatums": 2,
    "veld-uur": 2,
    "veld-adres": 2,
    "veld-gemeente": 2,
    "veld-provincie": 2,
    "veld-categorie": 3,
    "veld-aantalRonden": 3,
    "veld-aantalPoules": 3,
    "veld-naamIndiener": 4,
  };

  function gaNaarStap(n: number, scrollNaarId?: string) {
    setStap(n);
    if (!scrollNaarId) setVerzendPoging(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (scrollNaarId) {
          document.getElementById(scrollNaarId)?.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          document.getElementById("wizard-kop")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  function volgende() {
    const fout = verplichteVeldenLijst().find((v) => !v.waarde && VELD_STAP[v.id] === stap);
    if (fout) {
      setVerzendPoging(true);
      document.getElementById(fout.id)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    gaNaarStap(stap + 1);
  }

  async function versturen(e: React.FormEvent) {
    e.preventDefault();

    const eersteFout = verplichteVeldenLijst().find((veld) => !veld.waarde);
    if (eersteFout) {
      setVerzendPoging(true);
      // Spring naar de stap met het ontbrekende veld en scroll er naartoe.
      gaNaarStap(VELD_STAP[eersteFout.id] ?? 1, eersteFout.id);
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
      gaNaarStap(1);
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

  const STAPPEN = [t.form.wStapBasis, t.form.wStapLocatie, t.form.wStapExtra, t.form.wStapControle];
  const INTRO = [t.form.wIntro1, t.form.wIntro2, t.form.wIntro3, t.form.wIntro4];
  const VERDER = [t.form.wVerderLocatie, t.form.wVerderExtra, t.form.wVerderControle];

  const datumLabel = (d: string) => new Date(d).toLocaleDateString(taal === "fr" ? "fr-BE" : "nl-BE");

  const samenvatting: { label: string; waarde: string }[] = [
    { label: t.form.naamToernooi, waarde: naamNl },
    { label: t.form.organisator, waarde: clubnaam },
    {
      label: t.form.datum,
      waarde: reeksModus
        ? herhaalDatums
            .filter((d) => d.datum)
            .map((d) => datumLabel(d.datum))
            .join(", ")
        : datum
        ? datumLabel(datum)
        : "",
    },
    { label: t.form.uur, waarde: uur },
    { label: t.form.adres, waarde: [adres, gemeente].filter(Boolean).join(", ") },
    { label: t.form.provincie, waarde: provincie ? vertaalProvincie(provincie, taal) : "" },
    { label: t.form.formule, waarde: formule ? t.formule[formule] : "" },
    { label: t.form.categorie, waarde: categorie ? t.categorie[categorie] : "" },
    {
      label: t.form.speelvorm,
      waarde: `${t.speelvorm[speelvorm]}: ${speelvorm === "rondes" ? aantalRonden : aantalPoules}`,
    },
    { label: t.form.inschrijvingsprijs, waarde: gratis ? t.form.gratis : inschrijvingsprijs },
    { label: t.form.contactEmail, waarde: contactEmail },
    { label: t.form.maxPloegen, waarde: maxPloegen },
  ].filter((r) => r.waarde);

  const knopTekst = afficheBezig
    ? t.form.afficheUploaden
    : aiBezig
    ? t.form.afficheAnalyseren
    : status === "bezig"
    ? t.form.bezigMetVersturen
    : reeksModus
    ? t.form.verstuurReeks(herhaalDatums.filter((d) => d.datum).length)
    : wachtrij.length > 0
    ? t.form.verstuurEnVolgende(wachtrij.length)
    : t.form.versturen;

  const keuzeKnop = (actief: boolean) =>
    `rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-colors ${
      actief ? "border-geel bg-geel/10 text-white" : "border-white/15 text-white/70 hover:border-white/40"
    }`;

  return (
    <div className="wizard-donker bg-[#161616] text-white">
      <div className="mx-auto min-h-[70vh] max-w-2xl px-6 pb-16 pt-8 lg:px-10">
        <h1
          id="wizard-kop"
          className="scroll-mt-24 font-titel text-[2.3rem] font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl"
        >
          {t.form.wTitel1}
          <span className="block text-geel">{t.form.wTitel2}</span>
        </h1>

        <div className="mb-2 mt-6 text-sm">
          <span className="font-bold text-white">{t.form.wStap(stap)}</span>
          <span className="text-white/50"> · {STAPPEN[stap - 1]}</span>
        </div>
        <ol className="mb-7 grid grid-cols-4 gap-1">
          {STAPPEN.map((naam, i) => {
            const nr = i + 1;
            const klaar = nr < stap;
            const actief = nr === stap;
            return (
              <li key={naam} className="flex flex-col gap-2">
                <div className="flex items-center">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[0.65rem] font-extrabold ${
                      actief
                        ? "border-geel bg-geel text-[#1f1f1f] shadow-[0_0_0_4px_rgba(244,196,48,0.25)]"
                        : klaar
                        ? "border-geel bg-geel text-[#1f1f1f]"
                        : "border-white/30 text-white/40"
                    }`}
                  >
                    {klaar ? "✓" : nr}
                  </span>
                  {nr < STAPPEN.length && <span className={`h-0.5 flex-1 ${klaar ? "bg-geel" : "bg-white/20"}`} />}
                </div>
                <span className={`text-[0.65rem] leading-tight ${actief ? "font-bold text-white" : "text-white/50"}`}>
                  {naam}
                </span>
              </li>
            );
          })}
        </ol>

        <p className="mb-6 text-lg text-white/90">{INTRO[stap - 1]}</p>

        <form
          onSubmit={(e) => {
            if (stap < 4) {
              e.preventDefault();
              volgende();
            } else {
              versturen(e);
            }
          }}
          noValidate
          className="flex flex-col gap-6"
        >
          {/* STAP 1 — Basisgegevens */}
          <div className={stap === 1 ? "flex flex-col gap-5" : "hidden"}>
            <div id="veld-affiche" className="flex flex-col gap-2">
              <label className="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed border-white/25 p-4 transition-colors hover:border-geel/60">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => afficheGekozen(e.target.files)}
                  className="sr-only"
                />
                <svg
                  viewBox="0 0 24 24"
                  width={30}
                  height={30}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  className="shrink-0 text-white/80"
                  aria-hidden
                >
                  <path d="M7 3h7l5 5v13H7z" strokeLinejoin="round" />
                  <path d="M14 3v5h5M10 13h6M10 17h6" strokeLinecap="round" />
                </svg>
                <span className="min-w-0">
                  <span className="block font-bold text-white">{t.form.wAfficheToevoegen}</span>
                  <span className="block text-xs text-white/60">{t.form.wAfficheHint}</span>
                </span>
              </label>
              <p className="text-xs text-grijs">{t.form.afficheHint}</p>
              {afficheNaam && !afficheBezig && !afficheFout && (
                <p className="text-xs font-semibold text-donker">{afficheNaam}</p>
              )}
              {afficheBezig && <p className="text-xs font-semibold text-geel">{t.form.afficheUploaden}</p>}
              {aiBezig && <p className="text-xs font-semibold text-geel">{t.form.afficheAnalyseren}</p>}
              {afficheFout && <p className="text-xs font-semibold text-rood-2">{t.form.afficheFout}</p>}
              {autoIngevuld && !aiBezig && (
                <p className="text-xs font-semibold text-[#6ee7a7]">{t.form.afficheAutoIngevuld}</p>
              )}
              {alleAfficheVelden.length > 1 && (
                <div className="rounded-md border border-[#fde68a] bg-[#fffbeb] p-2.5 text-xs text-[#92400e]">
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
                <p className="text-xs font-semibold text-[#6ee7a7]">{t.form.reeksHerkend(herhaalDatums.length)}</p>
              )}
              {bestaandDubbel && (
                <div className="rounded-md border border-[#fecaca] bg-[#fef2f2] p-3 text-sm text-rood-2">
                  <p className="font-semibold">{t.form.foutDubbel}</p>
                  <p className="mt-1 text-donker">
                    {(taal === "fr" ? bestaandDubbel.naam_fr : bestaandDubbel.naam_nl) || bestaandDubbel.naam_nl}
                    {" — "}
                    {datumLabel(bestaandDubbel.datum)}
                    {" — "}
                    {bestaandDubbel.clubnaam}
                  </p>
                  {bestaandDubbel.affiche_url && (
                    <a href={bestaandDubbel.affiche_url} target="_blank" rel="noopener noreferrer" className="mt-2 block">
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
            </div>

            <Veld label={t.form.naamToernooi} verplicht id="veld-naamNl">
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

            <Veld label={t.form.tornooiType} verplicht>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setOpenToernooi(true)} className={keuzeKnop(openToernooi)}>
                  {t.form.openToernooi}
                </button>
                <button type="button" onClick={() => setOpenToernooi(false)} className={keuzeKnop(!openToernooi)}>
                  {t.form.officieelToernooi}
                </button>
              </div>
            </Veld>

            {openToernooi ? (
              <Veld label={t.form.organisator} verplicht id="veld-organisator">
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
                  fout={veldFout(clubnaam)}
                />
                {adresVanClub && (
                  <p className="mt-1 text-xs font-semibold text-[#6ee7a7]">{t.form.adresVanClubIngevuld}</p>
                )}
              </Veld>
            ) : (
              <Veld label={t.form.clubnaam} verplicht id="veld-club">
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
                {adresVanClub && (
                  <p className="mt-1 text-xs font-semibold text-[#6ee7a7]">{t.form.adresVanClubIngevuld}</p>
                )}
                {clubnaam.trim() && !clubId && (
                  <p className="mt-1 text-xs font-semibold text-rood-2">{t.form.clubNietGekoppeld}</p>
                )}
                <p className="mt-1 text-xs text-grijs">
                  {t.form.clubStaatErNietBij}{" "}
                  <Link href="/clubs/toevoegen" target="_blank" className="font-semibold text-geel underline">
                    {t.form.clubHierAanmelden}
                  </Link>
                </p>
              </Veld>
            )}

            <div id="veld-formule" className="flex scroll-mt-4 flex-col gap-2">
              <span className="text-[0.8rem] font-bold text-donker">
                {t.form.formule} <span className="text-rood">*</span>
              </span>
              <FormuleKaarten
                waarde={formule}
                onChange={(f) => setFormule(f)}
                namen={t.formule}
                fout={verzendPoging && !formule}
              />
            </div>

            <Veld label={`${t.form.opmerking} (${t.form.optioneel})`}>
              <textarea
                rows={3}
                value={opmerking}
                onChange={(e) => setOpmerking(e.target.value)}
                className="veld-input resize-none"
              />
            </Veld>
          </div>

          {/* STAP 2 — Locatie & datum */}
          <div className={stap === 2 ? "flex flex-col gap-5" : "hidden"}>
            {reeksModus && (
              <div id="veld-herhaaldatums" className="flex scroll-mt-4 flex-col gap-1.5">
                <span className="text-[0.8rem] font-bold text-donker">
                  {t.form.herhaalDatums} <span className="text-rood">*</span>
                </span>
                {reeksNamenVariëren && <p className="text-xs text-grijs">{t.form.reeksEigenNamen}</p>}
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
                      {reeksNamenVariëren && item.naamNl && <span className="text-xs text-grijs">{item.naamNl}</span>}
                      {herhaalDatums.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setHerhaalDatums((lijst) => lijst.filter((_, j) => j !== i))}
                          className="shrink-0 rounded-md border border-white/20 px-2.5 py-2 text-sm font-bold text-white/70 transition-all hover:border-rood-2 hover:text-rood-2 active:scale-95"
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
                  className="mt-1 self-start rounded-md border border-white/20 px-3 py-1.5 text-sm font-semibold text-white transition-all hover:border-geel active:scale-95"
                >
                  {t.beheer.datumToevoegen}
                </button>
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {!reeksModus && (
                <Veld label={t.form.datum} verplicht id="veld-datum">
                  <input
                    type="date"
                    required
                    value={datum}
                    onChange={(e) => setDatum(e.target.value)}
                    className={`veld-input ${veldFout(datum)}`}
                  />
                </Veld>
              )}
              <Veld label={t.form.uur} verplicht id="veld-uur">
                <input
                  type="time"
                  required
                  value={uur}
                  onChange={(e) => setUur(e.target.value)}
                  className={`veld-input ${veldFout(uur)}`}
                />
              </Veld>
            </div>
            <Veld
              label={openToernooi ? t.form.adres : `${t.form.adres} (${t.form.optioneel})`}
              verplicht={openToernooi}
              id="veld-adres"
            >
              <input
                required={openToernooi}
                value={adres}
                onChange={(e) => setAdres(e.target.value)}
                onBlur={() => controleerBuitenland(adres, gemeente)}
                className={`veld-input ${openToernooi ? veldFout(adres) : ""}`}
              />
            </Veld>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Veld label={t.form.gemeente} verplicht id="veld-gemeente">
                <input
                  required
                  value={gemeente}
                  onChange={(e) => setGemeente(e.target.value)}
                  onBlur={() => controleerBuitenland(adres, gemeente)}
                  className={`veld-input ${veldFout(gemeente)}`}
                />
                {buitenland && (
                  <p role="alert" className="mt-1.5 rounded-md border border-[#fde68a] bg-[#fffbeb] p-2.5 text-xs font-semibold text-[#92400e]">
                    {buitenland === "postcode" ? t.form.buitenlandPostcode : t.form.buitenlandPlaats}
                  </p>
                )}
              </Veld>
              <Veld label={t.form.provincie} verplicht id="veld-provincie">
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
          </div>

          {/* STAP 3 — Extra info */}
          <div className={stap === 3 ? "flex flex-col gap-5" : "hidden"}>
            {schiftingHint && (
              <p className="rounded-md border border-[#fde68a] bg-[#fffbeb] p-2.5 text-xs text-[#92400e]">
                {t.form.schiftingHint}
              </p>
            )}
            <Veld label={t.form.categorie} verplicht id="veld-categorie">
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

            <Veld label={t.form.speelvorm} verplicht>
              <div className="grid grid-cols-2 gap-2">
                {(["rondes", "poules"] as Speelvorm[]).map((sv) => (
                  <button key={sv} type="button" onClick={() => setSpeelvorm(sv)} className={keuzeKnop(speelvorm === sv)}>
                    {t.speelvorm[sv]}
                  </button>
                ))}
              </div>
            </Veld>

            {speelvorm === "rondes" ? (
              <Veld label={t.form.aantalRonden} verplicht id="veld-aantalRonden">
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
              <Veld label={t.form.aantalPoules} verplicht id="veld-aantalPoules">
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
              <Veld label={`${t.form.contactEmail} (${t.form.optioneel})`}>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="veld-input"
                />
              </Veld>
            </div>

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

            <KwalificatieDataVeld
              waarden={kwalificatieData}
              onChange={setKwalificatieData}
              uur={kwalificatieUur}
              onUurChange={setKwalificatieUur}
              hoofdDatum={datum}
              hoofdUur={uur}
            />
          </div>

          {/* STAP 4 — Controle */}
          <div className={stap === 4 ? "flex flex-col gap-5" : "hidden"}>
            <div className="rounded-xl border border-white/15 bg-white/[0.05] p-4">
              <h2 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-white/60">
                {t.form.wControleTitel}
              </h2>
              <dl className="flex flex-col gap-2.5">
                {samenvatting.map((r) => (
                  <div key={r.label} className="flex justify-between gap-4 text-sm">
                    <dt className="shrink-0 text-white/60">{r.label}</dt>
                    <dd className="text-right font-semibold text-white">{r.waarde}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <Veld label={t.form.jouwNaam} verplicht id="veld-naamIndiener">
              <input
                required
                value={naamIndiener}
                onChange={(e) => setNaamIndiener(e.target.value)}
                className={`veld-input ${veldFout(naamIndiener)}`}
              />
              <p className="mt-1 text-xs text-grijs">{t.form.jouwNaamHint}</p>
            </Veld>
          </div>

          {verzendPoging && verplichteVeldenLijst().some((v) => !v.waarde) && (
            <p className="text-sm font-medium text-rood-2">{t.form.foutVerplichteVelden}</p>
          )}

          {status === "fout" && !bestaandDubbel && (
            <p className="text-sm font-medium text-rood-2">
              {foutReden === "ongeldige_invoer" ? t.form.foutOngeldigeInvoer : t.form.fout}
            </p>
          )}

          {stap < 4 ? (
            <button
              type="button"
              onClick={volgende}
              disabled={afficheBezig || aiBezig}
              className="flex w-full items-center justify-between rounded-xl bg-geel px-5 py-4 text-base font-bold text-[#1f1f1f] shadow-[0_4px_20px_rgba(244,196,48,0.3)] transition-all active:brightness-95 disabled:opacity-60"
            >
              {afficheBezig ? t.form.afficheUploaden : aiBezig ? t.form.afficheAnalyseren : VERDER[stap - 1]}
              <span aria-hidden className="text-xl">
                →
              </span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={status === "bezig" || afficheBezig || aiBezig}
              className="flex w-full items-center justify-between rounded-xl bg-geel px-5 py-4 text-base font-bold text-[#1f1f1f] shadow-[0_4px_20px_rgba(244,196,48,0.3)] transition-all active:brightness-95 disabled:opacity-60"
            >
              {knopTekst}
              <span aria-hidden className="text-xl">
                →
              </span>
            </button>
          )}
          {stap > 1 && (
            <button
              type="button"
              onClick={() => gaNaarStap(stap - 1)}
              className="self-center text-sm font-semibold text-white/70 underline"
            >
              ‹ {t.form.wVorige}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

const FORMULE_AANTAL: Partial<Record<Formule, number>> = {
  "tete-a-tete": 1,
  doublette: 2,
  triplette: 3,
  quartet: 4,
  kwintet: 5,
  sextet: 6,
};

function PersoonIcoon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20c0-3.6 3-6 7-6s7 2.4 7 6" strokeLinecap="round" />
    </svg>
  );
}

function FormuleKaarten({
  waarde,
  onChange,
  namen,
  fout,
}: {
  waarde: Formule | "";
  onChange: (f: Formule) => void;
  namen: Record<Formule, string>;
  fout: boolean;
}) {
  return (
    <div className={`grid grid-cols-3 gap-2 rounded-xl ${fout ? "ring-2 ring-rood-2" : ""}`}>
      {FORMULES.map((f) => {
        const gekozen = waarde === f;
        const aantal = FORMULE_AANTAL[f];
        return (
          <button
            key={f}
            type="button"
            onClick={() => onChange(f)}
            aria-pressed={gekozen}
            className={`relative flex min-h-[5.5rem] flex-col items-center justify-center gap-2 rounded-xl border-2 px-1.5 py-3 text-center transition-colors ${
              gekozen ? "border-geel bg-geel/10" : "border-white/15 hover:border-white/40"
            }`}
          >
            {gekozen && (
              <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-geel text-[0.7rem] font-extrabold text-[#1f1f1f]">
                ✓
              </span>
            )}
            <span
              className={`flex flex-wrap items-center justify-center gap-0.5 ${gekozen ? "text-geel" : "text-white/80"}`}
            >
              {aantal && aantal <= 3 ? (
                Array.from({ length: aantal }).map((_, i) => <PersoonIcoon key={i} />)
              ) : aantal ? (
                <>
                  <PersoonIcoon />
                  <span className="text-sm font-extrabold">×{aantal}</span>
                </>
              ) : (
                <span className="text-lg leading-none">{f === "kleurentornooi" ? "🎨" : "🔀"}</span>
              )}
            </span>
            <span className="text-[0.74rem] font-bold leading-tight text-white">{namen[f]}</span>
          </button>
        );
      })}
    </div>
  );
}


function Veld({
  label,
  verplicht,
  id,
  children,
}: {
  label: string;
  verplicht?: boolean;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <label id={id} className="flex scroll-mt-4 flex-col gap-1.5">
      <span className="text-[0.8rem] font-bold text-donker">
        {label} {verplicht && <span className="text-rood">*</span>}
      </span>
      {children}
    </label>
  );
}
