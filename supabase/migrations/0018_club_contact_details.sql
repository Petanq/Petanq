-- Qpetanque - telefoonnummers, openingsuren en (waar gevonden) correcte
-- contactgegevens voor clubs in Waals-Brabant, Brussel, Namen, Luxemburg,
-- Henegouwen en de resterende Antwerpse clubs. Onderzocht via FBFP-clubpagina's
-- (voorzitter/secretaris/penningmeester-contact), clubwebsites, Facebook en
-- gemeentelijke verenigingsdatabanken, 2026-07.
--
-- Belangrijk: voor Waalse clubs was het bestaande contact_email vaak enkel de
-- interne FBFP-federatiecode (bv. h01@fbfp.be) — geen werkend adres. Waar een
-- echt e-mailadres van een bestuurslid gevonden is, wordt dat hier ingevuld.
-- Dit zijn persoonlijke adressen (voorzitter/secretaris), geen vast
-- clubsecretariaat — kan wijzigen bij bestuurswissel.
--
-- Clubs waarvoor niets betrouwbaars gevonden werd, zijn hier bewust weggelaten
-- (geen giswerk) — zie het overzicht dat Frederic apart heeft gekregen voor de
-- volledige lijst met "niet gevonden"-items en te verifiëren twijfelgevallen.

-- ===================== Waals-Brabant =====================

update clubs set
  telefoon = '0479/82.93.31',
  contact_email = 'joueur-petanque@hotmail.com'
where lower(naam) = lower('Petanque Club Genval');

update clubs set
  telefoon = '010/22.87.44',
  contact_email = 'claude.flemal@gmail.com',
  website = 'https://www.facebook.com/groups/petanquewavrienne/',
  openingsuren = 'Donderdag: mêlée vanaf 13u30. Zon- en feestdagen: doubletten vanaf 13u30.'
where lower(naam) = lower('La Wavrienne');

update clubs set
  telefoon = '0494/92.69.88',
  contact_email = 'cire.demets@hotmail.com',
  website = 'https://la-petanque-jauchoise.clubeo.com/'
where lower(naam) = lower('La Petanque Jauchoise');

update clubs set
  telefoon = '0494/21.28.16',
  contact_email = 'marcnickell@hotmail.com'
where lower(naam) = lower('Royal Blanc Ry Ottignies');

update clubs set
  telefoon = '0498/21.14.43',
  contact_email = 'sabinemarchal813@gmail.com',
  website = 'https://rpc-nivelloise.clubeo.com/',
  openingsuren = 'Open woensdag tot zondag, wisselende uren per dag.'
where lower(naam) = lower('Royal Petanque Club Nivelloise');

update clubs set
  telefoon = '0477/49.95.86',
  contact_email = 'kiki.tubizien@gmail.com',
  website = 'https://kiki-tubize.clubeo.com/',
  openingsuren = 'Dinsdag 14u00-17u30 (vrij toegankelijk), 17u30-21u00 (training). Woensdag 14u30-19u00 (veteranen). Vrijdag 20u00-02u00 (senioren). Zondag 14u00-19u00 (doublettentornooi, open voor iedereen).'
where lower(naam) = lower('Kiki Tubizien');

update clubs set
  telefoon = '0475/25.48.85',
  contact_email = 'guywillocq@skynet.be',
  openingsuren = 'Dinsdag 19u30-24u00 (mêlée, open voor iedereen). Vrijdag 13u30-19u00 (enkel april-september).'
where lower(naam) = lower('As Beauchamp');

update clubs set
  telefoon = '0496/97.52.73',
  contact_email = 'petanqueclublahulpe@hotmail.com',
  website = 'http://www.petanqueclublahulpe.com/'
where lower(naam) = lower('Royal Petanque Club La Hulpe');

update clubs set
  telefoon = '0477/34.10.09',
  contact_email = 'alainlosfeld2016@gmail.com',
  website = 'https://www.pcleparadis.be/'
where lower(naam) = lower('Royal PC Paradis');

update clubs set
  telefoon = '0472/69.86.32',
  contact_email = 'fc376445@skynet.be'
where lower(naam) = lower('PC Caramboul');

update clubs set
  telefoon = '0476/66.09.22',
  contact_email = 'guyrousseaux@hotmail.com',
  openingsuren = 'Open elke zaterdag of zondag vanaf 13u00.'
where lower(naam) = lower('ASBL Petanque Club De Genappe');

update clubs set
  contact_email = 'info@petanque-limaloise.be',
  website = 'https://www.petanque-limaloise.be/',
  openingsuren = 'Winter (1 okt-31 mrt): 6 overdekte, verwarmde terreinen. Zomer (1 apr-30 sep): 23 buitenterreinen. Zondag 14u00 (algemene bijeenkomst), maandag vanaf 13u30 (leden), dinsdag vanaf 13u30 (Enéo 50+), woensdag 14u30 en vrijdag 20u00 (kampioenschap).'
where lower(naam) = lower('Royal Cp Limaloise');

update clubs set
  telefoon = '02/354.34.58',
  contact_email = 'secretariat@pachy-petanque-waterloo.be',
  website = 'http://www.pachy-petanque-waterloo.be/',
  openingsuren = 'Maandag, woensdag, donderdag, zaterdag 13u30-20u00. Vrijdag 19u00-01u00. Winterkampioenschap 1 okt-31 mrt.'
where lower(naam) = lower('Pachy PC');

-- ===================== Brussel =====================

update clubs set
  telefoon = '+32 2 520 34 02',
  contact_email = 'eric.vandewiele@gmail.com',
  openingsuren = 'Maandag-vrijdag 10u-20u, zaterdag 9u-18u (bron: online bedrijvengids, niet rechtstreeks door de club bevestigd).'
where lower(naam) = lower('Royal Petanque Uccle Centre');

update clubs set
  telefoon = '+32 2 515 69 21',
  contact_email = 'newixelles@gmail.com',
  website = 'http://newixelles.e-monsite.com'
where lower(naam) = lower('New Ixelles');

update clubs set
  telefoon = '+32 2 726 17 48',
  contact_email = 'moustydeco@gmail.com'
where lower(naam) = lower('Forever Saint Josse');

update clubs set
  telefoon = '0486/51.65.81',
  contact_email = 'marieclaire.gast@gmail.com',
  openingsuren = 'Maandag, dinsdag en vrijdag 13u30-18u30.'
where lower(naam) = lower('Royal PC Floreal');

update clubs set
  telefoon = '0471/67.63.71',
  contact_email = 'amicale.anderlechtoise@hotmail.com'
where lower(naam) = lower('Amicale Anderlechtoise P.c.');

update clubs set
  telefoon = '+32 2 662 14 09',
  contact_email = 'info@petanque-pasa.be',
  website = 'http://www.petanque-pasa.be'
where lower(naam) = lower('Pétanque Auderghem Sainte Anne (p.a.s.a.)');

update clubs set
  telefoon = '02/376 63 12'
where lower(naam) = lower('Royale P.u.s.');

update clubs set
  telefoon = '+32 470 64 44 33',
  contact_email = 'guyhuvenne@gmail.com',
  openingsuren = 'Zomer: ma-wo en za 13u30-19u00 (mêlée), do-vr 13u30-18u30 (training), di en zo gesloten. Winter: ma 13u30-19u30, di en zo 13u00-19u30, wo en vr 13u00-19u30, do gesloten.'
where lower(naam) = lower('Royal Petanque Club Le Frankveld ASBL');

update clubs set
  telefoon = '02/514.13.50',
  contact_email = 'francois.dubuisson@ulb.be'
where lower(naam) = lower('PC Le Domaine');

update clubs set
  telefoon = '02/771.99.71',
  contact_email = 'ceutem70@gmail.com',
  website = 'https://www.facebook.com/RPCJB/',
  openingsuren = 'Maandag gesloten. Di-do en za-zo 11u-22u. Vrijdag 11u-01u.'
where lower(naam) = lower('Royal PC Joli-Bois');

update clubs set
  telefoon = '+32 2 538 02 98',
  contact_email = 'carine.potelle@gmail.com'
where lower(naam) = lower('PC Le Silence');

update clubs set
  telefoon = '02/469.11.50',
  contact_email = 'pderivieren@gmail.com',
  website = 'https://www.derivieren.be/index.php?page=petanque'
where lower(naam) = lower('Royal Petanque Club De Rivieren');

update clubs set
  telefoon = '+32 2 771 97 93',
  contact_email = 'albert.labye@skynet.be'
where lower(naam) = lower('Royal PC Elite');

update clubs set
  telefoon = '0492/31.30.92',
  contact_email = 'pcetterbeek@gmail.com',
  website = 'http://www.petanqueclubetterbeekois.be/'
where lower(naam) = lower('PC Etterbeekois');

update clubs set
  telefoon = '+32 2 479 31 22',
  contact_email = 'rpccmodele@gmail.com'
where lower(naam) = lower('Royal PC Cite Modele');

update clubs set
  telefoon = '02/538.02.98'
where lower(naam) = lower('Petanque Club Saint-Gillois');

update clubs set
  telefoon = '+32 495 284 675',
  contact_email = 'martine.dl@hotmail.be'
where lower(naam) = lower('PC New F.e.s.');

-- ===================== Namen =====================

update clubs set
  telefoon = '+32 81 74 06 37'
where lower(naam) = lower('La Petanque Belgradoise');

update clubs set
  telefoon = '+32 81 73 36 25',
  contact_email = 'christiane.nameche@gmail.com',
  openingsuren = 'Maandag 17u-21u. Vrijdag/zaterdag/zondag volgens kalender. Dinsdag t/m donderdag gesloten.'
where lower(naam) = lower('Royal Petanque Club Saint-Servais');

update clubs set
  telefoon = '+32 476 58 11 77',
  contact_email = 'isabellepilois@gmail.com',
  openingsuren = 'Vrijdag 18u45-24u00 (1 sept-30 jun). Zaterdag/zondag enkel bij tornooien.'
where lower(naam) = lower('Royal Pitchoun Petanque Club ASBL');

update clubs set
  telefoon = '+32 471 18 14 67',
  contact_email = 'laboule.velainoise@hotmail.com',
  openingsuren = 'Vrijdag 19u30-23u30 (1 apr-18 sept). Zaterdag/zondag volgens kalender.'
where lower(naam) = lower('New PC Velainois');

update clubs set
  telefoon = '+32 485 00 85 59',
  contact_email = 'homblette.sebastien@hotmail.be',
  openingsuren = 'Dinsdag 18u30-23u30. Woensdag 13u30-19u00 (half april-half september).'
where lower(naam) = lower('Petanque Club Tamines Sambre');

update clubs set
  telefoon = '0476/64.96.39',
  contact_email = 'agal.macors@gmail.com',
  website = 'https://lecochonnetmosan.blogspot.com/',
  openingsuren = 'Dinsdag en zaterdag vanaf 14u00, het hele jaar door.'
where lower(naam) = lower('Le Cochonnet Mosan');

update clubs set
  telefoon = '+32 479 07 46 73',
  contact_email = 'pclescrayas@hotmail.com',
  openingsuren = 'Tweewekelijks op vrijdag vanaf 19u30, vanaf april (zomerseizoen).'
where lower(naam) = lower('PC Les Crayas');

update clubs set
  openingsuren = 'Maandag en vrijdag 14u00-19u00 (training).'
where lower(naam) = lower('ASBL Petanque Beauraing');

-- ===================== Luxemburg =====================

update clubs set
  telefoon = '+32 63 57 62 25',
  contact_email = 'marieanne.adam@hotmail.com',
  website = 'https://www.facebook.com/pc.lamechoise/'
where lower(naam) = lower('La Mechoise');

update clubs set
  telefoon = '0493/48.11.79',
  contact_email = 'marty.noah@outlook.com',
  website = 'https://petanque-de-gouvy.clubeo.com/',
  openingsuren = 'Maandag 19u-21u30. Woensdag 14u-18u. Zaterdag 14u-18u. Zondag 9u30-12u30.'
where lower(naam) = lower('PC Gouvy');

update clubs set
  telefoon = '+32 474 51 39 37'
where lower(naam) = lower('La Boule Bastognarde');

update clubs set
  telefoon = '+32 472 24 08 26',
  openingsuren = 'Vrijdag 17u-21u. Zondag 10u-19u.'
where lower(naam) = lower('PC Saint-Hubert');

update clubs set
  telefoon = '0496/98.75.36',
  contact_email = 'petanque3@gmail.com',
  website = 'http://www.petanque3f.sitew.be/'
where lower(naam) = lower('Les 3 Frontieres Longeau');

update clubs set
  telefoon = '+32 498 32 11 38',
  contact_email = 'p.kintziger@gmail.com',
  openingsuren = 'Dinsdag 14u30-18u30 (heel jaar). Zaterdag 14u-22u (okt-mrt). Zondag 14u-20u (tornooien).'
where lower(naam) = lower('Royal PC Aubange');

update clubs set
  telefoon = '+32 491 50 61 71',
  openingsuren = 'Woensdag 14u-19u. Zaterdag 10u-19u (zomerseizoen).'
where lower(naam) = lower('Arel Boules Club');

update clubs set
  telefoon = '0468/36.66.53',
  contact_email = 'sylviane.petanque27@gmail.com',
  openingsuren = 'Woensdag en vrijdag vanaf 20u00.'
where lower(naam) = lower('PC Val D''Attert');

update clubs set
  telefoon = '+32 497 44 11 02',
  contact_email = 'gregbonma@gmail.com',
  openingsuren = 'Vrijdag 19u-22u.'
where lower(naam) = lower('Abc Durbuy PC');

update clubs set
  telefoon = '0495/69.44.88',
  contact_email = 'pcrochefortois@gmail.com',
  website = 'https://rochefortois.clubeo.com/'
where lower(naam) = lower('PC Rochefortois');

update clubs set
  telefoon = '0478/81.79.07',
  contact_email = 'cylaca@hotmail.com',
  openingsuren = 'Woensdag 18u30-22u30 (1 jun-30 sept). Zondag 13u30-21u00 (1 nov-15 mrt).'
where lower(naam) = lower('La Boule Feodale Latour');

-- ===================== Henegouwen =====================

update clubs set
  telefoon = '+32 497 62 10 67'
where lower(naam) = lower('Royal PC Les Carolos');

update clubs set
  telefoon = '071 59 39 72',
  contact_email = 'christineplateau@gmail.com',
  openingsuren = 'Maandag-vrijdag 10u-20u, zaterdag 9u-18u (bron: online bedrijvengids, niet rechtstreeks door de club bevestigd).'
where lower(naam) = lower('Royal Petanque Club  Marcinelle');

update clubs set
  telefoon = '+32 71 34 42 34'
where lower(naam) = lower('Climbia''S La Ruche');

update clubs set
  telefoon = '071/52.72.68',
  website = 'https://fannybivort.wixsite.com/fannybivort'
where lower(naam) = lower('La Fanny Bivort');

update clubs set
  telefoon = '0474/86.24.70',
  contact_email = 'geoffrey.legros.sautin@gmail.com',
  openingsuren = 'Woensdag 13u-21u. Zaterdag 13u-20u.'
where lower(naam) = lower('Petanque Club Les Marsupilamis');

update clubs set
  telefoon = '+32 491 74 62 83'
where lower(naam) = lower('Ernelle Monceau');

update clubs set
  telefoon = '+32 494 32 32 27',
  openingsuren = 'Woensdag 18u-21u. Buitenseizoen april-eind september: open competities za/zo.'
where lower(naam) = lower('PC La Botte');

update clubs set
  telefoon = '+32 65 31 38 42',
  website = 'https://pmons.clubeo.com/'
where lower(naam) = lower('La Petanque Montoise');

update clubs set
  telefoon = '0497/29.89.58',
  openingsuren = 'Dinsdag, donderdag, zaterdag 13u30-17u00.'
where lower(naam) = lower('Petanque Frasnoise');

update clubs set
  telefoon = '0499/84.01.44',
  openingsuren = 'Vrijdag 18u-24u. Zaterdag en zondag 13u-21u.'
where lower(naam) = lower('PC Le Pays Noir Farciennes');

update clubs set
  telefoon = '+32 495 66 71 21',
  contact_email = 'carole.schamp@hotmail.fr'
where lower(naam) = lower('PC Lutosa');

update clubs set
  telefoon = '+32 479 08 15 24',
  contact_email = 'amicalepetanqueleroux@gmail.com',
  openingsuren = 'Dinsdag 17u-22u. Vrijdag 18u-24u.'
where lower(naam) = lower('Petanque Club Le Roux');

update clubs set
  telefoon = '+32 71 59 37 04',
  openingsuren = 'Woensdag 13u-20u. Vrijdag 19u-24u. Zaterdag 13u-20u.'
where lower(naam) = lower('PC Thulisien');

update clubs set
  contact_email = 'pcboussu@proximus.be',
  telefoon = '0495/80.99.29',
  website = 'https://www.facebook.com/pcs.boussu.hornu/'
where lower(naam) = lower('PC Boussu');

update clubs set
  telefoon = '+32 71 33 06 68'
where lower(naam) = lower('PC A.s. Jumet');

update clubs set
  telefoon = '+32 65 52 02 99',
  contact_email = 'moinsmarc@gmail.com',
  website = 'http://pctertre-esperance.e-monsite.com'
where lower(naam) = lower('PC Tertre Esperance');

update clubs set
  telefoon = '+32 478 92 39 88',
  openingsuren = 'Woensdag 13u-19u. Donderdag 13u-20u. Zaterdag en zondag 12u-20u.'
where lower(naam) = lower('PC Lessines');

update clubs set
  telefoon = '0493/73.50.20',
  contact_email = 'pcch27@gmail.com',
  openingsuren = 'Vrijdag vanaf 19u. Zaterdag/zondag na tornooien.'
where lower(naam) = lower('PC Chatelet');

update clubs set
  telefoon = '+32 69 44 26 20'
where lower(naam) = lower('Tournai Petanque Club (tpc)');

update clubs set
  telefoon = '+32 69 44 26 20',
  contact_email = 'masicepetanque@gmail.com',
  openingsuren = 'Maandag, woensdag, donderdag, vrijdag vanaf 19u.'
where lower(naam) = lower('Masice Ravel Petanque');

update clubs set
  telefoon = '0495/27.67.46',
  website = 'https://petanque-elougoise.clubeo.com/'
where lower(naam) = lower('Les Six Boulettes Elouges');

-- ===================== Antwerpen (resterende clubs) =====================

update clubs set
  telefoon = '03/238.05.50',
  contact_email = 'pchorizon@skynet.be',
  website = 'www.pchorizon.be',
  openingsuren = 'Ma 13u-19u, wo 13u-19u, do 19u-00u30, za 13u-19u (enkel tijdens PFV-competitieseizoen okt-mrt), zo 13u-20u. Di en vr gesloten.'
where lower(naam) = lower('PC Bernardus');

update clubs set
  telefoon = '03 321 06 64'
where lower(naam) = lower('PC De Evers');

update clubs set
  telefoon = '+32 3 464 25 02',
  contact_email = 'delindepet@gmail.com',
  website = 'www.lindepet.be'
where lower(naam) = lower('PC De Lindepet');

update clubs set
  contact_email = 'p.c.hemelhof@skynet.be',
  website = 'https://www.pchemelhof.be/',
  openingsuren = 'Dinsdag en donderdag 12u30-18u00. Maandag en woensdag gesloten.'
where lower(naam) = lower('PC Hemelhof');

update clubs set
  telefoon = '+32478712720',
  contact_email = 'rudy.hennebert@gmail.com',
  website = 'https://www.pcherentals.be',
  openingsuren = 'Donderdag (heel jaar) vanaf 18u, training 18u30-22u30. Vrijdag (sept-mei) vanaf 19u30, training 20u-24u. Tijdens competitieseizoen (okt-apr) ook dinsdag en zaterdag vanaf 12u.'
where lower(naam) = lower('PC Herentals');

update clubs set
  contact_email = 'hvl@live.be',
  openingsuren = 'Dinsdag, donderdag, vrijdag 13u30-18u00. Dinsdag ook 19u-23u.'
where lower(naam) = lower('PC Kalmthout');

update clubs set
  telefoon = '0474 58 48 83',
  contact_email = 'pckontich@gmail.com',
  website = 'www.petanquekontichvzw.be'
where lower(naam) = lower('PC Kontich');

update clubs set
  telefoon = '0494 85 13 00',
  contact_email = 'voorzitter@pclier.be',
  website = 'www.pclier.be'
where lower(naam) = lower('PC Lier');

update clubs set
  telefoon = '0486 47 84 46',
  contact_email = 'modb@telenet.be'
where lower(naam) = lower('PC Lint');

update clubs set
  telefoon = '0487 22 43 33',
  contact_email = 'jeannuyts@telenet.be'
where lower(naam) = lower('PC Mol');

update clubs set
  telefoon = '03 888 09 70',
  contact_email = 'p.c.niel@telenet.be',
  website = 'pcniel.net',
  openingsuren = 'Woensdag 13u-18u, donderdag 13u-18u, vrijdag 19u-23u, zaterdag 13u-19u, zondag 13u-19u. Maandag en dinsdag gesloten.'
where lower(naam) = lower('PC Niel');

update clubs set
  telefoon = '03/321 06 64'
where lower(naam) = lower('PK De Evers');

-- PC Meerosa: seed-data vermeldde gemeente "Rijkevorsel", maar het werkelijke
-- adres is in Deurne (Antwerpen) — gemeente hierbij gecorrigeerd, net als bij
-- eerdere vergelijkbare correcties in migratie 0010.
update clubs set
  gemeente = 'Deurne',
  adres = 'Peter Benoitlaan 35, 2100 Deurne',
  telefoon = '03/321 63 77',
  contact_email = 'hallo@pcmeerosa.be',
  website = 'www.pcmeerosa.be',
  openingsuren = 'Maandag en vrijdag namiddag vanaf 13u30. Dinsdag avond vanaf 19u.'
where lower(naam) = lower('PC Meerosa');

-- ===================== West-Vlaanderen (aanvulling) =====================

update clubs set
  telefoon = '056/75 68 81',
  openingsuren = 'Dinsdag 14u-18u. Vrijdag 17u-22u.'
where lower(naam) = lower('PC Okapi');
