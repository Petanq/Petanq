import Link from "next/link";
import { ReactNode } from "react";

type Variant = "rood" | "outline" | "geel";

const VARIANT_STYLES: Record<Variant, string> = {
  rood: "bg-rood text-white hover:bg-rood-2 shadow-[0_4px_16px_rgba(192,57,43,0.35)]",
  outline: "border-[1.5px] border-white/20 bg-white/10 text-white hover:bg-white/[0.16]",
  geel: "bg-geel text-donker hover:brightness-105 shadow-[0_4px_20px_rgba(244,196,48,0.45)] hover:shadow-[0_6px_24px_rgba(244,196,48,0.6)]",
};

const BADGE_STYLES: Record<Variant, string> = {
  rood: "bg-donker text-geel",
  outline: "bg-geel text-donker",
  geel: "bg-donker text-geel",
};

type KnopProps = {
  children: ReactNode;
  variant?: Variant;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
};

export function Knop({
  children,
  variant = "rood",
  href,
  onClick,
  type = "button",
  disabled,
  className = "",
}: KnopProps) {
  const pil = `group inline-flex items-center gap-3 rounded-full py-1.5 pl-6 pr-1.5 font-bold transition-all hover:-translate-y-px disabled:opacity-60 disabled:hover:translate-y-0 ${VARIANT_STYLES[variant]} ${className}`;
  const badge = `flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm transition-transform group-hover:translate-x-0.5 ${BADGE_STYLES[variant]}`;

  const inhoud = (
    <>
      <span>{children}</span>
      <span className={badge}>→</span>
    </>
  );

  if (href?.startsWith("#")) {
    return (
      <a href={href} onClick={onClick} className={pil}>
        {inhoud}
      </a>
    );
  }

  if (href?.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className={pil}>
        {inhoud}
      </a>
    );
  }

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={pil}>
        {inhoud}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={pil}>
      {inhoud}
    </button>
  );
}
