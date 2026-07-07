import type { Metadata } from "next";
import { BeheerNav } from "@/components/beheer/beheer-nav";

export const metadata: Metadata = {
  title: "Beheer",
  robots: { index: false, follow: false },
};

export default function BeheerDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <BeheerNav />
      <div className="mx-auto max-w-[1140px] px-6 py-8 lg:px-10">{children}</div>
    </div>
  );
}
