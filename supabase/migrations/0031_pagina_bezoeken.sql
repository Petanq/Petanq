-- Generieke per-pagina bezoekteller (los van de algemene site_bezoeken),
-- zodat we ook kunnen zien hoe vaak een specifieke pagina bezocht wordt
-- (bv. "Op reis met Claudy Weibel"). Enkel geaggregeerd per dag+pad.
create table if not exists pagina_bezoeken (
  dag date not null,
  pad text not null,
  aantal integer not null default 0,
  primary key (dag, pad)
);

alter table pagina_bezoeken enable row level security;
-- Geen publieke policies: enkel de service-role (server-side) mag lezen/schrijven.

create or replace function increment_pagina_bezoek(p_pad text) returns void as $$
  insert into pagina_bezoeken (dag, pad, aantal)
  values (current_date, p_pad, 1)
  on conflict (dag, pad) do update set aantal = pagina_bezoeken.aantal + 1;
$$ language sql;
