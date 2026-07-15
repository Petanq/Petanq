"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/language-context";
import { Logo } from "./logo";
import { LanguageToggle } from "./language-toggle";

export function Nav() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-[300] border-b border-white/[0.07] bg-blauw">
      <div className="flex h-16 items-center justify-between px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo className="h-14 w-14" />
          <div className="flex flex-col leading-none">
            <span className="flex items-center font-titel text-2xl font-extrabold tracking-tight text-white">
              Petanque13
            </span>
            <span className="text-[0.6rem] font-semibold uppercase tracking-widest text-white/40">
              {t.nav.subtitel}
            </span>
          </div>
        </Link>

        <div className="hidden gap-1 md:flex">
          <Link href="/#toernooien" className="rounded-md px-3.5 py-1.5 text-[0.85rem] font-medium text-white/65 transition-colors hover:bg-white/[0.08] hover:text-geel">
            {t.nav.toernooien}
          </Link>
          <Link href="/provincies" className="rounded-md px-3.5 py-1.5 text-[0.85rem] font-medium text-white/65 transition-colors hover:bg-white/[0.08] hover:text-geel">
            {t.nav.provincies}
          </Link>
          <Link href="/clubs" className="rounded-md px-3.5 py-1.5 text-[0.85rem] font-medium text-white/65 transition-colors hover:bg-white/[0.08] hover:text-geel">
            {t.nav.clubs}
          </Link>
          <Link href="/petanque-reizen" className="rounded-md px-3.5 py-1.5 text-[0.85rem] font-medium text-white/65 transition-colors hover:bg-white/[0.08] hover:text-geel">
            {t.nav.reizen}
          </Link>
          <Link href="/over-ons" className="rounded-md px-3.5 py-1.5 text-[0.85rem] font-medium text-white/65 transition-colors hover:bg-white/[0.08] hover:text-geel">
            {t.nav.overOns}
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <LanguageToggle />
          <Link
            href="/beheer/login"
            title={t.nav.login}
            className="hidden items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-[0.83rem] font-medium text-white/50 transition-colors hover:bg-white/[0.08] hover:text-geel sm:flex"
          >
            🔒 {t.nav.login}
          </Link>
          <Link
            href="/toernooi-toevoegen"
            className="hidden whitespace-nowrap rounded-lg bg-rood px-4 py-2 text-[0.83rem] font-bold text-white transition-colors hover:bg-rood-2 sm:block"
          >
            {t.nav.toernooiToevoegen}
          </Link>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-md transition-colors hover:bg-white/[0.08] md:hidden"
          >
            <span className={`h-0.5 w-5 rounded-full bg-white transition-transform ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`h-0.5 w-5 rounded-full bg-white transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`h-0.5 w-5 rounded-full bg-white transition-transform ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="flex flex-col gap-1 border-t border-white/[0.07] bg-blauw px-6 py-3 md:hidden">
          <Link
            href="/#toernooien"
            onClick={() => setMenuOpen(false)}
            className="rounded-md px-3.5 py-2.5 text-[0.9rem] font-medium text-white/80 transition-colors hover:bg-white/[0.08] hover:text-geel"
          >
            {t.nav.toernooien}
          </Link>
          <Link
            href="/provincies"
            onClick={() => setMenuOpen(false)}
            className="rounded-md px-3.5 py-2.5 text-[0.9rem] font-medium text-white/80 transition-colors hover:bg-white/[0.08] hover:text-geel"
          >
            {t.nav.provincies}
          </Link>
          <Link
            href="/clubs"
            onClick={() => setMenuOpen(false)}
            className="rounded-md px-3.5 py-2.5 text-[0.9rem] font-medium text-white/80 transition-colors hover:bg-white/[0.08] hover:text-geel"
          >
            {t.nav.clubs}
          </Link>
          <Link
            href="/petanque-reizen"
            onClick={() => setMenuOpen(false)}
            className="rounded-md px-3.5 py-2.5 text-[0.9rem] font-medium text-white/80 transition-colors hover:bg-white/[0.08] hover:text-geel"
          >
            {t.nav.reizen}
          </Link>
          <Link
            href="/over-ons"
            onClick={() => setMenuOpen(false)}
            className="rounded-md px-3.5 py-2.5 text-[0.9rem] font-medium text-white/80 transition-colors hover:bg-white/[0.08] hover:text-geel"
          >
            {t.nav.overOns}
          </Link>
          <Link
            href="/toernooi-toevoegen"
            onClick={() => setMenuOpen(false)}
            className="mt-1 rounded-md bg-rood px-3.5 py-2.5 text-center text-[0.9rem] font-bold text-white transition-colors hover:bg-rood-2 sm:hidden"
          >
            {t.nav.toernooiToevoegen}
          </Link>
          <Link
            href="/beheer/login"
            onClick={() => setMenuOpen(false)}
            className="rounded-md px-3.5 py-2.5 text-[0.9rem] font-medium text-white/50 transition-colors hover:bg-white/[0.08] hover:text-geel sm:hidden"
          >
            🔒 {t.nav.login}
          </Link>
        </div>
      )}
    </nav>
  );
}
