-- Publieke aanvraagpagina voor Match13: een club kan zelf toegang aanvragen
-- (naam, club, e-mail, eventueel bericht) i.p.v. dat enkel Frederic zelf
-- iemand kan uitnodigen. Hij bekijkt/keurt de aanvraag nadien goed of af via
-- het bestaande "/beheer/match13/toegang"-scherm — goedkeuren roept gewoon de
-- bestaande match13GebruikerUitnodigen-actie aan, dit is dus enkel het
-- wachtrijtje ervoor.
create table match13_aanvragen (
  id uuid primary key default gen_random_uuid(),
  club text not null,
  naam text not null,
  email text not null,
  telefoon text null,
  bericht text null,
  status text not null default 'in_behandeling' check (status in ('in_behandeling', 'goedgekeurd', 'geweigerd')),
  ingediend_op timestamptz not null default now(),
  behandeld_door text null,
  behandeld_op timestamptz null,
  weiger_reden text null
);

alter table match13_aanvragen enable row level security;

-- Het publieke aanvraagformulier mag een rij toevoegen, maar uitsluitend met
-- status = 'in_behandeling' (voorkomt dat iemand zichzelf meteen goedkeurt).
create policy "match13_aanvragen_insert_publiek"
  on match13_aanvragen for insert
  to anon, authenticated
  with check (status = 'in_behandeling');

-- Enkel admins mogen de wachtrij bekijken/bijwerken (dit hangt samen met
-- match13_gebruikers, dat ook enkel voor admins toegankelijk is).
create policy "match13_aanvragen_admin_alles"
  on match13_aanvragen for all
  to authenticated
  using (is_admin())
  with check (is_admin());
