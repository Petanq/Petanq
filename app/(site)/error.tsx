"use client";

import { useEffect } from "react";
import { ServerFoutContent } from "@/components/server-fout-content";

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Onverwachte fout op de site:", error);
  }, [error]);

  return <ServerFoutContent reset={reset} />;
}
