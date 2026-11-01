"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/lib/language-context";
import { PaginaKop } from "@/components/pagina-kop";
import { PARTNERS } from "@/lib/partners";
import { Knop } from "@/components/ui/knop";
import {
  PaginaBezoekTeller,
  telDoorklik,
} from "@/components/pagina-bezoek-teller";
import { PARTNERS_PAD, DOSSIER_AANVRAAG_PAD } from "@/lib/bezoek-paden";

export function PartnersContent() {
  const { t } = useTranslation();

  return (
    <>
      <PaginaKop titel={t.partnersPagina.titel} />
      <div className="mx-auto max-w-[1140px] px-6 py-12 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start lg:gap-14 lg:px-10">
        <Image
          src="/images/boules-vrienden.jpg"
          alt=""
          width={800}
          height={600}
          className="mb-8 h-56 w-full rounded-2xl border-2 border-geel/60 object-cover shadow-[0_0_18px_rgba(244,196,48,0.18)] sm:h-72 lg:order-last lg:mb-0 lg:h-[26rem]"
        />
        <div className="max-w-2xl">
          <PaginaBezoekTeller pad={PARTNERS_PAD} />
          <p className="mb-8 text-sm leading-relaxed text-donker">
            {t.partnersPagina.intro}
          </p>

          <h2 className="mb-3 font-titel text-lg tracking-wide text-blauw">
            {t.partnersPagina.kenmerkenTitel}
          </h2>
          <ul className="mb-10 flex flex-col gap-3">
            {t.partnersPagina.kenmerken.map((kenmerk) => (
              <li
                key={kenmerk}
                className="flex items-start gap-3 text-sm leading-relaxed text-donker"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-geel text-[0.65rem] font-bold text-donker">
                  ✓
                </span>
                {kenmerk}
              </li>
            ))}
          </ul>

          <h2 className="mb-3 font-titel text-lg tracking-wide text-blauw">
            {t.partnersPagina.onzePartnersTitel}
          </h2>
          {PARTNERS.length > 0 ? (
            <ul className="mb-10 flex flex-wrap gap-4">
              {PARTNERS.map((pt) => {
                const logo = (
                  <Image
                    src={pt.logo}
                    alt={pt.naam}
                    width={200}
                    height={64}
                    className="h-16 w-auto rounded-md object-contain"
                  />
                );
                return (
                  <li
                    key={pt.naam}
                    className="rounded-xl border border-rand bg-white p-4 transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
                  >
                    {pt.url?.startsWith("/") ? (
                      <Link href={pt.url} title={pt.naam}>
                        {logo}
                      </Link>
                    ) : pt.url ? (
                      <a
                        href={pt.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={pt.naam}
                      >
                        {logo}
                      </a>
                    ) : (
                      logo
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="mb-10 rounded-xl border border-rand bg-[#faf9f6] p-8 text-center text-sm text-grijs">
              {t.partnersPagina.nogGeenPartners}
            </div>
          )}

          <div className="mb-6">
            <Knop
              variant="geel"
              onClick={() => telDoorklik(DOSSIER_AANVRAAG_PAD)}
              href={`mailto:info@petanque13.be?subject=${encodeURIComponent(t.partnersPagina.dossierMailOnderwerp)}&body=${encodeURIComponent(t.partnersPagina.dossierMailTekst)}`}
            >
              {t.partnersPagina.dossierKnop}
            </Knop>
          </div>

          <p className="text-sm text-grijs">
            {t.partnersPagina.ctaTekst}{" "}
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
