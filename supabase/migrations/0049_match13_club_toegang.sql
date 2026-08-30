-- Tot nu toe zag een uitgenodigde persoon enkel de toernooien die hij/zij
-- zelf had aangemaakt (aangemaakt_door = auth.uid()). Voor een club met
-- meerdere uitgenodigde personen (bv. PC Alosta met 2-3 mensen) betekende dat
-- elk van hen een eigen, geïsoleerde toernooilijst zag in plaats van dezelfde
-- gedeelde toernooien. Deze migratie koppelt toegang aan de CLUB in plaats
-- van aan de individuele persoon.

alter table match13_toernooien add column club text not null default '';

-- Backfill: elk bestaand toernooi krijgt de clubnaam van wie het aanmaakte.
update match13_toernooien t
set club = coalesce((select g.club from match13_gebruikers g where g.user_id = t.aangemaakt_door), '');

drop policy "match13_toernooien_toegang" on match13_toernooien;

create or replace function match13_eigen_club()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select club from match13_gebruikers where user_id = auth.uid() and actief = true limit 1;
$$;

-- club = '' matcht nooit, zelfs niet met een ander toernooi dat ook op ''
-- staat — anders zouden twee losse, per ongeluk clubloze gebruikers elkaars
-- toernooien kunnen zien.
create policy "match13_toernooien_toegang"
  on match13_toernooien for all
  to authenticated
  using (
    is_admin()
    or (heeft_match13_toegang() and match13_eigen_club() <> '' and club = match13_eigen_club())
  )
  with check (
    is_admin()
    or (heeft_match13_toegang() and match13_eigen_club() <> '' and club = match13_eigen_club())
  );
