-- Voorstellen van bezoekers (niet ingelogd) om de gegevens of openingsuren van een club aan te passen.
--
-- Bewust een aparte tabel naast club_wijzigingen:
--  - een bezoeker mag nooit het voorstel van de club zelf (of van een andere bezoeker) wissen of vervangen;
--  - de naam en het e-mailadres van de indiener staan hier en niet leesbaar voor clubaccounts.
--
-- Niets komt automatisch online: de admin keurt elk voorstel goed of af (zelfde scherm als de
-- voorstellen van clubs). Na behandeling wordt het e-mailadres van de indiener gewist.
--
-- Geen policies: enkel de service-role (server-side) leest en schrijft, zoals bij de tellers.
-- Veilig om vóór de nieuwe code uit te voeren: de app slaat dit over zolang de tabel ontbreekt.

create table if not exists club_bezoeker_voorstellen (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references clubs (id) on delete cascade,
  ingediend_op timestamptz not null default now(),
  voorstel jsonb not null,
  indiener_naam text not null,
  indiener_email text not null,   -- wordt leeg gemaakt zodra het voorstel behandeld is
  taal text not null default 'nl' check (taal in ('nl', 'fr')),
  status text not null default 'wachtend' check (status in ('wachtend', 'goedgekeurd', 'afgewezen')),
  behandeld_op timestamptz,
  behandeld_door uuid references auth.users (id) on delete set null,
  reden_afwijzing text
);

create index if not exists club_bezoeker_voorstellen_club on club_bezoeker_voorstellen (club_id, status);
create index if not exists club_bezoeker_voorstellen_email on club_bezoeker_voorstellen (indiener_email, ingediend_op);

alter table club_bezoeker_voorstellen enable row level security;
