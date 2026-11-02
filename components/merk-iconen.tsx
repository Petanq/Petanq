// Herkenbare merk-iconen voor de knoppen op de tornooipagina (agenda, delen, route)
// en eenvoudige lijn-icoontjes in de huisstijl.

type IcoonProps = { className?: string };

export function GoogleAgendaIcoon({ className = "h-6 w-6" }: IcoonProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" fill="#fff" />
      <path fill="#4285F4" d="M6 3h12a3 3 0 0 1 3 3v1H7v8H3V6a3 3 0 0 1 3-3z" />
      <path fill="#FBBC04" d="M17 7h4v10h-4z" />
      <path fill="#34A853" d="M3 17h14v4H6a3 3 0 0 1-3-3z" />
      <path fill="#EA4335" d="M17 17h4v1a3 3 0 0 1-3 3h-1z" />
      <text x="12" y="15.4" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#4285F4" fontFamily="Arial, sans-serif">
        31
      </text>
    </svg>
  );
}

export function AgendaBestandIcoon({ className = "h-6 w-6" }: IcoonProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="#1f1f1f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" fill="#f4c430" stroke="#1f1f1f" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
      <path d="M12 12.8v4.6m0 0-2-2m2 2 2-2" />
    </svg>
  );
}

export function WhatsAppIcoon({ className = "h-6 w-6" }: IcoonProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#25D366"
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
      />
    </svg>
  );
}

export function MessengerIcoon({ className = "h-6 w-6" }: IcoonProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="p13-messenger" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#006AFF" />
          <stop offset="1" stopColor="#00B2FF" />
        </linearGradient>
      </defs>
      <path
        fill="url(#p13-messenger)"
        d="M12 2C6.4 2 2 6.2 2 11.4c0 2.8 1.3 5.3 3.4 7V22l3.2-1.8c1 .3 2 .4 3.4.4 5.6 0 10-4.2 10-9.4S17.6 2 12 2z"
      />
      <path fill="#fff" d="M5.8 14.4 9.3 8.8 12 11.6l3.6-2.8-3.5 5.6-2.7-2.8z" />
    </svg>
  );
}

export function LinkIcoon({ className = "h-6 w-6" }: IcoonProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="#1f1f1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </svg>
  );
}

export function GoogleMapsIcoon({ className = "h-6 w-6" }: IcoonProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#EA4335" d="M12 2a7 7 0 0 0-7 7c0 4.9 7 13 7 13s7-8.1 7-13a7 7 0 0 0-7-7z" />
      <circle cx="12" cy="9" r="2.7" fill="#fff" />
    </svg>
  );
}

export function WazeIcoon({ className = "h-6 w-6" }: IcoonProps) {
  // Het echte Waze-icoon (al aanwezig op de site).
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/images/waze-icon.jpg" alt="" aria-hidden="true" className={`${className} rounded-full`} />;
}

export const LIJN = {
  kalender: "M4 5h16v15H4zM4 10h16M9 3v4M15 3v4",
  klok: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2",
  ronden: "M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4",
  euro: "M18 7a7 7 0 1 0 0 10M4 10h9M4 14h9",
  groep: "M9 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM3 20a6 6 0 0 1 12 0M17 6.5a2.5 2.5 0 1 1 0 5M16 14.5a5 5 0 0 1 6 5",
  pin: "M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21zM12 7a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z",
  mail: "M3 6h18v12H3zM3 7l9 6 9-6",
  pijlTerug: "M20 12H4M10 6l-6 6 6 6",
};

export function LijnIcoon({ pad, className = "h-[18px] w-[18px]" }: { pad: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={pad} />
    </svg>
  );
}
