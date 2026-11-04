"use client";

import { useEffect, useState } from "react";
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
  clubVerwijderingAanvragen,
} from "@/actions/beheer-clubs";
import { normaliseerUrl } from "@/lib/normaliseer-url";
import { dienVoorstelIn, haalMijnClub } from "@/actions/club-beheer";
import { Ico, UrenBewerker } from "@/components/club-beheer/UrenBewerker";
import { gelijkeUren, leegUren, type ClubUren } from "@/lib/club-beheer/uren";

export function ClubManageList({ clubs, isAdmin = false }: { clubs: Club[]; isAdmin?: boolean }) {
  const { t, taal } = useTranslation();
  const router = useRouter();
  const [toevoegenOpen, setToevoegenOpen] = useState(false);
  const [bewerkId, setBewerkId] = useState<string | null>(null);
  const [bezig, setBezig] = useState<string | null>(null);
  const [zoekterm, setZoekterm] = useState("");
  const [melding, setMelding] = useState<string | null>(null);
  const [opengeklapt, setOpengeklapt] = useState<Set<Provincie>>(new Set());
  const [verwijderAanvraagId, setVerwijderAanvraagId] = useState<string | null>(null);
  const [verwijderReden, setVerwijderReden] = useState("");

  function toggleProvincie(p: Provincie) {
    setOpengeklapt((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  }

  function toonMelding(tekst: string) {
    setMelding(tekst);
    setTimeout(() => setMelding(null), 3000);
  }

  const wachtend = clubs.filter((c) => !c.actief);
  const zoekLower = zoekterm.trim().toLowerCase();
  const overige = clubs
    .filter((c) => c.actief)
    .filter(
      (c) => !zoekLower || c.naam.toLowerCase().includes(zoekLower) || c.gemeente.toLowerCase().includes(zoekLower)
    );

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

  async function verwijderingAanvragen() {
    if (!verwijderAanvraagId || !verwijderReden.trim()) return;
    setBezig(verwijderAanvraagId);
    await clubVerwijderingAanvragen(verwijderAanvraagId, verwijderReden);
    setBezig(null);
    setVerwijderAanvraagId(null);
    setVerwijderReden("");
    router.refresh();
  }

  function renderClub(club: Club) {
    return bewerkId === club.id ? (
      <ClubFormulier
        key={club.id}
        club={club}
        isAdmin={isAdmin}
        onKlaar={() => {
          setBewerkId(null);
          toonMelding(t.beheer.clubBijgewerkt);
          router.refresh();
        }}
        onAnnuleren={() => setBewerkId(null)}
      />
    ) : (
      <div
        key={club.id}
        className={`flex flex-col gap-3 rounded-[10px] border-[1.5px] bg-white p-3.5 transition-all hover:border-geel/60 hover:shadow-[0_2px_10px_rgba(244,196,48,0.15)] ${
          club.actief ? "border-rand" : "border-geel"
        }`}
      >
      <div className="flex flex-wrap items-center justify-between gap-3">
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
            {club.adres && <div className="text-xs text-grijs">📍 {club.adres}</div>}
            {club.telefoon && <div className="text-xs text-grijs">📞 {club.telefoon}</div>}
            {!club.actief && club.ingediend_door && (
              <div className="text-xs text-grijs">
                {t.beheer.ingediendDoor(club.ingediend_door)}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
              club.actief ? "bg-[#ecfdf5] text-groen" : "bg-[#fffbeb] text-[#b45309]"
            }`}
          >
            {club.actief ? t.beheer.actief : t.beheer.inactief}
          </span>
          <button
            onClick={() => setBewerkId(club.id)}
            className="whitespace-nowrap rounded-md border border-rand px-3 py-1.5 text-sm font-semibold text-donker transition-all hover:border-blauw-3 hover:bg-licht active:scale-[0.97]"
          >
            {t.beheer.bewerken}
          </button>
          <button
            onClick={() => toggleActief(club)}
            disabled={bezig === club.id}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-60 disabled:active:scale-100 ${
              club.actief
                ? "border border-rand text-donker hover:border-blauw-3 hover:bg-licht"
                : "bg-groen text-white shadow-sm hover:shadow-md hover:brightness-105"
            }`}
          >
            {club.actief ? t.beheer.deactiveren : t.beheer.activeren}
          </button>
          <button
            onClick={() => (isAdmin ? verwijderen(club.id) : setVerwijderAanvraagId(club.id))}
            disabled={bezig === club.id}
            className="whitespace-nowrap rounded-md bg-rood px-3 py-1.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-rood-2 hover:shadow-md active:scale-[0.97] disabled:opacity-60 disabled:active:scale-100"
          >
            {isAdmin ? t.beheer.verwijderen : t.beheer.verwijderingAanvragen}
          </button>
        </div>
      </div>

      {verwijderAanvraagId === club.id && (
        <div className="flex flex-col gap-2 border-t border-rand pt-3">
          <label className="text-xs font-bold text-donker">{t.beheer.waaromVerwijderen}</label>
          <textarea
            rows={2}
            value={verwijderReden}
            onChange={(e) => setVerwijderReden(e.target.value)}
            className="veld-input resize-none"
          />
          {!verwijderReden.trim() && <p className="text-xs text-grijs">{t.beheer.redenVerplicht}</p>}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={verwijderingAanvragen}
              disabled={bezig === club.id || !verwijderReden.trim()}
              className="rounded-md bg-rood px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-rood-2 hover:shadow-md active:scale-[0.97] disabled:opacity-60 disabled:active:scale-100"
            >
              {t.beheer.bevestigen}
            </button>
            <button
              onClick={() => {
                setVerwijderAanvraagId(null);
                setVerwijderReden("");
              }}
              className="rounded-md border border-rand px-4 py-2 text-sm font-semibold text-donker transition-all hover:border-blauw-3 hover:bg-licht active:scale-[0.97]"
            >
              {t.beheer.annuleren}
            </button>
          </div>
        </div>
      )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {melding && (
        <div className="fixed right-6 top-6 z-50 rounded-md bg-groen px-4 py-2.5 text-sm font-bold text-white shadow-lg">
          {melding}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => setToevoegenOpen((v) => !v)}
          className="rounded-md bg-blauw px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-blauw-2 hover:shadow-md active:scale-[0.97]"
        >
          {t.beheer.nieuweClub}
        </button>
      </div>

      {toevoegenOpen && (
        <ClubFormulier
          onKlaar={() => {
            setToevoegenOpen(false);
            toonMelding(t.beheer.clubToegevoegd);
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-donker">
            {t.beheer.alleClubs}
          </h2>
          <input
            type="search"
            value={zoekterm}
            onChange={(e) => setZoekterm(e.target.value)}
            placeholder={t.clubsPagina.zoekPlaceholder}
            className="veld-input w-full sm:w-64"
          />
        </div>
        {overige.length === 0 && (
          <p className="text-sm text-grijs">{t.clubsPagina.geenResultaten}</p>
        )}
        <div className="flex flex-col gap-3">
          {ALLE_PROVINCIES.map((p) => {
            const clubsInProvincie = overige
              .filter((c) => c.provincie === p)
              .sort((a, b) => a.naam.localeCompare(b.naam));
            if (clubsInProvincie.length === 0) return null;
            const uitgeklapt = zoekterm.trim().length > 0 || opengeklapt.has(p);
            return (
              <div
                key={p}
                className={`rounded-[10px] border-[1.5px] bg-white transition-shadow ${
                  uitgeklapt ? "border-geel/60 shadow-[0_2px_10px_rgba(244,196,48,0.15)]" : "border-rand"
                }`}
              >
                <button
                  onClick={() => toggleProvincie(p)}
                  className="group flex w-full items-center justify-between gap-2 p-4 text-left"
                >
                  <span className="text-[0.8rem] font-extrabold uppercase tracking-widest text-[#b8860b] transition-colors group-hover:text-donker">
                    {vertaalProvincie(p, taal)}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="rounded-full bg-[#fdf3d9] px-2.5 py-0.5 text-xs font-bold text-[#b8860b]">
                      {clubsInProvincie.length}
                    </span>
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs text-[#b8860b] transition-all ${
                        uitgeklapt
                          ? "rotate-90 bg-geel text-donker"
                          : "bg-[#fdf3d9] group-hover:bg-geel group-hover:text-donker"
                      }`}
                      aria-hidden="true"
                    >
                      ›
                    </span>
                  </span>
                </button>
                {uitgeklapt && (
                  <div className="flex flex-col gap-2 p-4 pt-0">{clubsInProvincie.map(renderClub)}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ClubFormulier({
  club,
  isAdmin = false,
  onKlaar,
  onAnnuleren,
}: {
  club?: Club;
  isAdmin?: boolean;
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
  const [telefoon, setTelefoon] = useState(club?.telefoon ?? "");
  const [openingsuren, setOpeningsuren] = useState(club?.openingsuren ?? "");
  const [fotoUrl, setFotoUrl] = useState(club?.foto_url ?? null);
  const [fotoBezig, setFotoBezig] = useState(false);
  const [fotoFout, setFotoFout] = useState(false);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  // Openingsuren per dag (zomer/winter): enkel voor de admin bij een bestaande club. De admin staat meteen online.
  const toonUren = !!club && isAdmin;
  const [uren, setUren] = useState<ClubUren | null>(null);
  const [startUren, setStartUren] = useState<ClubUren | null>(null);
  const [urenFout, setUrenFout] = useState(false);

  useEffect(() => {
    if (!toonUren || !club) return;
    let geannuleerd = false;
    haalMijnClub(club.id).then((gegevens) => {
      if (geannuleerd) return;
      if (!gegevens) {
        setUrenFout(true);
        return;
      }
      const begin = gegevens.uren ?? leegUren();
      setStartUren(begin);
      setUren(JSON.parse(JSON.stringify(begin)) as ClubUren);
    });
    return () => {
      geannuleerd = true;
    };
  }, [toonUren, club]);

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
    setFout(null);
    const resultaat = club
      ? await clubBewerken(club.id, {
          naam,
          gemeente,
          provincie: provincie as Provincie,
          adres: adres || null,
          website: website || null,
          contact_email: contactEmail || null,
          telefoon: telefoon || null,
          openingsuren: openingsuren || null,
          foto_url: fotoUrl,
        })
      : await clubToevoegen({
          naam,
          gemeente,
          provincie,
          adres,
          website,
          contact_email: contactEmail,
          telefoon,
          openingsuren,
          foto_url: fotoUrl,
        });
    if (resultaat.succes && club && uren && !gelijkeUren(uren, startUren)) {
      const urenResultaat = await dienVoorstelIn(club.id, { uren });
      if (!urenResultaat.succes) {
        setBezig(false);
        setFout(urenResultaat.fout);
        return;
      }
    }
    setBezig(false);
    if (!resultaat.succes) {
      setFout(resultaat.fout);
      return;
    }
    onKlaar();
  }

  return (
    <div className="cb-scope">
      <section className="cb-paneel">
        <h2>
          <Ico>
            <path d="M4 20V10l8-6 8 6v10M9 20v-6h6v6" />
          </Ico>
          {t.clubBeheer.bewerkClub}
        </h2>
        <div className="cb-rij2">
          <div className="cb-veld">
            <label htmlFor="cf-naam">{t.clubForm.naam}</label>
            <input id="cf-naam" type="text" value={naam} onChange={(e) => setNaam(e.target.value)} />
          </div>
          <div className="cb-veld">
            <label htmlFor="cf-gemeente">{t.clubForm.gemeente}</label>
            <input id="cf-gemeente" type="text" value={gemeente} onChange={(e) => setGemeente(e.target.value)} />
          </div>
          <div className="cb-veld">
            <label htmlFor="cf-provincie">{t.clubForm.provincie}</label>
            <select id="cf-provincie" value={provincie} onChange={(e) => setProvincie(e.target.value as Provincie)}>
              <option value="" disabled>
                {t.form.kiesProvincie}
              </option>
              {ALLE_PROVINCIES.map((p) => (
                <option key={p} value={p}>
                  {vertaalProvincie(p, taal)}
                </option>
              ))}
            </select>
          </div>
          <div className="cb-veld">
            <label htmlFor="cf-adres">{t.clubForm.adres}</label>
            <input id="cf-adres" type="text" value={adres} onChange={(e) => setAdres(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="cb-paneel">
        <h2>
          <Ico>
            <path d="M4 6h16v12H4zM4 7l8 6 8-6" />
          </Ico>
          {t.clubBeheer.gegevensTitel}
        </h2>
        <div className="cb-rij2">
          <div className="cb-veld">
            <label htmlFor="cf-mail">{t.clubForm.contactEmail}</label>
            <input id="cf-mail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
          </div>
          <div className="cb-veld">
            <label htmlFor="cf-tel">{t.clubForm.telefoon}</label>
            <input id="cf-tel" type="tel" value={telefoon} onChange={(e) => setTelefoon(e.target.value)} />
          </div>
        </div>
        <div className="cb-veld">
          <label htmlFor="cf-web">{t.clubForm.website}</label>
          <input
            id="cf-web"
            type="text"
            inputMode="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            onBlur={(e) => setWebsite(normaliseerUrl(e.target.value))}
          />
        </div>
      </section>

      <section className="cb-paneel">
        <h2>
          <Ico>
            <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
            <circle cx="12" cy="13" r="3.5" />
          </Ico>
          {t.clubForm.foto}
        </h2>
        <div className="cb-foto-rij">
          {fotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fotoUrl} alt="" className="cb-foto" />
          ) : (
            <div className="cb-logo cb-foto" />
          )}
          <div>
            <label className="cb-knop rand cb-bestand">
              {t.clubBeheer.fotoKiezen}
              <input type="file" accept="image/*" onChange={(e) => fotoGekozen(e.target.files?.[0] ?? null)} />
            </label>
            <p className="cb-uitleg" style={{ margin: "0.5rem 0 0" }}>
              {t.clubForm.fotoHint}
            </p>
            {fotoBezig && <p className="cb-uitleg">{t.form.afficheUploaden}</p>}
            {fotoFout && <p className="cb-melding fout">{t.clubForm.fotoFout}</p>}
          </div>
        </div>
      </section>

      {toonUren && (
        <>
          {urenFout && <p className="cb-melding fout">{t.clubBeheer.nogNietBeschikbaar}</p>}
          {!uren && !urenFout && <p className="cb-uitleg">{t.clubBeheer.bezig}</p>}
          {uren && <UrenBewerker uren={uren} onChange={setUren} />}
        </>
      )}

      <section className="cb-paneel">
        <div className="cb-veld" style={{ marginBottom: 0 }}>
          <label htmlFor="cf-uren-tekst">{t.clubBeheer.oudeTekst}</label>
          <input id="cf-uren-tekst" type="text" value={openingsuren} onChange={(e) => setOpeningsuren(e.target.value)} />
          {toonUren && <p className="cb-uitleg" style={{ margin: "0.3rem 0 0" }}>{t.clubBeheer.oudeTekstUitleg}</p>}
        </div>
      </section>

      {fout && (
        <p className="cb-melding fout">
          {t.beheer.opslaanFout}
          <br />
          <span style={{ fontFamily: "monospace", fontSize: "0.75rem", fontWeight: 400 }}>{fout}</span>
        </p>
      )}

      <div className="cb-actierij">
        <button type="button" className="cb-knop" onClick={opslaan} disabled={bezig || !naam || !gemeente || !provincie}>
          {bezig ? t.beheer.bezigMetOpslaan : t.beheer.opslaan}
        </button>
        <button type="button" className="cb-knop rand" onClick={onAnnuleren}>
          {t.beheer.annuleren}
        </button>
      </div>
    </div>
  );
}
