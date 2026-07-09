const ZONNESTRALEN = [0, 45, 90, 135, 180, 225, 270, 315];

export function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 44 44"
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

      {ZONNESTRALEN.map((hoek) => (
        <line
          key={hoek}
          x1="22"
          y1="7"
          x2="22"
          y2="2"
          stroke="#F4C430"
          strokeWidth="3"
          strokeLinecap="round"
          transform={`rotate(${hoek} 22 22)`}
        />
      ))}

      <circle cx="22" cy="22" r="14" fill="#1F1F1F" stroke="#F4C430" strokeWidth="1.3" />
      <circle cx="19.5" cy="20" r="7.5" fill="url(#qpetanque-bal)" />
      <circle cx="29" cy="28" r="3" fill="#D62828" />
      <circle cx="27.6" cy="26.6" r="0.9" fill="#ef6b6b" opacity="0.8" />
    </svg>
  );
}
