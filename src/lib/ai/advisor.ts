import { Lead, LeadAudit } from "../extractor/types";

/**
 * Motor de Inteligência de Vendas B2B do Neon Leads
 * Prioriza com ênfase máxima estabelecimentos SEM SITE e sistemas web que podem ser ofertados,
 * com inteligência especializada para leads do Instagram Business e Google Maps.
 */
export function generateLeadAudit(lead: Lead): LeadAudit {
  const hasWebsite = Boolean(lead.website && lead.website.trim().length > 4);
  const niche = (lead.category || "").toLowerCase();
  const name = lead.name;
  const city = lead.city || "sua região";
  const ratingStr = lead.rating ? lead.rating.toFixed(1) : "4.8";
  const isInstagram = lead.source === "instagram";
  const handle = lead.instagramHandle || `@${name.toLowerCase().replace(/[^a-z0-9]/g, "")}`;

  // ---------------------------------------------------------------------------
  // 1. ÊNFASE MÁXIMA: CLIENTE SEM SITE (MINA DE OURO)
  // ---------------------------------------------------------------------------
  if (!hasWebsite) {
    // Especialização para Leads do Instagram SEM SITE
    if (isInstagram) {
      const offer = "Landing Page Profissional para Link da Bio + Sistema de Agendamento / Pedidos";
      const desc = `Desenvolvimento de uma página de alta conversão para substituir o link genérico da bio do Instagram da ${handle}, permitindo que os seguidores cliquem, vejam catálogo/serviços e agendem ou façam pedidos automaticamente no celular sem sobrecarregar o Direct.`;
      const price = "R$ 1.200 a R$ 2.500 (Setup) + R$ 150 a R$ 250/mês (Hospedagem/Suporte)";
      const roi = "+30% a 50% de aumento na conversão de seguidores em clientes agendados";

      const pitchWhatsapp = `Olá pessoal da ${handle}! Tudo bem? Acompanho as postagens de vocês no Instagram em ${city}, muito bacana o trabalho de vocês! 👏

Reparei num detalhe importante: no link da bio de vocês ainda não há um site profissional com sistema de agendamento online próprio para os seguidores marcarem horário direto pelo celular.

Hoje em dia, ter uma página rápida com agendamento automático na bio aumenta em mais de 40% o fechamento de novos clientes a partir do Instagram.

Nós criamos páginas modernas para a bio de negócios locais da região. Posso te enviar uma prévia de 1 minuto mostrando como ficaria essa solução para a ${handle}?`;

      const pitchInstagramDirect = `Olá! Tudo bem? Parabéns pelas postagens aqui no perfil! 👏 Reparei que no link da bio de vocês ainda não há um site profissional com agendamento online. Criamos páginas modernas para a bio que aumentam em até 40% as conversões de seguidores em clientes. Se fizer sentido, posso te mandar um modelo rápido de demonstração sem compromisso!`;

      return {
        hasWebsite: false,
        priorityLevel: "ALTA_OPORTUNIDADE",
        primaryOpportunity: "Site Profissional p/ Link da Bio + Sistema Online",
        painPoints: [
          "Perfil ativo no Instagram com seguidores, mas sem site profissional no link da bio",
          "Perda de clientes que desistem de agendar por falta de sistema rápido pelo celular",
          "Dependência de atendimento manual demorado no Direct do Instagram",
        ],
        recommendedOffer: offer,
        offerDescription: desc,
        suggestedPrice: price,
        estimatedROI: roi,
        pitchWhatsapp,
        pitchWhatsappUrl: buildWhatsappUrl(lead.phone, pitchWhatsapp),
        pitchEmail: buildEmailPitch(lead, offer, desc, price),
        pitchInstagramDirect,
      };
    }

    // Google Maps - Saúde / Clínicas / Estética / Barbearias
    const isHealthcare = /odonto|dent|medic|cl[ií]nic|est[eé]tic|sa[uú]de|fisiot|psic/i.test(niche);
    const isFood = /restauran|pizz|hamburg|lanch|bar|caf[eé]|churrasc|padar|alimento/i.test(niche);
    const isBeauty = /barbear|sal[aã]o|cabel|manicure|est[eé]tica|spa/i.test(niche);
    const isLegalOrFinance = /advog|jur[ií]d|cont[aá]b|consult|imob|corret|engenhar/i.test(niche);

    if (isHealthcare || isBeauty) {
      const systemName = isHealthcare ? "Sistema de Agendamento Médico/Odontológico Online 24h" : "Sistema de Agendamento Online Anti-Furo";
      const offer = `Landing Page Profissional + ${systemName}`;
      const desc = "Criação de uma página moderna de alta conversão integrada a um sistema onde o cliente clica no Google, visualiza os procedimentos e agenda o horário diretamente pelo celular com confirmação automática no WhatsApp.";
      const price = "R$ 1.500 a R$ 2.800 (Setup) + R$ 190 a R$ 290/mês (Suporte/Hospedagem)";
      const roi = "+15 a 35 novos agendamentos mensais capturados fora do horário comercial";

      const pitchWhatsapp = `Olá! Tudo bem? Vi a ${name} no Google em ${city} e parabéns pela nota ${ratingStr}! 👏

Notei um detalhe que pode estar fazendo vocês perderem pacientes todos os dias: quem encontra vocês no Google não tem um site para ver os tratamentos nem um sistema de agendamento online pelo celular.

Nós desenvolvemos uma solução completa de Página Profissional com Sistema de Agendamento 24h no WhatsApp para clínicas da região.

Posso te enviar um vídeo rápido de 1 minuto mostrando como ficaria essa solução para a ${name}?`;

      return {
        hasWebsite: false,
        priorityLevel: "ALTA_OPORTUNIDADE",
        primaryOpportunity: "Criação de Site + Sistema de Agendamento 24h",
        painPoints: [
          "Sem website indexado no Google (concorrentes com site capturam os melhores clientes)",
          "Perda de agendamentos no período noturno e finais de semana por falta de sistema online",
          "Atendimento telefônico manual sobrecarregando a equipe da recepção",
        ],
        recommendedOffer: offer,
        offerDescription: desc,
        suggestedPrice: price,
        estimatedROI: roi,
        pitchWhatsapp,
        pitchWhatsappUrl: buildWhatsappUrl(lead.phone, pitchWhatsapp),
        pitchEmail: buildEmailPitch(lead, offer, desc, price),
      };
    }

    if (isFood) {
      const offer = "Landing Page Própria + Cardápio & Sistema de Pedidos Online Sem Taxas";
      const desc = "Desenvolvimento de site institucional com cardápio digital interativo onde o cliente pede online e o pedido chega pronto e formatado no WhatsApp ou painel da cozinha, livrando o restaurante de taxas abusivas de aplicativos (até 27%).";
      const price = "R$ 1.200 a R$ 2.400 (Setup) + R$ 150 a R$ 250/mês";
      const roi = "Economia imediata de R$ 1.000 a R$ 3.500/mês em taxas de intermediação";

      const pitchWhatsapp = `Olá! Tudo bem? Encontrei a ${name} no Google em ${city}, muito bacana o trabalho de vocês! 🍕🍔

Reparei que vocês ainda não possuem um site próprio com sistema de pedidos direto no WhatsApp. Hoje muitos restaurantes da região estão pagando até 27% de taxa para o iFood simplesmente por não terem seu próprio cardápio digital no Google.

Nós criamos o sistema completo de cardápio online próprio, onde o cliente pede direto no celular e vocês ficam com 100% do lucro.

Posso te mandar uma demonstração de como funcionaria para a ${name}?`;

      return {
        hasWebsite: false,
        priorityLevel: "ALTA_OPORTUNIDADE",
        primaryOpportunity: "Site Próprio + Sistema de Pedidos Sem Comissão",
        painPoints: [
          "Dependência excessiva de aplicativos de entrega e perda de até 27% da margem",
          "Sem página própria no Google para capturar buscas locais de clientes famintos",
          "Falta de fidelização de clientes com base própria",
        ],
        recommendedOffer: offer,
        offerDescription: desc,
        suggestedPrice: price,
        estimatedROI: roi,
        pitchWhatsapp,
        pitchWhatsappUrl: buildWhatsappUrl(lead.phone, pitchWhatsapp),
        pitchEmail: buildEmailPitch(lead, offer, desc, price),
      };
    }

    if (isLegalOrFinance) {
      const offer = "Landing Page de Alta Autoridade + Sistema de Triagem & Qualificação de Clientes";
      const desc = "Página corporativa moderna com design sóbrio e elegante, integrada a um funil onde o visitante preenche o perfil da causa/demanda antes de falar no WhatsApp, economizando tempo com curiosos.";
      const price = "R$ 1.800 a R$ 3.800 (Setup)";
      const roi = "Captação contínua de contratos qualificados de médio e alto valor";

      const pitchWhatsapp = `Olá! Tudo bem? Vi a atuação de vocês da ${name} no Google em ${city}.

Notei que o escritório ainda não conta com uma landing page oficial indexada no Google para receber potenciais clientes e filtrar demandas qualificadas.

Desenvolvemos páginas de alta autoridade com sistema de triagem prévia para escritórios que desejam atrair novos clientes corporativos sem perder tempo com atendimentos desqualificados.

Gostaria de ver um exemplo rápido de como estruturamos esse funil?`;

      return {
        hasWebsite: false,
        priorityLevel: "ALTA_OPORTUNIDADE",
        primaryOpportunity: "Site de Autoridade + Funil de Triagem de Clientes",
        painPoints: [
          "Falta de presença online formal para gerar credibilidade imediata",
          "Dificuldade em captar novos clientes fora de indicações boca a boca",
          "Tempo perdido atendendo contatos que não têm o perfil ideal de cliente",
        ],
        recommendedOffer: offer,
        offerDescription: desc,
        suggestedPrice: price,
        estimatedROI: roi,
        pitchWhatsapp,
        pitchWhatsappUrl: buildWhatsappUrl(lead.phone, pitchWhatsapp),
        pitchEmail: buildEmailPitch(lead, offer, desc, price),
      };
    }

    // Comércio geral sem site
    const offer = "Site Institucional de Alta Conversão + Catálogo Digital de Serviços";
    const desc = "Criação de presença digital moderna e profissional no Google com apresentação completa de serviços, fotos, mapa interativo e botão direto de WhatsApp.";
    const price = "R$ 1.200 a R$ 2.200 (Setup) + R$ 120/mês";
    const roi = "Aumento de 30% a 50% na captação de clientes que pesquisam pelo serviço no Google";

    const pitchWhatsapp = `Olá! Tudo bem? Vi a ${name} no Google em ${city} e gostei muito das avaliações de vocês! ⭐

Reparei que vocês ainda não têm um site profissional cadastrado no Google Meu Negócio. Hoje em dia, mais de 70% das pessoas pesquisam pelo serviço no celular e acabam contratando o concorrente que tem um site claro com catálogo de serviços.

Nós criamos sites modernos e rápidos que posicionam sua empresa no topo das buscas da região.

Posso te encaminhar uma prévia de como ficaria um site profissional para a ${name}?`;

    return {
      hasWebsite: false,
      priorityLevel: "ALTA_OPORTUNIDADE",
      primaryOpportunity: "Criação de Site Institucional + Catálogo de Serviços",
      painPoints: [
        "Invisibilidade digital: cliente pesquisa no Google e não encontra informações detalhadas",
        "Perda de clientes para concorrentes locais que já possuem site",
        "Falta de catálogo profissional para envio rápido no WhatsApp",
      ],
      recommendedOffer: offer,
      offerDescription: desc,
      suggestedPrice: price,
      estimatedROI: roi,
      pitchWhatsapp,
      pitchWhatsappUrl: buildWhatsappUrl(lead.phone, pitchWhatsapp),
      pitchEmail: buildEmailPitch(lead, offer, desc, price),
    };
  }

  // ---------------------------------------------------------------------------
  // 2. EMPRESAS QUE JÁ POSSUEM SITE: SISTEMAS & AUTOMAÇÕES
  // ---------------------------------------------------------------------------
  const lowReviews = (lead.reviewsCount || 0) < 35;
  const isHealthcare = /odonto|dent|medic|cl[ií]nic|est[eé]tic|sa[uú]de/i.test(niche);

  if (isHealthcare) {
    const offer = "Módulo de Agendamento Online Integrado + Automação de WhatsApp";
    const desc = "Plugar no site existente do cliente um sistema de agendamento automático 24/7 com disparador de lembretes automáticos de consulta no WhatsApp para zerar faltas.";
    const price = "R$ 900 a R$ 1.800 (Implementação) + R$ 250/mês";
    const roi = "Redução de até 80% no não comparecimento (no-show) de consultas";

    const pitchWhatsapp = `Olá! Tudo bem? Estava no site da ${name} e achei excelente a estrutura de vocês em ${city}.

Porém notei que os pacientes ainda precisam ligar ou mandar mensagem manual para agendar. Nós implementamos sistemas de agendamento online direto no site existente, onde o paciente escolhe o dia e horário e recebe a confirmação automática no WhatsApp.

Posso te mostrar como funciona na prática em 1 minuto?`;

    return {
      hasWebsite: true,
      priorityLevel: "MEDIA",
      primaryOpportunity: "Sistema de Agendamento Online Integrado",
      painPoints: [
        "Site existente serve apenas como folheto e não converte agendamentos automáticos",
        "Alta taxa de faltas de pacientes por falta de lembrete automático",
      ],
      recommendedOffer: offer,
      offerDescription: desc,
      suggestedPrice: price,
      estimatedROI: roi,
      pitchWhatsapp,
      pitchWhatsappUrl: buildWhatsappUrl(lead.phone, pitchWhatsapp),
      pitchEmail: buildEmailPitch(lead, offer, desc, price),
    };
  }

  if (lowReviews) {
    const offer = "Sistema de Automação de Avaliações 5 Estrelas no Google";
    const desc = "Implementação de sistema via QR Code no balcão e disparo automático pós-atendimento no WhatsApp convidando clientes satisfeitos a deixarem 5 estrelas no Google.";
    const price = "R$ 600 a R$ 1.200";
    const roi = "Alcance de 100+ avaliações 5 estrelas, subindo o estabelecimento para o Top 3 do Google Maps";

    const pitchWhatsapp = `Olá! Tudo bem? Vi a ${name} no Google em ${city}. Vocês têm um ótimo serviço, porém estão com apenas ${lead.reviewsCount} avaliações no Google Maps.

Concorrentes com 100+ avaliações recebem 4x mais ligações. Desenvolvemos um sistema que coleta avaliações 5 estrelas automaticamente dos seus clientes satisfeitos pelo WhatsApp.

Gostaria de ver como funciona?`;

    return {
      hasWebsite: true,
      priorityLevel: "MEDIA",
      primaryOpportunity: "Sistema de Coleta de Avaliações 5★ no Google",
      painPoints: [
        "Poucas avaliações no Google em relação ao tempo de mercado",
        "Concorrentes menores aparecendo na frente pelo volume de reviews",
      ],
      recommendedOffer: offer,
      offerDescription: desc,
      suggestedPrice: price,
      estimatedROI: roi,
      pitchWhatsapp,
      pitchWhatsappUrl: buildWhatsappUrl(lead.phone, pitchWhatsapp),
      pitchEmail: buildEmailPitch(lead, offer, desc, price),
    };
  }

  // Otimização geral
  const offer = "Chatbot IA de Atendimento & Triagem de WhatsApp 24/7";
  const desc = "Assistente virtual inteligente integrado ao WhatsApp da empresa que responde dúvidas de clientes, orçamentos e agendamentos instantaneamente a qualquer hora do dia ou noite.";
  const price = "R$ 1.200 a R$ 2.500 + R$ 190/mês";
  const roi = "Zero clientes perdidos por demora no atendimento no WhatsApp";

  const pitchWhatsapp = `Olá! Tudo bem? Vi a ${name} no Google em ${city}.

Vocês recebem muitos contatos no WhatsApp fora do horário comercial? Nós criamos assistentes de inteligência artificial que atendem os clientes na hora, tiram dúvidas e qualificam o lead mesmo quando sua equipe está offline.

Posso te enviar uma demonstração rápida de teste?`;

  return {
    hasWebsite: true,
    priorityLevel: "OTIMIZACAO",
    primaryOpportunity: "Chatbot IA de Atendimento 24h no WhatsApp",
    painPoints: [
      "Demora para responder clientes no WhatsApp nos horários de pico e noites",
      "Perda de vendas para concorrentes que respondem primeiro",
    ],
    recommendedOffer: offer,
    offerDescription: desc,
    suggestedPrice: price,
    estimatedROI: roi,
    pitchWhatsapp,
    pitchWhatsappUrl: buildWhatsappUrl(lead.phone, pitchWhatsapp),
    pitchEmail: buildEmailPitch(lead, offer, desc, price),
  };
}

function buildWhatsappUrl(phone: string, text: string): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return "";

  let full = digits;
  if ((digits.length === 10 || digits.length === 11) && !digits.startsWith("55")) {
    full = "55" + digits;
  }

  return `https://wa.me/${full}?text=${encodeURIComponent(text)}`;
}

function buildEmailPitch(lead: Lead, offer: string, desc: string, price: string): string {
  return `Assunto: Oportunidade de crescimento para ${lead.name} no Google

Olá, equipe da ${lead.name},

Meu nome é [Seu Nome] e acompanho o mercado comercial de ${lead.city}.

Identifiquei uma oportunidade importante para a ${lead.name}: a implementação de ${offer}.

${desc}

Essa solução tem gerado um retorno expressivo para empresas do seu segmento, aumentando a captação direta de clientes e automatizando rotinas comerciais.

Podemos agendar uma rápida conversa de 10 minutos esta semana para eu apresentar um modelo prático sem compromisso?

Atenciosamente,
[Seu Nome / Sua Agência]
[Seu Telefone / WhatsApp]`;
}
