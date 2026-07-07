"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "@/lib/language-context";
import { ALLE_PROVINCIES, Provincie, vertaalProvincie } from "@/lib/provincies";
import { clubVoorstellen } from "@/actions/clubs";

export function ClubForm() {
  const { t, taal } = useTranslation();
  const zoekParams = useSearchParams();
  const voorgeselecteerdeProvincie = zoekParams.get("provincie") as Provincie | null;

  const [status, setStatus] = useState<"idle" | "bezig" | "ok" | "fout">("idle");
  const [naam, setNaam] = useState("");
  const [gemeente, setGemeente] = useState("");
  const [provincie, setProvincie] = useState<Provincie | "">(voorgeselecteerdeProvincie ?? "");
  const [website, setWebsite] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  async function versturen(e: React.FormEvent) {
    e.preventDefault();
    setStatus("bezig");
    const resultaat = await clubVoorstellen({
      naam,
      gemeente,
      provincie,
      website: website || undefined,
      contact_email: contactEmail || undefined,
    });
    setStatus(resultaat.succes ? "ok" : "fout");
  }

  if (status === "ok") {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <p className="mb-6 text-lg font-semibold text-groen">{t.clubForm.verzonden}</p>
        <Link href="/clubs" className="text-blauw-2 underline">
          {t.clubsPagina.titel}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <h1 className="mb-2 font-titel text-3xl tracking-wide text-blauw">{t.clubForm.titel}</h1>
      <p className="mb-8 text-sm text-grijs">{t.clubForm.beschrijving}</p>

      <form onSubmit={versturen} className="flex flex-col gap-4">
        <Veld label={t.clubForm.naam} verplicht>
          <input
            required
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
            className="veld-input"
          />
        </Veld>
        <Veld label={t.clubForm.gemeente} verplicht>
          <input
            required
            value={gemeente}
            onChange={(e) => setGemeente(e.target.value)}
            className="veld-input"
          />
        </Veld>
        <Veld label={t.clubForm.provincie} verplicht>
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
        <Veld label={t.clubForm.website}>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://"
            className="veld-input"
          />
        </Veld>
        <Veld label={t.clubForm.contactEmail}>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="veld-input"
          />
        </Veld>

        {status === "fout" && <p className="text-sm font-medium text-rood-2">{t.form.fout}</p>}

        <div className="mt-2 flex gap-3">
          <button
            type="submit"
            disabled={status === "bezig"}
            className="rounded-lg bg-rood px-6 py-3 font-bold text-white transition-colors hover:bg-rood-2 disabled:opacity-60"
          >
            {t.clubForm.versturen}
          </button>
          <Link
            href="/clubs"
            className="rounded-lg border-[1.5px] border-rand px-6 py-3 font-semibold text-donker"
          >
            {t.clubForm.annuleren}
          </Link>
        </div>
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
