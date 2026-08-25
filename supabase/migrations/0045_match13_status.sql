-- Lets Frederic track which pilot clubs are still in a free trial versus
-- already paying, without that affecting access itself (the `actief`
-- switch from 0044 already handles on/off). A plain text + check constraint
-- instead of an enum — easy to extend later, no enum-alteration gotchas.
alter table match13_gebruikers
  add column status text not null default 'proef' check (status in ('proef', 'betalend'));
