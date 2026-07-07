-- PetanQ - Officiële FBFP-kalender zomer 2026 (nationale kampioenschappen).
-- Enkel de evenementen die nog niet voorbij zijn t.o.v. begin juli 2026 zijn
-- toegevoegd; alles van april t.e.m. eind juni uit de officiële kalender was
-- al voorbij en is bewust weggelaten.
-- Uur, speelvorm (ronden of poules), aantal en contact e-mail staan niet in
-- de officiële kalender: aantal_ronden/aantal_poules blijven daarom bewust
-- leeg (onbekend) in plaats van een gok te presenteren als feit.

insert into toernooien
  (datum, uur, clubnaam, naam_nl, naam_fr, gemeente, provincie, categorie, formule, speelvorm, aantal_ronden, contact_email, opmerking, status)
values
  ('2026-08-22', '09:00', 'T.P.C. Vezon', 'Nationaal van Tournai', 'National de Tournai', 'Tournai', 'henegouwen', 'kampioenschap', 'doublette', 'rondes', null, 'info@fbfp.be', 'Officieel FBFP-evenement (21-23 augustus). Exact uur, formule en speelvorm (ronden/poules) niet vermeld in de officiële kalender — bevestig via fbfp.be.', 'goedgekeurd'),
  ('2026-09-06', '09:00', 'P.C. Tertre Espérance', 'Federaal Kampioenschap Individueel', 'Championnat Fédéral Individuel', 'Tertre (Saint-Ghislain)', 'henegouwen', 'kampioenschap', 'tete-a-tete', 'rondes', null, 'info@fbfp.be', 'Officieel FBFP-evenement. Exact uur en speelvorm (ronden/poules) niet vermeld in de officiële kalender — bevestig via fbfp.be.', 'goedgekeurd'),
  ('2026-09-12', '09:00', 'Les Boutons d''Or', 'Nationaal Triplet Mix', 'National Triplettes Mixtes', 'Flémalle', 'luik', 'kampioenschap', 'triplette', 'rondes', null, 'info@fbfp.be', 'Officieel FBFP-evenement. Exact uur en speelvorm (ronden/poules) niet vermeld in de officiële kalender — bevestig via fbfp.be.', 'goedgekeurd'),
  ('2026-09-20', '09:00', 'PC Reynaert', 'Belgisch Kampioenschap Individueel', 'Championnat Belge Individuel', 'Lokeren', 'oost-vlaanderen', 'kampioenschap', 'tete-a-tete', 'rondes', null, 'info@fbfp.be', 'Officieel FBFP-evenement. Exact uur en speelvorm (ronden/poules) niet vermeld in de officiële kalender — bevestig via fbfp.be.', 'goedgekeurd');
