-- De "+ Nieuw toernooi"-snelinvoer in /beheer/toernooien (toernooiToevoegenAlsAdmin)
-- voegt een toernooi meteen toe met status='goedgekeurd', maar de enige
-- bestaande insert-policy op deze tabel (toernooien_insert_publiek) staat
-- enkel status='in_behandeling' toe. Daardoor faalde die snelinvoer voor elke
-- moderator/admin met een RLS-foutmelding. Deze policy vult dat gat aan,
-- naast (niet in plaats van) de publieke insert-policy.
create policy "toernooien_insert_moderator"
  on toernooien for insert
  to authenticated
  with check (is_moderator());
