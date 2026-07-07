"use client";

import { useTranslation } from "@/lib/language-context";

export function Footer() {
  const { t } = useTranslation();

  return (
    <div className="mt-3 border-t border-rand px-6 py-6 text-center text-[0.77rem] text-grijs">
      <span>
        {t.footer.tekst}{" "}
        <a href="mailto:info@petanq.be" className="text-rood no-underline hover:underline">
          {t.footer.link}
        </a>
      </span>
    </div>
  );
}
