"use client";

const KLEUREN = ["#f0b429", "#c0392b", "#0b1f3a", "#16a34a", "#2563ae"];

export function Confetti({ aantal = 40 }: { aantal?: number }) {
  const stukjes = Array.from({ length: aantal }, (_, i) => {
    const links = Math.random() * 100;
    const vertraging = Math.random() * 0.4;
    const duur = 2.2 + Math.random() * 1.2;
    const kleur = KLEUREN[i % KLEUREN.length];
    const draai = Math.random() * 360;
    return { links, vertraging, duur, kleur, draai, id: i };
  });

  return (
    <div className="pointer-events-none fixed inset-0 z-[500] overflow-hidden">
      {stukjes.map((s) => (
        <span
          key={s.id}
          className="animatie-confetti absolute top-[-20px] h-2.5 w-2 rounded-sm"
          style={{
            left: `${s.links}%`,
            backgroundColor: s.kleur,
            animationDelay: `${s.vertraging}s`,
            animationDuration: `${s.duur}s`,
            transform: `rotate(${s.draai}deg)`,
          }}
        />
      ))}
    </div>
  );
}
