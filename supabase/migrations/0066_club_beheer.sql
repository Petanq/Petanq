-- Clubs beheren zelf hun openingsuren en contactgegevens ("Mijn club").
--
-- - club_uren:        de openingsuren zoals ze nu op de site staan (zomer, winter, afwijkingen)
-- - club_wijzigingen: wat een club voorstelt; wacht op goedkeuring door de admin
--                     (tenzij de club als "vertrouwd" is gemarkeerd: dan staat het meteen online)
-- - club_vandaag:     "vandaag gesloten" / "vandaag extra open", verloopt zelf na één dag
--
-- Wie een club mag beheren: de admin, of een actieve Match13-gebruiker die aan die club
-- gekoppeld is (match13_gebruikers.club_id). Schrijfacties van clubs lopen via server actions
-- (die dat zelf controleren); de policies hieronder regelen vooral wie wat mag LEZEN.
--
-- Veilig om vóór de nieuwe code uit te voeren: de app slaat het over zolang de tabellen ontbreken.

alter table clubs add column if not exists vertrouwd boolean not null default false;

create or replace function mag_club_beheren(p_club uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select is_admin() or exists (
    select 1 from match13_gebruikers
    where user_id = auth.uid() and actief = true and club_id = p_club
  );
$$;

-- ── Openingsuren zoals ze op de site staan ──────────────────────────────────
create table club_uren (
  club_id uuid primary key references clubs (id) on delete cascade,
  uren jsonb not null,
  bijgewerkt_op timestamptz not null default now(),
  -- laatste keer dat de club bevestigde dat alles nog klopt ("Alles klopt nog")
  bevestigd_op timestamptz
);

alter table club_uren enable row level security;

create policy "club_uren_lezen_publiek"
  on club_uren for select
  using (true);

create policy "club_uren_admin_schrijven"
  on club_uren for all
  to authenticated
  using (is_admin())
  with check (is_admin());

-- ── Voorstellen van clubs, wachtend op goedkeuring ──────────────────────────
create table club_wijzigingen (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references clubs (id) on delete cascade,
  ingediend_door uuid references auth.users (id) on delete set null,
  ingediend_op timestamptz not null default now(),
  voorstel jsonb not null,
  status text not null default 'wachtend' check (status in ('wachtend', 'goedgekeurd', 'afgewezen')),
  behandeld_op timestamptz,
  behandeld_door uuid references auth.users (id) on delete set null,
  reden_afwijzing text
);

-- Per club maximaal één openstaand voorstel: een nieuw voorstel vervangt het vorige.
create unique index club_wijzigingen_een_open_per_club
  on club_wijzigingen (club_id)
  where status = 'wachtend';

alter table club_wijzigingen enable row level security;

create policy "club_wijzigingen_lezen"
  on club_wijzigingen for select
  to authenticated
  using (mag_club_beheren(club_id));

create policy "club_wijzigingen_admin_schrijven"
  on club_wijzigingen for all
  to authenticated
  using (is_admin())
  with check (is_admin());

-- ── Vandaag gesloten / extra open ───────────────────────────────────────────
create table club_vandaag (
  club_id uuid primary key references clubs (id) on delete cascade,
  datum date not null,
  soort text not null check (soort in ('dicht', 'extra')),
  reden text not null default '' check (char_length(reden) <= 60),
  ingesteld_door uuid references auth.users (id) on delete set null,
  ingesteld_op timestamptz not null default now()
);

alter table club_vandaag enable row level security;

-- Publiek zichtbaar, maar enkel voor vandaag (Belgische datum): oudere rijen verdwijnen vanzelf uit beeld.
create policy "club_vandaag_lezen_publiek"
  on club_vandaag for select
  using (datum = (now() at time zone 'Europe/Brussels')::date);

create policy "club_vandaag_beheerders"
  on club_vandaag for all
  to authenticated
  using (mag_club_beheren(club_id))
  with check (mag_club_beheren(club_id));
