-- "Vrijwilliger sinds..." badge: haalt de effectieve aanmaakdatum op uit
-- auth.users (die al bestond) i.p.v. een nieuwe kolom leeg te laten starten.
alter table moderatoren add column if not exists aangemaakt_op timestamptz;

update moderatoren m
set aangemaakt_op = u.created_at
from auth.users u
where u.id = m.user_id and m.aangemaakt_op is null;

alter table moderatoren alter column aangemaakt_op set default now();
