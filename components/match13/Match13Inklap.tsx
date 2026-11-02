"use client";

import { useState, type ReactNode } from "react";

export type InklapIcoon = "kalender" | "lopend" | "klaar" | "wacht" | "proef" | "uitnodigen" | "club";

const LIJN = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function Icoon({ naam }: { naam: InklapIcoon }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...LIJN}>
      {naam === "kalender" && (
        <>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </>
      )}
      {naam === "lopend" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M10 8.5v7l6-3.5z" />
        </>
      )}
      {naam === "klaar" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12.5l3 3 5-6" />
        </>
      )}
      {naam === "wacht" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </>
      )}
      {naam === "proef" && (
        <>
          <path d="M6 3h12M6 21h12M7 3v3a5 5 0 0 0 2 4l1 2-1 2a5 5 0 0 0-2 4v3M17 3v3a5 5 0 0 1-2 4l-1 2 1 2a5 5 0 0 1 2 4v3" />
        </>
      )}
      {naam === "uitnodigen" && (
        <>
          <circle cx="9" cy="8" r="3.5" />
          <path d="M3 20c0-3.4 2.7-5.5 6-5.5s6 2.1 6 5.5M18 8v6M15 11h6" />
        </>
      )}
      {naam === "club" && (
        <>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 19c0-3.2 2.4-5 5.5-5s5.5 1.8 5.5 5M16 5.5a3 3 0 0 1 0 5.5M18 14.3c1.8.6 3 2.2 3 4.7" />
        </>
      )}
    </svg>
  );
}

// Inklapbare kaart voor de lijsten in Match13 (overzicht en Club beheer):
// icoon in een gouden cirkel, titel, aantal in een bolletje en een pijltje.
// Een titel als "Lopende tornooien (33)" wordt automatisch gesplitst in titel + aantal.
export function Match13Inklap({
  titel,
  icoon,
  defaultOpen = false,
  forceOpen = false,
  children,
}: {
  titel: string;
  icoon: InklapIcoon;
  defaultOpen?: boolean;
  forceOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const delen = titel.match(/^(.*?)\s*\((\d+)\)\s*$/);
  const naam = delen ? delen[1] : titel;
  const aantal = delen ? Number(delen[2]) : null;
  return (
    <details className="m13-inklap" open={open || forceOpen} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>
        <span className="m13-inklap-icoon">
          <Icoon naam={icoon} />
        </span>
        <span className="m13-inklap-titel">{naam}</span>
        {aantal !== null && <span className={"m13-inklap-aantal" + (aantal === 0 ? " leeg" : "")}>{aantal}</span>}
        <svg className="m13-inklap-pijl" viewBox="0 0 24 24" aria-hidden="true" {...LIJN}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </summary>
      <div className="m13-inklap-inhoud">{children}</div>
    </details>
  );
}
