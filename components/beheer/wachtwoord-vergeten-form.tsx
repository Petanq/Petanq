"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/language-context";
import { createClient } from "@/lib/supabase/client";

export function WachtwoordVergetenForm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "bezig" | "verzonden">("idle");

  async function versturen(e: React.FormEvent) {
    e.preventDefault();
    setStatus("bezig");
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/beheer/wachtwoord-resetten`,
    });
    // Bewust altijd dezelfde melding tonen, ongeacht of het adres bestaat
    // (anders zou je kunnen aftoetsen welke e-mailadressen moderator zijn).
    setStatus("verzonden");
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-6 py-12">
      <h1 className="mb-2 text-center font-titel text-3xl tracking-wide text-blauw">
        {t.beheer.wachtwoordResettenTitel}
      </h1>
      <p className="mb-6 text-center text-sm text-grijs">{t.beheer.wachtwoordResettenBeschrijving}</p>

      {status === "verzonden" ? (
        <p className="rounded-lg border border-rand bg-white p-4 text-center text-sm text-donker">
          {t.beheer.linkVerzonden}
        </p>
      ) : (
        <form onSubmit={versturen} className="flex flex-col gap-4">
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
          <button
            type="submit"
            disabled={status === "bezig"}
            className="mt-2 rounded-lg bg-blauw px-6 py-3 font-bold text-white transition-colors hover:bg-blauw-2 disabled:opacity-60"
          >
            {t.beheer.linkVersturen}
          </button>
        </form>
      )}

      <Link href="/beheer/login" className="mt-6 text-center text-sm font-semibold text-blauw-2 underline">
        {t.beheer.terugNaarInloggen}
      </Link>
    </div>
  );
}
