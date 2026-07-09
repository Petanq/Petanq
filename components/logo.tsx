export function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={`${className} shrink-0`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="qpetanque-bal" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#e8e8e8" />
          <stop offset="55%" stopColor="#a8a8a8" />
          <stop offset="100%" stopColor="#707070" />
        </radialGradient>
      </defs>
      <circle cx="17" cy="17" r="12.5" fill="none" stroke="#D62828" strokeWidth="6.5" />
      <path d="M13 22 L25 30" stroke="#D62828" strokeWidth="6.5" strokeLinecap="round" fill="none" />
      <circle cx="17" cy="17" r="6" fill="url(#qpetanque-bal)" />
    </svg>
  );
}
