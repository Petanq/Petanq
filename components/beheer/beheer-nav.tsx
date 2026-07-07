"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/language-context";

export function BeheerNav() {
  const { t } = useTranslation();
  const pathname = usePathname();

  const links = [
    { href: "/beheer", label: t.beheer.inBehandeling },
    { href: "/beheer/toernooien", label: t.beheer.alleToernooien },
    { href: "/beheer/clubs", label: t.beheer.clubsBeheer },
  ];

  return (
    <div className="border-b border-rand bg-white">
      <div className="mx-auto flex max-w-[1140px] flex-wrap items-center gap-1 px-6 py-3 lg:px-10">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-md px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              pathname === link.href
                ? "bg-blauw text-white"
                : "text-grijs hover:bg-licht hover:text-donker"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
