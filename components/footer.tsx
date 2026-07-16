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
      <div className="mt-3 flex items-center justify-center">
        <a
          href="https://www.facebook.com/profile.php?id=61592011318511"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f1f5f9] text-grijs transition-colors hover:bg-blauw hover:text-white"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
          </svg>
        </a>
      </div>
      <div className="mt-2 flex items-center justify-center gap-3">
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
