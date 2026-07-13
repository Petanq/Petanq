create table if not exists site_bezoeken (
  dag date primary key,
  aantal integer not null default 0
);

alter table site_bezoeken enable row level security;
-- Geen publieke policies: enkel de service-role (server-side) mag lezen/schrijven.

-- Atomische increment (i.p.v. select+update vanuit JS) om een race condition
-- te vermijden wanneer twee bezoekers exact tegelijk toekomen.
create or replace function increment_bezoek() returns void as $$
  insert into site_bezoeken (dag, aantal)
  values (current_date, 1)
  on conflict (dag) do update set aantal = site_bezoeken.aantal + 1;
$$ language sql;
