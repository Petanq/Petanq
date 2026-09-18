"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/language-context";
import { match13AanvraagGoedkeuren, match13AanvraagWeigeren, type Match13Aanvraag } from "@/actions/match13-toegang";

export function Match13AanvraagList({ aanvragen }: { aanvragen: Match13Aanvraag[] }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [rijBezig, setRijBezig] = useState<string | null>(null);
  const [rijLinks, setRijLinks] = useState<Record<string, string>>({});
  const [rijFouten, setRijFouten] = useState<Record<string, string>>({});
  const [weigerId, setWeigerId] = useState<string | null>(null);
  const [weigerReden, setWeigerReden] = useState("");

  if (aanvragen.length === 0) return null;

  async function goedkeuren(id: string) {
    setRijBezig(id);
    setRijFouten((f) => ({ ...f, [id]: "" }));
    const resultaat = await match13AanvraagGoedkeuren(id);
    setRijBezig(null);
    if (resultaat.succes) {
      setRijLinks((links) => ({ ...links, [id]: resultaat.link }));
      router.refresh();
    } else {
      setRijFouten((f) => ({ ...f, [id]: t.match13.aanvraagFout }));
    }
  }

  async function weigeren(id: string) {
    setRijBezig(id);
    await match13AanvraagWeigeren(id, weigerReden.trim() || null);
    setRijBezig(null);
    setWeigerId(null);
    setWeigerReden("");
    router.refresh();
  }

  return (
    <div className="card" style={{ marginBottom: "1.6rem" }}>
      <h2 style={{ marginTop: 0 }}>{t.match13.aanvragenTitel(aanvragen.length)}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
        {aanvragen.map((a) => (
          <div
            key={a.id}
            style={{
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "1rem 1.2rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.6rem" }}>
              <div>
                <div style={{ fontWeight: 700 }}>{a.club}</div>
                <div className="hint" style={{ margin: 0 }}>
                  {a.naam} — {a.email}
                  {a.telefoon ? ` — ${a.telefoon}` : ""}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                <button
                  className="match13-actie-knop"
                  disabled={rijBezig === a.id}
                  onClick={() => goedkeuren(a.id)}
                >
                  {rijBezig === a.id ? t.match13.bezig : t.match13.aanvraagGoedkeuren}
                </button>
                <button
                  className="match13-actie-knop gevaar"
                  disabled={rijBezig === a.id}
                  onClick={() => setWeigerId(weigerId === a.id ? null : a.id)}
                >
                  {t.match13.aanvraagWeigeren}
                </button>
              </div>
            </div>
            {a.bericht && (
              <p className="hint" style={{ marginTop: "0.6rem", marginBottom: 0 }}>
                {a.bericht}
              </p>
            )}
            {weigerId === a.id && (
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.8rem", flexWrap: "wrap" }}>
                <input
                  value={weigerReden}
                  onChange={(e) => setWeigerReden(e.target.value)}
                  placeholder={t.match13.aanvraagWeigerReden}
                  style={{
                    flex: "1 1 220px",
                    border: "1px solid var(--border)",
                    borderRadius: 7,
                    padding: "0.5rem 0.7rem",
                    fontFamily: "inherit",
                    fontSize: "0.9rem",
                  }}
                />
                <button className="match13-actie-knop gevaar" disabled={rijBezig === a.id} onClick={() => weigeren(a.id)}>
                  {t.match13.aanvraagWeigerBevestigen}
                </button>
              </div>
            )}
            {rijFouten[a.id] && (
              <p className="hint" style={{ color: "#fca5a5", marginTop: "0.6rem", marginBottom: 0 }}>
                {rijFouten[a.id]}
              </p>
            )}
            {rijLinks[a.id] && (
              <div className="match13-link-box">
                <p className="hint" style={{ marginBottom: "0.4rem" }}>
                  {t.match13.linkUitleg}
                </p>
                <code>{rijLinks[a.id]}</code>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
