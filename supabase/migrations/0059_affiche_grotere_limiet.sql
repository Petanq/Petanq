-- Verhoogt de maximale bestandsgrootte voor affiches van 5MB naar 15MB.
-- Rechtstreekse GSM-foto's (vaak HEIC) kunnen niet altijd browser-side
-- verkleind worden (enkel Apple-toestellen decoderen HEIC in de browser),
-- waardoor het originele, grotere bestand geüpload wordt en op de oude
-- limiet vastliep — de indiener kreeg dan een generieke "opladen mislukt".
update storage.buckets
set file_size_limit = 15728640
where id = 'affiches';
