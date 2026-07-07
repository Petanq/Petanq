export function Logo({ className = "h-9 w-[52px]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 62 40"
      className={`${className} shrink-0`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="petanq-bal" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#e8e8e8" />
          <stop offset="55%" stopColor="#a8a8a8" />
          <stop offset="100%" stopColor="#707070" />
        </radialGradient>
      </defs>

      {/* komeetstaart */}
      <path d="M1 31 A21 21 0 0 1 34 7" stroke="#1F1F1F" strokeWidth="5.5" fill="none" strokeLinecap="round" />
      <path d="M5 32.5 A17 17 0 0 1 32 13" stroke="#F4C430" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M9 33.5 A13 13 0 0 1 30 19" stroke="#D62828" strokeWidth="4" fill="none" strokeLinecap="round" />

      {/* bal */}
      <circle cx="34" cy="19" r="15" fill="url(#petanq-bal)" />
      <path
        d="M23 12 Q34 18 24 27 M34 4 Q40 19 34 34 M45 12 Q34 18 44 27"
        stroke="#5c5c5c"
        strokeWidth="0.6"
        fill="none"
        opacity="0.55"
      />

      {/* rode bal (cochonnet) */}
      <circle cx="47" cy="31" r="5" fill="#D62828" />
      <circle cx="45.5" cy="29.5" r="1.3" fill="#ef6b6b" opacity="0.8" />
    </svg>
  );
}

export function LogoQGlyph({ className = "h-[0.95em] w-[0.95em]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={`${className} inline-block`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="petanq-q-bal" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#e8e8e8" />
          <stop offset="55%" stopColor="#a8a8a8" />
          <stop offset="100%" stopColor="#707070" />
        </radialGradient>
      </defs>
      <circle cx="17" cy="17" r="12.5" fill="none" stroke="#D62828" strokeWidth="6.5" />
      <path d="M25 25 L36 36" stroke="#D62828" strokeWidth="6.5" strokeLinecap="round" fill="none" />
      <circle cx="17" cy="17" r="6" fill="url(#petanq-q-bal)" />
    </svg>
  );
}
