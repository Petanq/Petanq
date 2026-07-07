"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "@/lib/language-context";
import { createClient } from "@/lib/supabase/client";

export function BeheerNav() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();

  async function uitloggen() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/beheer/login");
    router.refresh();
  }

  const links = [
    { href: "/beheer", label: t.beheer.inBehandeling },
    { href: "/beheer/toernooien", label: t.beheer.alleToernooien },
    { href: "/beheer/clubs", label: t.beheer.clubsBeheer },
  ];

  return (
    <div className="border-b border-rand bg-white">
      <div className="mx-auto flex max-w-[1140px] flex-wrap items-center justify-between gap-3 px-6 py-4 lg:px-10">
        <div className="flex flex-wrap gap-1">
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
        <button onClick={uitloggen} className="text-sm font-semibold text-rood hover:underline">
          {t.beheer.uitloggen}
        </button>
      </div>
    </div>
  );
}
