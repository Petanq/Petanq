"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/language-context";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [wachtwoord, setWachtwoord] = useState("");
  const [fout, setFout] = useState(false);
  const [bezig, setBezig] = useState(false);

  async function inloggen(e: React.FormEvent) {
    e.preventDefault();
    setBezig(true);
    setFout(false);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: wachtwoord });
    setBezig(false);
    if (error) {
      setFout(true);
      return;
    }
    router.push("/beheer");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-6 py-12">
      <h1 className="mb-6 text-center font-titel text-3xl tracking-wide text-blauw">
        {t.beheer.inloggen}
      </h1>
      <form onSubmit={inloggen} className="flex flex-col gap-4">
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
          <span className="text-[0.8rem] font-bold text-donker">{t.beheer.wachtwoord}</span>
          <input
            type="password"
            required
            value={wachtwoord}
            onChange={(e) => setWachtwoord(e.target.value)}
            className="veld-input"
          />
        </label>
        {fout && <p className="text-sm font-medium text-rood-2">{t.beheer.inlogFout}</p>}
        <button
          type="submit"
          disabled={bezig}
          className="mt-2 rounded-lg bg-blauw px-6 py-3 font-bold text-white transition-colors hover:bg-blauw-2 disabled:opacity-60"
        >
          {t.beheer.inloggenKnop}
        </button>
        <Link
          href="/beheer/wachtwoord-vergeten"
          className="text-center text-sm font-semibold text-blauw-2 underline"
        >
          {t.beheer.wachtwoordVergeten}
        </Link>
      </form>
    </div>
  );
}
