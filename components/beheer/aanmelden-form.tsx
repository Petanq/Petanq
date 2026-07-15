"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/language-context";
import { ALLE_PROVINCIES, Provincie, vertaalProvincie } from "@/lib/provincies";
import { vrijwilligerAanmelden } from "@/actions/vrijwilliger-aanmelden";

export function AanmeldenForm() {
  const { t, taal } = useTranslation();
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [wachtwoord, setWachtwoord] = useState("");
  const [provincie, setProvincie] = useState<Provincie | "">("");
  const [status, setStatus] = useState<"idle" | "bezig" | "verzonden" | "te_kort" | "fout">("idle");
  const [foutCode, setFoutCode] = useState<string | null>(null);

  async function versturen(e: React.FormEvent) {
    e.preventDefault();
    if (wachtwoord.length < 8) {
      setStatus("te_kort");
      return;
    }
    setStatus("bezig");
    setFoutCode(null);
    const resultaat = await vrijwilligerAanmelden({
      naam,
      email,
      wachtwoord,
      provincie,
    });
    if (!resultaat.succes) {
      setFoutCode(resultaat.fout);
      setStatus("fout");
      return;
    }
    setStatus("verzonden");
  }

  if (status === "verzonden") {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-6 py-12 text-center">
        <p className="rounded-lg border border-rand bg-white p-4 text-sm text-groen">
          {t.beheer.aanmeldingVerzonden}
        </p>
        <Link href="/beheer/login" className="mt-6 text-center text-sm font-semibold text-blauw-2 underline">
          {t.beheer.terugNaarInloggen}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-6 py-12">
      <h1 className="mb-2 text-center font-titel text-3xl tracking-wide text-blauw">
        {t.beheer.aanmeldenTitel}
      </h1>
      <p className="mb-6 text-center text-sm text-grijs">{t.beheer.aanmeldenBeschrijving}</p>
      <form onSubmit={versturen} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[0.8rem] font-bold text-donker">{t.beheer.naam}</span>
          <input required value={naam} onChange={(e) => setNaam(e.target.value)} className="veld-input" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[0.8rem] font-bold text-donker">{t.beheer.email}</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="veld-input"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[0.8rem] font-bold text-donker">{t.beheer.kiesWachtwoord}</span>
          <input
            type="password"
            required
            minLength={8}
            value={wachtwoord}
            onChange={(e) => setWachtwoord(e.target.value)}
            className="veld-input"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[0.8rem] font-bold text-donker">{t.clubForm.provincie}</span>
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
          <span className="text-xs text-grijs">{t.beheer.provincieUitleg}</span>
        </label>
        {status === "te_kort" && <p className="text-sm font-medium text-rood-2">{t.beheer.wachtwoordTeKort}</p>}
        {status === "fout" && (
          <p className="text-sm font-medium text-rood-2">
            {foutCode === "al_geregistreerd" ? t.beheer.foutAlGeregistreerd : t.form.fout}
          </p>
        )}
        <button
          type="submit"
          disabled={status === "bezig"}
          className="mt-2 rounded-lg bg-blauw px-6 py-3 font-bold text-white transition-colors hover:bg-blauw-2 disabled:opacity-60"
        >
          {t.beheer.aanmeldenKnop}
        </button>
      </form>
      <Link href="/beheer/login" className="mt-6 text-center text-sm font-semibold text-blauw-2 underline">
        {t.beheer.terugNaarInloggen}
      </Link>
    </div>
  );
}
