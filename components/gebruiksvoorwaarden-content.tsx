"use client";

import { useTranslation } from "@/lib/language-context";

const inhoud = {
  nl: {
    titel: "Gebruiksvoorwaarden",
    bijgewerkt: "Laatst bijgewerkt: 11 november 2026",
    secties: [
      {
        kop: "1. Gratis en voor iedereen",
        alineas: [
          "Petanque13 is een vrijwilligersinitiatief en de kalender is gratis te raadplegen. Door de site te gebruiken, ga je akkoord met deze voorwaarden.",
        ],
      },
      {
        kop: "2. Auteursrecht en databank",
        alineas: [
          "De inhoud van Petanque13 is beschermd: de teksten, het ontwerp, het logo en de samengestelde databank met tornooien en clubs, die door vrijwilligers wordt verzameld, gecontroleerd en actueel gehouden. Daarvoor gelden het auteursrecht en het databankenrecht.",
          "Affiches, logo's en foto's van clubs en organisatoren blijven eigendom van hun maker of organisator.",
        ],
      },
      {
        kop: "3. Dit mag",
        lijst: [
          "De site gebruiken om tornooien en clubs te zoeken, voor persoonlijk gebruik of in je club.",
          "Een link naar Petanque13 of naar een tornooi delen, bijvoorbeeld via WhatsApp, Messenger of mail.",
          "Een tornooi toevoegen aan je eigen agenda.",
          "Een korte vermelding van één of enkele tornooien met een duidelijke bronvermelding (\"bron: Petanque13.be\") en een link naar de site.",
        ],
      },
      {
        kop: "4. Dit mag niet zonder onze schriftelijke toestemming",
        lijst: [
          "Gegevens automatisch en op grote schaal ophalen (scrapen, bots, scripts of andere geautomatiseerde middelen).",
          "De databank of een substantieel deel ervan kopiëren, opnieuw publiceren, verkopen of in een andere dienst, site of app gebruiken.",
          "De site, het ontwerp of het logo nabootsen op een manier die bezoekers kan doen denken dat het om Petanque13 gaat.",
          "De werking van de site hinderen of de beveiliging proberen te omzeilen.",
        ],
        alineas: [
          "Wil je gegevens van Petanque13 gebruiken, bijvoorbeeld voor een clubsite, een federatie of een app? Stuur ons een mail op info@petanque13.be. In veel gevallen kunnen we er samen iets voor regelen.",
        ],
      },
      {
        kop: "5. Maatregelen bij misbruik",
        alineas: [
          "Bij misbruik kunnen we de toegang blokkeren, de overname laten verwijderen bij de hostingpartij of de zoekmachines, en zo nodig juridische stappen ondernemen.",
        ],
      },
      {
        kop: "6. Geen garantie op de gegevens",
        alineas: [
          "We doen ons best om de kalender correct en actueel te houden, maar we kunnen niet garanderen dat alles klopt. Datum, uur, plaats en inschrijving kunnen wijzigen. Controleer belangrijke gegevens altijd bij de organisator. Petanque13 is niet aansprakelijk voor schade door onjuiste of verouderde gegevens.",
        ],
      },
      {
        kop: "7. Fout gevonden of iets dat van jou is?",
        alineas: [
          "Staat er iets verkeerd, of staat er een affiche, foto of tekst op de site die je liever niet hebt? Mail naar info@petanque13.be, dan passen we het aan of halen we het weg.",
        ],
      },
      {
        kop: "8. Toepasselijk recht",
        alineas: ["Op deze voorwaarden is het Belgische recht van toepassing."],
      },
    ],
    disclaimer:
      "Dit zijn algemene gebruiksvoorwaarden voor een vrijwilligersproject. Ze vervangen geen juridisch advies.",
  },
  fr: {
    titel: "Conditions d'utilisation",
    bijgewerkt: "Dernière mise à jour : 11 novembre 2026",
    secties: [
      {
        kop: "1. Gratuit et pour tous",
        alineas: [
          "Petanque13 est une initiative bénévole et le calendrier est consultable gratuitement. En utilisant le site, vous acceptez ces conditions.",
        ],
      },
      {
        kop: "2. Droit d'auteur et base de données",
        alineas: [
          "Le contenu de Petanque13 est protégé : les textes, le design, le logo et la base de données de tournois et de clubs, rassemblée, vérifiée et tenue à jour par des bénévoles. Le droit d'auteur et le droit des bases de données s'appliquent.",
          "Les affiches, logos et photos des clubs et des organisateurs restent la propriété de leur auteur ou organisateur.",
        ],
      },
      {
        kop: "3. Ce qui est permis",
        lijst: [
          "Utiliser le site pour chercher des tournois et des clubs, à titre personnel ou dans votre club.",
          "Partager un lien vers Petanque13 ou vers un tournoi, par exemple via WhatsApp, Messenger ou e-mail.",
          "Ajouter un tournoi à votre propre agenda.",
          "Mentionner brièvement un ou quelques tournois avec une source claire (« source : Petanque13.be ») et un lien vers le site.",
        ],
      },
      {
        kop: "4. Ce qui n'est pas permis sans notre accord écrit",
        lijst: [
          "Récupérer des données automatiquement et à grande échelle (scraping, bots, scripts ou autres moyens automatisés).",
          "Copier, republier, vendre la base de données ou une partie substantielle de celle-ci, ou l'utiliser dans un autre service, site ou application.",
          "Imiter le site, le design ou le logo de façon à faire croire aux visiteurs qu'il s'agit de Petanque13.",
          "Perturber le fonctionnement du site ou tenter de contourner sa sécurité.",
        ],
        alineas: [
          "Vous souhaitez utiliser des données de Petanque13, par exemple pour le site d'un club, une fédération ou une application ? Écrivez-nous à info@petanque13.be. Dans bien des cas, nous pouvons trouver une solution ensemble.",
        ],
      },
      {
        kop: "5. Mesures en cas d'abus",
        alineas: [
          "En cas d'abus, nous pouvons bloquer l'accès, faire supprimer la copie auprès de l'hébergeur ou des moteurs de recherche et, si nécessaire, engager des démarches juridiques.",
        ],
      },
      {
        kop: "6. Aucune garantie sur les données",
        alineas: [
          "Nous faisons de notre mieux pour garder le calendrier correct et à jour, mais nous ne pouvons pas garantir que tout est exact. La date, l'heure, le lieu et l'inscription peuvent changer. Vérifiez toujours les informations importantes auprès de l'organisateur. Petanque13 n'est pas responsable des dommages résultant de données inexactes ou périmées.",
        ],
      },
      {
        kop: "7. Une erreur, ou quelque chose qui vous appartient ?",
        alineas: [
          "Quelque chose est erroné, ou une affiche, photo ou texte du site vous dérange ? Écrivez à info@petanque13.be et nous le corrigerons ou le retirerons.",
        ],
      },
      {
        kop: "8. Droit applicable",
        alineas: ["Le droit belge s'applique à ces conditions."],
      },
    ],
    disclaimer:
      "Ce sont des conditions d'utilisation générales rédigées pour un projet bénévole. Elles ne remplacent pas un avis juridique.",
  },
};

export function GebruiksvoorwaardenContent() {
  const { taal } = useTranslation();
  const c = inhoud[taal];

  return (
    <div className="mx-auto max-w-2xl break-words px-6 py-16 lg:px-10">
      <h1 className="mb-2 font-titel text-[1.6rem] tracking-wide text-blauw max-[359px]:text-[1.3rem] min-[400px]:text-3xl sm:text-4xl">{c.titel}</h1>
      <p className="mb-8 text-xs text-grijs">{c.bijgewerkt}</p>

      {c.secties.map((sectie) => (
        <div key={sectie.kop} className="mb-6">
          <h2 className="mb-2 text-base font-bold text-donker">{sectie.kop}</h2>
          {sectie.lijst && (
            <ul className="mb-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-donker">
              {sectie.lijst.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          {sectie.alineas?.map((p) => (
            <p key={p} className="mb-2 text-sm leading-relaxed text-donker">
              {p}
            </p>
          ))}
        </div>
      ))}

      <p className="mt-8 border-t border-rand pt-4 text-xs text-grijs">{c.disclaimer}</p>
    </div>
  );
}
