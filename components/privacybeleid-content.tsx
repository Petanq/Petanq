"use client";

import { useTranslation } from "@/lib/language-context";

const inhoud = {
  nl: {
    titel: "Privacybeleid",
    bijgewerkt: "Laatst bijgewerkt: 8 juli 2026",
    secties: [
      {
        kop: "1. Wie is verantwoordelijk voor je gegevens?",
        alineas: [
          "Petanque13 is een vrijwilligersinitiatief dat een centrale toernooikalender voor petanque in België aanbiedt. Voor vragen over dit privacybeleid of je persoonsgegevens kan je terecht op info@petanque13.be.",
        ],
      },
      {
        kop: "2. Welke gegevens verzamelen we?",
        alineas: [
          "We verzamelen enkel de gegevens die je zelf actief invult via onze formulieren:",
        ],
        lijst: [
          "Toernooi aanmelden: contact e-mailadres, clubnaam en de gegevens van het toernooi (naam, datum, locatie, opmerkingen, eventueel een affiche-afbeelding).",
          "Club voorstellen of beheren: naam van de club, adres, website en contact e-mailadres, eventueel een foto van de club.",
          "Nieuwsbrief: e-mailadres, gekozen provincie en taal.",
          "Moderator/beheerder-account: naam en e-mailadres (aangemaakt door een beheerder, niet via een openbaar formulier).",
        ],
      },
      {
        kop: "3. Waarom verwerken we deze gegevens?",
        alineas: [
          "We gebruiken je gegevens uitsluitend om: je toernooi- of clubvoorstel te controleren en te publiceren, contact met je op te nemen bij vragen over je aanmelding, je de nieuwsbrief te sturen als je je daarvoor hebt ingeschreven, en om het beheerpaneel te beveiligen.",
          "We verkopen je gegevens nooit door aan derden en gebruiken ze niet voor advertenties.",
        ],
      },
      {
        kop: "4. Rechtsgrond",
        alineas: [
          "Voor de nieuwsbrief vragen we je uitdrukkelijke toestemming, die je op elk moment kan intrekken via de afmeldlink in elke e-mail. Voor toernooi- en clubaanmeldingen verwerken we je e-mailadres op basis van ons gerechtvaardigd belang om aanmeldingen te kunnen controleren en beantwoorden.",
        ],
      },
      {
        kop: "5. Met wie delen we je gegevens?",
        alineas: [
          "We werken met een beperkt aantal dienstverleners die als verwerker optreden en enkel toegang hebben tot wat nodig is om hun dienst te leveren:",
        ],
        lijst: [
          "Supabase — hosting van de database, opslag van foto's/affiches en het inlogsysteem voor beheerders (servers in de EU).",
          "Resend — verzending van e-mails (bevestigingen, meldingen, nieuwsbrief).",
          "Vercel — hosting van de website zelf.",
        ],
      },
      {
        kop: "6. Hoe lang bewaren we je gegevens?",
        alineas: [
          "Toernooi- en clubgegevens bewaren we zolang ze relevant zijn voor de kalender, of tot je vraagt om ze te verwijderen. Nieuwsbriefgegevens bewaren we tot je je uitschrijft. Je kan altijd vragen om je gegevens te laten verwijderen via info@petanque13.be.",
        ],
      },
      {
        kop: "7. Cookies en lokale opslag",
        alineas: [
          "Petanque13 gebruikt geen advertentie- of trackingcookies. Je taalvoorkeur (NL/FR) wordt lokaal in je browser opgeslagen (localStorage) en nooit naar onze servers verzonden. Als je inlogt als moderator, gebruikt Supabase een noodzakelijk inlogcookie om je sessie te onthouden.",
        ],
      },
      {
        kop: "8. Jouw rechten",
        alineas: [
          "Je hebt steeds het recht om je gegevens in te kijken, te laten verbeteren of verwijderen, de verwerking ervan te beperken, je gegevens over te laten dragen, of je toestemming (bv. voor de nieuwsbrief) in te trekken. Neem hiervoor contact op via info@petanque13.be. Je kan ook een klacht indienen bij de Belgische Gegevensbeschermingsautoriteit (www.gegevensbeschermingsautoriteit.be).",
        ],
      },
    ],
    disclaimer:
      "Dit is een algemeen privacybeleid opgesteld voor een vrijwilligersproject. Het vervangt geen juridisch advies.",
  },
  fr: {
    titel: "Politique de confidentialité",
    bijgewerkt: "Dernière mise à jour : 8 juillet 2026",
    secties: [
      {
        kop: "1. Qui est responsable de vos données ?",
        alineas: [
          "Petanque13 est une initiative bénévole qui propose un calendrier central des tournois de pétanque en Belgique. Pour toute question concernant cette politique de confidentialité ou vos données personnelles, contactez info@petanque13.be.",
        ],
      },
      {
        kop: "2. Quelles données collectons-nous ?",
        alineas: [
          "Nous ne collectons que les données que vous saisissez vous-même via nos formulaires :",
        ],
        lijst: [
          "Inscription d'un tournoi : adresse e-mail de contact, nom du club et les détails du tournoi (nom, date, lieu, remarques, éventuellement une affiche).",
          "Proposition ou gestion d'un club : nom du club, adresse, site web et e-mail de contact, éventuellement une photo du club.",
          "Newsletter : adresse e-mail, province choisie et langue.",
          "Compte modérateur/administrateur : nom et e-mail (créé par un administrateur, pas via un formulaire public).",
        ],
      },
      {
        kop: "3. Pourquoi traitons-nous ces données ?",
        alineas: [
          "Nous utilisons vos données uniquement pour : vérifier et publier votre proposition de tournoi ou de club, vous contacter en cas de question, vous envoyer la newsletter si vous y êtes inscrit, et sécuriser le panneau d'administration.",
          "Nous ne revendons jamais vos données à des tiers et ne les utilisons pas à des fins publicitaires.",
        ],
      },
      {
        kop: "4. Base légale",
        alineas: [
          "Pour la newsletter, nous demandons votre consentement explicite, que vous pouvez retirer à tout moment via le lien de désinscription dans chaque e-mail. Pour les inscriptions de tournois et de clubs, nous traitons votre e-mail sur la base de notre intérêt légitime à pouvoir vérifier et répondre aux inscriptions.",
        ],
      },
      {
        kop: "5. Avec qui partageons-nous vos données ?",
        alineas: [
          "Nous travaillons avec un nombre limité de prestataires agissant comme sous-traitants, qui n'ont accès qu'à ce qui est nécessaire pour fournir leur service :",
        ],
        lijst: [
          "Supabase — hébergement de la base de données, stockage des photos/affiches et système de connexion des administrateurs (serveurs dans l'UE).",
          "Resend — envoi des e-mails (confirmations, notifications, newsletter).",
          "Vercel — hébergement du site web lui-même.",
        ],
      },
      {
        kop: "6. Combien de temps conservons-nous vos données ?",
        alineas: [
          "Les données de tournois et de clubs sont conservées tant qu'elles sont pertinentes pour le calendrier, ou jusqu'à ce que vous demandiez leur suppression. Les données de la newsletter sont conservées jusqu'à votre désinscription. Vous pouvez toujours demander la suppression de vos données via info@petanque13.be.",
        ],
      },
      {
        kop: "7. Cookies et stockage local",
        alineas: [
          "Petanque13 n'utilise aucun cookie publicitaire ou de suivi. Votre préférence linguistique (NL/FR) est enregistrée localement dans votre navigateur (localStorage) et n'est jamais envoyée à nos serveurs. Si vous vous connectez en tant que modérateur, Supabase utilise un cookie de connexion nécessaire pour mémoriser votre session.",
        ],
      },
      {
        kop: "8. Vos droits",
        alineas: [
          "Vous avez le droit de consulter, corriger ou supprimer vos données, d'en limiter le traitement, de demander leur portabilité, ou de retirer votre consentement (par ex. pour la newsletter). Contactez-nous via info@petanque13.be. Vous pouvez également déposer une plainte auprès de l'Autorité belge de protection des données (www.autoriteprotectiondonnees.be).",
        ],
      },
    ],
    disclaimer:
      "Ceci est une politique de confidentialité générale rédigée pour un projet bénévole. Elle ne remplace pas un avis juridique.",
  },
};

export function PrivacybeleidContent() {
  const { taal } = useTranslation();
  const c = inhoud[taal];

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 lg:px-10">
      <h1 className="mb-2 font-titel text-4xl tracking-wide text-blauw">{c.titel}</h1>
      <p className="mb-8 text-xs text-grijs">{c.bijgewerkt}</p>

      {c.secties.map((sectie) => (
        <div key={sectie.kop} className="mb-6">
          <h2 className="mb-2 text-base font-bold text-donker">{sectie.kop}</h2>
          {sectie.alineas.map((p) => (
            <p key={p} className="mb-2 text-sm leading-relaxed text-donker">
              {p}
            </p>
          ))}
          {sectie.lijst && (
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-donker">
              {sectie.lijst.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      ))}

      <p className="mt-8 border-t border-rand pt-4 text-xs text-grijs">{c.disclaimer}</p>
    </div>
  );
}
