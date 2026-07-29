-- De vorige login_aantal-teller telde amper iets: een ingelogde sessie blijft
-- lang actief, dus vrijwilligers moeten zelden opnieuw het loginformulier
-- invullen. Vervangt dit door een bezoek-teller die telt telkens iemand het
-- beheerpaneel echt bezoekt (1x per browsersessie), wat beter weergeeft wie
-- actief blijft komen kijken.
alter table moderatoren rename column login_aantal to bezoek_aantal;
alter table moderatoren rename column laatste_login to laatste_bezoek;
