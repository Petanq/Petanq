"use client";

import Image from "next/image";
import { useTranslation } from "@/lib/language-context";

export function PartnersContent() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 lg:px-10">
      <Image
        src="/images/boules-vrienden.jpg"
        alt=""
        width={800}
        height={450}
        className="mb-8 h-56 w-full rounded-xl object-cover sm:h-72"
      />
      <h1 className="mb-6 font-titel text-4xl tracking-wide text-blauw">{t.partnersPagina.titel}</h1>
      <p className="mb-8 text-sm leading-relaxed text-donker">{t.partnersPagina.intro}</p>

      <h2 className="mb-3 font-titel text-lg tracking-wide text-blauw">{t.partnersPagina.kenmerkenTitel}</h2>
      <ul className="mb-10 flex flex-col gap-3">
        {t.partnersPagina.kenmerken.map((kenmerk) => (
          <li key={kenmerk} className="flex items-start gap-3 text-sm leading-relaxed text-donker">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-geel text-[0.65rem] font-bold text-donker">
              ✓
            </span>
            {kenmerk}
          </li>
        ))}
      </ul>

      <h2 className="mb-3 font-titel text-lg tracking-wide text-blauw">{t.partnersPagina.onzePartnersTitel}</h2>
      <div className="mb-10 rounded-xl border border-rand bg-[#faf9f6] p-8 text-center text-sm text-grijs">
        {t.partnersPagina.nogGeenPartners}
      </div>

      <p className="text-sm text-grijs">
        {t.partnersPagina.ctaTekst}{" "}
        <a href="mailto:info@petanque13.be" className="text-rood hover:underline">
          info@petanque13.be
        </a>
      </p>
    </div>
  );
}
