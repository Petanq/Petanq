-- "Deel live": een club kan een lopend Match13-toernooi koppelen aan zijn
-- eigen Petanque13.be-kalendervermelding, zodat bezoekers de stand kunnen
-- volgen zonder in te loggen — bewust per toernooi aan/uit gezet door de
-- club zelf, nooit standaard aan.
alter table match13_toernooien
  add column if not exists live_delen boolean not null default false,
  add column if not exists toernooi_id uuid references toernooien (id) on delete set null;

-- Enkel lezen, en enkel de rijen die de club zelf expliciet gedeeld heeft —
-- dit komt BOVENOP de bestaande "match13_toernooien_toegang"-policy (RLS-
-- policies voor hetzelfde command worden OR'd), dus club/admin-toegang om te
-- lezen/schrijven blijft ongewijzigd.
create policy "match13_toernooien_publiek_live"
  on match13_toernooien for select
  to public
  using (live_delen = true);
