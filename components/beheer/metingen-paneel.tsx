"use client";

import { useTranslation } from "@/lib/language-context";
import type { BezoekKenmerken, ToernooiActies } from "@/lib/data";
import { Provincie, vertaalProvincie } from "@/lib/provincies";

type Rij = { sleutel: string; label: string; aantal: number };

function Balken({ rijen, aandeelVan }: { rijen: Rij[]; aandeelVan?: number }) {
  const max = Math.max(1, ...rijen.map((r) => r.aantal));
  return (
    <div className="flex flex-col gap-1.5">
      {rijen.map((rij) => (
        <div key={rij.sleutel} className="flex items-center gap-2 text-sm">
          <span className="w-28 shrink-0 truncate text-donker sm:w-36">{rij.label}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-licht">
            <div className="h-full rounded-full bg-geel" style={{ width: `${Math.max(4, (rij.aantal / max) * 100)}%` }} />
          </div>
          <span className="w-16 shrink-0 text-right font-bold text-[#b8860b]">
            {rij.aantal}
            {aandeelVan ? <span className="ml-1 text-xs font-medium text-grijs">{Math.round((rij.aantal / aandeelVan) * 100)}%</span> : null}
          </span>
        </div>
      ))}
    </div>
  );
}

function Kop({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-donker">{children}</h3>;
}

function landNaam(code: string, taal: string): string {
  if (code === "onbekend") return code;
  try {
    return new Intl.DisplayNames([taal === "fr" ? "fr" : "nl"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

// Extra metingen op het dashboard (enkel voor de admin): wie bezoekt de site (Belgen, buitenland, bots)
// en wat doen bezoekers op een tornooipagina (doorklikken).
export function MetingenPaneel({
  kenmerken,
  acties,
}: {
  kenmerken: BezoekKenmerken | null;
  acties: ToernooiActies | null;
}) {
  const { t, taal } = useTranslation();
  const b = t.beheer;

  return (
    <>
      <div className="border-t border-rand pt-4">
        <Kop>{b.bezoekersTitel}</Kop>
        {kenmerken && kenmerken.totaal > 0 ? (
          <div className="flex flex-col gap-4">
            <Balken
              aandeelVan={kenmerken.totaal}
              rijen={[
                { sleutel: "be", label: b.bezoekersBelgie, aantal: kenmerken.belgie },
                { sleutel: "buitenland", label: b.bezoekersBuitenland, aantal: kenmerken.buitenland },
                { sleutel: "onbekend", label: b.bezoekersOnbekend, aantal: kenmerken.onbekend },
                { sleutel: "bots", label: b.bezoekersBots, aantal: kenmerken.bots },
              ]}
            />
            {kenmerken.talen.length > 0 && (
              <div>
                <Kop>{b.bezoekersTalen}</Kop>
                <Balken
                  rijen={kenmerken.talen.map((r) => ({
                    sleutel: r.sleutel,
                    label: b.talenNamen[r.sleutel as keyof typeof b.talenNamen] ?? r.sleutel,
                    aantal: r.aantal,
                  }))}
                />
              </div>
            )}
            {kenmerken.landen.length > 0 && (
              <div>
                <Kop>{b.bezoekersLanden}</Kop>
                <Balken
                  rijen={kenmerken.landen.map((r) => ({
                    sleutel: r.sleutel,
                    label: r.sleutel === "onbekend" ? b.bezoekersOnbekend : landNaam(r.sleutel, taal),
                    aantal: r.aantal,
                  }))}
                />
              </div>
            )}
            {kenmerken.provincies.length > 0 && (
              <div>
                <Kop>{b.bezoekersProvincies}</Kop>
                <Balken
                  rijen={kenmerken.provincies.map((r) => ({
                    sleutel: r.sleutel,
                    label: r.sleutel === "onbekend" ? b.onbekendeLocatie : vertaalProvincie(r.sleutel as Provincie, taal),
                    aantal: r.aantal,
                  }))}
                />
              </div>
            )}
            <p className="text-xs text-grijs">{b.bezoekersUitleg(kenmerken.sinds ?? "")}</p>
          </div>
        ) : (
          <p className="text-sm text-grijs">{b.metingLeeg}</p>
        )}
      </div>

      <div className="border-t border-rand pt-4">
        <Kop>{b.actiesTitel}</Kop>
        {acties && acties.totalen.length > 0 ? (
          <div className="flex flex-col gap-4">
            <Balken
              rijen={acties.totalen.map((r) => ({
                sleutel: r.actie,
                label: b.actieNamen[r.actie as keyof typeof b.actieNamen] ?? r.actie,
                aantal: r.aantal,
              }))}
            />
            {acties.top.length > 0 && (
              <div>
                <Kop>{b.actiesTop}</Kop>
                <ol className="flex flex-col gap-1 text-sm">
                  {acties.top.map((rij, i) => (
                    <li key={rij.id} className="flex items-baseline gap-2">
                      <span className="w-5 shrink-0 text-grijs">{i + 1}.</span>
                      <span className="min-w-0 flex-1 truncate text-donker">
                        {rij.naam} <span className="text-grijs">· {rij.club}</span>
                      </span>
                      <span className="shrink-0 font-bold text-[#b8860b]">{rij.aantal}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            <p className="text-xs text-grijs">{b.actiesUitleg(acties.sinds ?? "")}</p>
          </div>
        ) : (
          <p className="text-sm text-grijs">{b.metingLeeg}</p>
        )}
      </div>
    </>
  );
}
