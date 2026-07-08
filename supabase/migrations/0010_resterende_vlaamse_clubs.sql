-- PetanQ - Resterende Vlaamse clubs bijwerken met officieel adres/e-mail/
-- website. Bronnen: pfvlimburg.be/clubs.php, pfv-wvl.be/index.php/clubs/,
-- pfv-vbbh.be (Aangesloten-clubs-en-bestuur.pdf) — allen geraadpleegd op
-- 2026-07-08. Enkele clubs bleken met een foute gemeente/provincie in de
-- database te staan (waarschijnlijk verward met een naburige grote stad in
-- de oorspronkelijke data) — dat is hierbij meteen gecorrigeerd.

-- Limburg
update clubs set
  adres = 'Eikenlaan z/n, 3950 Bocholt',
  contact_email = 'riksevens72@gmail.com',
  website = 'http://www.bocholterpetanque.be'
where lower(naam) = lower('Bocholter Petanque');

update clubs set
  adres = 'Vreyshorring 143, 3920 Lommel',
  contact_email = 'verboven-serroeyen@hotmail.com',
  website = 'http://www.inter-lommel-petanque.jouwweb.nl/'
where lower(naam) = lower('Interlommel Petanque');

update clubs set
  gemeente = 'Lummen',
  adres = 'Boskesstraat 1, 3560 Lummen',
  contact_email = 'bennyclaespcgenenbos@hotmail.com'
where lower(naam) = lower('PC Genenbos');

update clubs set
  adres = 'Oudstrijderslaan 44c, 3530 Houthalen-Helchteren',
  contact_email = 'Christian.billen@hotmail.com'
where lower(naam) = lower('PC Kelchteren');

update clubs set
  adres = 'Koningin Astridlaan 91, 3680 Maaseik',
  contact_email = 'aertsanjes@skynet.be',
  website = 'http://www.petanqueclubmaaseik.be'
where lower(naam) = lower('PC Maaseik');

update clubs set
  adres = 'Sportpark 4, 3910 Pelt',
  contact_email = 'charelantonissen@telenet.be',
  website = 'http://www.pelterpc.be/pelter-pc/'
where lower(naam) = lower('Pelter PC');

update clubs set
  gemeente = 'Ham',
  provincie = 'limburg',
  adres = 'Oude baan z/n, 3945 Ham',
  contact_email = 'reynders.andre@hotmail.com',
  website = 'http://www.pczigzag.be'
where lower(naam) = lower('PC Zig Zag');

update clubs set
  gemeente = 'Sint-Truiden',
  provincie = 'limburg',
  adres = 'Hasseltsesteenweg 103, 3800 Sint-Truiden',
  contact_email = 'wilfried-geraerts@hotmail.com'
where lower(naam) = lower('PC Terbiest');

-- West-Vlaanderen
update clubs set
  adres = 'Steensedijk 2, 8400 Oostende',
  contact_email = 'oostendsepc@skynet.be',
  website = 'http://www.oostendsepetanqueclub.be'
where lower(naam) = lower('Oostendse PC');

update clubs set
  gemeente = 'Knokke-Heist',
  adres = 'Heistlaan 124, 8301 Knokke-Heist',
  contact_email = 'secretariaat.pcdevuurtoren@gmail.com',
  website = 'https://www.pc-de-vuurtoren-vzw-be.eu'
where lower(naam) = lower('PC De Vuurtoren');

update clubs set
  gemeente = 'Middelkerke',
  adres = 'Duinenweg 427, 8430 Middelkerke',
  contact_email = 'zmm@skynet.be'
where lower(naam) = lower('PC De Zeemeermin');

update clubs set
  gemeente = 'Gullegem',
  adres = 'Kwadries 78, 8560 Gullegem',
  contact_email = 'andre.baelen@hotmail.be'
where lower(naam) = lower('PC Gullegem');

update clubs set
  gemeente = 'Zwevegem',
  provincie = 'west-vlaanderen',
  adres = 'Otegemsestraat 238, 8550 Zwevegem',
  contact_email = 'els.tanghe@outlook.com'
where lower(naam) = lower('PC Okapi');

update clubs set
  gemeente = 'Oedelem',
  provincie = 'west-vlaanderen',
  adres = 'Sportstraat 1, 8730 Oedelem',
  contact_email = 'Secretariaat@pcdenakker.be'
where lower(naam) = lower('PC Den Akker');

update clubs set
  gemeente = 'Sint-Kruis',
  provincie = 'west-vlaanderen',
  adres = 'Blauwkasteelweg 28A, 8310 Sint-Kruis Brugge',
  contact_email = 'guldenkamer@hotmail.com'
where lower(naam) = lower('PC De Gulden Kamer');

-- Vlaams-Brabant / Brussel
update clubs set
  adres = 'Steenweg op Brussel 113, 1780 Wemmel',
  contact_email = 'anitavanhove22@gmail.com',
  website = 'http://www.petanque-wemmel.be'
where lower(naam) = lower('PC Wemmel');

update clubs set
  gemeente = 'Lot',
  adres = 'Goutstouwersstraat 59, 1651 Lot',
  contact_email = 'andy.pasteleurs@gmail.com',
  website = 'http://www.petanquebeersel.be'
where lower(naam) = lower('PC Beersel');

update clubs set
  adres = 'Broekeweg z/n, 1730 Asse',
  contact_email = 'marcel.vermeeren2@telenet.be'
where lower(naam) = lower('PC Hap Asse');

update clubs set
  adres = 'Kwadeplasstraat 31, 1640 Sint-Genesius-Rode',
  contact_email = 'weze1@hotmail.com'
where lower(naam) = lower('PC Rode');

update clubs set
  adres = '''d Arconatistraat 3, 1700 Dilbeek',
  contact_email = 'info@pcdilbeek.be',
  website = 'http://www.pcdilbeek.com'
where lower(naam) = lower('PC Dilbeek');

update clubs set
  gemeente = 'Oetingen',
  adres = 'Kloosterstraat 20A, 1775 Oetingen',
  contact_email = 'contact@petanqueoetingen.be',
  website = 'http://www.petanqueoetingen.be'
where lower(naam) = lower('VBBH - Gooik');
