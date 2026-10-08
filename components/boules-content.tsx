"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { useTranslation } from "@/lib/language-context";
import { BOULE_SETS, formatReeks, type BouleFamilie, type BouleSet } from "@/lib/boules";
import { PaginaBezoekTeller } from "@/components/pagina-bezoek-teller";
import styles from "./boules-content.module.css";

const FAMILIES: BouleFamilie[] = ["iris", "vartan", "planeet", "continental"];
const ACCENTS: Record<string, string> = { "iris-noir": "#e1d2a9", "iris-fuchsia": "#ee6abb", "iris-vert": "#94bf66", "iris-bleu": "#76a9e5" };

function sphereStyle(id: string): CSSProperties {
  return { "--boule-accent": ACCENTS[id] || "#a9bc97", "--sphere-x": id === "iris-fuchsia" ? "47.4%" : id === "iris-vert" ? "49.4%" : "50.2%", "--sphere-y": id === "iris-fuchsia" ? "50.5%" : id === "iris-vert" ? "46%" : "47.4%" } as CSSProperties;
}

function KeuzeIcon({ index }: { index: number }) {
  return <svg viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    {index === 0 ? <><circle cx="16" cy="16" r="10" /><path d="M4 27h24M4 24v6m24-6v6M9 16h14m-14 0 3-3m-3 3 3 3m11-3-3-3m3 3-3 3" /></> : index === 1 ? <><path d="M8 11h16l4 17H4l4-17Z" /><circle cx="16" cy="8" r="4" /><path d="M12 21h8" /></> : index === 2 ? <><circle cx="16" cy="16" r="11" /><path d="m10 17 4 4 8-10" /></> : <><circle cx="12" cy="16" r="9" /><circle cx="21" cy="16" r="9" /><path d="M17 8v16" /></>}
  </svg>;
}

export function BoulesContent() {
  const { t, taal } = useTranslation();
  const tp = t.boulesPagina;
  const fr = taal === "fr";
  const [filter, setFilter] = useState<BouleFamilie | null>(null);
  const [heroId, setHeroId] = useState("iris-noir");
  const [detail, setDetail] = useState<BouleSet | null>(null);
  const sets = filter ? BOULE_SETS.filter((s) => s.familie === filter) : BOULE_SETS;
  const familyLabel = (f: BouleFamilie) => f === "planeet" ? (fr ? "Les classiques" : "De klassiekers") : tp.filters[f];

  return <div className={styles.page}>
    <PaginaBezoekTeller pad="/boules" />
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <div className={styles.brandLogo}><Image src="/images/boules/boulenciel-logo.jpg" alt="Boulenciel — Official Shop" width={423} height={146} priority sizes="190px" /></div>
          <p className={styles.eyebrow}><span />{tp.partnerLabel}</p>
          <h1>{fr ? <>Les boules<br /><span>Boulenciel.</span></> : <>De boules van<br /><span>Boulenciel.</span></>}</h1>
          <p className={styles.heroIntro}>{tp.intro}</p>
          <div className={styles.heroActions}><a href="#modellen" className={styles.primary}>{tp.filterAlles} ({BOULE_SETS.length}) <span aria-hidden>↗</span></a><a href="#keuzehulp" className={styles.secondary}>{fr ? "Aidez-moi à choisir" : "Help mij kiezen"} <span aria-hidden>↓</span></a></div>
          <p className={styles.heroNote}>BOULENCIEL <span>·</span> MADE IN ITALY <span>·</span> FIPJP</p>
        </div>
        <div className={styles.heroShowcase} style={sphereStyle(heroId)}>
          <div className={styles.singleStage}>
            <div className={styles.showcaseRing} aria-hidden="true" />
            <Image key={heroId} src={`/images/boules/${heroId}.jpg`} alt={BOULE_SETS.find(s => s.id === heroId)?.naam || "Iris"} width={800} height={800} priority sizes="360px" className={styles.showcaseImage} />
          </div>
          <p className={styles.selectedModel} aria-live="polite">{BOULE_SETS.find(s => s.id === heroId)?.naam.replace(/^Set /, "")}</p>
          <div className={styles.swatches} aria-label={fr ? "Couleur Iris" : "Iris-kleur"}>
            {[["iris-noir", fr ? "Noir" : "Zwart", "#444a40"], ["iris-fuchsia", "Fuchsia", "#d9308c"], ["iris-vert", fr ? "Vert" : "Groen", "#6cab3b"], ["iris-bleu", fr ? "Bleu" : "Blauw", "#4384c9"]].map(([id, label, color]) => <button key={id} type="button" aria-label={label} aria-pressed={heroId === id} title={label} onClick={() => setHeroId(id)} style={{ "--swatch": color } as CSSProperties}><span /></button>)}
          </div>
          <p className={styles.showcaseHint}>{fr ? "Quatre couleurs. Un caractère unique." : "Vier kleuren. Een eigen karakter."}</p>
        </div>
      </div>
    </section>

    <div className={styles.container}>
      <div className={styles.benefits}>{tp.usps.map((usp, i) => <div key={usp.titel}><span className={styles.benefitIcon} aria-hidden>{["✓", "◎", "+", "◇"][i]}</span><div><h2>{usp.titel}</h2><p>{usp.tekst}</p></div></div>)}</div>
      <section id="keuzehulp" className={styles.guide}>
        <div className={styles.sectionHeading}><div><p className={styles.kicker}>{fr ? "BIEN CHOISIR SA BOULE" : "VIND JOUW BOULE"}</p><h2>{tp.keuzeTitel}</h2></div><p>{tp.keuzeIntro}</p></div>
        <div className={styles.guideGrid}>{tp.keuze.map((k, i) => <details key={k.titel} className={styles.guideItem}><summary><KeuzeIcon index={i} /><span><strong>{k.titel}</strong><small>{["72–75 mm", "660–710 g", "110 / 125", "Inox / carbone"][i]}</small></span><span className={styles.plus}>+</span></summary><p>{k.tekst}</p></details>)}</div>
      </section>

      <section id="modellen" className={styles.catalog}>
        <div className={styles.sectionHeading}><div><p className={styles.kicker}>BOULENCIEL PÉTANQUE</p><h2>{fr ? "Chaque modèle a son caractère." : "Elke boule heeft haar karakter."}</h2></div><p aria-live="polite">{sets.length} {fr ? "modèles à découvrir" : "modellen om te ontdekken"}</p></div>
        <div className={styles.filters} aria-label={fr ? "Filtrer les boules" : "Boules filteren"}>
          <FilterKnop actief={filter === null} onClick={() => setFilter(null)}>{tp.filterAlles}</FilterKnop>
          {FAMILIES.map(f => <FilterKnop key={f} actief={filter === f} onClick={() => setFilter(f)}>{familyLabel(f)}</FilterKnop>)}
        </div>
        <div className={styles.grid}>{sets.map(set => <BouleKaart key={set.id} set={set} onPreview={() => setDetail(set)} />)}</div>
      </section>
      <p className={styles.note}>{tp.slotTekst}</p>
    </div>
    {detail && <BouleDetail set={detail} onClose={() => setDetail(null)} />}
  </div>;
}

function FilterKnop({ actief, onClick, children }: { actief: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} aria-pressed={actief} className={`${styles.filter} ${actief ? styles.active : ""}`}>{children}</button>;
}

function modelIntro(set: BouleSet, fr: boolean) {
  if (set.familie === "iris") return fr ? "L’inox rencontre la couleur. Les inserts en plastique et la finition demi-tendre donnent à Iris son identité." : "Inox met een kleurrijk karakter. Kunststof inleg en een halfzachte uitvoering maken de Iris-lijn direct herkenbaar.";
  if (set.familie === "vartan") return fr ? "Des stries en spirale, en acier inoxydable demi-tendre. La gamme Vartan se décline en 16 ou 24 stries." : "Een spiraalpatroon in halfzacht roestvrij staal. De Vartan-lijn onderscheidt zich met 16 of 24 groeven.";
  if (set.familie === "continental") return fr ? "Une triplette tendre en carbone, à la finition noire brillante. Le modèle d’entrée de gamme de Boulenciel." : "Een zachte triplette in koolstofstaal met een glanzend zwarte afwerking. Het instapmodel van Boulenciel.";
  if (set.id === "rd-diego-rizzi") return fr ? "La signature de Diego Rizzi : une boule lisse et tendre en carbone, marquée de son emblème Alien." : "De signatuur van Diego Rizzi: een gladde, zachte carboneboule met zijn herkenbare Alien-embleem.";
  const patterns: Record<string, [string, string]> = { mars: ["fijne puntjes", "de petits points"], mercure: ["enkele cirkels", "des cercles simples"], saturne: ["dubbele cirkels", "des cercles doubles"], venus: ["een glad oppervlak", "une surface lisse"] };
  const pattern = patterns[set.id.split("-")[0]];
  return fr ? `Une boule en ${set.materiaal === "inox" ? "acier inoxydable" : "acier au carbone"}, avec ${pattern[1]}. ${set.hardheden.length === 2 ? "En version tendre ou demi-tendre." : "Disponible en version tendre."}` : `Een boule in ${set.materiaal === "inox" ? "roestvrij staal" : "koolstofstaal"}, met ${pattern[0]}. ${set.hardheden.length === 2 ? "Keuze uit een zachte of halfzachte uitvoering." : "Uitgevoerd in zacht staal."}`;
}

function BouleDetail({ set, onClose }: { set: BouleSet; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { taal } = useTranslation();
  const fr = taal === "fr";
  useEffect(() => {
    const element = dialog.current;
    const overflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = "hidden";
    return () => { element?.close(); document.body.style.overflow = overflow; };
  }, []);
  return <dialog ref={dialog} className={styles.detailDialog} onClose={event => { if (!event.currentTarget.open) onClose(); }} aria-labelledby="boule-detail-title" onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
    <div className={styles.detailContent} style={sphereStyle(set.id)}>
      <button type="button" className={styles.closeDetail} onClick={() => dialog.current?.close()} aria-label={fr ? "Fermer" : "Sluiten"}>×</button>
      <div className={`${styles.detailStage} ${set.familie === "iris" ? styles.darkStage : ""}`}><Image src={`/images/boules/${set.id}.jpg`} alt={set.naam} width={800} height={800} sizes="(max-width: 640px) 90vw, 500px" className={styles.productImage} /></div>
      <div className={styles.detailCopy}><h2 id="boule-detail-title">{set.naam.replace(/^Set /, "")}</h2><p>{modelIntro(set, fr)}</p><p>{formatReeks(set.diameters, "mm")} · {formatReeks(set.gewichten, "g")}</p></div>
    </div>
  </dialog>;
}

function BouleKaart({ set, onPreview }: { set: BouleSet; onPreview: () => void }) {
  const { t, taal } = useTranslation();
  const tp = t.boulesPagina;
  const fr = taal === "fr";
  const prijs = new Intl.NumberFormat(fr ? "fr-BE" : "nl-BE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(set.prijs);
  const kenmerken: [string, string][] = [
    [tp.materiaalLabel, tp.materiaal[set.materiaal]],
    [tp.hardheidLabel, set.hardheden.map(h => tp.hardheid[h]).join(" / ")],
    [tp.diameterLabel, formatReeks(set.diameters, "mm")],
    [tp.gewichtLabel, formatReeks(set.gewichten, "g")],
    [tp.gravureLabel, set.gravureTekens ? tp.gravureTot.replace("{n}", String(set.gravureTekens)) : tp.gravureGeen],
    ...(set.garantieMaanden ? [[tp.garantieLabel, `${set.garantieMaanden} ${tp.maanden}`] as [string, string]] : []),
  ];
  const dark = set.familie === "iris";
  return <article className={styles.card} style={sphereStyle(set.id)}>
    <button type="button" onClick={onPreview} aria-label={`${fr ? "Voir en détail" : "Bekijk in detail"}: ${set.naam}`} className={`${styles.productStage} ${dark ? styles.darkStage : ""}`}>
      <span className={styles.family}>{set.familie === "planeet" ? "CLASSIC" : set.familie.toUpperCase()}</span>
      <span className={styles.badge}>✓ FIPJP</span>
      <Image src={`/images/boules/${set.id}.jpg`} alt={set.naam} width={800} height={800} sizes="(min-width: 1000px) 340px, (min-width: 640px) 45vw, 300px" className={styles.productImage} />
      <span className={styles.stageCaption}>{tp.materiaal[set.materiaal]}</span>
      <span className={styles.zoomHint} aria-hidden="true">⌕</span>
    </button>
    <div className={styles.cardBody}>
      <div className={styles.cardTitle}><h3>{set.naam.replace(/^Set /, "")}</h3><div><strong>{prijs}</strong><small>{tp.perSet}</small></div></div>
      <p className={styles.productIntro}>{modelIntro(set, fr)}</p>
      <div className={styles.specs}><span>{formatReeks(set.diameters, "mm")}</span><span>{formatReeks(set.gewichten, "g")}</span><span>{set.hardheden.length === 2 ? (fr ? "Tendre / demi-tendre" : "Zacht / halfzacht") : set.hardheden[0] === "tendre" ? (fr ? "Tendre" : "Zacht") : (fr ? "Demi-tendre" : "Halfzacht")}</span></div>
      <details className={styles.more}><summary>{fr ? "Détails et caractéristiques" : "Details en specificaties"}<span aria-hidden>+</span></summary><p>{fr ? set.beschrijvingFr : set.beschrijvingNl}</p><dl>{kenmerken.map(([label, waarde]) => <div key={label}><dt>{label}</dt><dd>{waarde}</dd></div>)}</dl></details>
    </div>
  </article>;
}


