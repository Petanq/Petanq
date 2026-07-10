-- Qpetanque - correctie PC Terheiden: stond fout geregistreerd als
-- Antwerpen-provincie, ligt in werkelijkheid in Outer (Ninove), Oost-Vlaanderen.
-- Gegevens rechtstreeks door Frederic geverifieerd/gevonden, 2026-07.
update clubs set
  gemeente = 'Ninove',
  provincie = 'oost-vlaanderen',
  adres = 'Kerkstraat 73, 9406 Outer',
  telefoon = '054/50 21 67',
  contact_email = 'dhr.christian.declercq@gmail.com',
  openingsuren = 'Maandag en woensdag: open 13u30, start petanque 14u30. Vrijdag: open 18u00, start petanque 19u00.'
where lower(naam) = lower('PC Terheiden');
