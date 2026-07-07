"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/language-context";
import { inschrijvenOpNieuwsbrief } from "@/actions/nieuwsbrief";

export function NewsletterBlock() {
  const { t, taal } = useTranslation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "bezig" | "ok" | "fout">("idle");

  async function versturen(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("bezig");
    const resultaat = await inschrijvenOpNieuwsbrief({ email, provincie: null, taal });
    if (resultaat.succes) {
      setStatus("ok");
      setEmail("");
    } else {
      setStatus("fout");
    }
  }

  return (
    <div className="relative mt-4 grid grid-cols-1 gap-6 overflow-hidden rounded-xl bg-gradient-to-br from-blauw to-[#1e3a6e] p-7 sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <div className="mb-1 font-titel text-2xl tracking-wide text-white">{t.nieuwsbrief.titel}</div>
        <div className="text-[0.83rem] text-white/55">{t.nieuwsbrief.subtitel}</div>
      </div>
      <form onSubmit={versturen} className="flex flex-wrap gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.nieuwsbrief.emailPlaceholder}
          className="w-[200px] rounded-lg border-none px-3.5 py-2.5 font-body text-[0.85rem] outline-none"
        />
        <button
          type="submit"
          disabled={status === "bezig"}
          className="rounded-lg bg-geel px-4 py-2.5 font-bold text-donker disabled:opacity-60"
        >
          {t.nieuwsbrief.inschrijven}
        </button>
      </form>
      {status === "ok" && (
        <p className="col-span-full text-[0.8rem] font-medium text-geel">{t.nieuwsbrief.dankjewel}</p>
      )}
      {status === "fout" && (
        <p className="col-span-full text-[0.8rem] font-medium text-rood-2">{t.nieuwsbrief.fout}</p>
      )}
    </div>
  );
}
