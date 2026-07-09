"use client";

import { useTranslation } from "@/lib/language-context";
import { BelgiumMap } from "@/components/belgium-map";

export function ProvinciesContent({ aantalPerProvincie }: { aantalPerProvincie: Record<string, number> }) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 text-center lg:px-10">
      <h1 className="mb-2 font-titel text-4xl tracking-wide text-blauw">{t.provinciesPagina.titel}</h1>
      <p className="mb-8 text-sm text-grijs">{t.provinciesPagina.beschrijving}</p>

      <BelgiumMap aantalPerProvincie={aantalPerProvincie} />

      <p className="mt-10 text-[0.7rem] text-grijs">
        {t.provinciesPagina.bron}{" "}
        <a
          href="https://creativecommons.org/licenses/by-sa/3.0/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-donker"
        >
          CC BY-SA 3.0
        </a>
      </p>
    </div>
  );
}
