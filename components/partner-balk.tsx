"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/lib/language-context";
import { PARTNERS } from "@/lib/partners";

// Smalle balk onder de kop van de homepage. Zonder partners: uitnodiging om
// partner te worden. Met partners: hun logo's, met onderaan een discrete link.
export function PartnerBalk() {
  const { t } = useTranslation();
  const heeftPartners = PARTNERS.length > 0;

  return (
    <div className="border-y border-rand border-t-4 border-t-geel bg-white">
      <div className="mx-auto flex max-w-[1140px] flex-col items-start gap-x-8 gap-y-3 px-6 py-4 sm:flex-row sm:flex-wrap sm:items-center lg:px-10">
        <span className="text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-grijs">
          {t.partnerBalk.label}
        </span>

        {heeftPartners ? (
          <>
            <ul className="flex flex-1 flex-wrap items-center gap-x-8 gap-y-3">
              {PARTNERS.map((p) => {
                const logo = (
                  <Image src={p.logo} alt={p.naam} width={160} height={48} className="h-10 w-auto object-contain" />
                );
                return (
                  <li key={p.naam}>
                    {p.url ? (
                      <a href={p.url} target="_blank" rel="noopener noreferrer" title={p.naam}>
                        {logo}
                      </a>
                    ) : (
                      logo
                    )}
                  </li>
                );
              })}
            </ul>
            <Link href="/partners" className="text-xs font-semibold text-rood hover:underline">
              {t.partnerBalk.wordPartner} →
            </Link>
          </>
        ) : (
          <>
            <p className="flex-1 text-sm font-semibold text-donker">{t.partnerBalk.vraag}</p>
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
  );
}
