"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/language-context";

export function BeheerNav({
  wachtendeToernooien = 0,
  wachtendeClubs = 0,
  wachtendeVerwijderaanvragen = 0,
  isAdmin = false,
  heeftMatch13Toegang = false,
}: {
  wachtendeToernooien?: number;
  wachtendeClubs?: number;
  wachtendeVerwijderaanvragen?: number;
  isAdmin?: boolean;
  heeftMatch13Toegang?: boolean;
}) {
  const { t } = useTranslation();
  const pathname = usePathname();

  const links = [
    { href: "/beheer", label: () => t.beheer.inBehandeling, badge: wachtendeToernooien },
    { href: "/beheer/toernooien", label: () => t.beheer.alleToernooien, badge: 0 },
    { href: "/beheer/schiftingen", label: () => t.beheer.schiftingen, badge: 0 },
    { href: "/beheer/clubs", label: () => t.beheer.clubsBeheer, badge: wachtendeClubs },
    { href: "/beheer/moderatoren", label: () => t.beheer.vrijwilligers, badge: 0 },
    { href: "/beheer/ideeen", label: () => t.beheer.ideeen, badge: 0 },
    ...(isAdmin
      ? [
          {
            href: "/beheer/verwijderaanvragen",
            label: () => t.beheer.verwijderaanvragen,
            badge: wachtendeVerwijderaanvragen,
          },
        ]
      : []),
    ...(isAdmin || heeftMatch13Toegang
      ? [
          {
            href: "/beheer/match13",
            label: (actief: boolean) => (
              <span>
                Match<span className={actief ? "" : "text-geel"}>13</span>
              </span>
            ),
            badge: 0,
          },
        ]
      : []),
  ];

  return (
    <div className="border-b border-rand bg-white">
      <div className="mx-auto flex max-w-[1140px] flex-wrap items-center gap-1 px-6 py-3 lg:px-10">
        {links.map((link) => {
          const actief = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-semibold transition-all active:scale-95 ${
                actief ? "bg-geel text-donker shadow-sm" : "text-grijs hover:bg-licht hover:text-donker"
              }`}
            >
              {link.label(actief)}
              {link.badge > 0 && (
                <span className="rounded-full bg-rood px-1.5 py-0.5 text-[0.65rem] font-bold text-white">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
