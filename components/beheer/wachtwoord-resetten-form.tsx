"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/lib/language-context";
import { createClient } from "@/lib/supabase/client";
import { moderatorWachtwoordBevestigen } from "@/actions/beheer-moderatoren";

export function WachtwoordResettenForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const [wachtwoord, setWachtwoord] = useState("");
  const [status, setStatus] = useState<"idle" | "bezig" | "gelukt" | "te_kort" | "fout">("idle");
  const [foutDetail, setFoutDetail] = useState<string | null>(null);

  async function opslaan(e: React.FormEvent) {
    e.preventDefault();
    if (wachtwoord.length < 8) {
      setStatus("te_kort");
      return;
    }
    setStatus("bezig");
    setFoutDetail(null);
    const supabase = createClient();
    // De link zet het inlog-token in de URL; de client moet dat eerst zelf verwerken
    // (asynchroon, bij het aanmaken van de client) voordat updateUser() een sessie heeft.
    await supabase.auth.getSession();
    const { error } = await supabase.auth.updateUser({ password: wachtwoord });
    if (error) {
      console.error("Wachtwoord instellen mislukt:", error.message);
      setFoutDetail(error.message);
      setStatus("fout");
      return;
    }
    await moderatorWachtwoordBevestigen();
    setStatus("gelukt");
    setTimeout(() => router.push("/beheer/login"), 2000);
  }

  if (status === "gelukt") {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-6 py-12 text-center">
        <p className="rounded-lg border border-rand bg-white p-4 text-sm text-groen">
          {t.beheer.wachtwoordGewijzigd}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-6 py-12">
      <h1 className="mb-6 text-center font-titel text-3xl tracking-wide text-blauw">
        {t.beheer.wachtwoordResettenTitel}
      </h1>
      <form onSubmit={opslaan} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[0.8rem] font-bold text-donker">{t.beheer.nieuwWachtwoord}</span>
          <input
            type="password"
            required
            minLength={8}
            value={wachtwoord}
            onChange={(e) => setWachtwoord(e.target.value)}
            className="veld-input"
          />
        </label>
        {status === "te_kort" && <p className="text-sm font-medium text-rood-2">{t.beheer.wachtwoordTeKort}</p>}
        {status === "fout" && (
          <p className="text-sm font-medium text-rood-2">
            {t.form.fout}
            {foutDetail && <span className="mt-0.5 block text-xs font-normal text-grijs">({foutDetail})</span>}
          </p>
        )}
        <button
          type="submit"
          disabled={status === "bezig"}
          className="mt-2 rounded-lg bg-blauw px-6 py-3 font-bold text-white transition-colors hover:bg-blauw-2 disabled:opacity-60"
        >
          {t.beheer.nieuwWachtwoordOpslaan}
        </button>
      </form>
      <Link href="/beheer/login" className="mt-6 text-center text-sm font-semibold text-blauw-2 underline">
        {t.beheer.terugNaarInloggen}
      </Link>
    </div>
  );
}
