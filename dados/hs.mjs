// Dados da HS Engenharia e Elétrica: fonte única do site (página, horários, JSON-LD, sitemap e kit).
//
// De onde vem cada dado (material enviado pelo usuário em 20/10/2026):
// - nome, endereço e horários: ficha do Google da empresa (texto copiado em "HS ENGENHARIA E ELETRICA.txt");
// - WhatsApp e Instagram: o mesmo arquivo; o número também aparece na camisa da equipe nas fotos;
// - serviços: bio do Instagram @hsservicoseletricos e o que aparece nas fotos das obras;
// - fotos: pasta "HS servicos eletricos (@hsservicoseletricos) • Fotos e vídeos do Instagram".
//
// PENDENTE = falta o dado real. Enquanto estiver null, o site omite o item ou mostra um texto neutro.
// Nada aqui pode ser inventado: preço, ano de abertura, avaliações, nome de responsável e registro só com fonte.

/** PENDENTE: domínio definitivo. Por enquanto, o endereço provisório previsto na Vercel. */
export const siteUrl = "https://hs-engenharia-eletrica.vercel.app";

export const brand = {
  name: "HS Engenharia e Elétrica",
  /** Linha do próprio logo */
  tagline: "Projetos · Execução · Soluções",
  phone: "(62) 99165-3028",
  phoneHref: "tel:+5562991653028",
  phoneSchema: "+55-62-99165-3028",
  whatsappNumber: "5562991653028",
  instagramHandle: "@hsservicoseletricos",
  instagramHref: "https://www.instagram.com/hsservicoseletricos/",
  street: "R. RP-11, Qd. 20, Lt. 20",
  neighborhood: "Residencial Prado",
  city: "Senador Canedo",
  state: "GO",
  postalCode: "75264-083",
  /** PENDENTE: link direto da ficha do Google. Enquanto isso, "Ver no Google" usa a busca do Maps (maps.href). */
  googleProfileHref: null,
  /** Enviados pelo usuário em 20/10/2026 e conferidos na Receita Federal (CNPJ ativo, MEI, "Instalação e manutenção elétrica").
   *  A razão social oficial do MEI tem o CPF no fim; aqui fica só o nome, como o usuário mandou. */
  legalName: "Hugo Alves de Sousa",
  cnpj: "39.864.669/0001-67",
  /** PENDENTE: nome do responsável técnico e registro no CREA, se o cliente quiser mostrar. */
  responsavelTecnico: null,
  /** Início das atividades no CNPJ (Receita Federal): 21/11/2020. Vai só no JSON-LD (foundingDate). */
  since: "2020-11-21",
  /** PENDENTE: cidades atendidas além de Senador Canedo (ex.: Goiânia). Confirmar antes de citar. */
  areaServed: null,
};

// Buscar pelo nome + rua abre a ficha do Google (pino e avaliações), não só o endereço.
const mapsQuery = `${brand.name}, R. RP-11, ${brand.neighborhood}, ${brand.city} - ${brand.state}, ${brand.postalCode}`;
export const maps = {
  embedSrc: `https://www.google.com/maps?q=${encodeURIComponent(mapsQuery)}&output=embed`,
  href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`,
  directionsHref: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapsQuery)}`,
};

export const whatsappGreeting = `Olá! Vim pelo site da ${brand.name} e gostaria de um orçamento.`;

export function whatsappLink(message = whatsappGreeting) {
  return `https://wa.me/${brand.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/** Horário da ficha do Google. `weekday` segue Date#getDay (0 = domingo). */
export const hours = [
  { weekday: 1, day: "Segunda-feira", short: "Seg", open: "08:00", close: "19:00" },
  { weekday: 2, day: "Terça-feira", short: "Ter", open: "08:00", close: "19:00" },
  { weekday: 3, day: "Quarta-feira", short: "Qua", open: "08:00", close: "19:00" },
  { weekday: 4, day: "Quinta-feira", short: "Qui", open: "08:00", close: "19:00" },
  { weekday: 5, day: "Sexta-feira", short: "Sex", open: "08:00", close: "19:00" },
  { weekday: 6, day: "Sábado", short: "Sáb", open: "08:00", close: "12:00" },
  { weekday: 0, day: "Domingo", short: "Dom", open: null, close: null },
];

/**
 * PENDENTE: horário nos feriados. A ficha do Google não informa.
 * Enquanto for null, nos feriados nacionais o site avisa "confirme pelo WhatsApp" em vez de dizer aberto ou fechado.
 * Exemplo quando souber: { open: "08:00", close: "12:00" } ou "fechado".
 */
export const holidayHours = null;

/** Serviços da bio do Instagram e das fotos. Sem preço: o orçamento é sempre pelo WhatsApp. */
export const services = [
  {
    slug: "projetos",
    name: "Projetos",
    text: "Projeto elétrico e projeto de engenharia civil para construir, reformar ou regularizar.",
  },
  {
    slug: "obras-instalacoes",
    name: "Obras e instalações elétricas",
    text: "Execução da obra e da instalação elétrica, com montagem e organização de quadros de distribuição.",
  },
  {
    slug: "iluminacao-led",
    name: "Iluminação em LED",
    text: "Perfis de LED embutidos no forro, iluminação de fachada, lustres e pendentes.",
  },
  {
    slug: "carregador-veicular",
    name: "Carregador de carro elétrico",
    text: "Instalação do carregador de parede, com quadro de proteção próprio.",
  },
  {
    slug: "interfone-coletivo",
    name: "Interfone coletivo",
    text: "Instalação de interfone coletivo para prédio e condomínio.",
  },
  {
    slug: "seguranca-incendio",
    name: "Segurança contra incêndio",
    text: "Projeto e regularização de segurança contra incêndio.",
  },
  {
    slug: "aprovacoes-alvaras-rt",
    name: "Aprovações, alvarás e RT",
    text: "Aprovação de projeto, alvará e responsabilidade técnica (RT) para deixar a obra e o imóvel em dia.",
  },
];

export function serviceMessage(service) {
  return `Olá! Vim pelo site da ${brand.name} e gostaria de um orçamento de: ${service.name}.`;
}

/** Foto do topo: forro com dois perfis de LED em "L" (recorte 1200 x 1500). */
export const heroPhoto = {
  name: "forro-led",
  widths: [560, 800, 1200],
  width: 1200,
  height: 1500,
  alt: "Forro branco com dois perfis de LED embutidos e acesos, formando linhas em L",
  caption: "Perfis de LED embutidos no forro",
  // Os dois perfis de LED na foto, em pixels do recorte (medidos no brilho da imagem).
  // A linha de luz da página acende por cima deles na entrada.
  ledPaths: ["M656 79 L811 699 L329 762", "M842 188 L923 853 L473 889"],
};

/** Foto da seção de orçamento. */
export const teamPhoto = {
  name: "quadro-montagem",
  widths: [600, 900, 1200],
  width: 1200,
  height: 1600,
  alt: "Eletricista com a camisa da HS montando um quadro de distribuição numa parede de blocos",
};

/** Galeria em carrosséis. width/height = maior versão gerada por publicar/preparar-imagens.py. */
export const galleries = [
  {
    id: "iluminacao",
    title: "Iluminação em LED",
    photos: [
      { name: "forro-led-andaime", widths: [600, 900, 1200], width: 1200, height: 1600, label: "Perfis de LED no forro, ainda com o andaime da obra", alt: "Forro com dois perfis de LED acesos e um andaime de ferro na frente" },
      { name: "area-coberta-led", widths: [600, 900, 1200], width: 1200, height: 1600, label: "Área coberta com perfis de LED e spots embutidos", alt: "Área coberta com parede cinza texturizada e perfis de LED e spots embutidos no forro" },
      { name: "cozinha-led", widths: [600, 900, 1200], width: 1200, height: 1600, label: "Cozinha com perfil de LED e spots no forro", alt: "Cozinha com ilha de mármore, perfil de LED aceso e spots embutidos no forro" },
      { name: "sala-led-pendentes", widths: [600, 900, 1200], width: 1200, height: 1600, label: "Sala com retângulo de LED e pendentes", alt: "Sala de jantar com retângulo de LED no forro e pendentes de vidro acesos" },
      { name: "fachada-led-noite", widths: [480, 720], width: 720, height: 924, label: "Fachada com LED em volta da janela", alt: "Fachada de casa à noite com perfis de LED acesos em volta da janela" },
    ],
  },
  {
    id: "quadros",
    title: "Quadros e carregador de carro elétrico",
    photos: [
      { name: "quadro-organizado", widths: [600, 900, 1200], width: 1200, height: 1600, label: "Quadro de distribuição com a fiação organizada", alt: "Quadro de distribuição numa parede de blocos, com fios vermelhos, pretos e azuis organizados" },
      { name: "quadro-disjuntores", widths: [600, 900, 1200], width: 1200, height: 1600, label: "Disjuntores e barramento de cobre", alt: "Quadro aberto com disjuntores trifásicos e barramento de cobre" },
      { name: "quadro-geral", widths: [600, 900, 1200], width: 1200, height: 1600, label: "Quadro geral com os circuitos identificados", alt: "Quadro geral com duas colunas de disjuntores identificados à mão" },
      { name: "carregador-parede", widths: [600, 900, 1200], width: 1200, height: 1600, label: "Carregador de carro elétrico com quadro de proteção", alt: "Carregador de carro elétrico instalado na parede, com um quadro de proteção ao lado" },
      { name: "carregador-instalacao", widths: [600, 900, 1200], width: 1200, height: 1600, label: "Carregador aberto durante a instalação", alt: "Carregador de carro elétrico aberto no chão durante a instalação, com a placa à mostra" },
    ],
  },
];

/**
 * Stories do Instagram (prints de 360 px). Ficam pequenos, numa faixa que leva ao perfil.
 * Os prints do lustre (271 px) e do interfone (com figurinha de texto) ficaram de fora: borravam no celular.
 * PENDENTE: os vídeos originais desses reels deixariam as imagens nítidas (e podem virar clipes curtos).
 */
export const instagramStories = [
  { name: "ig-instalando-led", width: 360, height: 640, alt: "Eletricista em cima da escada instalando perfis de LED no forro" },
  { name: "ig-cozinha-apartamento", width: 361, height: 640, alt: "Cozinha de apartamento com perfis de LED no forro e a cidade pela janela" },
  { name: "ig-quadro-celular", width: 361, height: 640, alt: "Eletricista conferindo um quadro de energia com o celular" },
];

/**
 * Avaliações do Google, copiadas da ficha pelo usuário em 20/10/2026 (nota 5,0 em 17 avaliações, todas de 5 estrelas).
 * Texto dos clientes como está no Google; só a pontuação foi acertada (vírgula, espaço, ponto).
 * Ficaram de fora as sem texto, as de uma ou duas palavras e as que precisariam de correção de escrita.
 * Quando a nota ou a quantidade mudarem no Google, atualize googleRating.
 */
export const googleRating = { value: "5,0", count: 17, checked: "2026-10-20" };

export const reviews = [
  { author: "Eroíde Nasareth", text: "Serviço rápido e de confiança! Chamei para fazer o serviço e chegaram no horário marcado, foram super atenciosos e o problema foi resolvido. Super indico!" },
  { author: "Adryanna Castro", text: "Equipe de ótimos profissionais, me atenderam com agilidade e profissionalismo!" },
  { author: "Jardel Dourado", text: "Excelente profissional, atencioso e trabalho executado da forma correta." },
  { author: "Diego Rafael", text: "Super recomendo. Ótimo prestador! Foi prestativo e resolveu o problema!" },
  { author: "Wellington", text: "Ótimo profissional, responsável e zela pela qualidade." },
  { author: "Everlin Salt", text: "Gostaria de parabenizar os serviços prestados pela HS, uma empresa com atendimento de qualidade e eficiência na prestação de serviços." },
];

/** O que ainda falta do cliente (aparece no CLAUDE.md e no resumo de entrega). */
export const pendencias = [
  "Logo original em alta (PNG ou SVG): o atual foi recortado de um story do Instagram (361 px).",
  "Link direto da ficha do Google (hoje o \"Ver no Google\" usa a busca do Maps pelo nome e endereço).",
  "Horário nos feriados (hoje o site pede para confirmar pelo WhatsApp).",
  "Cidades atendidas além de Senador Canedo, se o cliente quiser citar (ex.: Goiânia).",
  "Nome do responsável técnico e registro no CREA, se o cliente quiser mostrar.",
  "Vídeos originais dos reels (LED, interfone, carregador) para trocar os prints do Instagram.",
  "Domínio próprio (hoje: endereço provisório na Vercel).",
  "ID do Google Analytics (G-...), se quiser medir visitas. Sem ele, o site não tem aviso de cookies.",
];
