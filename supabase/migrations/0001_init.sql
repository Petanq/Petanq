-- Le Bouliste.be - initiele schema
-- Voer uit in de Supabase SQL editor (Project > SQL Editor > New query), of via `supabase db push`.

create extension if not exists "pgcrypto";

-- ── Enums ──────────────────────────────────────────────────────────────────
create type provincie_enum as enum (
  'antwerpen', 'oost-vlaanderen', 'west-vlaanderen', 'limburg', 'vlaams-brabant',
  'henegouwen', 'luik', 'namen', 'waals-brabant', 'luxemburg', 'brussel'
);

create type regio_enum as enum ('vlaanderen', 'wallonie', 'brussel');

-- 'circuit' toegevoegd t.o.v. de oorspronkelijke opgave om de 50+ Circuit-
-- toernooien uit het design-prototype te ondersteunen (zichtbaar als grijze
-- kleurstreep op de toernooikaart).
create type categorie_enum as enum ('heren', 'dames', 'mix', 'jeugd', 'kampioenschap', 'circuit');

create type formule_enum as enum (
  'tete-a-tete', 'doublette', 'triplette', 'sextet', 'quartet', 'kwintet', 'kleurentornooi'
);

create type toernooi_status_enum as enum ('in_behandeling', 'goedgekeurd', 'geweigerd');
create type moderator_rol_enum as enum ('moderator', 'admin');
create type taal_enum as enum ('nl', 'fr');

-- ── Tabel: toernooien ──────────────────────────────────────────────────────
create table toernooien (
  id uuid primary key default gen_random_uuid(),
  aangemaakt_op timestamptz not null default now(),
  datum date not null,
  uur time not null,
  clubnaam text not null,
  naam_nl text not null,
  naam_fr text not null,
  gemeente text not null,
  provincie provincie_enum not null,
  regio regio_enum not null,
  categorie categorie_enum not null,
  formule formule_enum not null,
  aantal_ronden integer not null check (aantal_ronden > 0),
  inschrijvingsprijs numeric(6,2) check (inschrijvingsprijs is null or inschrijvingsprijs >= 0),
  gratis boolean not null default false,
  max_ploegen integer check (max_ploegen is null or max_ploegen > 0),
  contact_email text not null,
  link_inschrijving text,
  opmerking text,
  status toernooi_status_enum not null default 'in_behandeling',
  ingediend_door text,
  goedgekeurd_door text,
  goedgekeurd_op timestamptz
);

create index idx_toernooien_status on toernooien (status);
create index idx_toernooien_datum on toernooien (datum);
create index idx_toernooien_provincie on toernooien (provincie);
create index idx_toernooien_regio on toernooien (regio);

-- ── Tabel: clubs ───────────────────────────────────────────────────────────
create table clubs (
  id uuid primary key default gen_random_uuid(),
  naam text not null,
  gemeente text not null,
  provincie provincie_enum not null,
  regio regio_enum not null,
  website text,
  contact_email text,
  aangemaakt_op timestamptz not null default now(),
  actief boolean not null default true
);

create index idx_clubs_regio on clubs (regio);
create index idx_clubs_provincie on clubs (provincie);
create unique index idx_clubs_naam_gemeente on clubs (lower(naam), lower(gemeente));

-- ── Tabel: nieuwsbrief ─────────────────────────────────────────────────────
create table nieuwsbrief (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  provincie provincie_enum,
  taal taal_enum not null default 'nl',
  aangemaakt_op timestamptz not null default now(),
  actief boolean not null default true
);

create index idx_nieuwsbrief_provincie_actief on nieuwsbrief (provincie, actief);

-- ── Tabel: moderatoren ─────────────────────────────────────────────────────
create table moderatoren (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  naam text not null,
  email text not null,
  provincie provincie_enum,
  rol moderator_rol_enum not null default 'moderator'
);
