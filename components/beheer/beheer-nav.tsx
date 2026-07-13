"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/language-context";

export function BeheerNav({
  wachtendeToernooien = 0,
  wachtendeClubs = 0,
}: {
  wachtendeToernooien?: number;
  wachtendeClubs?: number;
}) {
  const { t } = useTranslation();
  const pathname = usePathname();

  const links = [
    { href: "/beheer", label: t.beheer.inBehandeling, badge: wachtendeToernooien },
    { href: "/beheer/toernooien", label: t.beheer.alleToernooien, badge: 0 },
    { href: "/beheer/clubs", label: t.beheer.clubsBeheer, badge: wachtendeClubs },
    { href: "/beheer/moderatoren", label: t.beheer.vrijwilligers, badge: 0 },
  ];

  return (
    <div className="border-b border-rand bg-white">
      <div className="mx-auto flex max-w-[1140px] flex-wrap items-center gap-1 px-6 py-3 lg:px-10">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-semibold transition-all active:scale-95 ${
              pathname === link.href
                ? "bg-blauw text-white shadow-sm"
                : "text-grijs hover:bg-licht hover:text-donker"
            }`}
          >
            {link.label}
            {link.badge > 0 && (
              <span className="rounded-full bg-rood px-1.5 py-0.5 text-[0.65rem] font-bold text-white">
                {link.badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
