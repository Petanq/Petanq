"use client";

import { useEffect } from "react";
import { ServerFoutContent } from "@/components/server-fout-content";

export default function BeheerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Onverwachte fout in het beheerpaneel:", error);
  }, [error]);

  return <ServerFoutContent reset={reset} />;
}
