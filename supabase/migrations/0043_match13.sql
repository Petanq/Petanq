-- Match13 (werknaam) — toernooidag-tool, volledig los van de rest van de site.
-- Voorlopig uitsluitend zichtbaar/bruikbaar voor admins (is_admin() uit
-- 0002_rls.sql), niet voor gewone moderatoren en niet voor het publiek.
--
-- De volledige toernooistaat (teams, rondes, scores, poule-brackets) wordt
-- als één jsonb-blob bewaard per toernooi, exact dezelfde vorm als het
-- AppState-object dat de oorspronkelijke lokale tool naar localStorage
-- schreef — geen relationeel bracket-model nodig.

create table match13_toernooien (
  id uuid primary key default gen_random_uuid(),
  aangemaakt_door uuid not null references auth.users (id) on delete cascade,
  naam text not null default 'Nieuw toernooi',
  data jsonb not null default '{}'::jsonb,
  aangemaakt_op timestamptz not null default now(),
  bijgewerkt_op timestamptz not null default now()
);

alter table match13_toernooien enable row level security;

create policy "match13_toernooien_admin_alles"
  on match13_toernooien for all
  to authenticated
  using (is_admin())
  with check (is_admin());
