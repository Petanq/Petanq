# PetanQ — setup-instructies

## 1. Node.js installeren
Download en installeer Node.js LTS (20.x) via https://nodejs.org. Herstart daarna je terminal en controleer:

```
node -v
npm -v
```

## 2. Dependencies installeren
In de projectmap:

```
npm install
```

## 3. Supabase-project aanmaken
1. Ga naar https://supabase.com, maak een account/project aan (kies een regio dicht bij België, bv. Frankfurt).
2. Ga naar **Project Settings > API** en noteer:
   - `Project URL` → wordt `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → wordt `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (geheim!) → wordt `SUPABASE_SERVICE_ROLE_KEY`
3. Ga naar **SQL Editor > New query** en voer de bestanden in `supabase/migrations/` **in deze volgorde** uit:
   1. `0001_init.sql`
   2. `0002_rls.sql`
   3. `0003_trigger_regio.sql`
   4. `seed.sql` (optioneel, vult de kalender met voorbeeldtoernooien uit het prototype)

## 4. Eerste moderator/admin aanmaken
1. Ga naar **Authentication > Users > Add user** en maak een gebruiker aan (e-mail + wachtwoord) voor jezelf.
2. Kopieer de gegenereerde `User UID`.
3. Voer in de SQL Editor uit (vervang de waarden):

```sql
insert into moderatoren (user_id, naam, email, rol)
values ('<USER_UID>', 'Frederic', 'frederic@nitra.be', 'admin');
```

Je kan nu inloggen op `/beheer/login` met dat e-mailadres/wachtwoord.

## 5. Resend-account aanmaken
1. Ga naar https://resend.com en maak een account aan.
2. Ga naar **API Keys** en maak een key aan → wordt `RESEND_API_KEY`.
3. Voor productie: verifieer je eigen domein onder **Domains** (bv. `petanq.be`) en gebruik dan een afzender zoals `PetanQ <noreply@petanq.be>` als `RESEND_AFZENDER`.
   - Zonder geverifieerd domein kan je tijdens ontwikkeling testen met het Resend-sandboxadres `onboarding@resend.dev`, maar dan kunnen mails alleen naar je eigen geverifieerde Resend-account-e-mail verstuurd worden.

## 6. Omgevingsvariabelen instellen
Kopieer `.env.local.example` naar `.env.local` en vul alle waarden in:

```
cp .env.local.example .env.local
```

## 7. Lokaal draaien

```
npm run dev
```

Ga naar http://localhost:3000.

## 8. Deployen op Vercel
1. Maak een Git-repository (GitHub/GitLab) van dit project en push de code.
2. Ga naar https://vercel.com, importeer de repository.
3. Voeg dezelfde omgevingsvariabelen uit `.env.local` toe bij **Project Settings > Environment Variables** (met `NEXT_PUBLIC_SITE_URL` = je definitieve domein, bv. `https://www.petanq.be`).
4. Deploy. Koppel nadien je eigen domein onder **Project Settings > Domains**.
5. Werk `NEXT_PUBLIC_SITE_URL` bij zodra het domein actief is en herdeploy (nodig voor correcte sitemap/e-maillinks/OG-tags).
