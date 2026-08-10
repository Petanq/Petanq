-- Schiftingsdata hebben vaak een ander (vast) speeluur dan de hoofddatum
-- (bv. schiftingen om 19u, terwijl de finale overdag is). Dit veld is
-- optioneel: als het leeg is, gebruiken we gewoon het hoofuur.
alter table toernooien add column if not exists kwalificatie_uur time null;
