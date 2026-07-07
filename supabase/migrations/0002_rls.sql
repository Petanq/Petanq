-- Le Bouliste.be - Row Level Security
-- Voer uit na 0001_init.sql.

alter table toernooien enable row level security;
alter table clubs enable row level security;
alter table nieuwsbrief enable row level security;
alter table moderatoren enable row level security;

-- Helperfunctie: is de huidige gebruiker een ingelogde moderator/admin?
-- security definer + vaste search_path: omzeilt bewust de RLS op
-- moderatoren zelf, anders zou de policy op moderatoren zichzelf weer
-- via deze functie aanroepen (oneindige recursie).
create or replace function is_moderator()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from moderatoren where user_id = auth.uid()
  );
$$;

-- Helperfunctie: is de huidige gebruiker een admin? Zelfde reden als hierboven.
create or replace function is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from moderatoren where user_id = auth.uid() and rol = 'admin'
  );
$$;

-- ── toernooien ─────────────────────────────────────────────────────────────
-- Iedereen mag goedgekeurde toernooien lezen.
create policy "toernooien_select_publiek"
  on toernooien for select
  to anon, authenticated
  using (status = 'goedgekeurd');

-- Moderatoren mogen alles lezen (incl. in_behandeling/geweigerd).
create policy "toernooien_select_moderator"
  on toernooien for select
  to authenticated
  using (is_moderator());

-- Het publieke aanmeldformulier mag een rij toevoegen, maar uitsluitend met
-- status = 'in_behandeling' (voorkomt dat iemand zichzelf meteen goedkeurt).
create policy "toernooien_insert_publiek"
  on toernooien for insert
  to anon, authenticated
  with check (status = 'in_behandeling');

-- Enkel moderatoren mogen bewerken (o.a. goedkeuren/weigeren) of verwijderen.
create policy "toernooien_update_moderator"
  on toernooien for update
  to authenticated
  using (is_moderator())
  with check (is_moderator());

create policy "toernooien_delete_moderator"
  on toernooien for delete
  to authenticated
  using (is_moderator());

-- ── clubs ──────────────────────────────────────────────────────────────────
-- Iedereen mag actieve clubs lezen.
create policy "clubs_select_publiek"
  on clubs for select
  to anon, authenticated
  using (actief = true);

create policy "clubs_select_moderator"
  on clubs for select
  to authenticated
  using (is_moderator());

-- Publiek mag een club voorstellen, maar enkel als inactief (wacht op
-- goedkeuring door een moderator in /beheer/clubs).
create policy "clubs_insert_publiek"
  on clubs for insert
  to anon, authenticated
  with check (actief = false);

-- Moderatoren mogen clubs rechtstreeks toevoegen, ook meteen actief
-- (tweede permissive policy: Postgres combineert INSERT-checks met OR).
create policy "clubs_insert_moderator"
  on clubs for insert
  to authenticated
  with check (is_moderator());

create policy "clubs_update_moderator"
  on clubs for update
  to authenticated
  using (is_moderator())
  with check (is_moderator());

create policy "clubs_delete_moderator"
  on clubs for delete
  to authenticated
  using (is_moderator());

-- ── nieuwsbrief ────────────────────────────────────────────────────────────
-- Publiek mag zich inschrijven, maar niet de lijst van abonnees lezen.
create policy "nieuwsbrief_insert_publiek"
  on nieuwsbrief for insert
  to anon, authenticated
  with check (true);

create policy "nieuwsbrief_select_moderator"
  on nieuwsbrief for select
  to authenticated
  using (is_moderator());

create policy "nieuwsbrief_update_moderator"
  on nieuwsbrief for update
  to authenticated
  using (is_moderator())
  with check (is_moderator());

create policy "nieuwsbrief_delete_moderator"
  on nieuwsbrief for delete
  to authenticated
  using (is_moderator());

-- ── moderatoren ────────────────────────────────────────────────────────────
-- Een moderator mag enkel zijn eigen rij zien, een admin ziet iedereen.
create policy "moderatoren_select_zelf_of_admin"
  on moderatoren for select
  to authenticated
  using (user_id = auth.uid() or is_admin());

-- Enkel admins mogen moderatoren toevoegen/bewerken/verwijderen.
create policy "moderatoren_insert_admin"
  on moderatoren for insert
  to authenticated
  with check (is_admin());

create policy "moderatoren_update_admin"
  on moderatoren for update
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy "moderatoren_delete_admin"
  on moderatoren for delete
  to authenticated
  using (is_admin());
