-- Ideeën/feedback vanuit vrijwilligers (enkel de beheerkant, niet publiek) —
-- vrijwilligers zien vaak dingen die niet vanzelf opvallen. Elke vrijwilliger
-- mag een idee indienen en alle ingediende ideeën bekijken; enkel een admin
-- mag een idee als "afgehandeld" markeren.
create table if not exists ideeen (
  id uuid primary key default gen_random_uuid(),
  moderator_naam text not null,
  tekst text not null,
  afgehandeld boolean not null default false,
  aangemaakt_op timestamptz not null default now()
);

alter table ideeen enable row level security;

create policy "ideeen_select_moderator"
  on ideeen for select
  to authenticated
  using (is_moderator());

create policy "ideeen_insert_moderator"
  on ideeen for insert
  to authenticated
  with check (is_moderator());

create policy "ideeen_update_admin"
  on ideeen for update
  to authenticated
  using (is_admin())
  with check (is_admin());
