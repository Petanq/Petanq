"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

// Donkere fotoachtergrond achter de hele site (stijlregels: .site-foto in
// globals.css). Match13 en Boulenciel hebben hun eigen (al donkere) opmaak.
export function SiteAchtergrond({ children }: { children: ReactNode }) {
  const pad = usePathname();
  const foto = !pad.startsWith("/match13") && !pad.startsWith("/boules");
  return <div className={`flex flex-1 flex-col ${foto ? "site-foto" : ""}`}>{children}</div>;
}
