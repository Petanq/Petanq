-- Match13 pilot access: a lightweight, separate account list for club
-- contacts who should ONLY see Match13 — never the real moderator dashboard
-- (club/tournament approvals etc.), and never the rest of Le Bouliste.be's
-- beheer. Deliberately NOT stored in `moderatoren` (that table's mere
-- existence of a row makes is_moderator() true for someone), so this can
-- never accidentally widen access to anything else.

create table match13_gebruikers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  naam text not null,
  email text not null,
  actief boolean not null default true,
  aangemaakt_op timestamptz not null default now()
);

alter table match13_gebruikers enable row level security;

-- Only the real admin manages this list.
create policy "match13_gebruikers_admin_alles"
  on match13_gebruikers for all
  to authenticated
  using (is_admin())
  with check (is_admin());

create or replace function heeft_match13_toegang()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from match13_gebruikers where user_id = auth.uid() and actief = true
  );
$$;

-- Replace the admin-only policy: a pilot user may see/manage only the
-- tournaments they themselves created (aangemaakt_door = auth.uid()) — never
-- another club's or the admin's own test tournaments. The admin still sees
-- everything.
drop policy "match13_toernooien_admin_alles" on match13_toernooien;

create policy "match13_toernooien_toegang"
  on match13_toernooien for all
  to authenticated
  using (is_admin() or (heeft_match13_toegang() and aangemaakt_door = auth.uid()))
  with check (is_admin() or (heeft_match13_toegang() and aangemaakt_door = auth.uid()));
