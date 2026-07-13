alter table moderatoren add column if not exists wachtwoord_ingesteld boolean not null default false;

-- Bestaande, al langer actieve accounts blijven als bevestigd staan; nieuwe/lopende
-- uitnodigingen moeten opnieuw expliciet een wachtwoord instellen om als "actief" te tonen.
update moderatoren set wachtwoord_ingesteld = true
where user_id in (
  select id from auth.users where email in ('frederic@nitra.be', 'frederic.nitra@gmail.com')
);
