-- Zacht verwijderen + verwijderingsaanvragen voor tornooien en clubs: een
-- gewone vrijwilliger kan niet meer rechtstreeks (definitief) verwijderen,
-- enkel een aanvraag met reden indienen. Een admin bevestigt (zacht
-- verwijderen — het record blijft in de databank staan, dus altijd nog
-- herstelbaar) of wijst de aanvraag af.
alter table toernooien add column if not exists verwijderd_op timestamptz null;
alter table toernooien add column if not exists verwijder_aanvraag_door text null;
alter table toernooien add column if not exists verwijder_aanvraag_reden text null;
alter table toernooien add column if not exists verwijder_aanvraag_op timestamptz null;

alter table clubs add column if not exists verwijderd_op timestamptz null;
alter table clubs add column if not exists verwijder_aanvraag_door text null;
alter table clubs add column if not exists verwijder_aanvraag_reden text null;
alter table clubs add column if not exists verwijder_aanvraag_op timestamptz null;

-- Enkel admins mogen verwijderd_op zetten (het definitief/zacht verwijeren
-- bevestigen) — dit geldt op databankniveau, dus een gewone vrijwilliger kan
-- dit ook niet omzeilen door rechtstreeks (buiten de app om) de databank aan
-- te spreken.
create or replace function bewaak_verwijderd_op() returns trigger as $$
begin
  if NEW.verwijderd_op is distinct from OLD.verwijderd_op and not is_admin() then
    raise exception 'Enkel admins mogen dit definitief verwijderen.';
  end if;
  return NEW;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_toernooien_bewaak_verwijderd_op on toernooien;
create trigger trg_toernooien_bewaak_verwijderd_op
  before update on toernooien
  for each row execute function bewaak_verwijderd_op();

drop trigger if exists trg_clubs_bewaak_verwijderd_op on clubs;
create trigger trg_clubs_bewaak_verwijderd_op
  before update on clubs
  for each row execute function bewaak_verwijderd_op();

-- Zacht-verwijderde rijen niet meer publiek tonen.
drop policy if exists "toernooien_select_publiek" on toernooien;
create policy "toernooien_select_publiek"
  on toernooien for select
  to anon, authenticated
  using (status = 'goedgekeurd' and verwijderd_op is null);

drop policy if exists "clubs_select_publiek" on clubs;
create policy "clubs_select_publiek"
  on clubs for select
  to anon, authenticated
  using (actief = true and verwijderd_op is null);

-- Enkel admins mogen nog rechtstreeks (hard) verwijderen. De app gebruikt dit
-- voortaan niet meer (verwijderen gebeurt via verwijderd_op), maar dit blijft
-- als extra vangnet staan.
drop policy if exists "toernooien_delete_moderator" on toernooien;
create policy "toernooien_delete_admin"
  on toernooien for delete
  to authenticated
  using (is_admin());

drop policy if exists "clubs_delete_moderator" on clubs;
create policy "clubs_delete_admin"
  on clubs for delete
  to authenticated
  using (is_admin());
