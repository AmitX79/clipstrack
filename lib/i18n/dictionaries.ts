// ClipsTrack i18n dictionaries. English is the source of truth; each locale
// keeps the same meaning and tone as the English original (UI copy only —
// server error messages from actions/sync remain English).
export const LOCALES = ["en", "es", "ja", "fr", "de", "pt", "ko", "it"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  es: "Español",
  ja: "日本語",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
  ko: "한국어",
  it: "Italiano",
};

export const dictionaries = {
  en: {
    meta: {
      title: "Clips Track — YouTube Shorts, Reels & TikTok Tracker",
      description:
        "Clips Track is a clip performance tracker for YouTube Shorts, Instagram Reels and TikTok videos — views, likes and comments every hour, in full numbers.",
      ogTitle: "Clips Track — YouTube Shorts, Reels & TikTok Tracker",
      ogDescription:
        "Track views, likes and comments for YouTube Shorts, Instagram Reels and TikTok videos — hourly, in full numbers.",
      trackedTitle: "My Accounts",
      trackedDescription:
        "Your tracked YouTube Shorts, Instagram Reels and TikTok video channels — private to you, updated hourly.",
    },
    nav: {
      how: "How it works",
      accounts: "My Accounts",
      add: "Add channel",
      themeDark: "Switch to dark mode",
      themeLight: "Switch to light mode",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      lang: "Change language",
    },
    hero: {
      eyebrow: "Multi-platform clip tracker",
      titleBefore: "Real numbers, not rounded guesses",
      titleAfter: ".",
      subtitleBefore: "Add a YouTube, Instagram or TikTok handle — ",
      subtitleAccent: "Clips Track",
      subtitleAfter:
        " snapshots every clip's views, likes and comments each hour, shown in full.",
      add: "Add a channel",
      view: "View my accounts",
      platforms: "YouTube Shorts · Instagram Reels · TikTok",
    },
    about: {
      eyebrow: "About",
      title: "What is Clips Track?",
      p1:
        "Clips Track is a clip tracker built for short-form content. Add a YouTube Shorts channel, an Instagram creator or a TikTok account, and Clips Track records how each clip performs — views, likes, comments and favorites — on the hour, every hour. There is no spreadsheet to maintain and no manual export: you open a page and see exactly what a clip did yesterday and what it is doing right now, down to the exact number.",
      p2:
        "Most analytics dashboards round everything into \"1.2M\" and \"400K\". Clips Track deliberately goes the other way, storing each figure at its precise value so a genuine comparison is always possible. Whether you call it clip tracking, a video tracker, or a clip performance tracker, the idea is the same: deliberate, exact, hourly measurements of the short-form videos that move your channel.",
    },
    rules: {
      eyebrow: "Platform rules",
      title: "Track the right clips on every platform",
      ytTitle: "YouTube Shorts tracker",
      ytBody:
        "Clips Track only stores YouTube Shorts — clips at most a minute long that appear in the Shorts feed. Long-form uploads never leak into the numbers, so each channel card stays a true Shorts tracker. Views, likes and comments are pulled straight from the YouTube Data API and snapshotted on the hour, giving you a clean signal of which Shorts actually perform.",
      igTitle: "Instagram Reels tracker",
      igBody:
        "On Instagram, Clips Track follows Reels only. Regular photo posts and carousels are filtered out, because Instagram publishes no view count for them — and Clips Track never invents numbers where the platform publishes none. Every Reel keeps its real play count, likes and comments, so the tracker shows growth you can actually trust.",
      ttTitle: "TikTok video tracker",
      ttBody:
        "TikTok is a video-first platform, and Clips Track keeps it that way. Photo-mode posts and active live streams are excluded; only plain videos with playable URLs are tracked, along with their digg, comment and favorite counts. The result is a focused TikTok video tracker of the clips that matter — not a dump of every item a profile ever posted.",
    },
    why: {
      eyebrow: "Why ClipsTrack",
      title: "Full numbers, hourly",
      f1Title: "Hourly snapshots",
      f1Body:
        "A background job captures stats on the hour, so you can watch clips climb — day by day, full number by full number, without lifting a finger.",
      f2Title: "Full numbers",
      f2Body:
        "No 1.2M or 400K guesses. Views, likes and comments are stored and shown at their exact value, every time.",
      f3Title: "Ratio alerts",
      f3Body:
        "Set an optional min like-ratio per channel; clips that fall below the threshold are flagged with a warning, so weak performance stands out at a glance.",
      p1:
        "To track video views reliably, Clips Track stores a time series — one measurement per clip per hour. Open a clip today and you can still see what it did a month ago: the first-hour leap on a new Reel, the slow morning crawl of a Short, a TikTok video that suddenly re-accelerates days later. Because the history is kept in exact numbers, the growth curve stays honest and comparable no matter when you look at it.",
      p2:
        "The per-clip numbers pair with channel-level totals — followers, lifetime views and post counts, also snapshotted hourly. That is what turns raw counts into a real clip performance tracker: you can compare how a new upload performs against the channel's baseline, spot which formats keep their like-ratio, and decide where the next post deserves its momentum.",
    },
    buckets: {
      eyebrow: "Windows",
      title: "Old clips backfilled, new clips watched",
      sub1Title: "How buckets work",
      sub1Body:
        "When you add a handle, Clips Track first backfills recent clips into an Old bucket — a one-time snapshot of the recent past. From then on, a Latest bucket keeps just the newest uploads, refreshed on every hourly sync. Which clips belong to which bucket is decided by publish date, never by guesswork, and clips never jump between buckets.",
      sub2Title: "Counts you control",
      sub2Body:
        "The window sizes are yours to pick per channel: backfill the last eight clips and track the newest four, or any other combination that fits how you watch. Lower a count and the extras are trimmed immediately; raise it and the window re-opens and backfills to match. Targeted clips get removed cleanly, history and all, so the dashboard always reflects what you actually want to watch.",
      sub3Title: "Who it is for",
      sub3Body:
        "Creators who want to track clip views without a spreadsheet. Growth teams comparing Shorts, Reels and TikTok in one view. Agencies that report exact numbers to clients. And anyone who has ever squinted at a rounded view count and wondered what the real figure was. Add as few or as many channels as you like — each one carries its own windows and alerts, so the dashboard scales from a single handle to a whole roster.",
    },
    faq: {
      eyebrow: "FAQ",
      title: "Frequently asked questions",
      sub: "Quick answers about what Clips Track tracks, how often it updates, and how your data is handled.",
      q1: "What is ClipsTrack?",
      a1:
        "ClipsTrack is a free clip tracker for short-form content. Add a YouTube, Instagram or TikTok handle and it records how each clip performs — views, likes and comments — every hour, always shown in full numbers. It keeps YouTube Shorts, Instagram Reels and TikTok videos together in one dashboard.",
      q2: "How does ClipsTrack track YouTube Shorts, Instagram Reels, and TikTok videos?",
      a2:
        "ClipsTrack pulls YouTube Shorts straight from the official YouTube Data API and keeps only clips up to 60 seconds — long-form uploads never get mixed in. On Instagram it tracks Reels only, skipping photo posts and carousels. On TikTok, only plain videos are tracked, along with their digg, comment and favorite counts. Each platform's stats are snapshotted hourly into a per-clip time series.",
      q3: "Is ClipsTrack free to use?",
      a3:
        "Yes — ClipsTrack is free. There's no paid plan, no per-channel fee and nothing is hidden behind a paywall.",
      q4: "How often does ClipsTrack update video stats?",
      a4:
        "Stats update every hour. The first snapshot is taken as soon as you add a handle, then a background sync refreshes views, likes and comments hourly from then on.",
      q5: "Can I track any public YouTube, Instagram, or TikTok account?",
      a5:
        "Yes — any public account on the three supported platforms can be tracked. Private or restricted accounts that require approval can't be read without authorization.",
      q6: "Do I need to log in to use ClipsTrack?",
      a6:
        "No login is required — there's no account system. Your tracked accounts are tied to a per-visitor identifier stored in your browser, so you can start adding channels immediately.",
      q7: "Can I track old videos, or only new uploads?",
      a7:
        "Both. When you add a channel, ClipsTrack first backfills recent clips into an \"Old\" bucket, then keeps a \"Latest\" bucket for new uploads going forward. You choose how many clips each bucket holds, per channel.",
      q8: "How many accounts can I track at once?",
      a8:
        "There's no fixed limit — add as many handles as you need, in batches. Each channel keeps its own counts, layout and alert settings.",
      q9: "Is my tracked data private to me?",
      a9:
        "Yes — the dashboard shows only the channels you added. Each visitor sees their own data and account records are isolated per visitor.",
      q10: "Can I see hourly growth of a video's views?",
      a10:
        "Yes. Every hourly sync stores another measurement for each clip, building a time series of exact view counts. Open a clip's history later and you can see its growth hour by hour and day by day.",
      q11: "Does ClipsTrack support Twitter/X?",
      a11:
        "Not yet — ClipsTrack currently tracks YouTube Shorts, Instagram Reels and TikTok videos. Twitter/X isn't supported.",
    },
    cta: {
      eyebrow: "Ready when you are",
      title: "Start tracking.",
    },
    footer: {
      after: "numbers always shown in full.",
      meta: "Self-hosted · YouTube · Instagram · TikTok",
    },
    acct: {
      eyebrow: "My Accounts",
      title: "The handles you track.",
      sub:
        "Your tracked accounts — private to you. Video stats update on the hour, always shown in full, never abbreviated.",
      dbError1: "Can't reach the database — check that ",
      dbError2: " points to a running Postgres, then reload.",
    },
    add: {
      platform: "Platform",
      placeholder: "Add channels… e.g. @mrbeast, @veritasium",
      old: "Old",
      latest: "Latest",
      ratio: "Ratio%",
      submit: "+ Add",
      adding: "Adding…",
      ariaHandles: "Handles to track",
      ariaOld: "Old videos count",
      ariaLatest: "Latest videos count",
      ariaRatio: "Min like ratio percent, optional",
      ratioTitle:
        "Optional: flag videos whose like-ratio (likes/views %) falls below this",
      helper:
        "Separate handles with commas — each is added on the platform you pick, in one go. The first snapshot starts immediately, then one sits every hour. Re-adding a handle updates it instead of duplicating. A Ratio% set per handle flags videos with a lower like-ratio as a warning.",
    },
    sort: {
      label: "Sort by",
      published: "Newest first",
      views: "Most views",
      likes: "Most likes",
      comments: "Most comments",
    },
    layout: { horizontal: "Horizontal", vertical: "Vertical" },
    empty: {
      eyebrow: "No accounts yet",
      title: "Your tracked accounts will appear here.",
      before: "Add the first handle ",
      link: "here",
      after: " — stats start appearing after the first sync.",
    },
    card: {
      refresh: "Refresh",
      edit: "Edit",
      remove: "Remove",
      save: "Save",
      saving: "Saving…",
      cancel: "Cancel",
      latest: "Latest",
      old: "Old",
      views: "Views",
      likes: "Likes",
      comments: "Comments",
      syncing: "Syncing…",
      noStats: "No stats collected yet.",
      noVideos: "No videos tracked yet.",
      backfill:
        "First sync backfills the {old} most recent videos, then tracks the newest {latest} going forward.",
      synced: "Synced {t} ago",
      notSynced: "Not synced yet",
      publishedOld: "{t} old",
      updated: "updated {t}",
      errCounts: "Counts must be whole numbers between 0 and 200.",
      errRatio:
        "Min like ratio must be between 0 and 100, or left empty.",
      ariaRefresh: "Refresh @{user}",
      ariaEdit: "Edit @{user} video settings",
      ariaRemove: "Remove @{user}",
      ratioBelow: "Below {min}% min like-ratio",
      likeRatioTitle: "Like-ratio {ratio} below the {min}% minimum",
      imgViewsTitle:
        "Instagram doesn't expose a view count for photo/carousel posts — only reels",
      noViews: "No view count available",
      confirmRemove: "Remove @{user} and its video history?",
      oldCountLabel: "Old videos count",
      oldCountHint: "Most recent videos to backfill once",
      latestCountLabel: "Latest videos count",
      latestCountHint: "Newest uploads to track going forward",
      ratioLabel: "Min ratio %",
      ratioHint: "Optional — flag videos below this like-ratio",
    },
    fmt: {
      ago: "ago",
      growthUnit: "/hr",
    },
  },
  es: {
    meta: {
      title: "Clips Track — Seguimiento de YouTube Shorts, Reels y TikTok",
      description:
        "Clips Track es un rastreador de rendimiento de clips para YouTube Shorts, Reels de Instagram y vídeos de TikTok: vistas, likes y comentarios cada hora, con números exactos.",
      ogTitle: "Clips Track — Seguimiento de YouTube Shorts, Reels y TikTok",
      ogDescription:
        "Sigue las vistas, likes y comentarios de YouTube Shorts, Reels de Instagram y vídeos de TikTok: cada hora, con números exactos.",
      trackedTitle: "Mis cuentas",
      trackedDescription:
        "Tus canales de YouTube Shorts, Reels de Instagram y TikTok rastreados: privados para ti y actualizados cada hora.",
    },
    nav: {
      how: "Cómo funciona",
      accounts: "Mis cuentas",
      add: "Añadir canal",
      themeDark: "Activar modo oscuro",
      themeLight: "Activar modo claro",
      openMenu: "Abrir menú",
      closeMenu: "Cerrar menú",
      lang: "Cambiar idioma",
    },
    hero: {
      eyebrow: "Rastreador de clips multiplataforma",
      titleBefore: "Números reales, no estimaciones redondeadas",
      titleAfter: ".",
      subtitleBefore: "Añade una cuenta de YouTube, Instagram o TikTok — ",
      subtitleAccent: "Clips Track",
      subtitleAfter:
        " registra cada hora las vistas, los likes y los comentarios de cada clip, mostrados en números exactos.",
      add: "Añadir un canal",
      view: "Ver mis cuentas",
      platforms: "YouTube Shorts · Instagram Reels · TikTok",
    },
    about: {
      eyebrow: "Acerca de",
      title: "¿Qué es Clips Track?",
      p1:
        "Clips Track es un rastreador de clips pensado para el contenido de formato corto. Añade un canal de YouTube Shorts, un creador de Instagram o una cuenta de TikTok, y Clips Track registra cada hora cómo rinde cada clip — vistas, likes, comentarios y favoritos — a la hora en punto. No hay hojas de cálculo que mantener ni exportaciones manuales: abres la página y ves exactamente qué hizo un clip ayer y qué está haciendo ahora mismo, hasta el número exacto.",
      p2:
        "La mayoría de los paneles redondean todo a «1,2 M» o «400 K». Clips Track hace justo lo contrario: guarda cada cifra con su valor exacto para que la comparación sea siempre real. Lo llames seguimiento de clips, rastreador de vídeos o tracker de rendimiento de clips, la idea es la misma: mediciones deliberadas, exactas y por horas de los vídeos cortos que mueven tu canal.",
    },
    rules: {
      eyebrow: "Reglas por plataforma",
      title: "Sigue los clips correctos en cada plataforma",
      ytTitle: "Tracker de YouTube Shorts",
      ytBody:
        "Clips Track solo guarda YouTube Shorts: clips de como mucho un minuto que aparecen en el feed de Shorts. Los vídeos de formato largo nunca se cuelan en las cifras, así que cada tarjeta de canal es un auténtico tracker de Shorts. Las vistas, los likes y los comentarios salen directamente de la API de datos de YouTube y se capturan a la hora en punto, dándote una señal limpia de qué Shorts rinden de verdad.",
      igTitle: "Tracker de Reels de Instagram",
      igBody:
        "En Instagram, Clips Track solo sigue Reels. Las fotos y los carruseles normales se filtran, porque Instagram no publica contador de vistas para ellos — y Clips Track nunca inventa números donde la plataforma no publica ninguno. Cada Reel conserva sus reproducciones, likes y comentarios reales, así que el tracker muestra un crecimiento en el que puedes confiar.",
      ttTitle: "Tracker de vídeos de TikTok",
      ttBody:
        "TikTok es una plataforma de vídeo, y Clips Track lo mantiene así. Las publicaciones en modo foto y los directos activos se excluyen; solo se siguen vídeos normales con URL reproducibles, junto con sus me gusta, comentarios y favoritos. El resultado es un tracker de vídeos de TikTok centrado en los clips que importan, no un volcado de todo lo que un perfil haya publicado.",
    },
    why: {
      eyebrow: "Por qué ClipsTrack",
      title: "Números exactos, cada hora",
      f1Title: "Capturas horarias",
      f1Body:
        "Un proceso en segundo plano captura las estadísticas a la hora en punto, para que puedas ver subir tus clips — día a día, número a número, sin mover un dedo.",
      f2Title: "Números exactos",
      f2Body:
        "Nada de 1,2M o 400K de ojo. Las vistas, los likes y los comentarios se guardan y se muestran con su valor exacto, siempre.",
      f3Title: "Alertas de ratio",
      f3Body:
        "Define un ratio mínimo de likes opcional por canal; los clips que queden por debajo se marcan con una advertencia, así el bajo rendimiento salta a la vista.",
      p1:
        "Para seguir las vistas de forma fiable, Clips Track guarda una serie temporal: una medición por clip y por hora. Abre un clip hoy y aún podrás ver qué hizo hace un mes: el salto de la primera hora en un Reel nuevo, el lento arranque de la mañana de un Short, un vídeo de TikTok que se acelera de golpe días después. Como el historial se conserva con números exactos, la curva de crecimiento se mantiene honesta y comparable sin importar cuándo la mires.",
      p2:
        "Los números por clip se combinan con los totales del canal — seguidores, vistas de por vida y número de publicaciones, también capturados cada hora. Eso es lo que convierte recuentos en bruto en un tracker real de rendimiento de clips: puedes comparar cómo rinde una publicación nueva frente a la base del canal, ver qué formatos mantienen su ratio de likes y decidir dónde merece empuje la próxima publicación.",
    },
    buckets: {
      eyebrow: "Ventanas",
      title: "Clips antiguos rellenados, clips nuevos vigilados",
      sub1Title: "Cómo funcionan las ventanas",
      sub1Body:
        "Cuando añades una cuenta, Clips Track primero rellena los clips recientes en una ventana «Antiguos»: una foto única del pasado reciente. A partir de ahí, una ventana «Nuevos» mantiene solo los últimos contenidos, actualizada en cada sincronización horaria. Qué clips van a cada ventana lo decide la fecha de publicación, nunca la suposición, y los clips nunca saltan entre ventanas.",
      sub2Title: "Límites que controlas",
      sub2Body:
        "Los tamaños de ventana los eliges por canal: rellena los últimos ocho clips y sigue los cuatro más nuevos, o cualquier otra combinación que encaje con cómo miras. Si bajas un número, los sobrantes se recortan al momento; si lo subes, la ventana se reabre y se rellena para igualar. Los clips que se quitan se eliminan limpiamente, con todo su historial, para que el panel siempre refleje lo que quieres ver.",
      sub3Title: "Para quién es",
      sub3Body:
        "Creadores que quieren seguir sus vistas sin hojas de cálculo. Equipos de crecimiento que comparan Shorts, Reels y TikTok en una sola vista. Agencias que reportan números exactos a sus clientes. Y cualquiera que haya entrecerrado los ojos ante un contador redondeado preguntándose cuál sería la cifra real. Añade los canales que quieras — cada uno tiene sus propias ventanas y avisos, así que el panel escala desde una sola cuenta hasta un roster completo.",
    },
    faq: {
      eyebrow: "Preguntas frecuentes",
      title: "Preguntas frecuentes",
      sub: "Respuestas rápidas sobre qué rastrea Clips Track, cada cuánto se actualiza y cómo se tratan tus datos.",
      q1: "¿Qué es ClipsTrack?",
      a1:
        "ClipsTrack es un rastreador de clips gratuito para contenido corto. Añade una cuenta de YouTube, Instagram o TikTok y registra cómo rinde cada clip — vistas, likes y comentarios — cada hora, siempre en números exactos. Reúne YouTube Shorts, Reels de Instagram y vídeos de TikTok en un solo panel.",
      q2: "¿Cómo rastrea ClipsTrack los YouTube Shorts, los Reels de Instagram y los vídeos de TikTok?",
      a2:
        "ClipsTrack obtiene los YouTube Shorts directamente de la API de datos oficial de YouTube y guarda solo clips de hasta 60 segundos: los vídeos largos nunca se mezclan. En Instagram solo rastrea Reels, ignorando fotos y carruseles. En TikTok solo se siguen vídeos normales, con sus me gusta, comentarios y favoritos. Las estadísticas de cada plataforma se capturan cada hora en una serie temporal por clip.",
      q3: "¿ClipsTrack es gratuito?",
      a3:
        "Sí — ClipsTrack es gratuito. No hay plan de pago, ni tarifa por canal y nada está oculto tras un muro de pago.",
      q4: "¿Con qué frecuencia actualiza ClipsTrack las estadísticas?",
      a4:
        "Las estadísticas se actualizan cada hora. La primera captura se toma en cuanto añades una cuenta; a partir de ahí, una sincronización en segundo plano refresca vistas, likes y comentarios cada hora.",
      q5: "¿Puedo rastrear cualquier cuenta pública de YouTube, Instagram o TikTok?",
      a5:
        "Sí — cualquier cuenta pública de las tres plataformas compatibles se puede rastrear. Las cuentas privadas o restringidas que exigen aprobación no se pueden leer sin autorización.",
      q6: "¿Necesito iniciar sesión para usar ClipsTrack?",
      a6:
        "No hace falta iniciar sesión — no hay sistema de cuentas. Tus cuentas rastreadas están ligadas a un identificador por visitante guardado en tu navegador, así que puedes empezar a añadir canales de inmediato.",
      q7: "¿Puedo rastrear vídeos antiguos o solo las publicaciones nuevas?",
      a7:
        "Ambos. Cuando añades un canal, ClipsTrack primero rellena los clips recientes en una ventana «Antiguos» y luego mantiene una ventana «Nuevos» para las publicaciones nuevas. Tú eliges cuántos clips contiene cada ventana, por canal.",
      q8: "¿Cuántas cuentas puedo rastrear a la vez?",
      a8:
        "No hay límite fijo — añade tantas cuentas como necesites, en lotes. Cada canal mantiene sus propios recuentos, formato y avisos.",
      q9: "¿Mis datos rastreados son privados?",
      a9:
        "Sí — el panel muestra solo los canales que tú añadiste. Cada visitante ve sus propios datos y los registros están aislados por visitante.",
      q10: "¿Puedo ver el crecimiento por hora de las vistas de un vídeo?",
      a10:
        "Sí. Cada sincronización horaria guarda otra medición de cada clip, construyendo una serie temporal con recuentos exactos. Abre el historial de un clip más tarde y podrás ver su crecimiento hora a hora y día a día.",
      q11: "¿ClipsTrack es compatible con Twitter/X?",
      a11:
        "Aún no — ClipsTrack actualmente rastrea YouTube Shorts, Reels de Instagram y vídeos de TikTok. Twitter/X no es compatible.",
    },
    cta: { eyebrow: "Listo cuando lo estés", title: "Empieza a rastrear." },
    footer: {
      after: "los números siempre al completo.",
      meta: "Autoadministrado · YouTube · Instagram · TikTok",
    },
    acct: {
      eyebrow: "Mis cuentas",
      title: "Las cuentas que rastreas.",
      sub:
        "Tus cuentas rastreadas — privadas para ti. Las estadísticas se actualizan a la hora en punto, siempre en números exactos, nunca abreviados.",
      dbError1: "No se puede acceder a la base de datos — comprueba que ",
      dbError2: " apunta a una instancia de Postgres en marcha y vuelve a cargar.",
    },
    add: {
      platform: "Plataforma",
      placeholder: "Añadir canales… p. ej. @mrbeast, @veritasium",
      old: "Viejos",
      latest: "Nuevos",
      ratio: "Ratio%",
      submit: "+ Añadir",
      adding: "Añadiendo…",
      ariaHandles: "Cuentas a rastrear",
      ariaOld: "Número de vídeos antiguos",
      ariaLatest: "Número de vídeos nuevos",
      ariaRatio: "Porcentaje mínimo de ratio de likes, opcional",
      ratioTitle:
        "Opcional: marca los vídeos cuyo ratio de likes (likes/visualizaciones %) quede por debajo de esto",
      helper:
        "Separa las cuentas con comas — cada una se añade en la plataforma que elijas, de una vez. La primera captura empieza de inmediato y luego se repite cada hora. Volver a añadir una cuenta la actualiza en lugar de duplicarla. Un Ratio% fijado por cuenta marca los vídeos con menor ratio de likes como advertencia.",
    },
    sort: {
      label: "Ordenar por",
      published: "Más recientes primero",
      views: "Más vistas",
      likes: "Más likes",
      comments: "Más comentarios",
    },
    layout: { horizontal: "Horizontal", vertical: "Vertical" },
    empty: {
      eyebrow: "Aún no hay cuentas",
      title: "Tus cuentas rastreadas aparecerán aquí.",
      before: "Añade la primera cuenta ",
      link: "aquí",
      after: " — las estadísticas empiezan a aparecer tras la primera sincronización.",
    },
    card: {
      refresh: "Actualizar",
      edit: "Editar",
      remove: "Eliminar",
      save: "Guardar",
      saving: "Guardando…",
      cancel: "Cancelar",
      latest: "Nuevos",
      old: "Viejos",
      views: "Vistas",
      likes: "Likes",
      comments: "Comentarios",
      syncing: "Sincronizando…",
      noStats: "Aún no hay estadísticas.",
      noVideos: "Aún no hay vídeos rastreados.",
      backfill:
        "La primera sincronización rellena los {old} vídeos más recientes y luego rastrea los {latest} más nuevos.",
      synced: "Sincronizado hace {t}",
      notSynced: "Aún sin sincronizar",
      publishedOld: "hace {t}",
      updated: "actualizado hace {t}",
      errCounts: "Los recuentos deben ser números enteros entre 0 y 200.",
      errRatio:
        "El ratio mínimo de likes debe estar entre 0 y 100, o dejarse vacío.",
      ariaRefresh: "Actualizar @{user}",
      ariaEdit: "Editar la configuración de vídeo de @{user}",
      ariaRemove: "Eliminar @{user}",
      ratioBelow: "Por debajo del {min}% mínimo de ratio de likes",
      likeRatioTitle:
        "El ratio de likes {ratio} está por debajo del mínimo del {min}%",
      imgViewsTitle:
        "Instagram no publica el contador de vistas para fotos/carruseles — solo en reels",
      noViews: "No hay contador de vistas disponible",
      confirmRemove: "¿Eliminar @{user} y su historial de vídeos?",
      oldCountLabel: "Nº de vídeos antiguos",
      oldCountHint: "Vídeos recientes a rellenar una vez",
      latestCountLabel: "Nº de vídeos nuevos",
      latestCountHint: "Nuevas publicaciones a rastrear",
      ratioLabel: "Ratio mín %",
      ratioHint: "Opcional — marca los vídeos por debajo de este ratio",
    },
    fmt: { ago: "atrás", growthUnit: "/h" },
  },
  ja: {
    meta: {
      title: "Clips Track — YouTubeショート・Reels・TikTokトラッカー",
      description:
        "Clips TrackはYouTubeショート、Instagramリール、TikTok動画のパフォーマンスを追跡するツール。再生数・いいね・コメントを毎時間、省略なしの実数で記録します。",
      ogTitle: "Clips Track — YouTubeショート・Reels・TikTokトラッカー",
      ogDescription:
        "YouTubeショート、Instagramリール、TikTok動画の再生数・いいね・コメントを毎時間、実数で追跡。",
      trackedTitle: "マイアカウント",
      trackedDescription:
        "追跡中のYouTubeショート、Instagramリール、TikTok動画のチャンネル。あなた専用、毎時間更新。",
    },
    nav: {
      how: "使い方",
      accounts: "マイアカウント",
      add: "チャンネルを追加",
      themeDark: "ダークモードに切り替え",
      themeLight: "ライトモードに切り替え",
      openMenu: "メニューを開く",
      closeMenu: "メニューを閉じる",
      lang: "言語を変更",
    },
    hero: {
      eyebrow: "マルチプラットフォーム動画追跡ツール",
      titleBefore: "丸められた推測ではなく、実際の数字",
      titleAfter: "。",
      subtitleBefore: "YouTube、Instagram、TikTokのアカウントを追加 — ",
      subtitleAccent: "Clips Track",
      subtitleAfter:
        " が各クリップの再生数・いいね・コメントを毎時間、省略せず完全な数字で記録します。",
      add: "チャンネルを追加",
      view: "マイアカウントを見る",
      platforms: "YouTube Shorts · Instagram Reels · TikTok",
    },
    about: {
      eyebrow: "概要",
      title: "Clips Trackとは？",
      p1:
        "Clips Trackはショート動画向けのクリップ追跡ツールです。YouTubeショートのチャンネル、Instagramのクリエイター、TikTokのアカウントを追加すると、各クリップのパフォーマンス（再生数・いいね・コメント・お気に入り）を毎時間、正時に記録します。スプレッドシートの管理も手動エクスポートも不要。ページを開けば、昨日の数字も今の数字も、正確な値そのまま確認できます。",
      p2:
        "多くの分析ダッシュボードは「120万」「40万」と概数にしてしまいます。Clips Trackはあえて逆を行き、すべての数字を正確な値で保存するので、いつでも本当の比較ができます。クリップ追跡、動画トラッカー、クリップ分析ツール、呼び方は何でもかまいません。考え方は同じ——あなたのチャンネルを動かすショート動画を、意図的に、正確に、毎時間測ることです。",
    },
    rules: {
      eyebrow: "プラットフォームごとのルール",
      title: "各プラットフォームで正しい動画だけを追跡",
      ytTitle: "YouTubeショートトラッカー",
      ytBody:
        "Clips TrackはYouTubeショートだけを保存します。ショートフィードに表示される、最大1分のクリップのみです。長尺動画が数字に混ざることは決してないため、各チャンネルカードは純粋なShortsトラッカーとして機能します。再生数・いいね・コメントはYouTube Data APIから直接取得し、正時にスナップショット。どのショートが実際に伸びているか、クリーンなシグナルが得られます。",
      igTitle: "Instagramリールトラッカー",
      igBody:
        "Instagramでは、Clips Trackはリールだけを追跡します。通常の写真投稿やカルーセルは除外されます。Instagramがそれらの再生数を公開していないためです。そしてClips Trackは、プラットフォームが数字を公開していないものには数字を作りません。すべてのリールは実際の再生数・いいね・コメントを保持するため、信頼できる成長を確認できます。",
      ttTitle: "TikTok動画トラッカー",
      ttBody:
        "TikTokは動画中心のプラットフォームであり、Clips Trackもそれを守ります。フォトモードの投稿や配信中ライブは除外し、再生可能なURLを持つ通常の動画だけを、いいね・コメント・お気に入りと一緒に追跡します。結果として、プロフィールに投稿された全アイテムのダンプではなく、本当に重要なクリップに焦点を当てたTikTok動画トラッカーになります。",
    },
    why: {
      eyebrow: "ClipsTrackの特徴",
      title: "実数を、毎時間",
      f1Title: "毎時間のスナップショット",
      f1Body:
        "バックグラウンド処理が正時に統計を取得するので、クリップが伸びていく様子を日々、数字の一つひとつまで、何もせずに見られます。",
      f2Title: "実数そのまま",
      f2Body:
        "「120万」や「40万」のような推測値はありません。再生数・いいね・コメントは常に正確な値で保存・表示されます。",
      f3Title: "比率アラート",
      f3Body:
        "チャンネルごとに任意の最小いいね比率を設定できます。基準を下回るクリップには警告が付き、パフォーマンスの低さがひと目でわかります。",
      p1:
        "再生数を確実に追跡するため、Clips Trackは時系列データを保存します——クリップごと、時間ごとの1測定です。今日クリップを開けば、1か月前の数字も見られます。新しいリールの初速、ショートのゆるやかな朝の伸び、数日経って再急伸するTikTok動画。履歴は正確な数値で保持されるため、成長曲線はいつ見ても正直で、比較可能なままです。",
      p2:
        "クリップごとの数字は、チャンネル全体の合計（フォロワー数、累計再生数、投稿数）と組み合わされます。こちらも毎時間スナップショットされます。それこそが、生のカウントを本物のクリップ分析ツールに変える仕組みです。新着投稿がチャンネルのベースラインと比べてどう伸びているか、どのフォーマットがいいね比率を保っているかを見極め、次の投稿の勢いをどこに注ぐべきか判断できます。",
    },
    buckets: {
      eyebrow: "ウィンドウ",
      title: "過去の動画をバックフィル、新しい動画を監視",
      sub1Title: "ウィンドウの仕組み",
      sub1Body:
        "アカウントを追加すると、Clips Trackはまず直近のクリップを「過去」ウィンドウにバックフィルします。これは過去の一括スナップショットです。以降、「最新」ウィンドウが新着動画だけを、毎時の同期で更新しながら保持します。どのクリップがどのウィンドウに属するかは公開日で判断され、推測は一切せず、クリップがウィンドウ間を移動することもありません。",
      sub2Title: "自由に選べる数",
      sub2Body:
        "ウィンドウのサイズはチャンネルごとに自由に選べます。直近8クリップをバックフィルして最新4件を追跡する、あるいは自分の見方に合う任意の組み合わせも可能です。数字を減らせば余分な分は即座にトリムされ、増やせばウィンドウが開き直されてそれに合わせてバックフィルされます。外したクリップは履歴ごとすっきり削除されるので、ダッシュボードには常に見たいものが反映されます。",
      sub3Title: "こんな方に",
      sub3Body:
        "スプレッドシートなしで再生数を追跡したいクリエイター。Shorts・Reels・TikTokを1つのビューで比較するグロースチーム。クライアントに正確な数字を報告する代理店。そして、丸められた再生数を見て「本当の数字は？」と思ったことがあるすべての人。チャンネルは何個でも追加できます。それぞれが独自のウィンドウとアラートを持つため、1アカウントから大人数のチームまで、ダッシュボードは自由にスケールします。",
    },
    faq: {
      eyebrow: "FAQ",
      title: "よくある質問",
      sub: "Clips Trackが何を追跡するか、どのくらいの頻度で更新されるか、データがどう扱われるかを簡潔に説明します。",
      q1: "ClipsTrackとは？",
      a1:
        "ClipsTrackはショート動画向けの無料のクリップ追跡ツールです。YouTube・Instagram・TikTokのアカウントを追加すると、各クリップのパフォーマンス（再生数・いいね・コメント）を毎時間、常に実数で記録します。YouTubeショート、Instagramリール、TikTok動画を1つのダッシュボードにまとめます。",
      q2: "ClipsTrackはYouTubeショート、Instagramリール、TikTok動画をどうやって追跡するの？",
      a2:
        "ClipsTrackはYouTubeの公式Data APIからショートを直接取得し、60秒までのクリップだけを保存します。長尺動画が混ざることは決してありません。Instagramではリールのみを追跡し、写真投稿やカルーセルはスキップします。TikTokでは通常の動画のみを、いいね・コメント・お気に入りと共に追跡します。各プラットフォームの統計は毎時間、クリップごとの時系列にスナップショットされます。",
      q3: "ClipsTrackは無料ですか？",
      a3:
        "はい、ClipsTrackは無料です。有料プランも、チャンネルごとの料金も、ペイウォールの裏に隠れた機能もありません。",
      q4: "ClipsTrackはどのくらいの頻度で統計を更新しますか？",
      a4:
        "統計は毎時間更新されます。最初のスナップショットはアカウントを追加した直後に取られ、その後はバックグラウンド同期が再生数・いいね・コメントを毎時間更新します。",
      q5: "公開されているYouTube・Instagram・TikTokアカウントならどれでも追跡できますか？",
      a5:
        "はい。対応する3つのプラットフォームの公開アカウントならどれでも追跡できます。承認が必要な非公開アカウントや制限付きアカウントは、認可なしでは読み込めません。",
      q6: "ClipsTrackを使うのにログインは必要ですか？",
      a6:
        "ログインは不要です。アカウントシステム自体がありません。追跡中のアカウントはブラウザに保存された訪問者ごとの識別子と紐づくため、すぐにチャンネルを追加し始められます。",
      q7: "過去の動画も追跡できますか？それとも新しい投稿だけですか？",
      a7:
        "両方です。チャンネルを追加すると、ClipsTrackはまず最近のクリップを「過去」ウィンドウにバックフィルし、その後「最新」ウィンドウで新着投稿を追跡します。各ウィンドウにいくつのクリップを入れるかはチャンネルごとに選べます。",
      q8: "一度にいくつまでアカウントを追跡できますか？",
      a8:
        "固定の上限はありません。必要なだけ、まとめて追加できます。各チャンネルは独自の数・レイアウト・アラート設定を保持します。",
      q9: "追跡データは自分だけが見られますか？",
      a9:
        "はい。ダッシュボードには、あなたが追加したチャンネルだけが表示されます。各訪問者は自分のデータだけを見られ、アカウント記録は訪問者ごとに分離されています。",
      q10: "動画の再生数の1時間ごとの伸びを見られますか？",
      a10:
        "はい。毎時の同期で各クリップの測定値がもう1つ保存され、正確な再生数の時系列ができていきます。後でクリップの履歴を開けば、時間ごと・日ごとの成長を見られます。",
      q11: "ClipsTrackはTwitter/Xに対応していますか？",
      a11:
        "まだです。現在ClipsTrackが対応しているのはYouTubeショート、Instagramリール、TikTok動画のみです。Twitter/Xは未対応です。",
    },
    cta: { eyebrow: "準備はいいですか？", title: "追跡を始めましょう。" },
    footer: {
      after: "数字は常に省略なしで表示します。",
      meta: "セルフホスト · YouTube · Instagram · TikTok",
    },
    acct: {
      eyebrow: "マイアカウント",
      title: "追跡中のハンドル。",
      sub:
        "追跡中のアカウント — あなた専用です。動画の統計は正時に更新され、常に実数で、省略されることはありません。",
      dbError1: "データベースに接続できません — ",
      dbError2: " が起動中のPostgresを指していることを確認して、再読み込みしてください。",
    },
    add: {
      platform: "プラットフォーム",
      placeholder: "チャンネルを追加… 例：@mrbeast、@veritasium",
      old: "過去",
      latest: "最新",
      ratio: "比率%",
      submit: "+ 追加",
      adding: "追加中…",
      ariaHandles: "追跡するハンドル",
      ariaOld: "過去の動画数",
      ariaLatest: "最新の動画数",
      ariaRatio: "最小いいね比率（％・任意）",
      ratioTitle:
        "任意：いいね比率（いいね/再生数 ％）がこれを下回る動画に警告を付ける",
      helper:
        "ハンドルをカンマ区切りで入力します。選択したプラットフォームで各アカウントがまとめて追加されます。最初のスナップショットは即座に記録され、以後毎時間実行されます。同じハンドルを再追加すると、重複ではなく更新になります。各ハンドルに設定した比率%を下回ると、その動画に警告が付きます。",
    },
    sort: {
      label: "並び替え",
      published: "新しい順",
      views: "再生数が多い順",
      likes: "いいねが多い順",
      comments: "コメントが多い順",
    },
    layout: { horizontal: "横並び", vertical: "縦並び" },
    empty: {
      eyebrow: "アカウントがまだありません",
      title: "追跡中のアカウントがここに表示されます。",
      before: "最初のアカウントを ",
      link: "ここ",
      after: " で追加 — 最初の同期後に統計が表示され始めます。",
    },
    card: {
      refresh: "更新",
      edit: "編集",
      remove: "削除",
      save: "保存",
      saving: "保存中…",
      cancel: "キャンセル",
      latest: "最新",
      old: "過去",
      views: "再生数",
      likes: "いいね",
      comments: "コメント",
      syncing: "同期中…",
      noStats: "まだ統計がありません。",
      noVideos: "まだ動画がありません。",
      backfill:
        "最初の同期で直近の{old}本の動画をバックフィルし、以後は新着{latest}本を追跡します。",
      synced: "{t}前に同期",
      notSynced: "未同期",
      publishedOld: "{t}前",
      updated: "{t}前に更新",
      errCounts: "数は0〜200の整数でなければなりません。",
      errRatio: "最小いいね比率は0〜100にするか、空欄にしてください。",
      ariaRefresh: "@{user}を更新",
      ariaEdit: "@{user}の動画設定を編集",
      ariaRemove: "@{user}を削除",
      ratioBelow: "最小いいね比率{min}%未満",
      likeRatioTitle: "いいね比率 {ratio} は最小値{min}%を下回っています",
      imgViewsTitle:
        "Instagramは写真・カルーセル投稿には再生数を公開していません（リールのみ）",
      noViews: "再生数が利用できません",
      confirmRemove: "@{user}とその動画履歴を削除しますか？",
      oldCountLabel: "過去の動画数",
      oldCountHint: "一度だけバックフィルする直近の動画数",
      latestCountLabel: "最新の動画数",
      latestCountHint: "今後追跡する新着投稿数",
      ratioLabel: "最小比率%",
      ratioHint: "任意 — この比率未満の動画に警告",
    },
    fmt: { ago: "前", growthUnit: "/h" },
  },
  fr: {
    meta: {
      title: "Clips Track — Suivi de YouTube Shorts, Reels et TikTok",
      description:
        "Clips Track est un outil de suivi des clips YouTube Shorts, Reels Instagram et vidéos TikTok — vues, likes et commentaires chaque heure, en chiffres exacts.",
      ogTitle: "Clips Track — Suivi de YouTube Shorts, Reels et TikTok",
      ogDescription:
        "Suivez les vues, likes et commentaires de vos YouTube Shorts, Reels Instagram et vidéos TikTok — chaque heure, en chiffres exacts.",
      trackedTitle: "Mes comptes",
      trackedDescription:
        "Vos chaînes YouTube Shorts, Reels Instagram et TikTok suivies — privées et mises à jour toutes les heures.",
    },
    nav: {
      how: "Comment ça marche",
      accounts: "Mes comptes",
      add: "Ajouter une chaîne",
      themeDark: "Activer le mode sombre",
      themeLight: "Activer le mode clair",
      openMenu: "Ouvrir le menu",
      closeMenu: "Fermer le menu",
      lang: "Changer de langue",
    },
    hero: {
      eyebrow: "Suivi de clips multi-plateformes",
      titleBefore: "Des chiffres réels, pas des approximations arrondies",
      titleAfter: ".",
      subtitleBefore: "Ajoutez un compte YouTube, Instagram ou TikTok — ",
      subtitleAccent: "Clips Track",
      subtitleAfter:
        " enregistre chaque heure les vues, likes et commentaires de chaque clip, affichés en chiffres exacts.",
      add: "Ajouter une chaîne",
      view: "Voir mes comptes",
      platforms: "YouTube Shorts · Instagram Reels · TikTok",
    },
    about: {
      eyebrow: "À propos",
      title: "C'est quoi, Clips Track ?",
      p1:
        "Clips Track est un outil de suivi des clips conçu pour le contenu court. Ajoutez une chaîne YouTube Shorts, un créateur Instagram ou un compte TikTok, et Clips Track enregistre chaque heure la performance de chaque clip — vues, likes, commentaires et favoris, à l'heure pile. Pas de feuille de calcul à tenir, pas d'export manuel : vous ouvrez la page et voyez exactement ce qu'un clip a fait hier et ce qu'il fait à l'instant, jusqu'au chiffre près.",
      p2:
        "La plupart des tableaux de bord arrondissent tout en « 1,2 M » et « 400 K ». Clips Track fait délibérément l'inverse : il stocke chaque chiffre à sa valeur exacte pour que la comparaison reste toujours honnête. Peu importe comment vous l'appelez — suivi de clips, tracker vidéo ou outil de mesure de clips — l'idée est la même : des relevés horaires, précis et réguliers des vidéos courtes qui font bouger votre chaîne.",
    },
    rules: {
      eyebrow: "Règles par plateforme",
      title: "Suivez les bons clips sur chaque plateforme",
      ytTitle: "Suivi de YouTube Shorts",
      ytBody:
        "Clips Track ne stocke que les YouTube Shorts : des clips d'une minute maximum qui apparaissent dans le fil Shorts. Les vidéos longues ne se mêlent jamais aux chiffres, chaque carte de chaîne reste donc un vrai suivi de Shorts. Les vues, likes et commentaires proviennent directement de l'API YouTube Data et sont relevés à l'heure pile, ce qui vous donne un signal clair des Shorts qui performent vraiment.",
      igTitle: "Suivi des Reels Instagram",
      igBody:
        "Sur Instagram, Clips Track ne suit que les Reels. Les publications photo et les carrousels sont filtrés, car Instagram ne publie pas de compteur de vues pour eux — et Clips Track n'invente jamais de chiffres là où la plateforme n'en publie aucun. Chaque Reel garde son vrai nombre de vues, de likes et de commentaires, le suivi montre donc une croissance fiable.",
      ttTitle: "Suivi des vidéos TikTok",
      ttBody:
        "TikTok est une plateforme d'abord vidéo, et Clips Track le reste. Les posts en mode photo et les live en cours sont exclus ; seules les vidéos classiques avec une URL lisible sont suivies, avec leurs likes, commentaires et favoris. Résultat : un suivi TikTok concentré sur les clips qui comptent — pas une décharge de tout ce qu'un profil a jamais publié.",
    },
    why: {
      eyebrow: "Pourquoi ClipsTrack",
      title: "Des chiffres exacts, chaque heure",
      f1Title: "Relevés horaires",
      f1Body:
        "Un processus en arrière-plan relève les statistiques à l'heure pile, pour que vous regardiez vos clips grimper — jour après jour, chiffre après chiffre, sans lever le petit doigt.",
      f2Title: "Des chiffres exacts",
      f2Body:
        "Pas de « 1,2M » ou « 400K » au doigt mouillé. Les vues, likes et commentaires sont stockés et affichés à leur valeur exacte, à chaque fois.",
      f3Title: "Alertes de ratio",
      f3Body:
        "Définissez un ratio minimum de likes par chaîne ; les clips qui passent sous le seuil sont signalés, pour repérer d'un coup d'œil les performances faibles.",
      p1:
        "Pour suivre les vues de façon fiable, Clips Track stocke une série temporelle : une mesure par clip et par heure. Ouvrez un clip aujourd'hui et vous verrez encore ce qu'il a fait il y a un mois : le bond de la première heure sur un nouveau Reel, la lente montée matinale d'un Short, une vidéo TikTok qui repart soudainement plusieurs jours après. Comme l'historique est conservé en chiffres exacts, la courbe de croissance reste honnête et comparable, quel que soit le moment où vous la regardez.",
      p2:
        "Les chiffres par clip se couplent aux totaux de la chaîne — abonnés, vues cumulées et nombre de publications, relevés également chaque heure. C'est ce qui transforme des compteurs bruts en un vrai outil de suivi de clips : comparez la performance d'une nouvelle publication à la référence de la chaîne, repérez les formats qui gardent leur ratio de likes, et décidez où mérite d'aller la prochaine publication.",
    },
    buckets: {
      eyebrow: "Fenêtres",
      title: "Anciens clips récupérés, nouveaux clips suivis",
      sub1Title: "Comment fonctionnent les fenêtres",
      sub1Body:
        "Quand vous ajoutez un compte, Clips Track récupère d'abord les clips récents dans une fenêtre « Anciens » — un instantané unique du passé récent. Ensuite, une fenêtre « Récents » ne garde que les dernières publications, rafraîchie à chaque synchronisation horaire. L'appartenance d'un clip se décide par sa date de publication, jamais au hasard, et les clips ne changent jamais de fenêtre.",
      sub2Title: "Des limites à votre main",
      sub2Body:
        "Les tailles de fenêtre sont à vous par chaîne : récupérez les huit derniers clips et suivez les quatre plus récents, ou toute autre combinaison qui colle à votre façon de regarder. Baissez un nombre et les surplus sont retirés immédiatement ; augmentez-le et la fenêtre se rouvre pour se réajuster. Les clips retirés disparaissent proprement, historique compris, pour que le tableau reflète toujours ce que vous voulez vraiment suivre.",
      sub3Title: "À qui ça s'adresse",
      sub3Body:
        "Les créateurs qui veulent suivre leurs vues sans feuille de calcul. Les équipes croissance qui comparent Shorts, Reels et TikTok en une seule vue. Les agences qui rapportent des chiffres exacts à leurs clients. Et tous ceux qui ont déjà plissé les yeux devant un compteur arrondi en se demandant quel était le vrai chiffre. Ajoutez autant de chaînes que vous voulez — chacune garde ses fenêtres et ses alertes, le tableau évolue donc d'une seule compte à toute une liste.",
    },
    faq: {
      eyebrow: "FAQ",
      title: "Questions fréquentes",
      sub: "Des réponses rapides sur ce que Clips Track suit, sa fréquence de mise à jour et la gestion de vos données.",
      q1: "Qu'est-ce que ClipsTrack ?",
      a1:
        "ClipsTrack est un suivi de clips gratuit pour le contenu court. Ajoutez un compte YouTube, Instagram ou TikTok et il enregistre chaque heure la performance de chaque clip — vues, likes et commentaires — toujours en chiffres exacts. Il réunit YouTube Shorts, Reels Instagram et vidéos TikTok dans un seul tableau de bord.",
      q2: "Comment ClipsTrack suit-il les YouTube Shorts, les Reels Instagram et les vidéos TikTok ?",
      a2:
        "ClipsTrack récupère les YouTube Shorts directement depuis l'API officielle YouTube Data et ne garde que les clips de 60 secondes maximum — les vidéos longues ne se mélangent jamais. Sur Instagram, il ne suit que les Reels, en ignorant photos et carrousels. Sur TikTok, seules les vidéos classiques sont suivies, avec leurs likes, commentaires et favoris. Les statistiques de chaque plateforme sont relevées toutes les heures dans une série temporelle par clip.",
      q3: "ClipsTrack est-il gratuit ?",
      a3:
        "Oui — ClipsTrack est gratuit. Pas de plan payant, pas de frais par chaîne et rien n'est caché derrière un paywall.",
      q4: "À quelle fréquence ClipsTrack met-il à jour les statistiques ?",
      a4:
        "Les statistiques se mettent à jour toutes les heures. Le premier relevé est pris dès que vous ajoutez un compte, puis une synchro en arrière-plan rafraîchit vues, likes et commentaires toutes les heures.",
      q5: "Puis-je suivre n'importe quel compte public YouTube, Instagram ou TikTok ?",
      a5:
        "Oui — tout compte public sur les trois plateformes prises en charge peut être suivi. Les comptes privés ou restreints qui exigent une approbation ne peuvent pas être lus sans autorisation.",
      q6: "Dois-je me connecter pour utiliser ClipsTrack ?",
      a6:
        "Aucune connexion requise — il n'y a pas de système de comptes. Vos comptes suivis sont liés à un identifiant par visiteur conservé dans votre navigateur, vous pouvez donc commencer à ajouter des chaînes immédiatement.",
      q7: "Puis-je suivre les anciennes vidéos ou seulement les nouvelles ?",
      a7:
        "Les deux. Quand vous ajoutez une chaîne, ClipsTrack récupère d'abord les clips récents dans une fenêtre « Anciens », puis garde une fenêtre « Récents » pour les nouvelles publications. Vous choisissez le nombre de clips par fenêtre, pour chaque chaîne.",
      q8: "Combien de comptes puis-je suivre en même temps ?",
      a8:
        "Pas de limite fixe — ajoutez autant de comptes que nécessaire, par lots. Chaque chaîne garde ses propres comptes, sa mise en page et ses alertes.",
      q9: "Mes données de suivi sont-elles privées ?",
      a9:
        "Oui — le tableau n'affiche que les chaînes que vous avez ajoutées. Chaque visiteur voit ses propres données et les comptes sont isolés par visiteur.",
      q10: "Puis-je voir la croissance horaire des vues d'une vidéo ?",
      a10:
        "Oui. Chaque synchro horaire stocke une mesure de plus pour chaque clip, construisant une série temporelle de comptes précis. Ouvrez plus tard l'historique d'un clip et vous verrez sa croissance heure par heure et jour par jour.",
      q11: "ClipsTrack prend-il en charge Twitter/X ?",
      a11:
        "Pas encore — ClipsTrack suit actuellement les YouTube Shorts, les Reels Instagram et les vidéos TikTok. Twitter/X n'est pas pris en charge.",
    },
    cta: { eyebrow: "Prêt quand vous l'êtes", title: "Commencez à suivre." },
    footer: {
      after: "des chiffres toujours affichés en entier.",
      meta: "Auto-hébergé · YouTube · Instagram · TikTok",
    },
    acct: {
      eyebrow: "Mes comptes",
      title: "Les comptes que vous suivez.",
      sub:
        "Vos comptes suivis — privés. Les statistiques se mettent à jour à l'heure pile, toujours en chiffres exacts, jamais abrégés.",
      dbError1: "Impossible d'atteindre la base de données — vérifiez que ",
      dbError2: " pointe vers un Postgres en cours d'exécution, puis rechargez.",
    },
    add: {
      platform: "Plateforme",
      placeholder: "Ajouter des chaînes… ex. @mrbeast, @veritasium",
      old: "Anciens",
      latest: "Récents",
      ratio: "Ratio%",
      submit: "+ Ajouter",
      adding: "Ajout…",
      ariaHandles: "Comptes à suivre",
      ariaOld: "Nombre d'anciennes vidéos",
      ariaLatest: "Nombre des dernières vidéos",
      ariaRatio: "Ratio de likes minimum en %, optionnel",
      ratioTitle:
        "Optionnel : marquer les vidéos dont le ratio de likes (likes/vues %) passe sous ce seuil",
      helper:
        "Séparez les comptes par une virgule — chacun est ajouté sur la plateforme choisie, d'un coup. Le premier relevé démarre immédiatement, puis il est pris toutes les heures. Réajouter un compte le met à jour au lieu de le dupliquer. Un Ratio% défini par compte signale les vidéos à faible ratio de likes comme un avertissement.",
    },
    sort: {
      label: "Trier par",
      published: "Plus récents",
      views: "Plus de vues",
      likes: "Plus de likes",
      comments: "Plus de commentaires",
    },
    layout: { horizontal: "Horizontal", vertical: "Vertical" },
    empty: {
      eyebrow: "Aucun compte pour l'instant",
      title: "Vos comptes suivis apparaîtront ici.",
      before: "Ajoutez le premier compte ",
      link: "ici",
      after: " — les statistiques commencent à apparaître après la première synchronisation.",
    },
    card: {
      refresh: "Actualiser",
      edit: "Modifier",
      remove: "Supprimer",
      save: "Enregistrer",
      saving: "Enregistrement…",
      cancel: "Annuler",
      latest: "Récents",
      old: "Anciens",
      views: "Vues",
      likes: "Likes",
      comments: "Commentaires",
      syncing: "Synchronisation…",
      noStats: "Pas encore de statistiques.",
      noVideos: "Aucune vidéo suivie pour l'instant.",
      backfill:
        "La première synchronisation récupère les {old} vidéos les plus récentes, puis suit les {latest} plus récentes.",
      synced: "Synchronisé il y a {t}",
      notSynced: "Non synchronisé",
      publishedOld: "il y a {t}",
      updated: "mis à jour il y a {t}",
      errCounts: "Les comptes doivent être des nombres entiers entre 0 et 200.",
      errRatio:
        "Le ratio de likes minimum doit être entre 0 et 100, ou vide.",
      ariaRefresh: "Actualiser @{user}",
      ariaEdit: "Modifier les paramètres vidéo de @{user}",
      ariaRemove: "Supprimer @{user}",
      ratioBelow: "Ratio de likes sous le minimum de {min}%",
      likeRatioTitle:
        "Le ratio de likes {ratio} est sous le minimum de {min}%",
      imgViewsTitle:
        "Instagram ne publie pas de compteur de vues pour les photos/carousels — uniquement les reels",
      noViews: "Aucun compteur de vues disponible",
      confirmRemove: "Supprimer @{user} et son historique de vidéos ?",
      oldCountLabel: "Nombre d'anciennes vidéos",
      oldCountHint: "Vidéos récentes à récupérer une seule fois",
      latestCountLabel: "Nombre des dernières vidéos",
      latestCountHint: "Nouvelles publications à suivre",
      ratioLabel: "Ratio min %",
      ratioHint: "Optionnel — signale les vidéos sous ce ratio",
    },
    fmt: { ago: "il y a", growthUnit: "/h" },
  },
  de: {
    meta: {
      title: "Clips Track — Tracker für YouTube Shorts, Reels & TikTok",
      description:
        "Clips Track ist ein Performance-Tracker für YouTube Shorts, Instagram Reels und TikTok-Videos — Aufrufe, Likes und Kommentare stündlich, in exakten Zahlen.",
      ogTitle: "Clips Track — Tracker für YouTube Shorts, Reels & TikTok",
      ogDescription:
        "Verfolge Aufrufe, Likes und Kommentare von YouTube Shorts, Instagram Reels und TikTok-Videos — stündlich, in exakten Zahlen.",
      trackedTitle: "Meine Konten",
      trackedDescription:
        "Deine verfolgten YouTube-Shorts-, Instagram-Reels- und TikTok-Kanäle — privat und stündlich aktualisiert.",
    },
    nav: {
      how: "So funktioniert's",
      accounts: "Meine Konten",
      add: "Kanal hinzufügen",
      themeDark: "Zum dunklen Modus wechseln",
      themeLight: "Zum hellen Modus wechseln",
      openMenu: "Menü öffnen",
      closeMenu: "Menü schließen",
      lang: "Sprache ändern",
    },
    hero: {
      eyebrow: "Clip-Tracker für alle Plattformen",
      titleBefore: "Echte Zahlen, keine gerundeten Schätzungen",
      titleAfter: ".",
      subtitleBefore: "Füge einen YouTube-, Instagram- oder TikTok-Account hinzu — ",
      subtitleAccent: "Clips Track",
      subtitleAfter:
        " erfasst stündlich Aufrufe, Likes und Kommentare jedes Clips — in voller Zahl angezeigt.",
      add: "Kanal hinzufügen",
      view: "Meine Konten ansehen",
      platforms: "YouTube Shorts · Instagram Reels · TikTok",
    },
    about: {
      eyebrow: "Über uns",
      title: "Was ist Clips Track?",
      p1:
        "Clips Track ist ein Clip-Tracker für kurze Inhalte. Füge einen YouTube-Shorts-Kanal, einen Instagram-Creator oder ein TikTok-Konto hinzu, und Clips Track zeichnet stündlich, zur vollen Stunde, auf, wie sich jeder Clip entwickelt — Aufrufe, Likes, Kommentare und Favoriten. Keine Tabelle zum Pflegen, kein manueller Export: Du öffnest die Seite und siehst genau, was ein Clip gestern gemacht hat und was gerade jetzt passiert — bis auf die letzte Zahl.",
      p2:
        "Die meisten Dashboards runden alles auf „1,2 Mio.“ und „400 K“. Clips Track geht bewusst den umgekehrten Weg und speichert jeden Wert exakt, damit ein echter Vergleich immer möglich ist. Ob du es Clip-Tracking, Video-Tracker oder Clip-Analyse nennst — die Idee ist dieselbe: bewusste, exakte, stündliche Messungen der kurzen Videos, die deinen Kanal voranbringen.",
    },
    rules: {
      eyebrow: "Regeln je Plattform",
      title: "Verfolge auf jeder Plattform die richtigen Clips",
      ytTitle: "YouTube-Shorts-Tracker",
      ytBody:
        "Clips Track speichert ausschließlich YouTube Shorts — Clips von höchstens einer Minute, die im Shorts-Feed erscheinen. Lange Videos verfälschen die Zahlen nie, jede Kanalkarte bleibt also ein echter Shorts-Tracker. Aufrufe, Likes und Kommentare kommen direkt aus der YouTube Data API und werden zur vollen Stunde erfasst — ein sauberes Signal dafür, welche Shorts wirklich performen.",
      igTitle: "Instagram-Reels-Tracker",
      igBody:
        "Auf Instagram verfolgt Clips Track ausschließlich Reels. Normale Foto-Posts und Karussells werden herausgefiltert, weil Instagram für sie keine Aufrufzahlen veröffentlicht — und Clips Track erfindet niemals Zahlen, wo die Plattform keine nennt. Jedes Reel behält echte Aufrufe, Likes und Kommentare, sodass der Tracker Wachstum zeigt, dem man vertrauen kann.",
      ttTitle: "TikTok-Video-Tracker",
      ttBody:
        "TikTok ist eine videozentrierte Plattform, und Clips Track bleibt dabei. Foto-Posts und laufende Live-Streams werden ausgeschlossen; verfolgt werden nur normale Videos mit abspielbarem URL, samt Likes, Kommentaren und Favoriten. Das Ergebnis ist ein fokussierter TikTok-Video-Tracker der Clips, die zählen — kein Abklatsch von allem, was ein Profil je gepostet hat.",
    },
    why: {
      eyebrow: "Warum ClipsTrack",
      title: "Exakte Zahlen, stündlich",
      f1Title: "Stündliche Snapshots",
      f1Body:
        "Ein Hintergrundjob erfasst die Statistiken zur vollen Stunde — so siehst du deine Clips Tag für Tag klettern, Zahl für Zahl, ohne einen Finger zu rühren.",
      f2Title: "Exakte Zahlen",
      f2Body:
        "Keine 1,2M- oder 400K-Rateei. Aufrufe, Likes und Kommentare werden immer auf ihren exakten Wert gespeichert und angezeigt.",
      f3Title: "Verhältnis-Warnungen",
      f3Body:
        "Lege optional eine Mindest-Like-Quote pro Kanal fest; Clips darunter werden als Warnung markiert, sodass schwache Performance sofort auffällt.",
      p1:
        "Um Aufrufe zuverlässig zu verfolgen, speichert Clips Track eine Zeitreihe — eine Messung pro Clip und Stunde. Öffne heute einen Clip und du siehst noch immer, was er vor einem Monat gemacht hat: den ersten-Stunden-Sprung eines neuen Reels, das langsame morgendliche Klettern eines Shorts, ein TikTok-Video, das Tage später plötzlich wieder anzieht. Da die Historie in exakten Zahlen bleibt, ist die Wachstumskurve immer ehrlich und vergleichbar — egal wann du sie anschaust.",
      p2:
        "Die Zahlen pro Clip verbinden sich mit den Kanal-Totals — Follower, Gesamtaufrufe und Anzahl der Posts, ebenfalls stündlich erfasst. Genau das macht aus Rohzahlen einen echten Clip-Tracker: Du kannst vergleichen, wie ein neuer Post gegenüber der Kanal-Basis abschneidet, erkennen, welche Formate ihre Like-Quote halten, und entscheiden, wohin der nächste Post seinen Schwung verdient.",
    },
    buckets: {
      eyebrow: "Fenster",
      title: "Alte Clips nachgefüllt, neue Clips überwacht",
      sub1Title: "So funktionieren die Fenster",
      sub1Body:
        "Wenn du ein Konto hinzufügst, füllt Clips Track zuerst kürzliche Clips in ein „Alt“-Fenster — einen einmaligen Snapshot der jüngsten Vergangenheit. Danach hält ein „Neu“-Fenster nur die neuesten Uploads, aktualisiert bei jedem stündlichen Sync. Welcher Clip in welches Fenster gehört, entscheidet das Veröffentlichungsdatum, nie das Raten — und Clips wechseln nie zwischen Fenstern.",
      sub2Title: "Zahlen, die du kontrollierst",
      sub2Body:
        "Die Fenstergrößen bestimmst du pro Kanal: fülle die letzten acht Clips nach und verfolge die neuesten vier — oder jede andere Kombination, die zu deiner Art zu schauen passt. Verringerst du eine Zahl, werden die Extras sofort entfernt; erhöhst du sie, öffnet sich das Fenster neu und füllt entsprechend nach. Entfernte Clips werden sauber gelöscht, inklusive Verlauf, sodass das Dashboard immer zeigt, was du wirklich sehen willst.",
      sub3Title: "Für wen es gedacht ist",
      sub3Body:
        "Creator, die Aufrufe ohne Tabelle verfolgen wollen. Growth-Teams, die Shorts, Reels und TikTok in einer Ansicht vergleichen. Agenturen, die exakte Zahlen an Kunden melden. Und alle, die schon einmal auf einen gerundeten Zähler gestarrt haben und sich fragten, wie die echte Zahl lautet. Füge so wenige oder so viele Kanäle hinzu, wie du willst — jeder trägt seine eigenen Fenster und Warnungen, das Dashboard skaliert von einem einzigen Konto bis zur ganzen Riege.",
    },
    faq: {
      eyebrow: "FAQ",
      title: "Häufig gestellte Fragen",
      sub: "Schnelle Antworten dazu, was Clips Track verfolgt, wie oft es aktualisiert und wie deine Daten behandelt werden.",
      q1: "Was ist ClipsTrack?",
      a1:
        "ClipsTrack ist ein kostenloser Clip-Tracker für kurze Inhalte. Füge einen YouTube-, Instagram- oder TikTok-Account hinzu und er zeichnet stündlich auf, wie sich jeder Clip entwickelt — Aufrufe, Likes und Kommentare — immer in exakten Zahlen. Shorts, Reels und TikTok-Videos in einem Dashboard.",
      q2: "Wie verfolgt ClipsTrack YouTube Shorts, Instagram Reels und TikTok-Videos?",
      a2:
        "ClipsTrack holt YouTube Shorts direkt aus der offiziellen YouTube Data API und behält nur Clips bis 60 Sekunden — lange Videos vermischen sich nie. Auf Instagram verfolgt es nur Reels und überspringt Foto-Posts und Karussells. Auf TikTok werden nur normale Videos samt Likes, Kommentaren und Favoriten verfolgt. Die Statistiken jeder Plattform werden stündlich in eine Zeitreihe pro Clip übernommen.",
      q3: "Ist ClipsTrack kostenlos?",
      a3:
        "Ja — ClipsTrack ist kostenlos. Kein Bezahlplan, keine Gebühr pro Kanal und nichts steckt hinter einer Paywall.",
      q4: "Wie oft aktualisiert ClipsTrack die Statistiken?",
      a4:
        "Die Statistiken aktualisieren sich stündlich. Der erste Snapshot wird sofort nach dem Hinzufügen eines Kontos aufgenommen, danach aktualisiert ein Hintergrund-Sync stündlich Aufrufe, Likes und Kommentare.",
      q5: "Kann ich jedes öffentliche YouTube-, Instagram- oder TikTok-Konto verfolgen?",
      a5:
        "Ja — jedes öffentliche Konto auf den drei unterstützten Plattformen kann verfolgt werden. Private oder eingeschränkte Konten, die eine Genehmigung verlangen, sind ohne Autorisierung nicht lesbar.",
      q6: "Muss ich mich für ClipsTrack anmelden?",
      a6:
        "Kein Login nötig — es gibt kein Kontosystem. Deine verfolgten Konten sind an einen pro Besucher in deinem Browser gespeicherten Identifikator gekoppelt, so kannst du sofort Kanäle hinzufügen.",
      q7: "Kann ich alte Videos verfolgen oder nur neue Uploads?",
      a7:
        "Beides. Wenn du einen Kanal hinzufügst, füllt ClipsTrack zuerst kürzliche Clips in ein „Alt“-Fenster nach und hält dann ein „Neu“-Fenster für neue Uploads. Du wählst pro Kanal, wie viele Clips jedes Fenster fasst.",
      q8: "Wie viele Konten kann ich gleichzeitig verfolgen?",
      a8:
        "Keine feste Grenze — füge so viele Konten hinzu, wie du brauchst, in Stapeln. Jeder Kanal behält seine eigenen Zahlen, sein Layout und seine Warnungen.",
      q9: "Sind meine verfolgten Daten privat?",
      a9:
        "Ja — das Dashboard zeigt nur die Kanäle, die du hinzugefügt hast. Jeder Besucher sieht nur seine eigenen Daten und die Konten sind pro Besucher isoliert.",
      q10: "Kann ich das stündliche Wachstum der Aufrufe eines Videos sehen?",
      a10:
        "Ja. Jeder stündliche Sync speichert eine weitere Messung pro Clip und baut so eine Zeitreihe exakter Aufrufzahlen auf. Öffnest du später die Historie eines Clips, siehst du sein Wachstum Stunde für Stunde und Tag für Tag.",
      q11: "Unterstützt ClipsTrack Twitter/X?",
      a11:
        "Noch nicht — ClipsTrack verfolgt derzeit YouTube Shorts, Instagram Reels und TikTok-Videos. Twitter/X wird nicht unterstützt.",
    },
    cta: { eyebrow: "Bereit, wenn du es bist", title: "Starte das Tracking." },
    footer: {
      after: "Zahlen werden immer vollständig angezeigt.",
      meta: "Self-hosted · YouTube · Instagram · TikTok",
    },
    acct: {
      eyebrow: "Meine Konten",
      title: "Die Accounts, die du verfolgst.",
      sub:
        "Deine verfolgten Konten — privat. Die Statistiken aktualisieren sich zur vollen Stunde, immer in voller Zahl, nie abgekürzt.",
      dbError1: "Datenbank nicht erreichbar — prüfe, ob ",
      dbError2: " auf eine laufende Postgres-Instanz zeigt, und lade neu.",
    },
    add: {
      platform: "Plattform",
      placeholder: "Kanäle hinzufügen… z. B. @mrbeast, @veritasium",
      old: "Alt",
      latest: "Neu",
      ratio: "Ratio%",
      submit: "+ Hinzufügen",
      adding: "Wird hinzugefügt…",
      ariaHandles: "Zu verfolgende Accounts",
      ariaOld: "Anzahl alter Videos",
      ariaLatest: "Anzahl der neuesten Videos",
      ariaRatio: "Minimale Like-Quote in %, optional",
      ratioTitle:
        "Optional: Videos markieren, deren Like-Quote (Likes/Aufrufe %) darunter liegt",
      helper:
        "Trenne Accounts mit Kommas — jeder wird auf der gewählten Plattform auf einen Schlag hinzugefügt. Der erste Snapshot startet sofort, danach läuft er stündlich. Einen Account erneut hinzuzufügen aktualisiert ihn statt zu duplizieren. Eine pro Account gesetzte Ratio% markiert Videos mit niedrigerer Like-Quote als Warnung.",
    },
    sort: {
      label: "Sortieren nach",
      published: "Neueste zuerst",
      views: "Meiste Aufrufe",
      likes: "Meiste Likes",
      comments: "Meiste Kommentare",
    },
    layout: { horizontal: "Horizontal", vertical: "Vertikal" },
    empty: {
      eyebrow: "Noch keine Konten",
      title: "Deine verfolgten Konten erscheinen hier.",
      before: "Füge das erste Konto ",
      link: "hier",
      after: " hinzu — nach dem ersten Sync erscheinen die Statistiken.",
    },
    card: {
      refresh: "Aktualisieren",
      edit: "Bearbeiten",
      remove: "Entfernen",
      save: "Speichern",
      saving: "Speichern…",
      cancel: "Abbrechen",
      latest: "Neu",
      old: "Alt",
      views: "Aufrufe",
      likes: "Likes",
      comments: "Kommentare",
      syncing: "Wird synchronisiert…",
      noStats: "Noch keine Statistiken.",
      noVideos: "Noch keine Videos verfolgt.",
      backfill:
        "Der erste Sync füllt die {old} neuesten Videos nach, danach verfolgt er die {latest} neuesten.",
      synced: "Vor {t} synchronisiert",
      notSynced: "Noch nicht synchronisiert",
      publishedOld: "vor {t}",
      updated: "aktualisiert vor {t}",
      errCounts: "Die Zahlen müssen ganze Werte zwischen 0 und 200 sein.",
      errRatio:
        "Die Mindest-Like-Quote muss zwischen 0 und 100 liegen oder leer sein.",
      ariaRefresh: "@{user} aktualisieren",
      ariaEdit: "Videoeinstellungen von @{user} bearbeiten",
      ariaRemove: "@{user} entfernen",
      ratioBelow: "Unter der Mindest-Like-Quote von {min}%",
      likeRatioTitle: "Like-Quote {ratio} unter dem Minimum von {min}%",
      imgViewsTitle:
        "Instagram veröffentlicht für Foto-/Karussell-Posts keine Aufrufzahlen — nur bei Reels",
      noViews: "Keine Aufrufzahl verfügbar",
      confirmRemove: "@{user} samt Videoverlauf entfernen?",
      oldCountLabel: "Anzahl alter Videos",
      oldCountHint: "Neueste Videos, einmal nachgefüllt",
      latestCountLabel: "Anzahl der neuesten Videos",
      latestCountHint: "Neueste Uploads, künftig verfolgt",
      ratioLabel: "Mindest-Ratio %",
      ratioHint: "Optional — markiert Videos unter dieser Quote",
    },
    fmt: { ago: "vor", growthUnit: "/Std." },
  },
  pt: {
    meta: {
      title: "Clips Track — Rastreador de YouTube Shorts, Reels e TikTok",
      description:
        "O Clips Track é um rastreador de desempenho de clipes para YouTube Shorts, Reels do Instagram e vídeos do TikTok — visualizações, curtidas e comentários a cada hora, em números exatos.",
      ogTitle: "Clips Track — Rastreador de YouTube Shorts, Reels e TikTok",
      ogDescription:
        "Acompanhe visualizações, curtidas e comentários de YouTube Shorts, Reels do Instagram e vídeos do TikTok — por hora, em números exatos.",
      trackedTitle: "Minhas contas",
      trackedDescription:
        "Seus canais rastreados de YouTube Shorts, Reels do Instagram e TikTok — privados para você e atualizados a cada hora.",
    },
    nav: {
      how: "Como funciona",
      accounts: "Minhas contas",
      add: "Adicionar canal",
      themeDark: "Ativar modo escuro",
      themeLight: "Ativar modo claro",
      openMenu: "Abrir menu",
      closeMenu: "Fechar menu",
      lang: "Alterar idioma",
    },
    hero: {
      eyebrow: "Rastreador de clipes multiplataforma",
      titleBefore: "Números reais, não estimativas arredondadas",
      titleAfter: ".",
      subtitleBefore: "Adicione uma conta do YouTube, Instagram ou TikTok — ",
      subtitleAccent: "Clips Track",
      subtitleAfter:
        " registra a cada hora as visualizações, curtidas e comentários de cada clipe, exibidos em números exatos.",
      add: "Adicionar um canal",
      view: "Ver minhas contas",
      platforms: "YouTube Shorts · Instagram Reels · TikTok",
    },
    about: {
      eyebrow: "Sobre",
      title: "O que é o Clips Track?",
      p1:
        "O Clips Track é um rastreador de clipes feito para conteúdo curto. Adicione um canal de YouTube Shorts, um criador do Instagram ou uma conta do TikTok, e o Clips Track registra a cada hora, na hora certa, o desempenho de cada clipe — visualizações, curtidas, comentários e favoritos. Não há planilha para manter nem exportação manual: você abre a página e vê exatamente o que um clipe fez ontem e o que está fazendo agora, até o número exato.",
      p2:
        "A maioria dos painéis arredonda tudo para \"1,2 mi\" e \"400 mil\". O Clips Track faz deliberadamente o oposto: guarda cada número com o valor exato para que a comparação seja sempre real. Chame de rastreamento de clipes, tracker de vídeos ou análise de clipes — a ideia é a mesma: medições deliberadas, exatas e de hora em hora dos vídeos curtos que movem o seu canal.",
    },
    rules: {
      eyebrow: "Regras por plataforma",
      title: "Rastreie os clipes certos em cada plataforma",
      ytTitle: "Rastreador de YouTube Shorts",
      ytBody:
        "O Clips Track guarda apenas YouTube Shorts: clipes de no máximo um minuto que aparecem no feed de Shorts. Vídeos longos nunca entram nos números, então cada cartão de canal é um verdadeiro rastreador de Shorts. Visualizações, curtidas e comentários vêm direto da API de dados do YouTube e são capturados na hora certa, dando a você um sinal claro de quais Shorts realmente performam.",
      igTitle: "Rastreador de Reels do Instagram",
      igBody:
        "No Instagram, o Clips Track acompanha apenas Reels. Fotos e carrosséis comuns são filtrados, porque o Instagram não publica contagem de visualizações para eles — e o Clips Track nunca inventa números onde a plataforma não publica nenhum. Cada Reel mantém suas reproduções, curtidas e comentários reais, então o rastreador mostra um crescimento em que você pode confiar.",
      ttTitle: "Rastreador de vídeos do TikTok",
      ttBody:
        "O TikTok é uma plataforma centrada em vídeo, e o Clips Track mantém isso. Posts em modo foto e lives ativas são excluídos; apenas vídeos comuns com URLs reproduzíveis são rastreados, junto com suas curtidas, comentários e favoritos. O resultado é um rastreador de vídeos do TikTok focado nos clipes que importam — não um despejo de tudo que um perfil já publicou.",
    },
    why: {
      eyebrow: "Por que o ClipsTrack",
      title: "Números exatos, a cada hora",
      f1Title: "Capturas a cada hora",
      f1Body:
        "Um processo em segundo plano captura as estatísticas na hora certa, para você ver seus clipes subirem — dia após dia, número após número, sem esforço.",
      f2Title: "Números exatos",
      f2Body:
        "Nada de chutar 1,2 mi ou 400 mil. Visualizações, curtidas e comentários são guardados e exibidos com o valor exato, sempre.",
      f3Title: "Alertas de proporção",
      f3Body:
        "Defina uma proporção mínima opcional de curtidas por canal; clipes abaixo do limite são sinalizados, para o baixo desempenho saltar aos olhos.",
      p1:
        "Para rastrear visualizações com confiabilidade, o Clips Track guarda uma série temporal: uma medição por clipe e por hora. Abra um clipe hoje e você ainda verá o que ele fez há um mês: o salto da primeira hora em um Reel novo, a lenta subida matinal de um Short, um vídeo do TikTok que dispara de novo dias depois. Como o histórico fica em números exatos, a curva de crescimento continua honesta e comparável, não importa quando você a consulte.",
      p2:
        "Os números por clipe se somam aos totais do canal — seguidores, visualizações acumuladas e número de publicações, também capturados a cada hora. É isso que transforma contagens brutas em um verdadeiro rastreador de desempenho de clipes: você compara como uma nova publicação performa em relação ao canal, identifica quais formatos mantêm a proporção de curtidas e decide para onde a próxima publicação merece ir.",
    },
    buckets: {
      eyebrow: "Janelas",
      title: "Clipes antigos preenchidos, clipes novos acompanhados",
      sub1Title: "Como funcionam as janelas",
      sub1Body:
        "Quando você adiciona uma conta, o Clips Track primeiro preenche os clipes recentes em uma janela \"Antigos\" — um instantâneo único do passado recente. Em seguida, uma janela \"Novos\" mantém apenas as publicações mais recentes, atualizada a cada sincronização horária. Qual clipe pertence a qual janela é decidido pela data de publicação, nunca por chute, e os clipes nunca pulam entre janelas.",
      sub2Title: "Limites que você controla",
      sub2Body:
        "Os tamanhos das janelas são escolhidos por canal: preencha os últimos oito clipes e acompanhe os quatro mais novos, ou qualquer combinação que combine com seu jeito de assistir. Se você reduzir um número, os extras são removidos na hora; se aumentar, a janela reabre e preenche para acompanhar. Clipes removidos são excluídos limpos, histórico junto, para o painel sempre refletir o que você realmente quer assistir.",
      sub3Title: "Para quem é",
      sub3Body:
        "Criadores que querem acompanhar visualizações sem planilha. Times de crescimento que comparam Shorts, Reels e TikTok em uma única visão. Agências que reportam números exatos aos clientes. E qualquer pessoa que já tenha apertado os olhos para um contador arredondado pensando qual seria o número real. Adicione quantos canais quiser — cada um tem suas janelas e alertas, então o painel cresce de uma única conta a um elenco inteiro.",
    },
    faq: {
      eyebrow: "FAQ",
      title: "Perguntas frequentes",
      sub: "Respostas rápidas sobre o que o Clips Track rastreia, com que frequência atualiza e como seus dados são tratados.",
      q1: "O que é o ClipsTrack?",
      a1:
        "O ClipsTrack é um rastreador de clipes gratuito para conteúdo curto. Adicione uma conta do YouTube, Instagram ou TikTok e ele registra a cada hora o desempenho de cada clipe — visualizações, curtidas e comentários — sempre em números exatos. Ele reúne YouTube Shorts, Reels do Instagram e vídeos do TikTok em um só painel.",
      q2: "Como o ClipsTrack rastreia YouTube Shorts, Reels do Instagram e vídeos do TikTok?",
      a2:
        "O ClipsTrack puxa os YouTube Shorts direto da API oficial de dados do YouTube e guarda apenas clipes de até 60 segundos — vídeos longos nunca se misturam. No Instagram, ele rastreia apenas Reels, ignorando fotos e carrosséis. No TikTok, apenas vídeos comuns são rastreados, com suas curtidas, comentários e favoritos. As estatísticas de cada plataforma são capturadas de hora em hora em uma série temporal por clipe.",
      q3: "O ClipsTrack é gratuito?",
      a3:
        "Sim — o ClipsTrack é gratuito. Não há plano pago, nem taxa por canal e nada fica escondido atrás de um paywall.",
      q4: "Com que frequência o ClipsTrack atualiza as estatísticas?",
      a4:
        "As estatísticas são atualizadas a cada hora. A primeira captura é tirada assim que você adiciona uma conta; depois, uma sincronização em segundo plano renova visualizações, curtidas e comentários de hora em hora.",
      q5: "Posso rastrear qualquer conta pública do YouTube, Instagram ou TikTok?",
      a5:
        "Sim — qualquer conta pública nas três plataformas compatíveis pode ser rastreada. Contas privadas ou restritas que exigem aprovação não podem ser lidas sem autorização.",
      q6: "Preciso fazer login para usar o ClipsTrack?",
      a6:
        "Não é preciso fazer login — não há sistema de contas. Suas contas rastreadas estão ligadas a um identificador por visitante salvo no seu navegador, então você pode começar a adicionar canais imediatamente.",
      q7: "Posso rastrear vídeos antigos ou só publicações novas?",
      a7:
        "Ambos. Quando você adiciona um canal, o ClipsTrack primeiro preenche os clipes recentes em uma janela \"Antigos\" e depois mantém uma janela \"Novos\" para novas publicações. Você escolhe quantos clipes cada janela guarda, por canal.",
      q8: "Quantas contas posso rastrear ao mesmo tempo?",
      a8:
        "Não há limite fixo — adicione quantas contas precisar, em lotes. Cada canal mantém seus próprios números, layout e alertas.",
      q9: "Meus dados rastreados são privados?",
      a9:
        "Sim — o painel mostra apenas os canais que você adicionou. Cada visitante vê seus próprios dados e os registros de conta são isolados por visitante.",
      q10: "Posso ver o crescimento por hora das visualizações de um vídeo?",
      a10:
        "Sim. Cada sincronização horária guarda mais uma medição de cada clipe, construindo uma série temporal de contagens exatas. Abra o histórico de um clipe depois e veja seu crescimento hora a hora e dia a dia.",
      q11: "O ClipsTrack é compatível com Twitter/X?",
      a11:
        "Ainda não — o ClipsTrack atualmente rastreia YouTube Shorts, Reels do Instagram e vídeos do TikTok. Twitter/X não é compatível.",
    },
    cta: { eyebrow: "Pronto quando você estiver", title: "Comece a rastrear." },
    footer: {
      after: "números sempre exibidos por completo.",
      meta: "Autogerenciado · YouTube · Instagram · TikTok",
    },
    acct: {
      eyebrow: "Minhas contas",
      title: "As contas que você rastreia.",
      sub:
        "Suas contas rastreadas — privadas para você. As estatísticas são atualizadas na hora certa, sempre em números exatos, nunca abreviados.",
      dbError1: "Não foi possível acessar o banco de dados — verifique se ",
      dbError2: " aponta para um Postgres em execução e recarregue.",
    },
    add: {
      platform: "Plataforma",
      placeholder: "Adicionar canais… ex.: @mrbeast, @veritasium",
      old: "Antigos",
      latest: "Novos",
      ratio: "Proporção%",
      submit: "+ Adicionar",
      adding: "Adicionando…",
      ariaHandles: "Contas para rastrear",
      ariaOld: "Número de vídeos antigos",
      ariaLatest: "Número de vídeos novos",
      ariaRatio: "Porcentagem mínima da proporção de curtidas, opcional",
      ratioTitle:
        "Opcional: marca os vídeos cuja proporção de curtidas (curtidas/visualizações %) fique abaixo disso",
      helper:
        "Separe as contas com vírgulas — cada uma é adicionada na plataforma escolhida, de uma vez. A primeira captura começa imediatamente e depois ocorre a cada hora. Re-adicionar uma conta a atualiza em vez de duplicar. Uma Proporção% definida por conta sinaliza vídeos com menor proporção de curtidas como um aviso.",
    },
    sort: {
      label: "Ordenar por",
      published: "Mais novos primeiro",
      views: "Mais visualizações",
      likes: "Mais curtidas",
      comments: "Mais comentários",
    },
    layout: { horizontal: "Horizontal", vertical: "Vertical" },
    empty: {
      eyebrow: "Ainda sem contas",
      title: "Suas contas rastreadas aparecerão aqui.",
      before: "Adicione a primeira conta ",
      link: "aqui",
      after: " — as estatísticas começam a aparecer após a primeira sincronização.",
    },
    card: {
      refresh: "Atualizar",
      edit: "Editar",
      remove: "Remover",
      save: "Salvar",
      saving: "Salvando…",
      cancel: "Cancelar",
      latest: "Novos",
      old: "Antigos",
      views: "Visualizações",
      likes: "Curtidas",
      comments: "Comentários",
      syncing: "Sincronizando…",
      noStats: "Ainda sem estatísticas.",
      noVideos: "Ainda não há vídeos rastreados.",
      backfill:
        "A primeira sincronização preenche os {old} vídeos mais recentes e depois rastreia os {latest} mais novos.",
      synced: "Sincronizado há {t}",
      notSynced: "Ainda não sincronizado",
      publishedOld: "há {t}",
      updated: "atualizado há {t}",
      errCounts: "Os números devem ser inteiros entre 0 e 200.",
      errRatio:
        "A proporção mínima de curtidas deve estar entre 0 e 100, ou ficar vazia.",
      ariaRefresh: "Atualizar @{user}",
      ariaEdit: "Editar as configurações de vídeo de @{user}",
      ariaRemove: "Remover @{user}",
      ratioBelow: "Abaixo da proporção mínima de {min}% de curtidas",
      likeRatioTitle:
        "A proporção de curtidas {ratio} está abaixo do mínimo de {min}%",
      imgViewsTitle:
        "O Instagram não expõe a contagem de visualizações para fotos/carrosséis — apenas reels",
      noViews: "Nenhuma contagem de visualizações disponível",
      confirmRemove: "Remover @{user} e o histórico de vídeos?",
      oldCountLabel: "Nº de vídeos antigos",
      oldCountHint: "Vídeos recentes a preencher uma vez",
      latestCountLabel: "Nº de vídeos novos",
      latestCountHint: "Novas publicações a acompanhar",
      ratioLabel: "Prop. mín %",
      ratioHint: "Opcional — sinaliza vídeos abaixo desta proporção",
    },
    fmt: { ago: "há", growthUnit: "/h" },
  },
  ko: {
    meta: {
      title: "Clips Track — YouTube Shorts·릴스·TikTok 트래커",
      description:
        "Clips Track는 YouTube Shorts, Instagram Reels, TikTok 동영상의 성과를 추적하는 도구입니다. 조회수·좋아요·댓글을 매시간 온전한 숫자로 기록합니다.",
      ogTitle: "Clips Track — YouTube Shorts·릴스·TikTok 트래커",
      ogDescription:
        "YouTube Shorts, Instagram Reels, TikTok 동영상의 조회수·좋아요·댓글을 매시간 온전한 숫자로 추적하세요.",
      trackedTitle: "내 계정",
      trackedDescription:
        "추적 중인 YouTube Shorts, Instagram Reels, TikTok 채널 — 나만 볼 수 있고 매시간 업데이트됩니다.",
    },
    nav: {
      how: "사용 방법",
      accounts: "내 계정",
      add: "채널 추가",
      themeDark: "다크 모드로 전환",
      themeLight: "라이트 모드로 전환",
      openMenu: "메뉴 열기",
      closeMenu: "메뉴 닫기",
      lang: "언어 변경",
    },
    hero: {
      eyebrow: "멀티플랫폼 클립 트래커",
      titleBefore: "반올림된 추측이 아닌, 실제 숫자",
      titleAfter: ".",
      subtitleBefore: "YouTube, Instagram, TikTok 계정을 추가하세요 — ",
      subtitleAccent: "Clips Track",
      subtitleAfter:
        " 가 매시간 각 클립의 조회수·좋아요·댓글을 온전한 숫자로 기록합니다.",
      add: "채널 추가",
      view: "내 계정 보기",
      platforms: "YouTube Shorts · Instagram Reels · TikTok",
    },
    about: {
      eyebrow: "소개",
      title: "Clips Track란 무엇인가요?",
      p1:
        "Clips Track는 숏폼 콘텐츠를 위한 클립 트래커입니다. YouTube Shorts 채널, Instagram 크리에이터, TikTok 계정을 추가하면 각 클립의 성과(조회수·좋아요·댓글·즐겨찾기)를 매시간 정시에 기록합니다. 스프레드시트 관리도, 수동 내보내기도 필요 없습니다. 페이지를 열면 어제의 성과와 지금의 성과를 정확한 숫자 그대로 확인할 수 있습니다.",
      p2:
        "대부분의 분석 대시보드는 모든 숫자를 '120만', '40만'처럼 반올림합니다. Clips Track는 의도적으로 정반대 방향을 택해 모든 수치를 정확한 값 그대로 저장하므로, 언제나 진짜 비교가 가능합니다. 클립 추적, 동영상 트래커, 클립 성과 분석 — 무엇이라 불러도 아이디어는 같습니다. 채널을 성장시키는 숏폼 동영상을 꼼꼼하고 정확하게, 매시간 측정하는 것입니다.",
    },
    rules: {
      eyebrow: "플랫폼별 규칙",
      title: "각 플랫폼에서 정확한 클립만 추적하세요",
      ytTitle: "YouTube Shorts 트래커",
      ytBody:
        "Clips Track는 YouTube Shorts만 저장합니다. Shorts 피드에 표시되는 최대 1분짜리 클립만요. 긴 영상이 수치에 섞이는 일은 절대 없으므로 각 채널 카드는 진정한 Shorts 트래커로 동작합니다. 조회수·좋아요·댓글은 YouTube Data API에서 직접 가져와 정시에 스냅샷되므로, 어떤 Shorts가 실제로 반응을 얻는지 깔끔하게 확인할 수 있습니다.",
      igTitle: "Instagram 릴스 트래커",
      igBody:
        "Instagram에서는 Clips Track가 릴스만 추적합니다. 일반 사진 게시물과 캐러셀은 제외됩니다. 제외되는 이유는 Instagram이 이들에 대한 조회수를 공개하지 않기 때문이며, Clips Track는 플랫폼이 숫자를 내놓지 않는 곳에 숫자를 만들어내지 않습니다. 모든 릴스는 실제 재생수·좋아요·댓글을 그대로 유지하므로, 믿을 수 있는 성장을 보여줍니다.",
      ttTitle: "TikTok 동영상 트래커",
      ttBody:
        "TikTok은 영상 중심 플랫폼이며, Clips Track도 그 원칙을 지킵니다. 사진 모드 게시물과 진행 중인 라이브는 제외하고, 재생 가능한 URL이 있는 일반 동영상만 좋아요·댓글·즐겨찾기와 함께 추적합니다. 그 결과는 프로필이 게시한 모든 항목의 덤프가 아니라, 정말 중요한 클립에 집중된 TikTok 동영상 트래커입니다.",
    },
    why: {
      eyebrow: "ClipsTrack를 선택하는 이유",
      title: "매시간, 온전한 숫자로",
      f1Title: "매시간 스냅샷",
      f1Body:
        "백그라운드 작업이 정시에 통계를 기록하므로, 별다른 노력 없이 클립이 날마다 숫자로 성장하는 모습을 지켜볼 수 있습니다.",
      f2Title: "온전한 숫자",
      f2Body:
        "120만, 40만 같은 어림수가 없습니다. 조회수·좋아요·댓글은 언제나 정확한 값 그대로 저장되고 표시됩니다.",
      f3Title: "비율 알림",
      f3Body:
        "채널별로 최소 좋아요 비율을 선택적으로 설정할 수 있습니다. 기준을 밑도는 클립은 경고로 표시되어 부진한 성과가 한눈에 드러납니다.",
      p1:
        "조회수를 신뢰성 있게 추적하기 위해 Clips Track는 시계열을 저장합니다 — 클립당 매시간 한 번씩 측정합니다. 오늘 클립을 열어도 한 달 전의 기록을 볼 수 있습니다. 새 릴스의 첫 시간 급등, Shorts의 아침 느린 성장, 며칠 뒤 갑자기 다시 빨라지는 TikTok 동영상까지. 기록이 정확한 숫자로 보존되므로 성장 곡선은 언제 보든 솔직하고 비교 가능합니다.",
      p2:
        "클립별 수치가 채널 전체 합계(팔로워, 누적 조회수, 게시물 수)와 함께 표시되며, 이것도 매시간 스냅샷됩니다. 이것이야말로 단순 수치를 진짜 클립 성과 트래커로 바꾸는 요소입니다. 새 게시물이 채널 기준선 대비 어떻게 성과를 내는지 비교하고, 어떤 형식이 좋아요 비율을 유지하는지 파악한 뒤, 다음 게시물의 무게를 어디에 둘지 결정할 수 있습니다.",
    },
    buckets: {
      eyebrow: "윈도우",
      title: "오래된 클립은 채우고, 새 클립은 지켜보기",
      sub1Title: "윈도우는 어떻게 작동하나요?",
      sub1Body:
        "계정을 추가하면 Clips Track는 먼저 최근 클립을 '이전' 윈도우에 백필합니다 — 최근 과거의 일회성 스냅샷입니다. 이후에는 '최신' 윈도우가 최신 게시물만 매시간 동기화로 갱신하며 유지합니다. 어떤 클립이 어느 윈도우에 속할지는 추측이 아닌 게시 날짜로 결정되며, 클립이 윈도우 사이를 옮겨 다니는 일은 없습니다.",
      sub2Title: "내가 정하는 수치",
      sub2Body:
        "윈도우 크기는 채널별로 직접 정합니다. 최근 8개의 클립을 백필하고 최신 4개를 추적하든, 자신의 시청 방식에 맞는 어떤 조합이든 가능합니다. 숫자를 낮추면 초과분이 즉시 제거되고, 올리면 윈도우가 다시 열려 그에 맞게 백필됩니다. 제외된 클립은 기록까지 깔끔하게 삭제되므로 대시보드는 항상 실제로 보고 싶은 내용만 반영합니다.",
      sub3Title: "누가 쓰면 좋은가요?",
      sub3Body:
        "스프레드시트 없이 조회수를 추적하고 싶은 크리에이터, Shorts·릴스·TikTok을 한 화면에서 비교하는 성장 팀, 고객에게 정확한 숫자를 보고해야 하는 에이전시, 그리고 반올림된 조회수를 보며 실제 숫자가 뭐였을지 궁금해한 적 있는 모든 사람. 원하는 만큼 채널을 추가하세요. 각 채널이 자신만의 윈도우와 알림을 갖기 때문에, 대시보드는 단일 계정부터 전체 목록까지 자연스럽게 확장됩니다.",
    },
    faq: {
      eyebrow: "FAQ",
      title: "자주 묻는 질문",
      sub: "Clips Track가 무엇을 추적하는지, 얼마나 자주 업데이트되는지, 데이터가 어떻게 처리되는지에 대한 빠른 답변입니다.",
      q1: "ClipsTrack란 무엇인가요?",
      a1:
        "ClipsTrack는 숏폼 콘텐츠를 위한 무료 클립 트래커입니다. YouTube, Instagram, TikTok 계정을 추가하면 각 클립의 성과(조회수·좋아요·댓글)를 매시간, 항상 온전한 숫자로 기록합니다. YouTube Shorts, Instagram Reels, TikTok 동영상을 하나의 대시보드로 모아줍니다.",
      q2: "ClipsTrack는 YouTube Shorts, Instagram Reels, TikTok 동영상을 어떻게 추적하나요?",
      a2:
        "ClipsTrack는 YouTube 공식 Data API에서 Shorts를 직접 가져와 최대 60초 클립만 저장합니다. 긴 영상이 섞일 일은 없습니다. Instagram에서는 사진 게시물과 캐러셀을 건너뛰고 릴스만 추적합니다. TikTok에서는 좋아요·댓글·즐겨찾기와 함께 일반 동영상만 추적합니다. 각 플랫폼의 통계는 매시간 클립별 시계열로 스냅샷됩니다.",
      q3: "ClipsTrack는 무료인가요?",
      a3:
        "네, ClipsTrack는 무료입니다. 유료 요금제도, 채널당 요금도 없고 페이월 뒤에 숨겨진 것도 없습니다.",
      q4: "ClipsTrack는 통계를 얼마나 자주 업데이트하나요?",
      a4:
        "통계는 매시간 업데이트됩니다. 첫 스냅샷은 계정을 추가하는 즉시 기록되며, 이후 백그라운드 동기화가 매시간 조회수·좋아요·댓글을 갱신합니다.",
      q5: "공개된 YouTube, Instagram, TikTok 계정은 모두 추적할 수 있나요?",
      a5:
        "네. 지원되는 세 플랫폼의 공개 계정은 모두 추적할 수 있습니다. 승인이 필요한 비공개 또는 제한 계정은 인증 없이는 읽을 수 없습니다.",
      q6: "ClipsTrack를 사용하려면 로그인이 필요한가요?",
      a6:
        "로그인은 필요 없습니다. 계정 시스템 자체가 없습니다. 추적 중인 계정은 브라우저에 저장된 방문자별 식별자에 연결되므로, 바로 채널 추가를 시작할 수 있습니다.",
      q7: "오래된 동영상도 추적할 수 있나요, 아니면 새 게시물만 되나요?",
      a7:
        "둘 다 됩니다. 채널을 추가하면 ClipsTrack는 먼저 최근 클립을 '이전' 윈도우에 백필하고, 이후 '최신' 윈도우에서 새 게시물을 유지합니다. 각 윈도우에 몇 개의 클립을 담을지는 채널별로 정할 수 있습니다.",
      q8: "한 번에 계정을 몇 개까지 추적할 수 있나요?",
      a8:
        "고정된 제한이 없습니다. 필요한 만큼 계정을 일괄로 추가하세요. 각 채널은 자체 수치, 레이아웃, 알림 설정을 유지합니다.",
      q9: "추적 데이터는 나만 볼 수 있나요?",
      a9:
        "네. 대시보드에는 직접 추가한 채널만 표시됩니다. 각 방문자는 자신의 데이터만 볼 수 있으며 계정 기록은 방문자별로 분리됩니다.",
      q10: "동영상 조회수의 시간별 증가를 볼 수 있나요?",
      a10:
        "네. 매시간 동기화가 각 클립의 측정값을 하나씩 더 저장하며 정확한 조회수의 시계열을 만듭니다. 나중에 클립 기록을 열면 시간별, 날짜별 성장을 볼 수 있습니다.",
      q11: "ClipsTrack는 Twitter/X를 지원하나요?",
      a11:
        "아직입니다. ClipsTrack는 현재 YouTube Shorts, Instagram Reels, TikTok 동영상을 추적합니다. Twitter/X는 지원하지 않습니다.",
    },
    cta: { eyebrow: "준비되셨나요?", title: "추적을 시작하세요." },
    footer: {
      after: "숫자는 항상 온전하게 표시됩니다.",
      meta: "자체 호스팅 · YouTube · Instagram · TikTok",
    },
    acct: {
      eyebrow: "내 계정",
      title: "추적 중인 계정들.",
      sub:
        "추적 중인 계정 — 나만 볼 수 있습니다. 동영상 통계는 정시에 업데이트되며, 항상 온전한 숫자로, 줄임말 없이 표시됩니다.",
      dbError1: "데이터베이스에 연결할 수 없습니다 — ",
      dbError2: " 가 실행 중인 Postgres를 가리키는지 확인하고 새로고침하세요.",
    },
    add: {
      platform: "플랫폼",
      placeholder: "채널 추가… 예: @mrbeast, @veritasium",
      old: "이전",
      latest: "최신",
      ratio: "비율%",
      submit: "+ 추가",
      adding: "추가 중…",
      ariaHandles: "추적할 계정",
      ariaOld: "이전 동영상 수",
      ariaLatest: "최신 동영상 수",
      ariaRatio: "최소 좋아요 비율(%) - 선택 사항",
      ratioTitle:
        "선택 사항: 좋아요 비율(좋아요/조회수 %)이 이 값 미만인 동영상에 경고 표시",
      helper:
        "계정을 쉼표로 구분하면 선택한 플랫폼에 한 번에 모두 추가됩니다. 첫 스냅샷은 즉시 시작되고 이후 매시간 실행됩니다. 같은 계정을 다시 추가하면 중복이 아니라 업데이트됩니다. 계정별 비율%를 설정하면 좋아요 비율이 낮은 동영상이 경고로 표시됩니다.",
    },
    sort: {
      label: "정렬 기준",
      published: "최신순",
      views: "조회수 많은 순",
      likes: "좋아요 많은 순",
      comments: "댓글 많은 순",
    },
    layout: { horizontal: "가로", vertical: "세로" },
    empty: {
      eyebrow: "아직 계정이 없습니다",
      title: "추적한 계정이 여기에 표시됩니다.",
      before: "첫 계정을 ",
      link: "여기",
      after: " 에서 추가하세요 — 첫 동기화 후 통계가 표시되기 시작합니다.",
    },
    card: {
      refresh: "새로고침",
      edit: "편집",
      remove: "삭제",
      save: "저장",
      saving: "저장 중…",
      cancel: "취소",
      latest: "최신",
      old: "이전",
      views: "조회수",
      likes: "좋아요",
      comments: "댓글",
      syncing: "동기화 중…",
      noStats: "아직 통계가 없습니다.",
      noVideos: "아직 추적된 동영상이 없습니다.",
      backfill:
        "첫 동기화에서 최근 {old}개의 동영상을 백필하고, 이후 최신 {latest}개를 추적합니다.",
      synced: "{t} 전 동기화",
      notSynced: "아직 동기화 안 됨",
      publishedOld: "{t} 전",
      updated: "{t} 전 업데이트",
      errCounts: "수치는 0~200 사이의 정수여야 합니다.",
      errRatio: "최소 좋아요 비율은 0~100 사이거나 비워 두어야 합니다.",
      ariaRefresh: "@{user} 새로고침",
      ariaEdit: "@{user}의 동영상 설정 편집",
      ariaRemove: "@{user} 삭제",
      ratioBelow: "최소 좋아요 비율 {min}% 미만",
      likeRatioTitle: "좋아요 비율 {ratio}가 최소 {min}% 미만입니다",
      imgViewsTitle:
        "Instagram은 사진/캐러셀 게시물의 조회수를 공개하지 않습니다 — 릴스만 가능",
      noViews: "조회수를 사용할 수 없습니다",
      confirmRemove: "@{user}와 동영상 기록을 삭제할까요?",
      oldCountLabel: "이전 동영상 수",
      oldCountHint: "한 번 백필할 최근 동영상 수",
      latestCountLabel: "최신 동영상 수",
      latestCountHint: "앞으로 추적할 최신 게시물 수",
      ratioLabel: "최소 비율%",
      ratioHint: "선택 사항 — 이 비율 미만인 동영상에 경고",
    },
    fmt: { ago: "전", growthUnit: "/h" },
  },
  it: {
    meta: {
      title: "Clips Track — Tracker per YouTube Shorts, Reels e TikTok",
      description:
        "Clips Track è un tracker delle performance di YouTube Shorts, Reels di Instagram e video TikTok: visualizzazioni, like e commenti ogni ora, in numeri esatti.",
      ogTitle: "Clips Track — Tracker per YouTube Shorts, Reels e TikTok",
      ogDescription:
        "Tieni traccia di visualizzazioni, like e commenti di YouTube Shorts, Reels di Instagram e video TikTok — ogni ora, in numeri esatti.",
      trackedTitle: "I miei account",
      trackedDescription:
        "I tuoi canali YouTube Shorts, Instagram Reels e TikTok tracciati — privati e aggiornati ogni ora.",
    },
    nav: {
      how: "Come funziona",
      accounts: "I miei account",
      add: "Aggiungi canale",
      themeDark: "Passa alla modalità scura",
      themeLight: "Passa alla modalità chiara",
      openMenu: "Apri menu",
      closeMenu: "Chiudi menu",
      lang: "Cambia lingua",
    },
    hero: {
      eyebrow: "Tracker di clip multi-piattaforma",
      titleBefore: "Numeri reali, non stime arrotondate",
      titleAfter: ".",
      subtitleBefore: "Aggiungi un account YouTube, Instagram o TikTok — ",
      subtitleAccent: "Clips Track",
      subtitleAfter:
        " registra ogni ora visualizzazioni, like e commenti di ogni clip, mostrati in numeri esatti.",
      add: "Aggiungi un canale",
      view: "Vedi i miei account",
      platforms: "YouTube Shorts · Instagram Reels · TikTok",
    },
    about: {
      eyebrow: "Chi siamo",
      title: "Cos'è Clips Track?",
      p1:
        "Clips Track è un tracker di clip pensato per i contenuti brevi. Aggiungi un canale YouTube Shorts, un creator Instagram o un account TikTok, e Clips Track registra ogni ora, allo scoccare dell'ora, le performance di ogni clip — visualizzazioni, like, commenti e preferiti. Nessun foglio di calcolo da aggiornare, nessun export manuale: apri la pagina e vedi esattamente cosa ha fatto un clip ieri e cosa sta facendo adesso, fino al numero esatto.",
      p2:
        "La maggior parte delle dashboard arrotonda tutto in \"1,2M\" e \"400K\". Clips Track fa deliberatamente l'opposto: salva ogni cifra al suo valore esatto, così il confronto resta sempre reale. Lo chiami clip tracking, video tracker o tracker di performance — l'idea è la stessa: misurazioni costanti, esatte e orarie dei video brevi che muovono il tuo canale.",
    },
    rules: {
      eyebrow: "Regole per piattaforma",
      title: "Traccia i clip giusti su ogni piattaforma",
      ytTitle: "Tracker per YouTube Shorts",
      ytBody:
        "Clips Track salva solo YouTube Shorts: clip al massimo di un minuto che compaiono nel feed Shorts. I video lunghi non entrano mai nei numeri, così ogni scheda canale resta un vero tracker di Shorts. Visualizzazioni, like e commenti arrivano direttamente dall'API dati di YouTube e vengono catturati allo scoccare dell'ora, dando un segnale chiaro di quali Shorts performano davvero.",
      igTitle: "Tracker per Reels Instagram",
      igBody:
        "Su Instagram, Clips Track segue solo i Reels. Foto e caroselli normali vengono filtrati, perché Instagram non pubblica il conteggio delle visualizzazioni per questi contenuti — e Clips Track non inventa mai numeri dove la piattaforma non ne pubblica. Ogni Reel mantiene le sue visualizzazioni, i like e i commenti reali, quindi il tracker mostra una crescita di cui ti puoi fidare.",
      ttTitle: "Tracker per video TikTok",
      ttBody:
        "TikTok è una piattaforma prima di tutto video, e Clips Track la mantiene tale. I post in modalità foto e le live in corso sono esclusi; vengono tracciati solo i video normali con URL riproducibile, insieme a like, commenti e preferiti. Il risultato è un tracker video TikTok concentrato sui clip che contano — non uno scarico di tutto ciò che un profilo ha mai pubblicato.",
    },
    why: {
      eyebrow: "Perché ClipsTrack",
      title: "Numeri esatti, ogni ora",
      f1Title: "Snapshot orari",
      f1Body:
        "Un processo in background cattura le statistiche allo scoccare dell'ora, così puoi guardare i tuoi clip crescere — giorno dopo giorno, numero dopo numero, senza muovere un dito.",
      f2Title: "Numeri esatti",
      f2Body:
        "Niente 1,2M o 400K per approssimazione. Visualizzazioni, like e commenti vengono salvati e mostrati al loro valore esatto, ogni volta.",
      f3Title: "Avvisi sul rapporto",
      f3Body:
        "Imposta un rapporto minimo di like opzionale per canale; i clip sotto la soglia vengono segnalati, così le performance deboli si notano subito.",
      p1:
        "Per tracciare le visualizzazioni in modo affidabile, Clips Track salva una serie temporale: una misurazione per clip e per ora. Apri oggi un clip e vedrai ancora cosa ha fatto un mese fa: il balzo della prima ora su un nuovo Reel, la lenta salita mattutina di uno Short, un video TikTok che riaccelerare all'improvviso giorni dopo. Poiché lo storico resta in numeri esatti, la curva di crescita rimane onesta e confrontabile, in qualunque momento la guardi.",
      p2:
        "I numeri di ogni clip si uniscono ai totali del canale — follower, visualizzazioni complessive e numero di post, anch'essi catturati ogni ora. È questo che trasforma dei conteggi grezzi in un vero tracker di performance: puoi confrontare come un nuovo post performa rispetto alla base del canale, individuare i formati che tengono il rapporto di like e decidere dove merita di andare la spinta del prossimo post.",
    },
    buckets: {
      eyebrow: "Finestre",
      title: "Clip vecchi riempiti, clip nuovi seguiti",
      sub1Title: "Come funzionano le finestre",
      sub1Body:
        "Quando aggiungi un account, Clips Track riempie prima i clip recenti in una finestra \"Vecchi\" — uno snapshot unico del passato recente. Da lì, una finestra \"Nuovi\" tiene solo gli ultimi caricamenti, aggiornata a ogni sync orario. Quale clip appartiene a quale finestra è deciso dalla data di pubblicazione, mai a caso, e i clip non saltano mai tra le finestre.",
      sub2Title: "Limiti che controlli",
      sub2Body:
        "Le dimensioni delle finestre le scegli tu, per canale: riempi gli ultimi otto clip e segui i quattro più nuovi, o qualsiasi altra combinazione che si adatti a come guardi. Abbassa un numero e gli extra vengono tagliati subito; alzalo e la finestra si riapre e si riallinea. I clip esclusi vengono rimossi in modo pulito, storico compreso, così la dashboard riflette sempre ciò che vuoi davvero vedere.",
      sub3Title: "A chi è rivolto",
      sub3Body:
        "Creator che vogliono seguire le visualizzazioni senza fogli di calcolo. Team growth che confrontano Shorts, Reels e TikTok in un'unica vista. Agenzie che riportano numeri esatti ai clienti. E chiunque abbia mai strizzato gli occhi davanti a un contatore arrotondato chiedendosi qual fosse la cifra reale. Aggiungi tutti i canali che vuoi — ognuno porta le sue finestre e i suoi avvisi, quindi la dashboard scala da un singolo account a tutto un roster.",
    },
    faq: {
      eyebrow: "FAQ",
      title: "Domande frequenti",
      sub: "Risposte rapide su cosa traccia Clips Track, con che frequenza si aggiorna e come vengono gestiti i tuoi dati.",
      q1: "Cos'è ClipsTrack?",
      a1:
        "ClipsTrack è un tracker di clip gratuito per i contenuti brevi. Aggiungi un account YouTube, Instagram o TikTok e registra ogni ora la performance di ogni clip — visualizzazioni, like e commenti — sempre in numeri esatti. Riunisce YouTube Shorts, Reels Instagram e video TikTok in un'unica dashboard.",
      q2: "Come fa ClipsTrack a tracciare YouTube Shorts, Reels Instagram e video TikTok?",
      a2:
        "ClipsTrack prende gli YouTube Shorts direttamente dall'API ufficiale di YouTube e conserva solo clip fino a 60 secondi — i video lunghi non si mescolano mai. Su Instagram traccia solo i Reels, saltando foto e caroselli. Su TikTok vengono tracciati solo i video normali, con like, commenti e preferiti. Le statistiche di ogni piattaforma vengono catturate ogni ora in una serie temporale per clip.",
      q3: "ClipsTrack è gratuito?",
      a3:
        "Sì — ClipsTrack è gratuito. Nessun piano a pagamento, nessuna tariffa per canale e nulla è nascosto dietro un paywall.",
      q4: "Con che frequenza ClipsTrack aggiorna le statistiche?",
      a4:
        "Le statistiche si aggiornano ogni ora. Il primo snapshot viene preso appena aggiungi un account, poi una sync in background aggiorna visualizzazioni, like e commenti ogni ora.",
      q5: "Posso tracciare qualsiasi account pubblico YouTube, Instagram o TikTok?",
      a5:
        "Sì — qualsiasi account pubblico sulle tre piattaforme supportate può essere tracciato. Gli account privati o ristretti che richiedono approvazione non possono essere letti senza autorizzazione.",
      q6: "Devo accedere per usare ClipsTrack?",
      a6:
        "Nessun login richiesto — non esiste un sistema di account. I tuoi account tracciati sono legati a un identificatore per visitatore salvato nel browser, quindi puoi iniziare ad aggiungere canali subito.",
      q7: "Posso tracciare i video vecchi o solo i nuovi caricamenti?",
      a7:
        "Entrambi. Quando aggiungi un canale, ClipsTrack riempie prima i clip recenti in una finestra \"Vecchi\" e poi mantiene una finestra \"Nuovi\" per i nuovi caricamenti. Scegli tu quanti clip tiene ogni finestra, per canale.",
      q8: "Quanti account posso tracciare alla volta?",
      a8:
        "Nessun limite fisso — aggiungi tutti gli account che ti servono, a batch. Ogni canale mantiene i propri conteggi, layout e avvisi.",
      q9: "I miei dati tracciati sono privati?",
      a9:
        "Sì — la dashboard mostra solo i canali che hai aggiunto. Ogni visitatore vede i propri dati e i record degli account sono isolati per visitatore.",
      q10: "Posso vedere la crescita oraria delle visualizzazioni di un video?",
      a10:
        "Sì. Ogni sync orario salva un'altra misurazione per ogni clip, costruendo una serie temporale di conteggi esatti. Apri più tardi lo storico di un clip e vedrai la sua crescita ora per ora e giorno per giorno.",
      q11: "ClipsTrack supporta Twitter/X?",
      a11:
        "Non ancora — ClipsTrack attualmente traccia YouTube Shorts, Reels Instagram e video TikTok. Twitter/X non è supportato.",
    },
    cta: { eyebrow: "Pronto quando vuoi", title: "Inizia a tracciare." },
    footer: {
      after: "numeri sempre mostrati per intero.",
      meta: "Self-hosted · YouTube · Instagram · TikTok",
    },
    acct: {
      eyebrow: "I miei account",
      title: "Gli account che tracci.",
      sub:
        "I tuoi account tracciati — privati. Le statistiche si aggiornano allo scoccare dell'ora, sempre in numeri esatti, mai abbreviate.",
      dbError1: "Impossibile raggiungere il database — verifica che ",
      dbError2: " punti a un Postgres in esecuzione, poi ricarica.",
    },
    add: {
      platform: "Piattaforma",
      placeholder: "Aggiungi canali… es. @mrbeast, @veritasium",
      old: "Vecchi",
      latest: "Nuovi",
      ratio: "Rapporto%",
      submit: "+ Aggiungi",
      adding: "Aggiunta…",
      ariaHandles: "Account da tracciare",
      ariaOld: "Numero di vecchi video",
      ariaLatest: "Numero degli ultimi video",
      ariaRatio: "Percentuale minima di rapporto like, facoltativa",
      ratioTitle:
        "Facoltativo: segnala i video il cui rapporto like (like/visualizzazioni %) scende sotto questa soglia",
      helper:
        "Separa gli account con le virgole — ognuno viene aggiunto sulla piattaforma scelta, in un colpo solo. Il primo snapshot parte subito, poi viene preso ogni ora. Riaaggiungere un account lo aggiorna invece di duplicarlo. Un Rapporto% impostato per account segnala come avviso i video con rapporto like più basso.",
    },
    sort: {
      label: "Ordina per",
      published: "Più recenti",
      views: "Più visualizzazioni",
      likes: "Più like",
      comments: "Più commenti",
    },
    layout: { horizontal: "Horizontal", vertical: "Vertical" },
    empty: {
      eyebrow: "Ancora nessun account",
      title: "I tuoi account tracciati appariranno qui.",
      before: "Aggiungi il primo account ",
      link: "qui",
      after: " — le statistiche iniziano ad apparire dopo la prima sincronizzazione.",
    },
    card: {
      refresh: "Aggiorna",
      edit: "Modifica",
      remove: "Rimuovi",
      save: "Salva",
      saving: "Salvataggio…",
      cancel: "Annulla",
      latest: "Nuovi",
      old: "Vecchi",
      views: "Visualizzazioni",
      likes: "Like",
      comments: "Commenti",
      syncing: "Sincronizzazione…",
      noStats: "Ancora nessuna statistica.",
      noVideos: "Ancora nessun video tracciato.",
      backfill:
        "La prima sincronizzazione riempie i {old} video più recenti, poi traccia i {latest} più nuovi.",
      synced: "Sincronizzato {t} fa",
      notSynced: "Non ancora sincronizzato",
      publishedOld: "{t} fa",
      updated: "aggiornato {t} fa",
      errCounts: "I conteggi devono essere numeri interi tra 0 e 200.",
      errRatio:
        "Il rapporto minimo di like deve essere tra 0 e 100, oppure vuoto.",
      ariaRefresh: "Aggiorna @{user}",
      ariaEdit: "Modifica le impostazioni video di @{user}",
      ariaRemove: "Rimuovi @{user}",
      ratioBelow: "Sotto il minimo di {min}% di rapporto like",
      likeRatioTitle:
        "Il rapporto like {ratio} è sotto il minimo del {min}%",
      imgViewsTitle:
        "Instagram non espone il conteggio delle visualizzazioni per foto/caroselli — solo per i reel",
      noViews: "Nessun conteggio visualizzazioni disponibile",
      confirmRemove: "Rimuovere @{user} e la sua cronologia video?",
      oldCountLabel: "Numero di vecchi video",
      oldCountHint: "Video recenti da riempire una volta",
      latestCountLabel: "Numero degli ultimi video",
      latestCountHint: "Nuovi caricamenti da seguire",
      ratioLabel: "Rapporto min %",
      ratioHint: "Facoltativo — segnala i video sotto questo rapporto",
    },
    fmt: { ago: "fa", growthUnit: "/h" },
  },
} as const;

export type Dictionary = (typeof dictionaries)[Locale];