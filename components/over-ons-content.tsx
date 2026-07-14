"use client";

import Image from "next/image";
import { useTranslation } from "@/lib/language-context";

export function OverOnsContent() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 lg:px-10">
      <Image
        src="/images/balls-closeup.jpg"
        alt=""
        width={800}
        height={450}
        className="mb-8 h-56 w-full rounded-xl object-cover sm:h-72"
      />
      <h1 className="mb-6 font-titel text-4xl tracking-wide text-blauw">{t.overOnsPagina.titel}</h1>
      <p className="mb-4 text-sm leading-relaxed text-donker">{t.overOnsPagina.alinea1}</p>
      <p className="mb-6 text-sm leading-relaxed text-donker">{t.overOnsPagina.alinea2}</p>
      <p className="text-sm text-grijs">
        {t.overOnsPagina.contact}{" "}
        <a href="mailto:info@petanque13.be" className="text-rood hover:underline">
          info@petanque13.be
        </a>
      </p>
    </div>
  );
}
