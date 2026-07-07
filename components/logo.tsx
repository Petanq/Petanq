export function Logo() {
  return (
    <svg
      viewBox="0 0 40 40"
      className="h-9 w-9 shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="petanq-bal" cx="35%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#d4d4d4" />
          <stop offset="100%" stopColor="#6b6b6b" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="19" fill="url(#petanq-bal)" />
      <circle cx="20" cy="20" r="13" fill="none" stroke="#D62828" strokeWidth="2" />
      <circle cx="20" cy="20" r="7" fill="none" stroke="#D62828" strokeWidth="2" />
      <circle cx="20" cy="20" r="2.5" fill="#D62828" />
    </svg>
  );
}
