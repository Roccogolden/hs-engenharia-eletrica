// Monta o HTML das páginas a partir de dados/hs.mjs. Quem chama é publicar/build.mjs.
// O conteúdo vai inteiro no HTML (bom para o Google e para quem está sem JavaScript);
// o JavaScript só acrescenta horário ao vivo, carrosséis, lightbox e movimento.

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const formatHour = (t) => {
  const [h, m] = t.split(":");
  return `${Number(h)}h${m === "00" ? "" : m}`;
};

const srcset = (name, widths) => widths.map((w) => `/img/${name}-${w}.webp ${w}w`).join(", ");

export const icones = {
  whatsapp:
    '<svg class="ic" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>',
  instagram:
    '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r=".6" fill="currentColor"/></svg>',
  pino:
    '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
  seta:
    '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="square" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>',
  esquerda:
    '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="square" aria-hidden="true"><path d="M20 12H5M11 6l-6 6 6 6"/></svg>',
  fechar:
    '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="square" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
};

function head(d, { titulo, descricao, url, ogImage, noindex, versoes, jsonld, comIntro = false, gsc = "" }) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descricao)}">
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${url}">`}
<meta name="theme-color" content="#0b0b0c">
<meta name="format-detection" content="telephone=no">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="${esc(d.brand.name)}">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(descricao)}">
<meta property="og:url" content="${url}">
${ogImage ? `<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(d.brand.name)}, ${esc(d.brand.city)} – ${esc(d.brand.state)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${ogImage}">` : ""}
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="icon" href="/favicon-192.png" sizes="192x192" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/fonts/saira-latin-100-900.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/barlow-latin-400.woff2" as="font" type="font/woff2" crossorigin>
${comIntro ? `<script>
  // Abertura: só com movimento liberado. Ela trava a rolagem; se o JavaScript falhar, a página se solta sozinha em 9 s.
  (function () {
    try {
      if (!location.hash && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.classList.add('has-intro');
        setTimeout(function () { document.documentElement.classList.remove('has-intro'); }, 9000);
      }
    } catch (e) {}
  })();
</script>` : ""}${gsc ? `\n<meta name="google-site-verification" content="${esc(gsc)}">` : ""}
<link rel="stylesheet" href="/css/hs.css?v=${versoes.css}">
<noscript><style>.intro{display:none!important}html.has-intro body{overflow:auto!important}</style></noscript>
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : ""}
</head>`;
}

function topo(d, { naHome }) {
  const pre = naHome ? "" : "/";
  const wa = d.whatsappLink();
  return `
<a class="pular" href="#conteudo">Pular para o conteúdo</a>
<header class="topo" data-topo>
  <div class="wrap topo__barra">
    <a class="marca" href="${naHome ? "#inicio" : "/"}" aria-label="${esc(d.brand.name)}, início">
      <img class="marca__emblema" src="/img/logo-hs-emblema.webp" width="338" height="160" alt="">
      <span class="marca__nome" aria-hidden="true"><span>Engenharia</span><span>e Elétrica</span></span>
    </a>
    <nav class="topo__nav" aria-label="Seções">
      <a href="${pre}#servicos">Serviços</a>
      <a href="${pre}#obras">Obras</a>
      <a href="${pre}#avaliacoes">Avaliações</a>
      <a href="${pre}#contato">Contato</a>
      <a class="topo__orcamento" href="${pre}#orcamento">Orçamento</a>
    </nav>
    <button class="topo__menu" type="button" aria-expanded="false" aria-controls="menu-movel" data-menu-botao>
      <span class="sr" data-menu-rotulo>Abrir menu</span><i></i><i></i>
    </button>
  </div>
</header>
<div class="menu-movel" id="menu-movel" hidden data-menu>
  <nav class="wrap menu-movel__nav" aria-label="Menu">
    <a href="${pre}#servicos">Serviços ${icones.seta}</a>
    <a href="${pre}#obras">Obras ${icones.seta}</a>
    <a href="${pre}#avaliacoes">Avaliações ${icones.seta}</a>
    <a href="${pre}#contato">Endereço e horário ${icones.seta}</a>
    <a href="${pre}#orcamento">Pedir orçamento ${icones.seta}</a>
  </nav>
  <div class="wrap menu-movel__acoes">
    <a class="botao botao--luz" href="${wa}" target="_blank" rel="noopener">${icones.whatsapp}Chamar no WhatsApp</a>
    <a class="botao botao--linha" href="${d.maps.directionsHref}" target="_blank" rel="noopener">${icones.pino}Como chegar</a>
    <p class="status" data-status><span class="status__ponto" aria-hidden="true"></span><span data-status-texto>Seg a sex, 8h às 19h</span></p>
  </div>
</div>`;
}

function rodape(d) {
  const b = d.brand;
  const semana = d.hours.filter((h) => h.weekday >= 1 && h.weekday <= 5);
  const sab = d.hours.find((h) => h.weekday === 6);
  return `
<footer class="rodape">
  <div class="zebra" aria-hidden="true"></div>
  <div class="wrap rodape__grade">
    <div class="rodape__marca">
      <img src="/img/logo-hs.webp" width="348" height="236" alt="${esc(b.name)}" loading="lazy">
    </div>
    <div>
      <p class="rodape__titulo">Endereço</p>
      <p>${esc(b.street)}<br>${esc(b.neighborhood)}<br>${esc(b.city)} – ${esc(b.state)}, ${esc(b.postalCode)}</p>
    </div>
    <div>
      <p class="rodape__titulo">Horário</p>
      <p>Seg a sex: ${formatHour(semana[0].open)} às ${formatHour(semana[0].close)}<br>Sáb: ${formatHour(sab.open)} às ${formatHour(sab.close)}<br>Dom: fechado</p>
    </div>
    <div>
      <p class="rodape__titulo">Contato</p>
      <p><a href="${d.whatsappLink()}" target="_blank" rel="noopener">WhatsApp ${esc(b.phone)}</a><br><a href="${b.instagramHref}" target="_blank" rel="noopener">Instagram ${esc(b.instagramHandle)}</a></p>
    </div>
  </div>
  <div class="wrap rodape__base">
    <p>© ${new Date().getFullYear()} ${esc(b.name)} · ${esc(b.tagline)}${b.cnpj ? ` · CNPJ ${esc(b.cnpj)}` : ""}</p>
    <p data-cookies></p>
  </div>
</footer>`;
}

function zapFlutuante(d) {
  return `
<a class="zap" href="${d.whatsappLink()}" target="_blank" rel="noopener" aria-label="Conversar no WhatsApp" data-zap>
  <span class="zap__rotulo" aria-hidden="true">Fale com a gente</span>
  <span class="zap__botao">${icones.whatsapp}</span>
</a>`;
}

function scripts(versoes, comMovimento = true) {
  const vendor = comMovimento
    ? ["gsap", "ScrollTrigger", "SplitText", "DrawSVGPlugin", "lenis"]
        .map((n) => `<script src="/vendor/${n}.min.js" defer></script>`)
        .join("\n")
    : "";
  return `${vendor}
<script src="/js/hs.js?v=${versoes.hs}" defer></script>
${comMovimento ? `<script src="/js/movimento.js?v=${versoes.movimento}" defer></script>` : ""}`;
}

function dadosJson(d) {
  // O que o hs.js precisa para o horário ao vivo (no fuso de Goiás)
  return `<script type="application/json" id="hs-dados">${JSON.stringify({
    hours: d.hours.map(({ weekday, open, close }) => ({ weekday, open, close })),
    holidayHours: d.holidayHours,
  })}</script>`;
}

function carrossel(g) {
  const n = g.photos.length;
  return `
    <div class="galeria" data-carrossel role="region" aria-roledescription="carrossel" aria-label="${esc(g.title)}">
      <div class="galeria__cabeca">
        <h3 class="galeria__titulo">${esc(g.title)} <span class="galeria__conta">${n} fotos</span></h3>
        <div class="galeria__setas">
          <button type="button" class="seta" data-anterior aria-label="Fotos anteriores">${icones.esquerda}</button>
          <button type="button" class="seta" data-proxima aria-label="Próximas fotos">${icones.seta}</button>
        </div>
      </div>
      <ul class="galeria__trilho" data-trilho>
${g.photos
  .map((p, i) => {
    // No cartão bastam as versões até 900 px; a maior fica para a foto ampliada
    const card = p.widths.filter((w) => w <= 900);
    return `        <li class="galeria__item" aria-label="${i + 1} de ${n}">
          <button type="button" class="foto" data-foto data-src="/img/${p.name}-${Math.max(...p.widths)}.webp" data-legenda="${esc(p.label)}" aria-label="Ampliar foto: ${esc(p.label)}">
            <span class="foto__moldura"><img src="/img/${p.name}-${Math.max(...card)}.webp" srcset="${srcset(p.name, card)}" sizes="(min-width: 1024px) 330px, (min-width: 640px) 34vw, 64vw" width="${p.width}" height="${p.height}" alt="${esc(p.alt)}" loading="lazy" decoding="async"></span>
          </button>
          <p class="foto__legenda">${esc(p.label)}</p>
        </li>`;
  })
  .join("\n")}
      </ul>
    </div>`;
}

function stories(d) {
  const b = d.brand;
  return `
    <div class="galeria galeria--stories" data-carrossel role="region" aria-roledescription="carrossel" aria-label="No Instagram">
      <div class="galeria__cabeca">
        <h3 class="galeria__titulo">No Instagram <a class="galeria__perfil" href="${b.instagramHref}" target="_blank" rel="noopener">${esc(b.instagramHandle)}</a></h3>
        <div class="galeria__setas">
          <button type="button" class="seta" data-anterior aria-label="Anteriores">${icones.esquerda}</button>
          <button type="button" class="seta" data-proxima aria-label="Próximas">${icones.seta}</button>
        </div>
      </div>
      <ul class="galeria__trilho" data-trilho>
${d.instagramStories
  .map(
    (s) => `        <li class="galeria__item">
          <a class="story" href="${b.instagramHref}" target="_blank" rel="noopener">
            <img src="/img/${s.name}-${s.width}.webp" width="${s.width}" height="${s.height}" alt="${esc(s.alt)}" loading="lazy" decoding="async">
            <span class="sr">(abre o Instagram)</span>
          </a>
        </li>`,
  )
  .join("\n")}
        <li class="galeria__item">
          <a class="story story--perfil" href="${b.instagramHref}" target="_blank" rel="noopener">
            ${icones.instagram}
            <span>Ver mais no Instagram</span>
            <strong>${esc(b.instagramHandle)}</strong>
          </a>
        </li>
      </ul>
    </div>`;
}

function avaliacoes(d) {
  const nota = d.googleRating;
  const n = d.reviews.length;
  return `
  <section class="secao avaliacoes" id="avaliacoes" aria-labelledby="avaliacoes-titulo">
    <div class="wrap">
      <div class="secao__cabeca">
        <h2 class="titulo" id="avaliacoes-titulo" data-titulo>Avaliações no Google</h2>
        <div class="nota" data-reveal>
          <p class="nota__valor"><span class="nota__numero">${esc(nota.value)}</span><span class="estrelas estrelas--grandes" data-estrelas aria-hidden="true"><i>★</i><i>★</i><i>★</i><i>★</i><i>★</i></span></p>
          <p class="nota__texto">Nota ${esc(nota.value)} em ${nota.count} avaliações na ficha da HS no Google. <a href="${d.maps.href}" target="_blank" rel="noopener">Ver no Google</a></p>
        </div>
      </div>
      <div class="galeria galeria--avaliacoes" data-carrossel data-reveal role="region" aria-roledescription="carrossel" aria-label="Avaliações de clientes">
        <div class="galeria__cabeca">
          <h3 class="galeria__titulo">O que os clientes escreveram</h3>
          <div class="galeria__setas">
            <button type="button" class="seta" data-anterior aria-label="Avaliações anteriores">${icones.esquerda}</button>
            <button type="button" class="seta" data-proxima aria-label="Próximas avaliações">${icones.seta}</button>
          </div>
        </div>
        <ul class="galeria__trilho" data-trilho>
${d.reviews
  .map(
    (r, i) => `          <li class="galeria__item" aria-label="${i + 1} de ${n}">
            <figure class="avaliacao">
              <p class="estrelas" role="img" aria-label="5 de 5 estrelas">★★★★★</p>
              <blockquote><p>“${esc(r.text)}”</p></blockquote>
              <figcaption><strong>${esc(r.author)}</strong><span>Avaliação no Google</span></figcaption>
            </figure>
          </li>`,
  )
  .join("\n")}
        </ul>
      </div>
    </div>
  </section>`;
}

export function paginaInicial(d, ctx) {
  const b = d.brand;
  const h = d.heroPhoto;
  const t = d.teamPhoto;
  const semana = d.hours.find((x) => x.weekday === 1);
  const sab = d.hours.find((x) => x.weekday === 6);
  const resumoHorario = `Seg a sex, ${formatHour(semana.open)} às ${formatHour(semana.close)} · Sáb, ${formatHour(sab.open)} às ${formatHour(sab.close)}`;
  const linhasHorario = d.hours
    .map(
      (x) =>
        `<div data-dia="${x.weekday}"><dt>${esc(x.day)}</dt><dd>${x.open ? `${formatHour(x.open)} às ${formatHour(x.close)}` : "Fechado"}</dd></div>`,
    )
    .join("\n          ");
  const feriado =
    d.holidayHours === "fechado"
      ? "Fechado"
      : d.holidayHours
        ? `${formatHour(d.holidayHours.open)} às ${formatHour(d.holidayHours.close)}`
        : "Confirme pelo WhatsApp";

  return `${head(d, { ...ctx, comIntro: true })}
<body>
<div class="intro" aria-hidden="true" data-intro>
  <div class="intro__fundo" data-intro-fundo></div>
  <div class="intro__luz" data-intro-luz></div>
  <svg class="intro__cena" data-intro-cena></svg>
  <img class="intro__logo" data-intro-logo src="/img/logo-hs.webp" width="348" height="236" alt="">
</div>
${topo(d, { naHome: true })}
<main id="conteudo" tabindex="-1">
  <svg class="linha" aria-hidden="true" data-linha></svg>

  <section class="hero" id="inicio" aria-labelledby="hero-titulo">
    <div class="wrap hero__grade">
      <div class="hero__texto">
        <h1 class="hero__titulo" id="hero-titulo" data-hero-titulo>Engenharia civil e elétrica em ${esc(b.city)}</h1>
        <p class="hero__lede" data-hero-item>A gente faz o projeto, executa a obra e cuida da regularização: aprovação, alvará e responsabilidade técnica.</p>
        <div class="hero__acoes" data-hero-item>
          <a class="botao botao--luz" href="${d.whatsappLink()}" target="_blank" rel="noopener">${icones.whatsapp}Pedir orçamento</a>
          <a class="botao botao--linha" href="#obras">Ver obras</a>
        </div>
        <div class="hero__horario" data-hero-item>
          <a class="hero__nota" href="#avaliacoes"><span class="estrelas" aria-hidden="true">★★★★★</span><span class="hero__nota-texto"><strong>${esc(d.googleRating.value)}</strong> no Google · ${d.googleRating.count} avaliações</span></a>
          <p class="status" data-status aria-live="polite"><span class="status__ponto" aria-hidden="true"></span><span data-status-texto>${esc(resumoHorario)}</span></p>
          <p class="hero__semana">${esc(resumoHorario)}</p>
        </div>
      </div>
      <figure class="hero__foto" data-hero-foto>
        <img src="/img/${h.name}-800.webp" srcset="${srcset(h.name, h.widths)}" sizes="(min-width: 1024px) 44vw, 92vw" width="${h.width}" height="${h.height}" alt="${esc(h.alt)}" fetchpriority="high" decoding="async">
        <span class="hero__escuro" aria-hidden="true" data-hero-escuro></span>
        <svg class="hero__led" viewBox="0 0 ${h.width} ${h.height}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" data-hero-led>
          <defs><filter id="led-brilho" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9"/></filter></defs>
          <g class="hero__led-halo" filter="url(#led-brilho)">${h.ledPaths.map((p) => `<path d="${p}"/>`).join("")}</g>
          <g class="hero__led-fio">${h.ledPaths.map((p) => `<path d="${p}"/>`).join("")}</g>
        </svg>
        <figcaption>${esc(h.caption)}</figcaption>
      </figure>
    </div>
  </section>

  <section class="secao servicos" id="servicos" aria-labelledby="servicos-titulo">
    <div class="wrap">
      <div class="secao__cabeca">
        <h2 class="titulo" id="servicos-titulo" data-titulo>O que a gente faz</h2>
        <p class="secao__lede" data-reveal>Do projeto à regularização. Em cada serviço, “Pedir orçamento” abre o WhatsApp com a mensagem pronta.</p>
      </div>
      <ol class="servicos__lista" data-quadro>
${d.services
  .map(
    (s, i) => `        <li class="servico">
          <span class="disjuntor" aria-hidden="true"><i class="disjuntor__led"></i>C${i + 1}</span>
          <h3 class="servico__nome">${esc(s.name)}</h3>
          <p class="servico__texto">${esc(s.text)}</p>
          <a class="servico__link" href="${d.whatsappLink(d.serviceMessage(s))}" target="_blank" rel="noopener">Pedir orçamento<span class="sr"> de ${esc(s.name)}</span>${icones.seta}</a>
        </li>`,
  )
  .join("\n")}
      </ol>
    </div>
  </section>

  <section class="secao obras" id="obras" aria-labelledby="obras-titulo">
    <div class="wrap">
      <div class="secao__cabeca">
        <h2 class="titulo" id="obras-titulo" data-titulo>Obras</h2>
        <p class="secao__lede" data-reveal>Fotos tiradas nas obras, durante e depois da instalação. Clique ou toque numa foto para ampliar.</p>
      </div>
${d.galleries.map(carrossel).join("\n")}
${stories(d)}
    </div>
  </section>
${avaliacoes(d)}

  <section class="secao contato" id="contato" aria-labelledby="contato-titulo">
    <div class="wrap contato__grade">
      <div class="contato__info">
        <h2 class="titulo" id="contato-titulo" data-titulo>Endereço e horário</h2>
        <address class="contato__endereco" data-reveal>
          <span class="contato__rua">${esc(b.street)}</span>
          <span>${esc(b.neighborhood)}, ${esc(b.city)} – ${esc(b.state)}</span>
          <span>CEP ${esc(b.postalCode)}</span>
        </address>
        <div class="contato__acoes" data-reveal>
          <a class="botao botao--linha" href="${d.maps.directionsHref}" target="_blank" rel="noopener">${icones.pino}Como chegar</a>
          <a class="contato__canal" href="${d.whatsappLink()}" target="_blank" rel="noopener">${icones.whatsapp}${esc(b.phone)}</a>
          <a class="contato__canal" href="${b.instagramHref}" target="_blank" rel="noopener">${icones.instagram}${esc(b.instagramHandle)}</a>
        </div>
        <div class="horario" data-reveal>
          <p class="status" data-status><span class="status__ponto" aria-hidden="true"></span><span data-status-texto>${esc(resumoHorario)}</span></p>
          <dl class="horario__lista" data-horario>
          ${linhasHorario}
          <div data-dia="feriado"><dt>Feriados</dt><dd>${esc(feriado)}</dd></div>
          </dl>
        </div>
      </div>
      <div class="contato__mapa" data-reveal>
        <iframe src="${d.maps.embedSrc}" title="Mapa: ${esc(b.name)} no ${esc(b.neighborhood)}, ${esc(b.city)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
      </div>
    </div>
  </section>

  <section class="secao orcamento" id="orcamento" aria-labelledby="orcamento-titulo">
    <div class="wrap orcamento__grade">
      <figure class="orcamento__foto" data-acende>
        <span class="orcamento__moldura"><img src="/img/${t.name}-900.webp" srcset="${srcset(t.name, t.widths)}" sizes="(min-width: 1024px) 38vw, 92vw" width="${t.width}" height="${t.height}" alt="${esc(t.alt)}" loading="lazy" decoding="async"></span>
      </figure>
      <div class="orcamento__texto">
        <h2 class="titulo" id="orcamento-titulo" data-titulo>Conte o que você precisa</h2>
        <p class="secao__lede" data-reveal>O orçamento é feito pelo WhatsApp. Para sair mais certo, mande junto:</p>
        <ul class="checklist" data-checklist>
          <li>Fotos do local, do quadro de energia ou da planta, se tiver</li>
          <li>O endereço da obra, com bairro e cidade</li>
          <li>O que você precisa: projeto, obra, instalação ou regularização</li>
          <li>Para quando você precisa</li>
        </ul>
        <a class="botao botao--luz botao--grande" href="${d.whatsappLink()}" target="_blank" rel="noopener" data-cta-final>
          ${icones.whatsapp}<span class="botao__duas"><strong>Chamar no WhatsApp</strong><small>${esc(b.phone)}</small></span>
        </a>
        <p class="orcamento__nota">Atendimento de segunda a sexta, das ${formatHour(semana.open)} às ${formatHour(semana.close)}, e sábado, das ${formatHour(sab.open)} às ${formatHour(sab.close)}.</p>
      </div>
    </div>
  </section>
</main>
${rodape(d)}
${zapFlutuante(d)}
${dadosJson(d)}
${ctx.ga || ""}
${scripts(ctx.versoes)}
</body>
</html>
`;
}

export function pagina404(d, ctx) {
  return `${head(d, { ...ctx, noindex: true, jsonld: null })}
<body class="pagina-404">
${topo(d, { naHome: false })}
<main id="conteudo" class="erro" tabindex="-1">
  <div class="wrap erro__caixa">
    <svg class="erro__linha" viewBox="0 0 600 40" preserveAspectRatio="none" aria-hidden="true">
      <path class="erro__fio" d="M0 20 H262"/>
      <path class="erro__fio erro__fio--apagado" d="M338 20 H600"/>
      <circle class="erro__ponta" cx="262" cy="20" r="3.5"/>
      <circle class="erro__ponta erro__ponta--apagada" cx="338" cy="20" r="3.5"/>
    </svg>
    <p class="erro__codigo">Erro 404</p>
    <h1 class="erro__titulo">Página não encontrada</h1>
    <p class="erro__texto">O endereço pode ter mudado ou estar com um erro de digitação. A página inicial tem os serviços, as obras e o contato.</p>
    <div class="erro__acoes">
      <a class="botao botao--luz" href="/">Voltar ao início</a>
      <a class="botao botao--linha" href="${d.whatsappLink()}" target="_blank" rel="noopener">${icones.whatsapp}Chamar no WhatsApp</a>
    </div>
  </div>
</main>
${rodape(d)}
${dadosJson(d)}
${scripts(ctx.versoes, false)}
</body>
</html>
`;
}
