import type { PageContent } from "./types";

export const es: PageContent = {
  meta: {
    about: {
      title: "Sobre nosotros",
      description:
        "Qué es ClipsTrack y por qué existe - números exactos de clips de YouTube Shorts, Reels de Instagram y TikTok con el calendario de cada plataforma (YouTube cada hora, Instagram/TikTok cada 3 horas), sin hojas de cálculo.",
    },
    privacy: {
      title: "Política de privacidad",
      description:
        "Qué almacena ClipsTrack (tus canales rastreados, estadísticas públicas y la cookie de sesión ct_uid), por qué, y cómo solicitar el borrado completo de tus datos.",
    },
    terms: {
      title: "Términos y condiciones",
      description:
        "Los términos de uso de ClipsTrack - uso aceptable, precisión de los datos y responsabilidad, disponibilidad del servicio y cómo se pueden eliminar cuentas rastreadas.",
    },
    contact: {
      title: "Contacto",
      description:
        "Preguntas, solicitudes de borrado o rastreadores averiados - ponte en contacto con el equipo de ClipsTrack mediante el formulario o el correo.",
    },
  },
  about: {
    eyebrow: "Sobre nosotros",
    title: "Qué es ClipsTrack y por qué existe",
    intro:
      "ClipsTrack nació de una pequeña molestia: todos los paneles de análisis redondean las visitas a «1,2M» y «400K». Comparar un Short y un Reel con honestidad es comparar suposiciones.",
    sections: [
      {
        h: "Números exactos, con un calendario fijo",
        p: "ClipsTrack guarda visitas, likes, comentarios y favoritos de cada clip que añades - con el calendario de cada plataforma (YouTube cada hora, Instagram/TikTok cada 3 horas), con su valor exacto. Sin redondeos, sin «1,2M». El número que ves es el que la plataforma publicó en ese momento.",
      },
      {
        h: "Una sola página para las tres plataformas",
        p: "Rastrea YouTube Shorts, Reels de Instagram y TikTok desde una única lista de cuentas. Añade un canal y cada vídeo que cumpla las reglas de formato corto de la plataforma se mide automáticamente - sin hojas de cálculo ni exportaciones manuales.",
      },
      {
        h: "Para quién es",
        p: "Creadores y agencias que publican el mismo clip en varias plataformas y quieren compararlas bien, además de cualquiera que esté harto de mantener a mano una hoja de cálculo con estadísticas de vídeos.",
      },
      {
        h: "Lo que no es",
        p: "ClipsTrack no es un panel de anuncios, un programador ni una suite completa de análisis. Sin funciones de relleno, sin boletines. Hace una sola cosa - rastreo exacto de clips con el calendario de cada plataforma - y lo hace en silencio.",
      },
    ],
    closing:
      "ClipsTrack es autoadministrado, pequeño a propósito y hecho para quienes quieren números reales. Eres tú. Ve y añade un canal.",
  },
  privacy: {
    eyebrow: "Privacidad",
    title: "Política de privacidad",
    intro:
      "La versión corta: ClipsTrack almacena solo lo necesario para rastrear clips, nunca vende tus datos y te permite borrarlo todo cuando quieras.",
    sections: [
      {
        h: "Qué almacenamos",
        p: "Lo único que guardamos es lo necesario para que el rastreo funcione: las cuentas que envías (nombres, URLs o IDs de canales de YouTube, Instagram o TikTok), las estadísticas públicas que capturamos de esos canales (visitas, likes, comentarios y favoritos, cada uno con su marca de tiempo) y un pequeño identificador por visitante.",
      },
      {
        h: "La cookie ct_uid",
        p: "En tu primera visita establecemos una cookie llamada ct_uid - un identificador aleatorio sin información personal. Existe para que los canales que añades queden vinculados a ti y no a otros visitantes. No te rastrea por otros sitios y no hay seguimiento de terceros ni anuncios en ClipsTrack.",
      },
      {
        h: "Solo datos públicos",
        p: "Las estadísticas que registramos son datos públicos de las plataformas - los mismos números que cualquiera puede ver abriendo el perfil. Nunca captamos información privada, mensajes directos ni nada que no sea ya visible públicamente. Lo que aportamos es la organización: capturas con un calendario fijo, en un solo lugar.",
      },
      {
        h: "Lo que no hacemos",
        p: "No vendemos, alquilamos ni compartimos tus datos con nadie. No hay anuncios ni corredores de datos vinculados a ClipsTrack. Tus cuentas rastreadas solo son visibles para ti y se guardan separadas de las de cualquier otro visitante.",
      },
      {
        h: "Solicitud de borrado",
        p: "Para borrarlo todo, envíanos un mensaje desde la página de contacto indicando que es una solicitud de borrado - o escribe a support@clipstrack.com - y eliminaremos todos los canales e historial vinculados a tu ID de visitante. Como los datos de cada visitante están aislados, borrar los tuyos nunca afecta a los de nadie.",
      },
      {
        h: "Limpieza automática",
        p: "Las cuentas que permanecen inactivas se eliminan automáticamente tras 90 días, junto con sus capturas. Si vuelves más tarde, empiezas de cero.",
      },
      {
        h: "Cambios",
        p: "Si esta política cambia de forma relevante, actualizaremos esta página con una fecha nueva.",
      },
    ],
  },
  terms: {
    eyebrow: "Legal",
    title: "Términos y condiciones",
    intro:
      "Estos términos cubren tu uso de ClipsTrack - el sitio web que estás usando ahora mismo y todo lo que ofrece. Al añadir canales o usar el servicio, los aceptas.",
    sections: [
      {
        h: "Uso aceptable",
        p: "ClipsTrack existe para rastrear cuentas de vídeo de formato corto. Úsalo para eso y con responsabilidad: no intentes romper el servicio, extraer datos en masa para revenderlos, acosar a propietarios de cuentas ni rastrear cuentas sin un interés legítimo.",
      },
      {
        h: "De dónde vienen los datos",
        p: "Las estadísticas provienen de plataformas de terceros: la YouTube Data API, Instagram y TikTok. Esas plataformas controlan lo publicado y pueden cambiarlo, limitarlo o retirarlo en cualquier momento. ClipsTrack registra lo que publican - no genera ni corrige los números.",
      },
      {
        h: "Sin garantía de precisión",
        p: "Hacemos todo lo posible por capturar fielmente, pero no garantizamos que los datos sean precisos, completos o estén al día. Los recuentos pueden ir con retraso, no estar disponibles temporalmente o diferir de lo que muestra la propia plataforma, y no somos responsables de las decisiones tomadas a partir de los números.",
      },
      {
        h: "Disponibilidad del servicio",
        p: "ClipsTrack se ofrece «tal cual» y «según disponibilidad». Puede ir lento, cambiar o dejar de funcionar sin previo aviso - incluso por mantenimiento, cambios en las APIs de las plataformas o motivos de coste. No somos responsables de ningún corte.",
      },
      {
        h: "Eliminación y suspensión",
        p: "Podemos eliminar cuentas, datos o el acceso al servicio a nuestro criterio y sin previo aviso - por ejemplo para proteger el servicio o cuando la ley lo exija.",
      },
      {
        h: "Límites de responsabilidad",
        p: "En la máxima medida que permita la ley, ClipsTrack y sus operadores no responden de daños indirectos, incidentales, consecuentes o especiales derivados de tu uso del servicio, incluso si se les hubiera advertido de esa posibilidad.",
      },
      {
        h: "Contacto",
        p: "¿Dudas sobre estos términos? Escríbenos desde la página de contacto o a support@clipstrack.com.",
      },
    ],
  },
  contact: {
    eyebrow: "Contacto",
    title: "Contacto",
    sub: "Preguntas, informes de errores o solicitudes de eliminación: escríbenos y te responderemos.",
    email: "support@clipstrack.com",
  },
};