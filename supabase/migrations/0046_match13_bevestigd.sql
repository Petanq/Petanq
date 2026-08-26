-- Lets Frederic see whether an invited pilot club actually logged in yet
-- (set to true the moment they successfully set their password), same
-- pattern as the existing moderatoren.wachtwoord_ingesteld column.
alter table match13_gebruikers add column bevestigd boolean not null default false;
