-- PetanQ - optionele affiche (poster) per toernooi.
alter table toernooien add column affiche_url text;

-- Storage-bucket voor affiches, publiek leesbaar, met beperking op
-- bestandsgrootte (5MB) en toegestane types (jpeg/png/webp).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('affiches', 'affiches', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Iedereen mag affiches lezen (publieke bucket, maar policy toch expliciet).
create policy "affiches_select_publiek"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'affiches');

-- Het publieke aanmeldformulier mag een affiche uploaden.
create policy "affiches_insert_publiek"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'affiches');

-- Enkel moderatoren mogen affiches verwijderen/vervangen (opruimen).
create policy "affiches_delete_moderator"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'affiches' and is_moderator());

create policy "affiches_update_moderator"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'affiches' and is_moderator());
