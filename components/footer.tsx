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
        <a href="mailto:info@petanque13.be" className="text-rood no-underline hover:underline">
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
          className="text-rood no-underline hover:underline"
        >
          {t.footer.teambuildingLink}
        </a>
      </div>
      <div className="mt-3 flex items-center justify-center gap-3">
        <Link href="/privacybeleid" className="text-grijs underline hover:text-donker">
          {t.footer.privacybeleid}
        </Link>
        <span className="text-rand">·</span>
        <Link href="/partners" className="text-grijs underline hover:text-donker">
          {t.partnersPagina.titel}
        </Link>
        <span className="text-rand">·</span>
        <Link href="/beheer/login" className="text-grijs underline hover:text-donker">
          {t.nav.login}
        </Link>
      </div>
      <div className="mt-3 text-[0.7rem] text-grijs/70">
        {t.footer.copyright} · Frederic Keulemans · {t.footer.ondernemingsnr} BE 1042.720.306
      </div>
    </div>
  );
}
