-- Een Match13-toernooi hoort bij een CLUB (kolom club), niet bij de persoon die het
-- aanmaakte. Tot nu toe stond aangemaakt_door op "on delete cascade": werd één
-- uitgenodigde persoon (of zijn login) verwijderd, dan verdwenen ALLE toernooien die
-- die persoon aanmaakte mee, ook die van collega's in dezelfde club en zonder archief.
--
-- Vanaf nu blijft het toernooi bestaan als de maker verdwijnt (aangemaakt_door wordt
-- leeg). De toegang loopt via club, dus de club ziet het toernooi gewoon nog.
-- Veilig om vóór of na de nieuwe code uit te voeren.

alter table match13_toernooien alter column aangemaakt_door drop not null;

do $$
declare
  fk_naam text;
begin
  select c.conname into fk_naam
  from pg_constraint c
  join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any (c.conkey)
  where c.conrelid = 'public.match13_toernooien'::regclass
    and c.contype = 'f'
    and a.attname = 'aangemaakt_door';

  if fk_naam is not null then
    execute format('alter table match13_toernooien drop constraint %I', fk_naam);
  end if;
end $$;

alter table match13_toernooien
  add constraint match13_toernooien_aangemaakt_door_fkey
  foreign key (aangemaakt_door) references auth.users (id) on delete set null;
