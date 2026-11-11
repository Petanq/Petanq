"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/lib/language-context";
import { telDoorklik } from "@/components/pagina-bezoek-teller";
import { TEAMBUILDING_DOORKLIK_PAD } from "@/lib/bezoek-paden";

export function Footer() {
  const { t } = useTranslation();

  return (
    <div className="mt-3 border-t border-rand px-6 py-6 text-center text-[0.77rem] text-grijs">
      <Image
        src="/images/logo-volledig.png"
        alt="Petanque13"
        width={177}
        height={40}
        className="mx-auto mb-3"
      />
      <span>
        {t.footer.tekst}{" "}
        <a href="mailto:info@petanque13.be" className="text-rood underline underline-offset-2 hover:no-underline [.site-foto_&]:text-rood-2">
          {t.footer.link}
        </a>
      </span>
      <div className="mt-3">
        {t.footer.teambuilding}{" "}
        <a
          href="https://teambuilding13.be"
          target="_blank"
          rel="noopener"
          onClick={() => telDoorklik(TEAMBUILDING_DOORKLIK_PAD)}
          className="text-rood underline underline-offset-2 hover:no-underline [.site-foto_&]:text-rood-2"
        >
          {t.footer.teambuildingLink}
        </a>
      </div>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2">
        <Link href="/privacybeleid" className="inline-flex min-h-[44px] items-center px-1 text-grijs underline hover:text-donker">
          {t.footer.privacybeleid}
        </Link>
        <span className="text-rand" aria-hidden="true">·</span>
        <Link href="/partners" className="inline-flex min-h-[44px] items-center px-1 text-grijs underline hover:text-donker">
          {t.partnersPagina.titel}
        </Link>
        <span className="text-rand" aria-hidden="true">·</span>
        <Link href="/beheer/login" className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center px-1 text-grijs underline hover:text-donker">
          {t.nav.login}
        </Link>
      </div>
      <div className="mt-2 text-[0.75rem] text-grijs">
        {t.footer.copyright} · Frederic Keulemans · {t.footer.ondernemingsnr} BE 1042.720.306
      </div>
    </div>
  );
}
