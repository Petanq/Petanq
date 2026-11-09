-- Twee extra, anonieme metingen (geen IP-adressen, geen cookies, enkel opgeteld per dag):
--
-- 1. bezoeken_kenmerken: per dag hoeveel bezoeken er waren per land, provincie, browsertaal en
--    "bot of niet". Zo kan het dashboard Belgen, buitenland, bots en onbekend uit elkaar houden
--    (in bezoeken_provincie zat dat allemaal samen onder 'onbekend').
-- 2. toernooi_acties: per dag en per tornooi hoe vaak bezoekers doorklikken (route, agenda,
--    delen, opslaan, inschrijven, ...).
--
-- Enkel de service-role (server-side) mag lezen en schrijven, zoals bij de andere tellers.

create table if not exists bezoeken_kenmerken (
  dag date not null,
  land text not null,        -- tweeletterige landcode (bv. 'BE', 'FR') of 'onbekend'
  provincie text not null,   -- zoals in bezoeken_provincie, of 'onbekend'
  taal text not null,        -- taal van de browser: 'nl', 'fr', 'en', 'de', 'overig' of 'onbekend'
  bot boolean not null,
  aantal integer not null default 0,
  primary key (dag, land, provincie, taal, bot)
);

alter table bezoeken_kenmerken enable row level security;

create or replace function increment_bezoek_kenmerk(
  p_land text,
  p_provincie text,
  p_taal text,
  p_bot boolean
) returns void as $$
  insert into bezoeken_kenmerken (dag, land, provincie, taal, bot, aantal)
  values (current_date, p_land, p_provincie, p_taal, p_bot, 1)
  on conflict (dag, land, provincie, taal, bot)
  do update set aantal = bezoeken_kenmerken.aantal + 1;
$$ language sql;

create table if not exists toernooi_acties (
  dag date not null,
  toernooi_id uuid not null references toernooien (id) on delete cascade,
  actie text not null,
  aantal integer not null default 0,
  primary key (dag, toernooi_id, actie)
);

alter table toernooi_acties enable row level security;

create or replace function registreer_toernooi_actie(p_toernooi uuid, p_actie text) returns void as $$
  insert into toernooi_acties (dag, toernooi_id, actie, aantal)
  values (current_date, p_toernooi, p_actie, 1)
  on conflict (dag, toernooi_id, actie)
  do update set aantal = toernooi_acties.aantal + 1;
$$ language sql;
