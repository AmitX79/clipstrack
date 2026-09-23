import type { PageContent } from "./types";

export const pt: PageContent = {
  meta: {
    about: {
      title: "Sobre nós",
      description:
        "O que é o ClipsTrack e por que ele existe - números exatos dos clipes do YouTube Shorts, Instagram Reels e TikTok no ritmo de cada plataforma (YouTube a cada hora, Instagram/TikTok a cada 3 horas), sem planilhas.",
    },
    privacy: {
      title: "Política de privacidade",
      description:
        "O que o ClipsTrack armazena (seus canais rastreados, estatísticas públicas e o cookie de sessão ct_uid), por quê, e como solicitar a exclusão completa dos seus dados.",
    },
    terms: {
      title: "Termos e condições",
      description:
        "Os termos de uso do ClipsTrack - uso aceitável, precisão dos dados e responsabilidade, disponibilidade do serviço e como contas rastreadas podem ser removidas.",
    },
    contact: {
      title: "Contato",
      description:
        "Dúvidas, pedidos de exclusão ou rastreadores quebrados - fale com a equipe do ClipsTrack pelo formulário ou e-mail.",
    },
  },
  about: {
    eyebrow: "Sobre nós",
    title: "O que é o ClipsTrack e por que ele existe",
    intro:
      "O ClipsTrack nasceu de um pequeno incômodo: todo painel de análise arredonda visualizações para “1,2M” e “400K”. Comparar um Short e um Reel com honestidade é comparar suposições.",
    sections: [
      {
        h: "Números exatos, em ritmo definido",
        p: "O ClipsTrack registra visualizações, curtidas, comentários e favoritos de cada clipe que você adiciona - no ritmo de cada plataforma (YouTube a cada hora, Instagram/TikTok a cada 3 horas), sempre no valor exato. Sem arredondamentos, sem “1,2M”. O número que você vê é o número que a plataforma publicou naquele momento.",
      },
      {
        h: "Uma página para as três plataformas",
        p: "Ele rastreia YouTube Shorts, Reels do Instagram e TikTok a partir de uma única lista de perfis. Adicione um canal e cada vídeo que atende às regras de formato curto da plataforma é medido automaticamente - sem planilhas nem exportações manuais.",
      },
      {
        h: "Para quem é",
        p: "Criadores e agências que publicam o mesmo clipe em várias plataformas e querem compará-las direito, além de qualquer pessoa cansada de manter uma planilha de estatísticas de vídeo na mão.",
      },
      {
        h: "O que ele não é",
        p: "O ClipsTrack não é um painel de anúncios, um agendador nem uma suíte completa de análise. Sem excessos de recursos, sem newsletters. Ele faz uma coisa - rastreamento exato de clipes no ritmo de cada plataforma - e faz isso em silêncio.",
      },
    ],
    closing:
      "O ClipsTrack é autogerenciado, pequeno de propósito e feito para quem quer números reais. É você. Vá adicionar um canal.",
  },
  privacy: {
    eyebrow: "Privacidade",
    title: "Política de privacidade",
    intro:
      "Em resumo: o ClipsTrack guarda apenas o necessário para rastrear clipes, nunca vende seus dados e permite que você apague tudo sempre que quiser.",
    sections: [
      {
        h: "O que armazenamos",
        p: "Os únicos dados que mantemos são os necessários para o rastreio funcionar: os perfis que você envia (nomes, URLs ou IDs de canais do YouTube, Instagram ou TikTok), as estatísticas públicas que capturamos desses canais (visualizações, curtidas, comentários e favoritos, cada um com carimbo de data/hora) e um pequeno identificador por visitante.",
      },
      {
        h: "O cookie ct_uid",
        p: "Na sua primeira visita definimos um cookie chamado ct_uid - um identificador aleatório sem informações pessoais. Ele existe para que os canais que você adiciona fiquem ligados a você e não a outros visitantes. Ele não rastreia você em outros sites, e não há rastreamento de terceiros nem publicidade em nenhum lugar do ClipsTrack.",
      },
      {
        h: "Somente dados públicos",
        p: "As estatísticas que registramos são dados públicos das plataformas - os mesmos números que qualquer pessoa vê ao abrir o perfil. Nunca capturamos informações privadas, mensagens diretas nem nada que já não seja visível publicamente. O que acrescentamos é a organização: capturas em ritmo definido, em um só lugar.",
      },
      {
        h: "O que não fazemos",
        p: "Não vendemos, alugamos nem compartilhamos seus dados com ninguém. Não há anúncios nem corretores de dados ligados ao ClipsTrack. Suas contas rastreadas são visíveis apenas para você e ficam armazenadas separadamente das de qualquer outro visitante.",
      },
      {
        h: "Solicitar exclusão",
        p: "Para apagar tudo, envie uma mensagem pela página de contato marcando-a como solicitação de exclusão - ou escreva para support@clipstrack.com - e removeremos todos os canais e o histórico ligados ao seu ID de visitante. Como os dados de cada visitante são isolados, apagar os seus nunca afeta os de ninguém.",
      },
      {
        h: "Limpeza automática",
        p: "Contas que ficam inativas são removidas automaticamente após 90 dias, junto com suas capturas. Se você voltar depois, começa do zero.",
      },
      {
        h: "Alterações",
        p: "Se esta política mudar de forma relevante, atualizaremos esta página com uma nova data.",
      },
    ],
  },
  terms: {
    eyebrow: "Legal",
    title: "Termos e condições",
    intro:
      "Estes termos cobrem o seu uso do ClipsTrack - o site que você está usando agora e tudo o que ele oferece. Ao adicionar canais ou usar o serviço, você os aceita.",
    sections: [
      {
        h: "Uso aceitável",
        p: "O ClipsTrack existe para rastrear contas de vídeo de formato curto. Use-o para isso e com responsabilidade: não tente quebrar o serviço, coletar dados em massa para revender, assediar donos de contas nem rastrear contas sem interesse legítimo.",
      },
      {
        h: "De onde vêm os dados",
        p: "As estatísticas vêm de plataformas de terceiros: a YouTube Data API, o Instagram e o TikTok. Essas plataformas controlam o que é publicado e podem mudar, limitar ou remover isso a qualquer momento. O ClipsTrack registra o que elas publicam - ele não gera nem corrige os números.",
      },
      {
        h: "Sem garantia de precisão",
        p: "Fazemos o nosso melhor para capturar fielmente, mas não garantimos que os dados sejam precisos, completos ou atualizados. Os contadores podem atrasar, ficar temporariamente indisponíveis ou diferir do que a própria plataforma mostra, e não somos responsáveis por decisões tomadas com base nos números.",
      },
      {
        h: "Disponibilidade do serviço",
        p: "O ClipsTrack é fornecido “como está” e “conforme disponibilidade”. Ele pode ficar lento, mudar ou parar de funcionar sem aviso - inclusive por manutenção, mudanças nas APIs das plataformas ou motivos de custo. Não somos responsáveis por nenhuma indisponibilidade.",
      },
      {
        h: "Remoção e suspensão",
        p: "Podemos remover contas, dados ou o acesso ao serviço a nosso critério e sem aviso - por exemplo, para proteger o serviço ou quando exigido por lei.",
      },
      {
        h: "Limites de responsabilidade",
        p: "Na máxima extensão permitida por lei, o ClipsTrack e seus operadores não são responsáveis por danos indiretos, incidentais, consequentes ou especiais decorrentes do seu uso do serviço, mesmo que tenham sido avisados dessa possibilidade.",
      },
      {
        h: "Contato",
        p: "Dúvidas sobre estes termos? Fale conosco pela página de contato ou em support@clipstrack.com.",
      },
    ],
  },
  contact: {
    eyebrow: "Contato",
    title: "Fale conosco",
    sub: "Uma dúvida, um pedido de exclusão, um rastreador quebrado - envie uma mensagem e responderemos.",
    email: "support@clipstrack.com",
    form: {
      name: "Nome",
      email: "E-mail",
      message: "Mensagem",
      namePlaceholder: "Seu nome",
      emailPlaceholder: "voce@exemplo.com",
      messagePlaceholder: "Como podemos ajudar?",
      submit: "Enviar mensagem",
      invalid: "Adicione seu nome, um e-mail válido e uma mensagem.",
      mailtoNote:
        "Se o seu aplicativo de e-mail não abrir, escreva diretamente para support@clipstrack.com.",
    },
    mailtoSubject: "Contato do ClipsTrack",
    mailtoBody:
      "Da página de contato do ClipsTrack.\n\nNome: {name}\nE-mail: {email}\n\n{message}",
  },
};