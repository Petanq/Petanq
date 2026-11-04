-- Vangnet: een Match13-toernooi dat uit de database verdwijnt (per ongeluk geklikt, via
-- SQL, of in cascade) belandt altijd eerst in het archief, met alles wat nodig is om het
-- terug te zetten. Zo gaan ingeschreven teams nooit meer onherroepelijk verloren.
--
-- Veilig om vóór of na de nieuwe code uit te voeren.

alter table match13_archief add column if not exists meta jsonb;

create or replace function match13_archiveer_bij_verwijderen()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Alleen toernooien met inhoud: ingeschreven teams, rondes of een geplande datum.
  -- Lege "Nieuw toernooi"-proefjes vervuilen het archief niet.
  if (
    jsonb_array_length(coalesce(old.data->'teams', '[]'::jsonb)) > 0
    or jsonb_array_length(coalesce(old.data->'rounds', '[]'::jsonb)) > 0
    or old.geplande_datum is not null
  )
  -- De app archiveert zelf al (met dezelfde gegevens) net voor het verwijderen: dan niet dubbel.
  and not exists (
    select 1 from match13_archief a
    where a.oorspronkelijk_toernooi_id = old.id
      and a.reden = 'verwijderd'
      and a.gearchiveerd_op > now() - interval '1 minute'
  ) then
    insert into match13_archief (oorspronkelijk_toernooi_id, club, data, reden, meta)
    values (
      old.id,
      coalesce(nullif(old.data->>'clubName', ''), old.club, ''),
      old.data,
      'verwijderd',
      jsonb_build_object(
        'club', old.club,
        'naam', old.naam,
        'geplande_datum', old.geplande_datum,
        'organisator', old.organisator,
        'afgewerkt', old.afgewerkt,
        'is_test', old.is_test
      )
    );
  end if;
  return old;
end;
$$;

drop trigger if exists match13_archiveer_bij_verwijderen on match13_toernooien;
create trigger match13_archiveer_bij_verwijderen
  before delete on match13_toernooien
  for each row execute function match13_archiveer_bij_verwijderen();
