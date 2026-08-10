-- Schiftingsdata kunnen elk hun eigen uur hebben (bv. een datum die uitzonderlijk
-- op een ander tijdstip start dan de rest) — daarom slaan we per datum ook een
-- optioneel uur op i.p.v. enkel een lijst van datums. Blijft een datum zonder
-- eigen uur staan, dan valt de site terug op het algemene kwalificatie_uur.
--
-- Postgres laat geen subquery toe in de USING-transform van "alter column type",
-- daarom via een tussenkolom: nieuwe kolom aanmaken, data overzetten, oude
-- kolom weggooien en de nieuwe hernoemen naar de oorspronkelijke naam.
alter table toernooien add column kwalificatiedata_new jsonb;

update toernooien
set kwalificatiedata_new = (
  select jsonb_agg(jsonb_build_object('datum', to_char(d, 'YYYY-MM-DD'), 'uur', null))
  from unnest(kwalificatiedata) as d
)
where kwalificatiedata is not null;

alter table toernooien drop column kwalificatiedata;
alter table toernooien rename column kwalificatiedata_new to kwalificatiedata;
