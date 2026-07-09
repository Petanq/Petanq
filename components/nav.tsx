"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/language-context";
import { Logo } from "./logo";
import { LanguageToggle } from "./language-toggle";

export function Nav() {
  const { t } = useTranslation();

  return (
    <nav className="sticky top-0 z-[300] flex h-16 items-center justify-between border-b border-white/[0.07] bg-blauw px-6 lg:px-10">
      <Link href="/" className="flex items-center gap-2.5">
        <Logo />
        <div className="flex flex-col leading-none">
          <span className="flex items-center font-titel text-2xl font-extrabold tracking-tight text-white">
            Qpetanque
          </span>
          <span className="text-[0.6rem] font-semibold uppercase tracking-widest text-white/40">
            {t.nav.subtitel}
          </span>
        </div>
      </Link>

      <div className="hidden gap-1 md:flex">
        <Link href="/#toernooien" className="rounded-md px-3.5 py-1.5 text-[0.85rem] font-medium text-white/65 transition-colors hover:bg-white/[0.08] hover:text-white">
          {t.nav.toernooien}
        </Link>
        <Link href="/provincies" className="rounded-md px-3.5 py-1.5 text-[0.85rem] font-medium text-white/65 transition-colors hover:bg-white/[0.08] hover:text-white">
          {t.nav.provincies}
        </Link>
        <Link href="/clubs" className="rounded-md px-3.5 py-1.5 text-[0.85rem] font-medium text-white/65 transition-colors hover:bg-white/[0.08] hover:text-white">
          {t.nav.clubs}
        </Link>
        <Link href="/over-ons" className="rounded-md px-3.5 py-1.5 text-[0.85rem] font-medium text-white/65 transition-colors hover:bg-white/[0.08] hover:text-white">
          {t.nav.overOns}
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <LanguageToggle />
        <Link
          href="/beheer/login"
          title={t.nav.login}
          className="hidden items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-[0.83rem] font-medium text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white sm:flex"
        >
          🔒 {t.nav.login}
        </Link>
        <Link
          href="/toernooi-toevoegen"
          className="whitespace-nowrap rounded-lg bg-rood px-4 py-2 text-[0.83rem] font-bold text-white transition-colors hover:bg-rood-2"
        >
          {t.nav.toernooiToevoegen}
        </Link>
      </div>
    </nav>
  );
}
