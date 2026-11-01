import type { ReactNode } from "react";

// Donkere kop bovenaan een pagina (zelfde stijl als de gsm-kop van Clubs):
// zwarte band met gouden onderrand, optioneel een gedimde foto erachter.
export function PaginaKop({
  titel,
  accent,
  ondertitel,
  foto,
  children,
}: {
  titel: string;
  accent?: string;
  ondertitel?: string;
  foto?: string;
  children?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden border-b-4 border-geel bg-[#161616]">
      {foto && (
        <>
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{ backgroundImage: `url('${foto}')`, backgroundSize: "cover", backgroundPosition: "center 40%" }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#161616] via-[#161616]/75 to-[#161616]/20" />
        </>
      )}
      <div className="relative z-[2] mx-auto max-w-[1140px] px-6 py-10 sm:py-14 lg:px-10">
        <h1 className="font-titel text-[2.4rem] font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl">
          {titel}
          {accent && <span className="block text-geel">{accent}</span>}
        </h1>
        {ondertitel && <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-white/80">{ondertitel}</p>}
        {children}
      </div>
    </div>
  );
}
