"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/language-context";
import { match13ToegangAanvragen } from "@/actions/match13-toegang";
import { Knop } from "@/components/ui/knop";

export function Match13AanvraagForm() {
  const { t, taal } = useTranslation();
  const [status, setStatus] = useState<"idle" | "bezig" | "ok" | "fout">("idle");
  const [club, setClub] = useState("");
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [telefoon, setTelefoon] = useState("");
  const [bericht, setBericht] = useState("");

  async function versturen(e: React.FormEvent) {
    e.preventDefault();
    setStatus("bezig");
    const resultaat = await match13ToegangAanvragen({ club, naam, email, telefoon, bericht }, taal);
    setStatus(resultaat.succes ? "ok" : "fout");
  }

  if (status === "ok") {
    return (
      <div className="rounded-2xl border border-geel/30 bg-blauw/[0.03] p-8 text-center">
        <p className="text-lg font-semibold text-groen">{t.match13Aanvraag.verzonden}</p>
      </div>
    );
  }

  return (
    <form onSubmit={versturen} className="flex flex-col gap-4 rounded-2xl border border-blauw/10 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="font-titel text-xl tracking-wide text-blauw">{t.match13Aanvraag.formTitel}</h2>
      <Veld label={t.match13Aanvraag.club} verplicht>
        <input required value={club} onChange={(e) => setClub(e.target.value)} className="veld-input" />
      </Veld>
      <Veld label={t.match13Aanvraag.naam} verplicht>
        <input required value={naam} onChange={(e) => setNaam(e.target.value)} className="veld-input" />
      </Veld>
      <Veld label={t.match13Aanvraag.email} verplicht>
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="veld-input" />
      </Veld>
      <Veld label={t.match13Aanvraag.telefoon}>
        <input type="tel" value={telefoon} onChange={(e) => setTelefoon(e.target.value)} className="veld-input" />
      </Veld>
      <Veld label={t.match13Aanvraag.bericht}>
        <textarea
          value={bericht}
          onChange={(e) => setBericht(e.target.value)}
          rows={3}
          placeholder={t.match13Aanvraag.berichtHint}
          className="veld-input"
        />
      </Veld>

      {status === "fout" && <p className="text-sm font-medium text-rood-2">{t.match13Aanvraag.fout}</p>}

      <div className="mt-2">
        <Knop type="submit" variant="geel" disabled={status === "bezig"}>
          {status === "bezig" ? t.match13Aanvraag.bezigMetVersturen : t.match13Aanvraag.versturen}
        </Knop>
      </div>
    </form>
  );
}

function Veld({ label, verplicht, children }: { label: string; verplicht?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[0.8rem] font-bold text-donker">
        {label} {verplicht && <span className="text-rood">*</span>}
      </span>
      {children}
    </label>
  );
}
