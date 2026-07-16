"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/language-context";

export function Footer() {
  const { t } = useTranslation();

  return (
    <div className="mt-3 border-t border-rand px-6 py-6 text-center text-[0.77rem] text-grijs">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/logo-wordmark.png"
        alt="Petanque13"
        className="mx-auto mb-3 h-10 w-auto"
      />
      <span>
        {t.footer.tekst}{" "}
        <a href="mailto:info@petanque13.be" className="text-rood no-underline hover:underline">
          {t.footer.link}
        </a>
      </span>
      <div className="mt-3 flex items-center justify-center gap-3">
        <Link href="/privacybeleid" className="text-grijs underline hover:text-donker">
          {t.footer.privacybeleid}
        </Link>
        <span className="text-rand">·</span>
        <Link href="/beheer/login" className="text-grijs underline hover:text-donker">
          {t.nav.login}
        </Link>
      </div>
    </div>
  );
}
