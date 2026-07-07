import type { Metadata } from "next";
import { BeheerTopbar } from "@/components/beheer/beheer-topbar";

export const metadata: Metadata = {
  title: "Beheer",
  robots: { index: false, follow: false },
};

export default function BeheerRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-licht">
      <BeheerTopbar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
