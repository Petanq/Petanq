-- Beveiliging, deel 1 (veilig om altijd te draaien, ook voor de nieuwe code online staat):
--  1. een tabel waarmee de site het aantal inzendingen per bezoeker kan begrenzen (tegen spam);
--  2. de nieuwsbrief met bevestiging via e-mail (double opt-in).
-- Niet draaien op een speeldag.

-- 1. Inzendingen tellen (soort + sleutel = IP-adres of afgekorte hash van een e-mailadres).
create table if not exists formulier_pogingen (
  id bigserial primary key,
  soort text not null,
  sleutel text not null,
  aangemaakt_op timestamptz not null default now()
);
create index if not exists formulier_pogingen_zoek on formulier_pogingen (soort, sleutel, aangemaakt_op);
alter table formulier_pogingen enable row level security;
-- Bewust geen policies: enkel de server (service-rol) leest en schrijft hier.

-- 2. Nieuwsbrief met bevestiging.
alter table nieuwsbrief add column if not exists bevestigd boolean not null default false;
alter table nieuwsbrief add column if not exists bevestig_token uuid not null default gen_random_uuid();
alter table nieuwsbrief add column if not exists bevestigd_op timestamptz null;

-- De bestaande abonnees schreven zich zelf in via het formulier: die blijven gewoon actief.
update nieuwsbrief set bevestigd = true, bevestigd_op = coalesce(bevestigd_op, now()) where bevestigd = false;

create unique index if not exists nieuwsbrief_bevestig_token_uniek on nieuwsbrief (bevestig_token);
