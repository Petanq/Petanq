-- Qpetanque - voorkom dat hetzelfde toernooi (zelfde club, datum en naam)
-- meermaals wordt ingediend/toegevoegd.
create unique index if not exists toernooien_uniek
  on toernooien (lower(clubnaam), datum, lower(naam_nl));
