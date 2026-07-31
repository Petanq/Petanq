export function ZoekIcoon({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="20" cy="20" r="13" stroke="#1F1F1F" strokeWidth="3.5" />
      <path d="M20 8.5a11.5 11.5 0 0 1 11.5 11.5" stroke="#F4C430" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M29.2 29.2 40 40" stroke="#1F1F1F" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
