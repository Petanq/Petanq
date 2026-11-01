"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/lib/language-context";
import { PaginaKop } from "@/components/pagina-kop";
import { telDoorklik } from "@/components/pagina-bezoek-teller";
import { TEAMBUILDING_DOORKLIK_PAD } from "@/lib/bezoek-paden";

export function OverOnsContent() {
  const { t } = useTranslation();

  return (
    <>
      <PaginaKop titel={t.overOnsPagina.titel} />
      <div className="mx-auto max-w-[1140px] px-6 py-12 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start lg:gap-14 lg:px-10">
        <Image
          src="/images/over-ons.jpg"
          alt=""
          width={1200}
          height={675}
          className="mb-8 aspect-[16/9] w-full rounded-2xl border-2 border-geel/60 object-cover shadow-[0_0_18px_rgba(244,196,48,0.18)] lg:order-last lg:mb-0"
        />
        <div className="max-w-2xl">
          <p className="mb-4 text-sm leading-relaxed text-donker">
            {t.overOnsPagina.alinea1}
          </p>
          <p className="mb-4 text-sm leading-relaxed text-donker">
            {t.overOnsPagina.alinea2}
          </p>
          <p className="mb-6 text-sm leading-relaxed text-donker">
            {t.overOnsPagina.alinea3}{" "}
            <Link
              href="/beheer/aanmelden"
              className="text-rood hover:underline"
            >
              {t.overOnsPagina.vrijwilligerKnop}
            </Link>
          </p>
          <p className="mb-6 text-sm leading-relaxed text-donker">
            {t.overOnsPagina.teambuildingTekst}{" "}
            <a
              href="https://teambuilding13.be"
              target="_blank"
              rel="noopener"
              onClick={() => telDoorklik(TEAMBUILDING_DOORKLIK_PAD)}
              className="text-rood hover:underline"
            >
              {t.overOnsPagina.teambuildingLink}
            </a>
          </p>
          <p className="text-sm text-grijs">
            {t.overOnsPagina.contact}{" "}
            <a
              href="mailto:info@petanque13.be"
              className="text-rood hover:underline"
            >
              info@petanque13.be
            </a>{" "}
            {t.overOnsPagina.ofBel}{" "}
            <a href="tel:0479499167" className="text-rood hover:underline">
              0479 49 91 67
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
