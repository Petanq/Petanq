"use client";

import { useTranslation } from "@/lib/language-context";

export function WachtOpGoedkeuring() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center text-center">
      <h1 className="mb-2 font-titel text-3xl tracking-wide text-blauw">{t.beheer.wachtOpGoedkeuringTitel}</h1>
      <p className="text-sm text-grijs">{t.beheer.wachtOpGoedkeuringTekst}</p>
    </div>
  );
}
