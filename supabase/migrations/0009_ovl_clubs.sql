-- PetanQ - Oost-Vlaamse clubs bijwerken met officieel adres/e-mail/website,
-- bron: https://www.pfv-ovl.be/index.php/competitieve-clubs/ (2026-07-08).
-- Deze bron toonde ook dat 3 clubs met de verkeerde gemeente in de database
-- stonden (waarschijnlijk verward met de dichtstbijzijnde grote stad) — die
-- gemeente/provincie is hierbij meteen gecorrigeerd.

update clubs set
  adres = 'Domein Beukenhof, Langestraat 12, 9300 Aalst',
  contact_email = 'francoismarleen176@gmail.com',
  website = 'http://www.pcalosta06.be'
where lower(naam) = lower('KPC Alosta');

update clubs set
  gemeente = 'Heusden',
  adres = 'Bosheidestraat 7, 9070 Heusden',
  contact_email = 'christophe.dal@skynet.be',
  website = 'http://petanquemistral.com'
where lower(naam) = lower('KP Mistral');

update clubs set
  gemeente = 'Wondelgem',
  provincie = 'oost-vlaanderen',
  adres = 'Botestraat 98A, 9032 Wondelgem',
  contact_email = 'secretariaat@kpc-schorpioen.com',
  website = 'https://www.kpc-schorpioen.com'
where lower(naam) = lower('KPC Schorpioen');

update clubs set
  gemeente = 'Merelbeke',
  adres = 'Ovenveldstraat 9, 9090 Merelbeke',
  contact_email = 'pcverbroedering@outlook.be'
where lower(naam) = lower('KPC Verbroedering');

update clubs set
  gemeente = 'Heusden',
  adres = 'Wellingstraat 95, 9070 Heusden',
  contact_email = 'Secretariaat.Haeseveld@gmail.com',
  website = 'https://www.petanquehaeseveld.be'
where lower(naam) = lower('PC Haeseveld');

update clubs set
  gemeente = 'Lokeren',
  adres = 'Oude Bruglaan 49, 9160 Lokeren',
  contact_email = 'debeliedries@gmail.com',
  website = 'http://pcreynaert.be/'
where lower(naam) = lower('PC Reynaert');

update clubs set
  gemeente = 'Letterhoutem',
  provincie = 'oost-vlaanderen',
  adres = 'Klein Zottegem 42, 9520 Letterhoutem',
  contact_email = 'jeanmarie1961@live.be'
where lower(naam) = lower('PC Chapoo');
