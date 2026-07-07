"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/language-context";
import { Provincie } from "@/lib/provincies";

export function AddClubCard({ provincie }: { provincie: Provincie }) {
  const { t } = useTranslation();

  return (
    <Link
      href={`/clubs/toevoegen?provincie=${provincie}`}
      className="flex min-h-[76px] items-center justify-center rounded-[10px] border-2 border-dashed border-rand p-3.5 text-center text-[0.83rem] font-semibold text-grijs transition-colors hover:border-blauw-3 hover:text-blauw-2"
    >
      {t.clubsPagina.clubToevoegen}
    </Link>
  );
}
