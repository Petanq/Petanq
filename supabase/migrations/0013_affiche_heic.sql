-- Sta ook HEIC/HEIF toe (formaat dat sommige iPhones gebruiken voor foto's),
-- zodat een affiche die rechtstreeks met de GSM-camera gefotografeerd wordt
-- altijd geupload kan worden.
update storage.buckets
set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
where id = 'affiches';
