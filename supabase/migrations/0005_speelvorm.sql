-- PetanQ - "speelvorm" toevoegen: een toernooi speelt zich af in een vast
-- aantal ronden (Swiss/klassiek) OF in poules (groepsfase), niet allebei.
-- aantal_ronden wordt daarom nullable; aantal_poules is nieuw en ook nullable.

create type speelvorm_enum as enum ('rondes', 'poules');

alter table toernooien
  add column speelvorm speelvorm_enum not null default 'rondes',
  add column aantal_poules integer check (aantal_poules is null or aantal_poules > 0),
  alter column aantal_ronden drop not null;

-- Data-integriteit: bij 'rondes' moet aantal_ronden gekend zijn, bij 'poules'
-- moet aantal_poules gekend zijn (het andere veld mag null zijn, "onbekend"
-- kan ook door zowel aantal_ronden als aantal_poules null te laten).
alter table toernooien
  add constraint speelvorm_consistent check (
    (speelvorm = 'rondes' and aantal_poules is null)
    or (speelvorm = 'poules' and aantal_ronden is null)
  );
