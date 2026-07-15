-- Vrijwilligers mogen standaard enkel toernooien in hun eigen provincie
-- goedkeuren/weigeren. mag_heel_belgie geeft een admin de mogelijkheid om
-- die beperking per moderator op te heffen.
alter table moderatoren add column if not exists mag_heel_belgie boolean not null default false;
