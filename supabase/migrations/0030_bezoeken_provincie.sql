-- Houdt bij, enkel geaggregeerd (geen IP-adressen bewaard), hoeveel bezoeken
-- er per dag per provincie binnenkomen. De provincie wordt geschat op basis
-- van Vercel's IP-gebaseerde locatie (zie lib/stad-provincie.ts) — bij twijfel
-- of buiten België komt de rij onder 'onbekend' terecht.
create table if not exists bezoeken_provincie (
  dag date not null,
  provincie text not null,
  aantal integer not null default 0,
  primary key (dag, provincie)
);

alter table bezoeken_provincie enable row level security;
-- Geen publieke policies: enkel de service-role (server-side) mag lezen/schrijven.

create or replace function increment_bezoek_provincie(p_provincie text) returns void as $$
  insert into bezoeken_provincie (dag, provincie, aantal)
  values (current_date, p_provincie, 1)
  on conflict (dag, provincie) do update set aantal = bezoeken_provincie.aantal + 1;
$$ language sql;
