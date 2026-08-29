-- Wanneer een club (of de admin) een Match13-toernooi wist of verwijdert,
-- bewaren we automatisch een kopie van de eindstand hier — onzichtbaar voor
-- de club zelf, enkel voor de admin. Zo blijven resultaten beschikbaar ook
-- als een club zelf hun toernooi opruimt voor een volgende speelavond.
create table match13_archief (
  id uuid primary key default gen_random_uuid(),
  oorspronkelijk_toernooi_id uuid,
  club text not null default '',
  data jsonb not null,
  reden text not null,
  gearchiveerd_op timestamptz not null default now()
);

alter table match13_archief enable row level security;

-- Enkel de admin mag dit ooit lezen. Er is bewust geen insert/update-check
-- voor niet-admins: het archiveren zelf gebeurt via de service-role client
-- binnenin een server action (na de eigen magMatch13Gebruiken()-check daar),
-- dus dat omzeilt RLS sowieso — deze policy regelt enkel wie het achteraf
-- kan bekijken.
create policy "match13_archief_admin_alleen"
  on match13_archief for all
  to authenticated
  using (is_admin())
  with check (is_admin());
