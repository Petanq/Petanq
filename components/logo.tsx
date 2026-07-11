export function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <span
      className={`${className} shrink-0 rounded-full border-2 border-geel shadow-[0_1px_4px_rgba(0,0,0,0.35)]`}
      style={{
        display: "inline-block",
        backgroundImage: "url('/images/balls-closeup.jpg')",
        backgroundSize: "300% 201%",
        backgroundPosition: "88% 95%",
      }}
      aria-hidden="true"
    />
  );
}
