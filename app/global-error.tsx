"use client";

// Vangt enkel fouten in de root layout zelf op (uiterst zeldzaam) — vervangt
// dan de volledige pagina, dus bewust zonder afhankelijkheid van de normale
// layout, providers of globals.css.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="nl">
      <body style={{ fontFamily: "system-ui, sans-serif", textAlign: "center", padding: "4rem 1.5rem" }}>
        <h1 style={{ fontSize: "1.4rem", marginBottom: "0.75rem" }}>
          Er ging iets mis / Une erreur est survenue
        </h1>
        <p style={{ color: "#666", marginBottom: "2rem" }}>Probeer het opnieuw. / Réessayez.</p>
        <button
          onClick={reset}
          style={{
            background: "#1d4ed8",
            color: "white",
            border: "none",
            borderRadius: "999px",
            padding: "0.6rem 1.5rem",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Probeer opnieuw / Réessayer
        </button>
      </body>
    </html>
  );
}
