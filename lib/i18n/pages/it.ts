import type { PageContent } from "./types";

export const it: PageContent = {
  meta: {
    about: {
      title: "Chi siamo",
      description:
        "Cos'è ClipsTrack e perché esiste - numeri esatti per YouTube Shorts, Instagram Reels e TikTok secondo il ritmo di ogni piattaforma (YouTube ogni ora, Instagram/TikTok ogni 3 ore), senza fogli di calcolo.",
    },
    privacy: {
      title: "Informativa sulla privacy",
      description:
        "Cosa conserva ClipsTrack (i canali che segui, le statistiche pubbliche e il cookie di sessione ct_uid), perché, e come richiedere la cancellazione completa dei tuoi dati.",
    },
    terms: {
      title: "Termini e condizioni",
      description:
        "I termini d'uso di ClipsTrack - uso consentito, accuratezza dei dati e responsabilità, disponibilità del servizio e rimozione degli account seguiti.",
    },
    contact: {
      title: "Contatti",
      description:
        "Domande, richieste di cancellazione o tracker guasti - contatta il team di ClipsTrack tramite il modulo o via e-mail.",
    },
  },
  about: {
    eyebrow: "Chi siamo",
    title: "Cos'è ClipsTrack e perché esiste",
    intro:
      "ClipsTrack è nato da un piccolo fastidio: ogni dashboard di analisi arrotonda le visualizzazioni a «1,2M» e «400K». Confrontare onestamente uno Short e una Reel significa confrontare supposizioni.",
    sections: [
      {
        h: "Numeri esatti, a ritmo definito",
        p: "ClipsTrack registra visualizzazioni, like, commenti e preferiti per ogni clip che aggiungi - secondo il ritmo di ogni piattaforma (YouTube ogni ora, Instagram/TikTok ogni 3 ore), al loro valore esatto. Niente arrotondamenti, niente «1,2M». Il numero che vedi è quello pubblicato dalla piattaforma in quel momento.",
      },
      {
        h: "Una pagina per tutte e tre le piattaforme",
        p: "Segue YouTube Shorts, Instagram Reels e TikTok da un unico elenco di handle. Aggiungi un canale e ogni video che rispetta le regole dei formati brevi della piattaforma viene misurato automaticamente - niente fogli di calcolo né export manuali.",
      },
      {
        h: "Per chi è fatto",
        p: "Per creator e agenzie che pubblicano lo stesso clip su più piattaforme e vogliono confrontarle in modo corretto, e per chiunque sia stanco di tenere a mano un foglio di calcolo delle statistiche video.",
      },
      {
        h: "Cosa non è",
        p: "ClipsTrack non è una dashboard pubblicitaria, non è un pianificatore e non è una suite completa di analisi. Niente funzioni inutili, niente newsletter. Fa una sola cosa - il monitoraggio esatto dei clip secondo il ritmo di ogni piattaforma - e lo fa in silenzio.",
      },
    ],
    closing:
      "ClipsTrack è auto-hostato, volutamente piccolo, e fatto per chi vuole numeri veri. Sei tu. Vai ad aggiungere un canale.",
  },
  privacy: {
    eyebrow: "Privacy",
    title: "Informativa sulla privacy",
    intro:
      "In breve: ClipsTrack conserva solo ciò che gli serve per monitorare i clip, non vende mai i tuoi dati e ti permette di cancellare tutto quando vuoi.",
    sections: [
      {
        h: "Cosa conserviamo",
        p: "I soli dati che teniamo sono quelli necessari al monitoraggio: gli handle che invii (nomi, URL o ID di canali YouTube, Instagram o TikTok), le statistiche pubbliche che catturiamo per quei canali (visualizzazioni, like, commenti e preferiti, ciascuno con un timestamp) e un piccolo identificativo per visitatore.",
      },
      {
        h: "Il cookie ct_uid",
        p: "Alla tua prima visita impostiamo un cookie chiamato ct_uid - un identificativo casuale senza alcuna informazione personale. Serve affinché i canali che aggiungi restino legati a te e non ad altri visitatori. Non ti traccia su altri siti, e non c'è tracciamento di terze parti né pubblicità in nessun punto di ClipsTrack.",
      },
      {
        h: "Solo dati pubblici",
        p: "Le statistiche che registriamo sono dati pubblici delle piattaforme - gli stessi numeri che chiunque può vedere aprendo il profilo. Non catturiamo mai informazioni private, messaggi diretti o nulla che non sia già visibile pubblicamente. Ciò che aggiungiamo è l'organizzazione: snapshot a un ritmo definito, in un unico posto.",
      },
      {
        h: "Cosa non facciamo",
        p: "Non vendiamo, non affittiamo e non condividiamo i tuoi dati con nessuno. Non ci sono pubblicità né intermediari di dati collegati a ClipsTrack. I tuoi account seguiti sono visibili solo a te e sono conservati separatamente da quelli di ogni altro visitatore.",
      },
      {
        h: "Richiesta di cancellazione",
        p: "Per cancellare tutto, inviaci un messaggio dalla pagina dei contatti indicando che si tratta di una richiesta di cancellazione - oppure scrivi a support@clipstrack.com - e rimuoveremo tutti i canali e la cronologia legati al tuo ID visitatore. Poiché i dati di ogni visitatore sono isolati, cancellare i tuoi non tocca mai quelli degli altri.",
      },
      {
        h: "Pulizia automatica",
        p: "Gli account rimasti inattivi vengono rimossi automaticamente dopo 90 giorni, insieme ai loro snapshot. Se torni più avanti, riparti da zero.",
      },
      {
        h: "Modifiche",
        p: "Se questa informativa cambia in modo sostanziale, aggiorneremo questa pagina con una nuova data.",
      },
    ],
  },
  terms: {
    eyebrow: "Note legali",
    title: "Termini e condizioni",
    intro:
      "Questi termini disciplinano il tuo utilizzo di ClipsTrack - il sito web che stai usando adesso e tutto ciò che offre. Aggiungendo canali o usando il servizio, li accetti.",
    sections: [
      {
        h: "Uso consentito",
        p: "ClipsTrack esiste per monitorare account di video in formato breve. Usalo per questo e con responsabilità: non tentare di rompere il servizio, raccogliere dati in massa da rivendere, molestare i proprietari degli account o seguire account senza un legittimo interesse.",
      },
      {
        h: "Da dove arrivano i dati",
        p: "Le statistiche provengono da piattaforme terze: la YouTube Data API, Instagram e TikTok. Queste piattaforme controllano ciò che viene pubblicato e possono modificarlo, limitarlo o rimuoverlo in qualsiasi momento. ClipsTrack registra ciò che pubblicano - non genera né corregge i numeri.",
      },
      {
        h: "Nessuna garanzia di accuratezza",
        p: "Facciamo del nostro meglio per registrare fedelmente, ma non garantiamo che i dati siano accurati, completi o aggiornati. I conteggi possono essere in ritardo, temporaneamente non disponibili o diversi da quanto mostra la piattaforma stessa, e non rispondiamo delle decisioni prese a partire dai numeri.",
      },
      {
        h: "Disponibilità del servizio",
        p: "ClipsTrack è fornito «così com'è» e «secondo disponibilità». Può essere lento, cambiare o smettere di funzionare senza preavviso - per manutenzione, modifiche alle API delle piattaforme o motivi di costo. Non rispondiamo di alcun periodo di inattività.",
      },
      {
        h: "Rimozione e sospensione",
        p: "Possiamo rimuovere account, dati o l'accesso al servizio a nostra discrezione e senza preavviso - ad esempio per proteggere il servizio o quando richiesto dalla legge.",
      },
      {
        h: "Limiti di responsabilità",
        p: "Nella misura massima consentita dalla legge, ClipsTrack e i suoi operatori non sono responsabili di danni indiretti, incidentali, consequenziali o speciali derivanti dal tuo utilizzo del servizio, anche se avvisati della possibilità.",
      },
      {
        h: "Contatti",
        p: "Domande su questi termini? Contattaci tramite la pagina dei contatti o all'indirizzo support@clipstrack.com.",
      },
    ],
  },
  contact: {
    eyebrow: "Contatti",
    title: "Contattaci",
    sub: "Una domanda, una richiesta di cancellazione, un tracker rotto - inviaci un messaggio e ti risponderemo.",
    email: "support@clipstrack.com",
    form: {
      name: "Nome",
      email: "Email",
      message: "Messaggio",
      namePlaceholder: "Il tuo nome",
      emailPlaceholder: "tu@esempio.com",
      messagePlaceholder: "Come possiamo aiutarti?",
      submit: "Invia messaggio",
      invalid: "Aggiungi il tuo nome, un'email valida e un messaggio.",
      mailtoNote:
        "Se la tua app di posta non si apre, scrivi direttamente a support@clipstrack.com.",
    },
    mailtoSubject: "Contatto da ClipsTrack",
    mailtoBody:
      "Dalla pagina dei contatti di ClipsTrack.\n\nNome: {name}\nEmail: {email}\n\n{message}",
  },
};