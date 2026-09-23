import type { PageContent } from "./types";

export const fr: PageContent = {
  meta: {
    about: {
      title: "À propos",
      description:
        "Ce qu'est ClipsTrack et pourquoi il existe - des chiffres exacts pour YouTube Shorts, Instagram Reels et TikTok selon le rythme de chaque plateforme (YouTube toutes les heures, Instagram/TikTok toutes les 3 heures), sans feuilles de calcul.",
    },
    privacy: {
      title: "Politique de confidentialité",
      description:
        "Ce que ClipsTrack conserve (vos chaînes suivies, les stats publiques et le cookie de session ct_uid), pourquoi, et comment demander la suppression totale de vos données.",
    },
    terms: {
      title: "Conditions d'utilisation",
      description:
        "Les conditions d'utilisation de ClipsTrack - usage acceptable, exactitude des données et responsabilité, disponibilité du service et suppression des comptes suivis.",
    },
    contact: {
      title: "Contact",
      description:
        "Questions, demandes de suppression ou suivi en panne - contactez l'équipe ClipsTrack via le formulaire ou par e-mail.",
    },
  },
  about: {
    eyebrow: "À propos",
    title: "Ce qu'est ClipsTrack et pourquoi il existe",
    intro:
      "ClipsTrack est né d'une petite frustration : tous les tableaux de bord arrondissent les vues à « 1,2 M » et « 400 K ». Comparer honnêtement un Short et une Reel, c'est comparer des approximations.",
    sections: [
      {
        h: "Des chiffres exacts, à un rythme défini",
        p: "ClipsTrack enregistre les vues, j'aime, commentaires et favoris de chaque clip que vous ajoutez - selon le rythme de chaque plateforme (YouTube toutes les heures, Instagram/TikTok toutes les 3 heures), à la valeur exacte. Pas d'arrondi, pas de « 1,2 M ». Le nombre que vous voyez est celui publié par la plateforme à cet instant.",
      },
      {
        h: "Une seule page pour les trois plateformes",
        p: "Il suit YouTube Shorts, Instagram Reels et TikTok depuis une unique liste de comptes. Ajoutez un canal et chaque vidéo qui répond aux règles de format court de la plateforme est mesurée automatiquement - sans feuilles de calcul ni exports manuels.",
      },
      {
        h: "Pour qui c'est fait",
        p: "Les créateurs et les agences qui diffusent le même clip sur plusieurs plateformes et veulent les comparer proprement, ainsi que toute personne fatiguée de tenir à la main une feuille de calcul de statistiques.",
      },
      {
        h: "Ce que ce n'est pas",
        p: "ClipsTrack n'est ni un tableau de bord publicitaire, ni un planificateur, ni une suite d'analyse complète. Pas de superflu, pas de newsletter. Il fait une seule chose - le suivi exact de clips au rythme de chaque plateforme - et le fait en silence.",
      },
    ],
    closing:
      "ClipsTrack est auto-hébergé, petit par choix, et fait pour les gens qui veulent des chiffres réels. C'est vous. Allez ajouter un canal.",
  },
  privacy: {
    eyebrow: "Confidentialité",
    title: "Politique de confidentialité",
    intro:
      "En bref : ClipsTrack ne stocke que ce dont il a besoin pour suivre des clips, ne vend jamais vos données et vous permet de tout supprimer quand vous voulez.",
    sections: [
      {
        h: "Ce que nous stockons",
        p: "Les seules données conservées sont celles nécessaires au suivi : les comptes que vous soumettez (noms, URLs ou ID de chaînes YouTube, Instagram ou TikTok), les statistiques publiques que nous capturons pour ces chaînes (vues, j'aime, commentaires et favoris, chacun avec un horodatage) et un petit identifiant par visiteur.",
      },
      {
        h: "Le cookie ct_uid",
        p: "Lors de votre première visite, nous posons un cookie nommé ct_uid - un identifiant aléatoire sans aucune information personnelle. Il existe pour que les chaînes que vous ajoutez restent liées à vous et non à d'autres visiteurs. Il ne vous suit pas sur d'autres sites, et il n'y a ni suivi tiers ni publicité sur ClipsTrack.",
      },
      {
        h: "Des données publiques uniquement",
        p: "Les statistiques que nous enregistrons sont des données publiques de plateformes - les mêmes chiffres que n'importe qui peut voir en ouvrant le profil. Nous ne capturons jamais d'informations privées, de messages directs, ni quoi que ce soit qui ne soit pas déjà visible publiquement. Ce que nous apportons, c'est l'organisation : des instantanés à un rythme défini, au même endroit.",
      },
      {
        h: "Ce que nous ne faisons pas",
        p: "Nous ne vendons, louons ni partageons vos données avec personne. Aucune publicité ni aucun courtier de données n'est lié à ClipsTrack. Vos comptes suivis ne sont visibles que de vous et sont stockés séparément de ceux de chaque autre visiteur.",
      },
      {
        h: "Demander la suppression",
        p: "Pour tout effacer, envoyez-nous un message depuis la page de contact en le marquant comme demande de suppression - ou écrivez à support@clipstrack.com - et nous supprimerons toutes les chaînes et l'historique liés à votre ID de visiteur. Comme les données de chaque visiteur sont isolées, supprimer les vôtres ne touche jamais celles des autres.",
      },
      {
        h: "Nettoyage automatique",
        p: "Les comptes restés inactifs sont supprimés automatiquement après 90 jours, avec leurs instantanés. Si vous revenez plus tard, vous repartez de zéro.",
      },
      {
        h: "Modifications",
        p: "Si cette politique change de façon significative, nous mettrons à jour cette page avec une nouvelle date.",
      },
    ],
  },
  terms: {
    eyebrow: "Mentions légales",
    title: "Conditions d'utilisation",
    intro:
      "Ces conditions couvrent votre utilisation de ClipsTrack - le site web que vous utilisez en ce moment et tout ce qu'il propose. En ajoutant des chaînes ou en utilisant le service, vous les acceptez.",
    sections: [
      {
        h: "Usage acceptable",
        p: "ClipsTrack existe pour suivre des comptes de vidéos de format court. Utilisez-le pour cela, et avec responsabilité : n'essayez pas de casser le service, de collecter massivement des données pour les revendre, de harceler des propriétaires de comptes ou de suivre des comptes sans intérêt légitime.",
      },
      {
        h: "D'où viennent les données",
        p: "Les statistiques proviennent de plateformes tierces : la YouTube Data API, Instagram et TikTok. Ces plateformes contrôlent ce qui est publié et peuvent le modifier, le limiter ou le retirer à tout moment. ClipsTrack enregistre ce qu'elles publient - il ne génère ni ne corrige les chiffres.",
      },
      {
        h: "Pas de garantie d'exactitude",
        p: "Nous faisons de notre mieux pour capturer fidèlement, mais nous ne garantissons pas que les données soient exactes, complètes ou à jour. Les compteurs peuvent être en retard, temporairement indisponibles, ou différer de ce qu'affiche la plateforme elle-même, et nous ne sommes pas responsables des décisions prises à partir des chiffres.",
      },
      {
        h: "Disponibilité du service",
        p: "ClipsTrack est fourni « en l'état » et « selon disponibilité ». Il peut être lent, changer ou cesser de fonctionner sans préavis - notamment pour maintenance, modifications d'API des plateformes ou raisons de coût. Nous ne sommes pas responsables des interruptions.",
      },
      {
        h: "Suppression et suspension",
        p: "Nous pouvons supprimer des comptes, des données ou l'accès au service à notre discrétion et sans préavis - par exemple pour protéger le service ou lorsque la loi l'exige.",
      },
      {
        h: "Limites de responsabilité",
        p: "Dans la mesure maximale permise par la loi, ClipsTrack et ses exploitants ne sont pas responsables des dommages indirects, accessoires, consécutifs ou spéciaux découlant de votre utilisation du service, même s'ils en avaient été informés.",
      },
      {
        h: "Contact",
        p: "Des questions sur ces conditions ? Contactez-nous via la page de contact ou à support@clipstrack.com.",
      },
    ],
  },
  contact: {
    eyebrow: "Contact",
    title: "Contactez-nous",
    sub: "Une question, une demande de suppression, un suivi en panne - envoyez-nous un message et nous vous répondrons.",
    email: "support@clipstrack.com",
    form: {
      name: "Nom",
      email: "E-mail",
      message: "Message",
      namePlaceholder: "Votre nom",
      emailPlaceholder: "vous@exemple.com",
      messagePlaceholder: "Comment pouvons-nous aider ?",
      submit: "Envoyer le message",
      invalid: "Ajoutez votre nom, un e-mail valide et un message.",
      mailtoNote:
        "Si votre application d'e-mail ne s'ouvre pas, écrivez directement à support@clipstrack.com.",
    },
    mailtoSubject: "Contact depuis ClipsTrack",
    mailtoBody:
      "Depuis la page de contact de ClipsTrack.\n\nNom : {name}\nE-mail : {email}\n\n{message}",
  },
};