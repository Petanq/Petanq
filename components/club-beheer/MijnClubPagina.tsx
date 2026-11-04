"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/language-context";
import type { MijnClub } from "@/actions/club-beheer";
import { MijnClubFormulier } from "@/components/club-beheer/MijnClubFormulier";
import { Match13TerugKnop } from "@/components/match13/Match13TerugKnop";
import "./club-beheer.css";

export interface ClubKeuze {
  id: string;
  naam: string;
  gemeente: string;
}

// Kop + inhoud van "Mijn club": het formulier, of een uitleg als de account nog aan geen club
// gekoppeld is, of (voor de admin) een lijst om een club te kiezen.
export function MijnClubPagina({
  club,
  clubs,
  isAdmin,
}: {
  club: MijnClub | null;
  clubs?: ClubKeuze[];
  isAdmin: boolean;
}) {
  const { t } = useTranslation();
  const c = t.clubBeheer;

  return (
    <div className="match13-lijst-pagina">
      <Match13TerugKnop href={isAdmin ? "/beheer" : "/beheer/match13"} />
      <header className="match13-hero">
        <h1>
          {c.titel}
          {club ? (
            <>
              , <em>{club.naam}.</em>
            </>
          ) : (
            "."
          )}
        </h1>
        <p>{c.uitleg}</p>
      </header>

      {club ? (
        <MijnClubFormulier key={club.id} club={club} />
      ) : clubs ? (
        <section className="cb-paneel">
          <h2>{c.kiesClub}</h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.4rem" }}>
            {clubs.map((k) => (
              <li key={k.id}>
                <Link href={`/beheer/mijn-club?club=${k.id}`}>
                  {k.naam} <span style={{ color: "#777" }}>· {k.gemeente}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="cb-paneel">
          <p style={{ margin: 0 }}>{c.geenClub}</p>
        </section>
      )}
    </div>
  );
}
