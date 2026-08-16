import { Logo } from "@/components/logo";

export default function SiteLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Logo className="h-12 w-12 animate-pulse opacity-70" />
    </div>
  );
}
