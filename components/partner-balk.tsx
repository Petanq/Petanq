"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/lib/language-context";
import { PARTNERS } from "@/lib/partners";

// Balk onder de kop van de homepage. Zonder partners: uitnodiging om partner
// te worden. Met partners: hun logo's op een lichte kaart zodat ze goed
// uitkomen op de donkere balk, met onderaan een discrete link.
export function PartnerBalk() {
  const { t } = useTranslation();
  const heeftPartners = PARTNERS.length > 0;

  return (
    <div>
      {/* Gouden lijn die aan de zijkanten wegvloeit i.p.v. een harde streep. */}
      <div aria-hidden="true" className="h-[3px] bg-gradient-to-r from-geel/0 via-geel to-geel/0" />
      <div className="bg-gradient-to-b from-[#161616]/95 to-[#161616]/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1140px] flex-col items-start gap-x-8 gap-y-3 px-6 py-5 sm:flex-row sm:flex-wrap sm:items-center lg:px-10">
          <span className="text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-geel">
            {t.partnerBalk.label}
          </span>

          {heeftPartners ? (
            <>
              <ul className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-3">
                {PARTNERS.map((p) => {
                  const logo = (
                    <span className="block rounded-xl bg-white p-1.5 shadow-[0_6px_20px_rgba(0,0,0,0.45)] ring-1 ring-geel/40 transition-all group-hover:-translate-y-0.5 group-hover:ring-geel">
                      <Image
                        src={p.logo}
                        alt={p.naam}
                        width={200}
                        height={64}
                        className="h-14 w-auto rounded-md object-contain"
                      />
                    </span>
                  );
                  return (
                    <li key={p.naam}>
                      {p.url?.startsWith("/") ? (
                        <Link href={p.url} title={p.naam} className="group block">
                          {logo}
                        </Link>
                      ) : p.url ? (
                        <a href={p.url} target="_blank" rel="noopener noreferrer" title={p.naam} className="group block">
                          {logo}
                        </a>
                      ) : (
                        <span className="group block">{logo}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
              <Link
                href="/partners"
                className="inline-flex min-h-[44px] items-center rounded-full border border-geel/60 px-4 text-xs font-bold text-geel transition-colors hover:bg-geel hover:text-[#1f1f1f]"
              >
                {t.partnerBalk.wordPartner} →
              </Link>
            </>
          ) : (
            <>
              <p className="flex-1 text-sm font-semibold text-white">{t.partnerBalk.vraag}</p>
              <Link
                href="/partners"
                className="group inline-flex items-center gap-2 rounded-full bg-geel py-1 pl-5 pr-1 text-sm font-bold text-donker transition-all hover:-translate-y-px hover:brightness-105"
              >
                {t.partnerBalk.wordPartner}
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-donker text-xs text-geel transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            </>
          )}
        </div>
      </div>
      {/* Zachte overgang naar de rest van de pagina i.p.v. een harde rand. */}
      <div aria-hidden="true" className="h-6 bg-gradient-to-b from-[#161616]/80 to-transparent" />
    </div>
  );
}
