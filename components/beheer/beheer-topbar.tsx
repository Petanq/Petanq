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
    <nav className="flex h-16 items-center justify-between gap-2 border-b border-white/10 bg-donker px-3 sm:px-6 lg:px-10">
      <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
        <Link href="/beheer" className="flex min-w-0 items-center gap-1.5 sm:gap-2.5">
          <Logo className="h-9 w-9 shrink-0 sm:h-14 sm:w-14" />
          <span className="truncate font-titel text-base font-extrabold tracking-tight text-white sm:text-xl">
            Petanque13
          </span>
        </Link>
        <span className="hidden shrink-0 rounded-full border border-geel/40 bg-geel/10 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-widest text-geel sm:inline-block">
          {t.beheer.dashboard}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-1 sm:gap-3">
        <Link
          href="/"
          title={t.beheer.naarWebsite}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-base text-white transition-colors active:scale-95 sm:h-auto sm:w-auto sm:rounded-md sm:bg-transparent sm:px-3 sm:py-2 sm:text-sm sm:font-medium sm:text-white/60 sm:hover:bg-white/[0.08] sm:hover:text-white"
        >
          <span className="sm:hidden">←</span>
          <span className="hidden sm:inline">← {t.beheer.naarWebsite}</span>
        </Link>
        <LanguageToggle />
        {!isLoginPagina && (
          <button
            onClick={uitloggen}
            className="shrink-0 whitespace-nowrap rounded-lg bg-rood px-2.5 py-1.5 text-[0.72rem] font-bold text-white transition-colors hover:bg-rood-2 sm:px-4 sm:py-2 sm:text-[0.83rem]"
          >
            {t.beheer.uitloggen}
          </button>
        )}
      </div>
    </nav>
  );
}
