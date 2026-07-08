-- PetanQ - optionele foto per club, enkel door moderatoren toe te voegen.
alter table clubs add column foto_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('club-fotos', 'club-fotos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])
on conflict (id) do nothing;

create policy "club_fotos_select_publiek"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'club-fotos');

-- Enkel moderatoren mogen clubfoto's uploaden/vervangen/verwijderen (admin-only functie).
create policy "club_fotos_insert_moderator"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'club-fotos' and is_moderator());

create policy "club_fotos_update_moderator"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'club-fotos' and is_moderator());

create policy "club_fotos_delete_moderator"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'club-fotos' and is_moderator());
