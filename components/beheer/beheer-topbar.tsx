"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "@/lib/language-context";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/logo";
import { LanguageToggle } from "@/components/language-toggle";

export function BeheerTopbar() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPagina = pathname === "/beheer/login";

  async function uitloggen() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/beheer/login");
    router.refresh();
  }

  return (
    <nav className="flex h-16 items-center justify-between border-b border-white/10 bg-donker px-6 lg:px-10">
      <div className="flex items-center gap-3">
        <Link href="/beheer" className="flex items-center gap-2.5">
          <Logo className="h-14 w-14" />
          <span className="flex items-center font-titel text-xl font-extrabold tracking-tight text-white">
            Petanque13
          </span>
        </Link>
        <span className="rounded-full border border-geel/40 bg-geel/10 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-widest text-geel">
          {t.beheer.dashboard}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="hidden text-sm font-medium text-white/60 transition-colors hover:text-white sm:inline"
        >
          ← {t.beheer.naarWebsite}
        </Link>
        <LanguageToggle />
        {!isLoginPagina && (
          <button
            onClick={uitloggen}
            className="whitespace-nowrap rounded-lg bg-rood px-4 py-2 text-[0.83rem] font-bold text-white transition-colors hover:bg-rood-2"
          >
            {t.beheer.uitloggen}
          </button>
        )}
      </div>
    </nav>
  );
}
