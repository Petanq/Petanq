-- Match13: een club die in Opzet een clubnaam intikt die niet in de clublijst staat,
-- komt hier als "nieuwe club om na te kijken" terecht. De admin ziet die lijst in het
-- Match13-overzicht (met een rood bolletje op de Match13-tegel) en vinkt ze af.
--
-- Het toernooi zelf werkt gewoon door — dit is enkel een melding.
-- Veilig om vóór of na de nieuwe code uit te voeren: zolang de tabel ontbreekt,
-- slaat de app de melding gewoon over.

create table if not exists match13_nieuwe_clubs (
  id uuid primary key default gen_random_uuid(),
  toernooi_id uuid references match13_toernooien (id) on delete cascade,
  naam text not null,
  gemeente text not null default '',
  aangemaakt_op timestamptz not null default now(),
  afgehandeld boolean not null default false,
  afgehandeld_op timestamptz
);

-- Per toernooi maximaal één openstaande melding (wijzigt de club van naam, dan wordt ze vervangen).
create unique index if not exists match13_nieuwe_clubs_open_per_toernooi
  on match13_nieuwe_clubs (toernooi_id)
  where not afgehandeld;

alter table match13_nieuwe_clubs enable row level security;

-- Alleen de admin leest en beheert dit. Het aanmaken van een melding gebeurt via de
-- service-role client in een server action (na de eigen Match13-toegangscontrole).
create policy "match13_nieuwe_clubs_admin_alles"
  on match13_nieuwe_clubs for all
  to authenticated
  using (is_admin())
  with check (is_admin());
