-- Houdt bij hoe vaak elke moderator/vrijwilliger inlogt, enkel zichtbaar voor
-- de admin op de moderatorenpagina.
alter table moderatoren add column if not exists login_aantal integer not null default 0;
alter table moderatoren add column if not exists laatste_login timestamptz;
