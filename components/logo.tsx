export function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <span
      className={`${className} shrink-0 rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.35)]`}
      style={{
        display: "inline-block",
        backgroundImage: "url('/images/logo-icon.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      aria-hidden="true"
    />
  );
}
