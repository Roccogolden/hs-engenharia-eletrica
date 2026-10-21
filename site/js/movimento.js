/* HS Engenharia e Elétrica: movimento (GSAP 3.15 + ScrollTrigger + SplitText + DrawSVG + Lenis).
   Tudo tirado do serviço elétrico:
   - Abertura: uma lâmpada pendurada e uma tomada ao lado da logo; o cabo sobe com o plugue, que encaixa na tomada
     com uma faísca; a lâmpada pisca, acende e mostra a logo; a luz dela se espalha e abre a página.
   - Topo: os dois perfis de LED da foto acendem por cima da foto escura e a sala "liga"; a faísca contorna a foto.
   - Ao longo: o cabo fica instalado (apagado) pelas margens; a energia corre por ele com a rolagem, com uma faísca
     crepitando na ponta. Títulos acendem como letreiro, disjuntores dos serviços ligam, fotos acendem, LEDs da lista ligam.
   - Fechamento: a faísca contorna o botão do WhatsApp, estoura e o botão liga. Uma vez.
   Com "reduzir movimento": sem abertura, cabo inteiro energizado e parado, botão aceso, tudo visível. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  function endIntro() { root.classList.remove('has-intro'); }
  if (!window.gsap || !window.ScrollTrigger || !window.DrawSVGPlugin) { endIntro(); return; }
  gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);
  if (window.SplitText) gsap.registerPlugin(SplitText);

  var css = getComputedStyle(root);
  var COR = {
    amarelo: css.getPropertyValue('--amarelo').trim() || '#f4b81c',
    texto: css.getPropertyValue('--texto').trim() || '#f2f0eb',
    tinta: css.getPropertyValue('--tinta').trim() || '#111111',
    linhaForte: css.getPropertyValue('--linha-forte').trim() || '#3b3b41',
    fraco: css.getPropertyValue('--fraco').trim() || '#8a867f',
    apagado: '#3b3b41'
  };
  var SVGNS = 'http://www.w3.org/2000/svg';
  var main = doc.querySelector('main');
  var svgLinha = doc.querySelector('[data-linha]');
  var fotoHero = doc.querySelector('[data-hero-foto]');
  var ctaFinal = doc.querySelector('[data-cta-final]');
  var lenis = null;
  var PONTA = 0.72; // a ponta do fio acompanha esta altura da tela

  function fone() { return window.innerWidth < 640; }
  function el(tag, attrs, pai) {
    var e = doc.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (pai) pai.appendChild(e);
    return e;
  }
  function fontesProntas(max) {
    var fontes = doc.fonts && doc.fonts.load ? doc.fonts.load('700 48px Saira') : Promise.resolve();
    return Promise.race([fontes, new Promise(function (r) { setTimeout(r, max); })]);
  }
  // Posição de um elemento dentro do <main>, sem contar transformações
  function pos(e0) {
    var x = 0, y = 0, e = e0;
    while (e && e !== main) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; }
    return { l: x, t: y, r: x + e0.offsetWidth, b: y + e0.offsetHeight };
  }

  /* ---------- Fio de energia: geometria ---------- */
  var NPECAS = 8; // emenda, desce, cruza, desce, cruza, desce, vai ao botão, contorna o botão
  function medirLinha() {
    var W = main.clientWidth, H = main.offsetHeight, f = fone();
    var pad = W >= 1024 ? 40 : W >= 640 ? 32 : 20;
    var margem = Math.max(0, (W - 1280) / 2) + pad;
    var gL = f ? 7 : Math.max(7, margem - 12), gR = W - gL;
    var off = f ? 13 : 12;
    var secoes = [].slice.call(main.children).filter(function (e) { return e.tagName === 'SECTION'; });
    var topos = secoes.map(function (s) { return s.offsetTop; });
    var foto = pos(fotoHero);
    var F = { l: foto.l - off, t: foto.t - off, r: foto.r + off, b: foto.b + off };
    var B = pos(ctaFinal), bo = 9;
    var Bf = { l: B.l - bo, t: B.t - bo, r: B.r + bo, b: B.b + bo }, by = (B.t + B.b) / 2;
    var HS = f ? 100 : 140; // rolagem gasta em cada trecho horizontal
    var cruz1 = topos[2], cruz2 = topos[3]; // serviços → obras, obras → contato
    var pecas = [
      { d: 'M' + F.r + ' ' + F.b + ' H' + gR, s0: F.b - 30, s1: F.b + 30, nulo: Math.abs(F.r - gR) < 1 },
      { d: 'M' + gR + ' ' + F.b + ' V' + cruz1, s0: F.b + 30, s1: cruz1 - HS / 2 },
      { d: 'M' + gR + ' ' + cruz1 + ' H' + gL, s0: cruz1 - HS / 2, s1: cruz1 + HS / 2 },
      { d: 'M' + gL + ' ' + cruz1 + ' V' + cruz2, s0: cruz1 + HS / 2, s1: cruz2 - HS / 2 },
      { d: 'M' + gL + ' ' + cruz2 + ' H' + gR, s0: cruz2 - HS / 2, s1: cruz2 + HS / 2 },
      { d: 'M' + gR + ' ' + cruz2 + ' V' + by, s0: cruz2 + HS / 2, s1: by - HS / 2 },
      // O contorno do botão termina com o centro dele a ~66% da altura da tela
      { d: 'M' + gR + ' ' + by + ' H' + Bf.r, s0: by - HS / 2, s1: by - 30 },
      { d: 'M' + Bf.r + ' ' + by + ' V' + Bf.t + ' H' + Bf.l + ' V' + Bf.b + ' H' + Bf.r + ' Z', s0: by - 30, s1: by + (f ? 40 : 50) }
    ];
    // O fim do fio precisa caber na rolagem (o rodapé é curto): comprime os últimos trechos se faltar página
    var topoMain = main.getBoundingClientRect().top + window.scrollY;
    var sMax = ScrollTrigger.maxScroll(window) - topoMain + window.innerHeight * PONTA - 4;
    for (var i = pecas.length - 1; i >= 0 && pecas[i].s1 > sMax; i--) {
      pecas[i].s1 = sMax;
      pecas[i].s0 = Math.min(pecas[i].s0, sMax - 40);
      sMax = pecas[i].s0;
    }
    return {
      W: W, H: H, inicio: { x: F.r, y: F.b }, junta: { x: Bf.r, y: by },
      moldura: 'M' + F.r + ' ' + F.b + ' V' + F.t + ' H' + F.l + ' V' + F.b + ' H' + F.r,
      pecas: pecas
    };
  }

  function montarLinha() {
    var layout = medirLinha();
    var cabos = [], pecas = [], comprimentos = [], compMoldura = 0;
    for (var i = 0; i < NPECAS; i++) cabos.push(el('path', { 'class': 'l-cabo' }, svgLinha));
    var moldura = [el('path', { 'class': 'l-brilho' }, svgLinha), el('path', { 'class': 'l-fio' }, svgLinha)];
    for (var j = 0; j < NPECAS; j++) pecas.push([el('path', { 'class': 'l-brilho' }, svgLinha), el('path', { 'class': 'l-fio' }, svgLinha)]);
    function aplicar() {
      layout = medirLinha();
      svgLinha.setAttribute('viewBox', '0 0 ' + layout.W + ' ' + layout.H);
      moldura.forEach(function (p) { p.setAttribute('d', layout.moldura); });
      compMoldura = moldura[1].getTotalLength();
      layout.pecas.forEach(function (pc, k) {
        cabos[k].setAttribute('d', pc.d);
        pecas[k].forEach(function (p) { p.setAttribute('d', pc.d); p.style.visibility = pc.nulo ? 'hidden' : ''; });
        cabos[k].style.visibility = pc.nulo ? 'hidden' : '';
        comprimentos[k] = pecas[k][1].getTotalLength();
      });
    }
    aplicar();
    root.classList.add('linha-ativa');
    return {
      moldura: moldura, pecas: pecas, aplicar: aplicar,
      layout: function () { return layout; },
      ponto: function (k, p) { return pecas[k][1].getPointAtLength(comprimentos[k] * Math.max(0, Math.min(1, p))); },
      pontoMoldura: function (p) { return moldura[1].getPointAtLength(compMoldura * Math.max(0, Math.min(1, p))); },
      destruir: function () {
        while (svgLinha.firstChild) svgLinha.removeChild(svgLinha.firstChild);
        root.classList.remove('linha-ativa');
      }
    };
  }

  /* ---------- Faísca: crepita na ponta do fio e solta fagulhas ---------- */
  function criarFaisca(svg, pequena) {
    var g = el('g', { 'class': 'faisca' }, svg);
    var halo = el('circle', { 'class': 'faisca__halo', r: pequena ? 7 : 9 }, g);
    var raios = [];
    for (var i = 0; i < 5; i++) raios.push(el('line', { 'class': 'faisca__raio', x1: 0, y1: 0, x2: 0, y2: -8 }, g));
    var nucleo = el('circle', { 'class': 'faisca__nucleo', r: 2.4 }, g);
    var pool = [], ip = 0;
    for (var k = 0; k < (pequena ? 6 : 10); k++) pool.push(el('circle', { 'class': 'faisca__particula', r: 0, cx: 0, cy: 0 }, svg));
    gsap.set(g, { autoAlpha: 0 });
    var ativo = false, x = 0, y = 0, ux = 0, uy = 0, tAnt = 0;
    function fagulha(px, py, alcance) {
      var p = pool[ip++ % pool.length];
      var ang = Math.random() * Math.PI * 2, dist = alcance * (0.4 + Math.random() * 0.6);
      gsap.killTweensOf(p);
      gsap.fromTo(p, { attr: { cx: px, cy: py, r: 1.7 }, opacity: 1 }, {
        attr: { cx: px + Math.cos(ang) * dist, cy: py + Math.sin(ang) * dist + 5, r: 0.3 },
        opacity: 0, duration: 0.3 + Math.random() * 0.35, ease: 'power2.out'
      });
    }
    function crepitar(t) {
      if (!ativo || t - tAnt < 0.045) return;
      tAnt = t;
      var vy = y - window.scrollY; // fora da tela, não gasta nada
      if (vy < -120 || vy > window.innerHeight + 120) return;
      raios.forEach(function (r) {
        var l = (pequena ? 4 : 5) + Math.random() * (pequena ? 6 : 9);
        r.setAttribute('y2', -l);
        r.setAttribute('transform', 'rotate(' + Math.round(Math.random() * 360) + ')');
        r.style.opacity = Math.random() < 0.3 ? 0 : 1;
      });
      halo.setAttribute('r', (pequena ? 6 : 8) + Math.random() * 4);
      nucleo.setAttribute('r', 1.8 + Math.random() * 1.3);
      var moveu = Math.abs(x - ux) + Math.abs(y - uy) > 0.5;
      ux = x; uy = y;
      if ((moveu && Math.random() < 0.75) || Math.random() < 0.1) fagulha(x, y, pequena ? 18 : 24);
    }
    gsap.ticker.add(crepitar);
    return {
      mover: function (nx, ny) {
        x = nx; y = ny;
        gsap.set(g, { x: nx, y: ny });
        if (!ativo) { ativo = true; gsap.to(g, { autoAlpha: 1, duration: 0.12, overwrite: 'auto' }); }
      },
      esconder: function () {
        if (!ativo) return;
        ativo = false;
        gsap.to(g, { autoAlpha: 0, duration: 0.18, overwrite: 'auto' });
      },
      estourar: function (px, py, n, alcance) { for (var i2 = 0; i2 < n; i2++) fagulha(px, py, alcance); },
      destruir: function () { gsap.ticker.remove(crepitar); g.remove(); pool.forEach(function (p) { p.remove(); }); }
    };
  }

  /* ---------- Rolagem suave ---------- */
  function ligarLenis() {
    if (!window.Lenis || window.matchMedia('(pointer: coarse)').matches) return null;
    var l = new Lenis({ duration: 1.1, smoothWheel: true });
    l.on('scroll', ScrollTrigger.update);
    var raf = function (t) { l.raf(t * 1000); };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    l._hsRaf = raf;
    return l;
  }
  function desligarLenis() {
    if (!lenis) return;
    gsap.ticker.remove(lenis._hsRaf);
    lenis.destroy();
    lenis = null;
  }
  doc.addEventListener('hs:travar', function () { if (lenis) lenis.stop(); });
  doc.addEventListener('hs:soltar', function () { if (lenis) lenis.start(); });
  doc.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || !lenis) return;
    var id = a.getAttribute('href');
    var alvo = id.length > 1 ? doc.querySelector(id) : null;
    if (!alvo) return;
    e.preventDefault();
    var topoH = parseFloat(getComputedStyle(root).getPropertyValue('--topo-h')) || 64;
    // Espera o menu do celular fechar e soltar a rolagem
    setTimeout(function () { if (lenis) lenis.scrollTo(alvo, { offset: id === '#inicio' ? 0 : -(topoH + 8), duration: 1.2 }); }, 0);
    if (history.replaceState) history.replaceState(null, '', id);
  });

  /* ---------- Revelações (só abaixo da primeira tela) ---------- */
  function abaixo(e) { return e.getBoundingClientRect().top > window.innerHeight * 0.92; }

  // Letreiro acendendo: cada palavra pisca e liga, com um brilho que apaga devagar
  function letreiro(titulo, tl, inicio) {
    var split = SplitText.create(titulo, { type: 'words' });
    gsap.set(titulo, { opacity: 1 });
    gsap.set(split.words, { opacity: 0.1 });
    var fim = inicio;
    split.words.forEach(function (w, i) {
      var t = inicio + i * 0.075 + Math.random() * 0.05;
      tl.to(w, { opacity: 0.85, duration: 0.04, ease: 'none' }, t)
        .to(w, { opacity: 0.18, duration: 0.05, ease: 'none' }, t + 0.06)
        .to(w, { opacity: 1, duration: 0.05, ease: 'none' }, t + 0.13)
        .fromTo(w, { textShadow: '0 0 18px rgba(255, 205, 80, 0.55)' }, { textShadow: '0 0 0px rgba(255, 205, 80, 0)', duration: 0.8, ease: 'power2.out' }, t + 0.13);
      fim = Math.max(fim, t + 0.95);
    });
    tl.call(function () { split.revert(); }, null, fim);
    return split;
  }

  function titulos(ctx) {
    var lista = gsap.utils.toArray('[data-titulo]').filter(abaixo);
    var splits = [];
    lista.forEach(function (t) { gsap.set(t, { opacity: 0.1 }); });
    function comSplit() {
      lista.forEach(function (t) {
        if (!window.SplitText) return subir(t);
        var tl = gsap.timeline({ scrollTrigger: { trigger: t, start: 'top 86%', once: true } });
        splits.push(letreiro(t, tl, 0));
      });
    }
    function subir(t) {
      gsap.fromTo(t, { opacity: 0.1 }, { opacity: 1, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: t, start: 'top 88%', once: true } });
    }
    // O SplitText só divide certo com a fonte carregada
    var tentativas = 0;
    (function esperar() {
      if (!ctx.vivo) return;
      if (!doc.fonts || doc.fonts.status === 'loaded') ctx.add(comSplit);
      else if (++tentativas > 80) ctx.add(function () { lista.forEach(subir); });
      else setTimeout(esperar, 100);
    })();
    return function () { splits.forEach(function (s) { s.revert(); }); };
  }

  // Serviços: cada disjuntor liga em sequência, com o LED piscando antes de firmar
  function disjuntores() {
    var itens = gsap.utils.toArray('[data-quadro] > li').filter(abaixo);
    if (!itens.length) return function () {};
    function partes(it) { return it.querySelectorAll('.servico__nome, .servico__texto, .servico__link'); }
    itens.forEach(function (it) {
      gsap.set(it.querySelector('.disjuntor__led'), { backgroundColor: COR.apagado, boxShadow: '0 0 0px rgba(244, 184, 28, 0)' });
      gsap.set(it.querySelector('.disjuntor'), { borderColor: COR.apagado, color: COR.fraco });
      gsap.set(partes(it), { opacity: 0.3, y: 14 });
    });
    ScrollTrigger.batch(itens, {
      start: 'top 90%', once: true,
      onEnter: function (els) {
        els.forEach(function (it, i) {
          var led = it.querySelector('.disjuntor__led'), dj = it.querySelector('.disjuntor');
          gsap.timeline({ delay: i * 0.12 })
            .to(partes(it), { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.05 }, 0)
            .to(led, { backgroundColor: COR.amarelo, duration: 0.04, ease: 'none' }, 0.18)
            .to(led, { backgroundColor: COR.apagado, duration: 0.05, ease: 'none' }, 0.25)
            .to(led, { backgroundColor: COR.amarelo, boxShadow: '0 0 7px rgba(244, 184, 28, 0.9)', duration: 0.05, ease: 'none' }, 0.33)
            .to(dj, { borderColor: 'rgba(244, 184, 28, 0.5)', color: COR.amarelo, duration: 0.25, ease: 'power2.out' }, 0.33)
            .set([led, dj], { clearProps: 'backgroundColor,boxShadow,borderColor,color' });
        });
      }
    });
    return function () {
      itens.forEach(function (it) {
        gsap.set([it.querySelector('.disjuntor__led'), it.querySelector('.disjuntor')], { clearProps: 'all' });
        gsap.set(partes(it), { clearProps: 'opacity,transform' });
      });
    };
  }

  // Fotos acendem como lâmpada: escuras, piscam e firmam (os cartões visíveis de cada carrossel e a foto do orçamento)
  function fotosAcendem() {
    var alvos = [];
    gsap.utils.toArray('[data-carrossel]').forEach(function (car) {
      var trilho = car.querySelector('[data-trilho]');
      var dir = trilho.getBoundingClientRect().right;
      [].slice.call(trilho.children).forEach(function (li) {
        var caixa = li.querySelector('.foto__moldura, .story:not(.story--perfil)');
        if (caixa && li.getBoundingClientRect().left < dir && abaixo(li)) alvos.push({ el: li, caixa: caixa });
      });
    });
    gsap.utils.toArray('[data-acende]').filter(abaixo).forEach(function (fig) {
      alvos.push({ el: fig, caixa: fig.querySelector('.orcamento__moldura') });
    });
    alvos.forEach(function (a) {
      a.sombra = doc.createElement('span');
      a.sombra.className = 'apagador';
      a.sombra.setAttribute('aria-hidden', 'true');
      a.caixa.appendChild(a.sombra);
      gsap.set(a.sombra, { opacity: 0.86 });
      a.el._acende = a;
    });
    ScrollTrigger.batch(alvos.map(function (a) { return a.el; }), {
      start: 'top 88%', once: true,
      onEnter: function (els) {
        els.forEach(function (e, i) {
          var a = e._acende;
          gsap.timeline({ delay: i * 0.1, onComplete: function () { a.sombra.remove(); } })
            .to(a.sombra, { opacity: 0.25, duration: 0.05, ease: 'none' })
            .to(a.sombra, { opacity: 0.72, duration: 0.06, ease: 'none' }, '+=0.05')
            .to(a.sombra, { opacity: 0, duration: 0.45, ease: 'power2.out' }, '+=0.04');
        });
      }
    });
    return function () { alvos.forEach(function (a) { if (a.sombra) a.sombra.remove(); }); };
  }

  // Lista do orçamento: os LEDs indicadores ligam um por um, na ordem de leitura
  function leds() {
    var lista = doc.querySelector('[data-checklist]');
    if (!lista || !abaixo(lista)) return function () {};
    var itens = [].slice.call(lista.children);
    itens.forEach(function (li) { li.classList.add('desligado'); });
    gsap.set(itens, { opacity: 0.35, y: 12 });
    var proximo = 0, pendentes = [];
    function ligar(li) {
      var t = performance.now() / 1000, em = Math.max(t + 0.3, proximo);
      proximo = em + 0.22;
      pendentes.push(gsap.delayedCall(em - t, function () {
        li.classList.remove('desligado');
        pendentes.push(gsap.delayedCall(0.05, function () { li.classList.add('desligado'); }));
        pendentes.push(gsap.delayedCall(0.11, function () { li.classList.remove('desligado'); }));
      }));
    }
    ScrollTrigger.batch(itens, {
      start: 'top 88%', once: true,
      onEnter: function (els) {
        gsap.to(els, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08 });
        els.forEach(ligar);
      }
    });
    return function () {
      pendentes.forEach(function (c) { c.kill(); });
      itens.forEach(function (li) { li.classList.remove('desligado'); });
    };
  }

  function resto() {
    var lista = gsap.utils.toArray('[data-reveal]').filter(abaixo);
    var mob = fone();
    gsap.set(lista, { y: mob ? 22 : 34, opacity: 0.35 });
    ScrollTrigger.batch(lista, {
      start: 'top 88%', once: true,
      onEnter: function (els) {
        gsap.to(els, { y: 0, opacity: 1, duration: mob ? 0.6 : 0.8, ease: 'power3.out', stagger: Math.min(0.08, 0.48 / els.length), overwrite: true });
      }
    });
  }

  /* ---------- Abertura: tomada, plugue, lâmpada e logo ---------- */
  function montarCena(svg, W, H, f) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    var s = f ? 0.72 : 1, cx = W / 2, cy = H / 2;
    var lw = f ? 120 : 172, lh = lw * 236 / 348;
    var LC = { x: cx - 46 * s, y: cy + 36 * s };          // centro da logo
    var rb = 16 * s, BC = { x: LC.x, y: LC.y - lh / 2 - 54 * s }; // centro do vidro da lâmpada
    var yn = BC.y - rb - 8 * s;                            // pescoço da lâmpada
    var pw = 40 * s, ph = 52 * s;
    var SC = { x: LC.x + lw / 2 + 48 * s + pw / 2, y: LC.y - 2 * s }; // centro da tomada
    var PL = SC.x - pw / 2;                                // borda esquerda do espelho da tomada
    var cabX = PL - 34 * s;                                // o cabo sobe aqui e vira para a tomada
    var n = function (v) { return Math.round(v * 10) / 10; };

    // Cordão da lâmpada, do teto até a rosca
    var cord = 'M' + n(BC.x) + ' -4 V' + n(yn - 12 * s);
    var cordao = [el('path', { 'class': 'c-brilho', d: cord }, svg), el('path', { 'class': 'c-fio', d: cord }, svg)];
    // Cabo do plugue: sobe da base da tela e vira para a tomada
    var cab = 'M' + n(cabX) + ' ' + n(H + 4) + ' V' + n(SC.y) + ' H' + n(PL - 28 * s);
    var cabo = [el('path', { 'class': 'c-brilho', d: cab }, svg), el('path', { 'class': 'c-fio', d: cab }, svg)];
    var fracaoVertical = (H + 4 - SC.y) / (H + 4 - SC.y + (PL - 28 * s - cabX));

    // Lâmpada (rosca em cima, vidro embaixo)
    var lampada = el('g', {}, svg);
    el('rect', { 'class': 'c-corpo', x: n(BC.x - 6 * s), y: n(yn - 12 * s), width: n(12 * s), height: n(12 * s), rx: n(1.5 * s) }, lampada);
    el('path', { 'class': 'c-traco', d: 'M' + n(BC.x - 6 * s) + ' ' + n(yn - 8 * s) + ' H' + n(BC.x + 6 * s) + ' M' + n(BC.x - 6 * s) + ' ' + n(yn - 4 * s) + ' H' + n(BC.x + 6 * s) }, lampada);
    var vidroD = 'M' + n(BC.x - 6 * s) + ' ' + n(yn) +
      ' C' + n(BC.x - 6 * s) + ' ' + n(yn + 6 * s) + ' ' + n(BC.x - rb) + ' ' + n(BC.y - rb * 0.55) + ' ' + n(BC.x - rb) + ' ' + n(BC.y) +
      ' A' + n(rb) + ' ' + n(rb) + ' 0 0 0 ' + n(BC.x + rb) + ' ' + n(BC.y) +
      ' C' + n(BC.x + rb) + ' ' + n(BC.y - rb * 0.55) + ' ' + n(BC.x + 6 * s) + ' ' + n(yn + 6 * s) + ' ' + n(BC.x + 6 * s) + ' ' + n(yn) + ' Z';
    el('path', { 'class': 'c-vidro', d: vidroD }, lampada);
    var aceso = el('path', { 'class': 'c-aceso', d: vidroD }, lampada);
    var filamento = el('path', { 'class': 'c-filamento', d: 'M' + n(BC.x - 5 * s) + ' ' + n(BC.y + 2 * s) + ' L' + n(BC.x - 2.5 * s) + ' ' + n(BC.y - 4 * s) + ' L' + n(BC.x) + ' ' + n(BC.y + 2 * s) + ' L' + n(BC.x + 2.5 * s) + ' ' + n(BC.y - 4 * s) + ' L' + n(BC.x + 5 * s) + ' ' + n(BC.y + 2 * s) }, lampada);

    // Tomada de três pinos (padrão brasileiro), de frente
    var tomada = el('g', {}, svg);
    var espelho = el('rect', { 'class': 'c-corpo', x: n(PL), y: n(SC.y - ph / 2), width: n(pw), height: n(ph), rx: n(7 * s) }, tomada);
    el('circle', { 'class': 'c-traco', cx: n(SC.x), cy: n(SC.y), r: n(13 * s) }, tomada);
    var furos = [[-5, 3], [5, 3], [0, -6]].map(function (o) {
      return el('circle', { 'class': 'c-furo', cx: n(SC.x + o[0] * s), cy: n(SC.y + o[1] * s), r: n(2.4 * s) }, tomada);
    });

    // Plugue (de lado, pinos para a tomada); o corpo preto esconde a ponta do cabo
    var plugue = el('g', {}, svg);
    el('path', { 'class': 'c-traco', d: 'M' + n(PL - 8 * s) + ' ' + n(SC.y - 4 * s) + ' H' + n(PL + 3 * s) + ' M' + n(PL - 8 * s) + ' ' + n(SC.y + 4 * s) + ' H' + n(PL + 3 * s) }, plugue);
    el('rect', { 'class': 'c-corpo', x: n(PL - 28 * s), y: n(SC.y - 8 * s), width: n(20 * s), height: n(16 * s), rx: n(3 * s) }, plugue);

    // Fagulhas do encaixe
    var fagulhas = [];
    for (var i = 0; i < 7; i++) fagulhas.push(el('line', { 'class': 'c-traco', x1: n(PL), y1: n(SC.y), x2: n(PL), y2: n(SC.y), opacity: 0 }, svg));

    return {
      s: s, lw: lw, lh: lh, LC: LC, BC: BC, SC: SC, PL: PL,
      cordao: cordao, cabo: cabo, fracaoVertical: fracaoVertical,
      lampada: lampada, aceso: aceso, filamento: filamento,
      tomada: tomada, espelho: espelho, furos: furos, plugue: plugue, fagulhas: fagulhas,
      plugueY: H + 30 - SC.y, plugueX: -14 * s
    };
  }

  /* ---------- Tudo junto, com e sem "reduzir movimento" ---------- */
  var mm = gsap.matchMedia();
  mm.add({ motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' }, function (ctx) {
    var temLinha = !!(main && svgLinha && fotoHero && ctaFinal);

    if (ctx.conditions.reduce) {
      // Estado final, parado: cabo inteiro energizado e botão aceso (o CSS já deixa aceso)
      endIntro();
      if (!temLinha) return;
      var parada = montarLinha();
      var t = null;
      function redesenhar() { clearTimeout(t); t = setTimeout(parada.aplicar, 150); }
      window.addEventListener('resize', redesenhar);
      if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(parada.aplicar);
      return function () { window.removeEventListener('resize', redesenhar); parada.destruir(); };
    }

    ctx.vivo = true;
    var limpezas = [];
    lenis = ligarLenis();

    /* Topo: estados iniciais enquanto a abertura cobre a tela */
    var intro = doc.querySelector('[data-intro]');
    var comAbertura = root.classList.contains('has-intro') && !!intro;
    var tituloHero = doc.querySelector('[data-hero-titulo]');
    var itensHero = gsap.utils.toArray('[data-hero-item]');
    var escuro = doc.querySelector('[data-hero-escuro]');
    var led = doc.querySelector('[data-hero-led]');
    var linha = temLinha ? montarLinha() : null;
    var faisca = linha ? criarFaisca(svgLinha, fone()) : null;
    var progresso = [], molduraPronta = !comAbertura, ligou = false;

    if (comAbertura) {
      gsap.set(tituloHero, { opacity: 0.1 });
      gsap.set(itensHero, { opacity: 0, y: 24 });
      if (escuro) gsap.set(escuro, { opacity: 0.8 });
      if (linha) gsap.set(linha.moldura, { drawSVG: '0%' });
    }

    // A faísca fica na ponta do trecho energizado mais adiantado; antes de rolar, espera no canto da foto
    function atualizarPonta() {
      if (!faisca || !molduraPronta) return;
      var k = -1;
      for (var i = 0; i < progresso.length; i++) if (progresso[i] > 0) k = i;
      if (k === NPECAS - 1 && progresso[k] >= 1) { faisca.esconder(); return; }
      if (k < 0) { var ini = linha.layout().inicio; faisca.mover(ini.x, ini.y); return; }
      var pt = linha.ponto(k, progresso[k]);
      faisca.mover(pt.x, pt.y);
    }

    function heroIn(curta) {
      var tl = gsap.timeline();
      if (window.SplitText && (!doc.fonts || doc.fonts.status === 'loaded')) letreiro(tituloHero, tl, 0.05);
      else tl.to(tituloHero, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0);
      tl.to(itensHero, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.07 }, 0.22);
      if (linha) {
        var prog = { p: 0 };
        tl.to(prog, {
          p: 1, duration: curta ? 0.8 : 1.15, ease: 'power2.inOut',
          onUpdate: function () {
            gsap.set(linha.moldura, { drawSVG: (prog.p * 100) + '%' });
            if (faisca) { var pt = linha.pontoMoldura(prog.p); faisca.mover(pt.x, pt.y); }
          },
          // Desenhada, a moldura vira traço normal (acompanha mudanças de tamanho) e a faísca espera no canto
          onComplete: function () {
            linha.moldura.forEach(function (p) { p.style.strokeDasharray = 'none'; p.style.strokeDashoffset = '0'; });
            molduraPronta = true;
            atualizarPonta();
          }
        }, 0.15);
      }
      if (led && escuro) {
        var fios = led.querySelectorAll('path');
        var grupos = led.querySelectorAll('g');
        tl.set(led, { autoAlpha: 1 }, 0.25)
          .fromTo(fios, { drawSVG: '0%' }, { drawSVG: '100%', duration: curta ? 0.55 : 0.8, ease: 'power2.inOut', stagger: 0.1 }, 0.25)
          // O LED pisca ao ligar e a sala acende
          .to(grupos, { opacity: 0.3, duration: 0.05, ease: 'none' }, curta ? 0.85 : 1.1)
          .to(grupos, { opacity: 1, duration: 0.04, ease: 'none' })
          .to(grupos, { opacity: 0.5, duration: 0.05, ease: 'none' }, '+=0.05')
          .to(grupos, { opacity: 1, duration: 0.05, ease: 'none' })
          .to(escuro, { opacity: 0, duration: 0.7, ease: 'power2.out' }, '-=0.02')
          .to(led, { autoAlpha: 0, duration: 0.8, ease: 'power1.inOut' }, '+=0.15');
      }
      return tl;
    }

    function linhaNaRolagem() {
      if (!linha) return;
      var scrub = fone() ? 0.4 : 0.6;
      linha.pecas.forEach(function (par, i) {
        progresso[i] = 0;
        gsap.fromTo(par, { drawSVG: '0%' }, {
          drawSVG: '100%', ease: 'none',
          onUpdate: function () {
            progresso[i] = this.progress();
            atualizarPonta();
            if (i === NPECAS - 1 && progresso[i] >= 1 && !ligou) { ligou = true; acender(); }
          },
          scrollTrigger: {
            trigger: main,
            start: function () { return 'top+=' + linha.layout().pecas[i].s0 + ' ' + PONTA * 100 + '%'; },
            end: function () { return 'top+=' + linha.layout().pecas[i].s1 + ' ' + PONTA * 100 + '%'; },
            scrub: scrub,
            invalidateOnRefresh: true
          }
        });
      });
      // O botão começa desligado; a faísca chega e ele liga
      gsap.set(ctaFinal, { backgroundColor: 'rgba(244, 184, 28, 0)', color: COR.texto, boxShadow: 'inset 0 0 0 1px ' + COR.linhaForte });
    }

    function acender() {
      var j = linha.layout().junta;
      if (faisca) faisca.estourar(j.x, j.y, fone() ? 6 : 10, fone() ? 34 : 46);
      gsap.timeline({ onComplete: function () { gsap.set(ctaFinal, { clearProps: 'backgroundColor,color,boxShadow' }); } })
        .to(ctaFinal, { backgroundColor: COR.amarelo, color: COR.tinta, boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0)', duration: 0.05, ease: 'none' })
        .to(ctaFinal, { backgroundColor: 'rgba(244, 184, 28, 0.2)', duration: 0.05, ease: 'none' }, '+=0.06')
        .to(ctaFinal, { backgroundColor: COR.amarelo, duration: 0.05, ease: 'none' }, '+=0.05')
        .to(ctaFinal, { backgroundColor: 'rgba(244, 184, 28, 0.55)', duration: 0.04, ease: 'none' }, '+=0.08')
        .to(ctaFinal, { backgroundColor: COR.amarelo, duration: 0.06, ease: 'none' })
        .to(ctaFinal, { scale: 1.045, duration: 0.18, ease: 'power2.out' }, '<')
        .to(ctaFinal, { scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.5)', clearProps: 'transform' });
    }

    if (linha) {
      ScrollTrigger.addEventListener('refreshInit', linha.aplicar);
      ScrollTrigger.addEventListener('refresh', atualizarPonta);
      limpezas.push(function () {
        ScrollTrigger.removeEventListener('refreshInit', linha.aplicar);
        ScrollTrigger.removeEventListener('refresh', atualizarPonta);
        if (faisca) faisca.destruir();
        linha.destruir();
      });
    }

    /* Abertura */
    function playIntro() {
      if (!ctx.vivo) return;
      if (!comAbertura) {
        // Sem abertura (link direto para uma seção): o topo já aparece pronto
        if (linha) gsap.set(linha.moldura, { drawSVG: '100%' });
        if (led) gsap.set(led, { autoAlpha: 0 });
        endIntro();
        ScrollTrigger.refresh();
        return;
      }
      var visto = false;
      try { visto = sessionStorage.getItem('hs-intro') === '1'; sessionStorage.setItem('hs-intro', '1'); } catch (e) {}
      var nav = performance.getEntriesByType ? performance.getEntriesByType('navigation')[0] : null;
      var curta = visto || (nav && nav.type === 'reload');

      var fundo = intro.querySelector('[data-intro-fundo]');
      var luz = intro.querySelector('[data-intro-luz]');
      var svg = intro.querySelector('[data-intro-cena]');
      var logo = intro.querySelector('[data-intro-logo]');
      var W = window.innerWidth, H = window.innerHeight, f = fone();
      var c = montarCena(svg, W, H, f);
      gsap.set(logo, { left: c.LC.x - c.lw / 2, top: c.LC.y - c.lh / 2 });
      gsap.set(luz, { left: c.BC.x, top: c.BC.y, scale: 0.35, opacity: 0 });
      var diag = Math.max(
        Math.hypot(c.BC.x, c.BC.y), Math.hypot(W - c.BC.x, c.BC.y),
        Math.hypot(c.BC.x, H - c.BC.y), Math.hypot(W - c.BC.x, H - c.BC.y)
      ) + 120;
      fundo.style.setProperty('--mx', c.BC.x + 'px');
      fundo.style.setProperty('--my', c.BC.y + 'px');
      fundo.style.setProperty('--mr', '0px');

      // Solta a página assim que a luz termina de abrir; o topo continua acendendo com a página já livre
      var terminou = false;
      function fim() {
        if (terminou) return;
        terminou = true;
        soltarEventos();
        endIntro();
        fundo.classList.remove('abrindo');
        if (lenis) lenis.start();
        ScrollTrigger.refresh();
      }
      var EVENTOS = ['pointerdown', 'wheel', 'touchstart', 'keydown'];
      function pular() { tl.timeScale(5); soltarEventos(); }
      function soltarEventos() { EVENTOS.forEach(function (ev) { window.removeEventListener(ev, pular); }); }
      if (lenis) lenis.stop();
      var tl = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: fim });
      EVENTOS.forEach(function (ev) { window.addEventListener(ev, pular, { passive: true }); });
      ctx.add(function () { return function () { soltarEventos(); }; });

      var fios = c.cordao.concat(c.cabo);
      function piscarLampada(pos0) {
        tl.to([c.aceso, c.filamento], { opacity: 1, duration: 0.05, ease: 'none' }, pos0)
          .to(fios, { opacity: 1, duration: 0.05, ease: 'none' }, pos0)
          .to([c.aceso, c.filamento], { opacity: 0.25, duration: 0.05, ease: 'none' }, pos0 + 0.08)
          .to([c.aceso, c.filamento], { opacity: 1, duration: 0.05, ease: 'none' }, pos0 + 0.15)
          .to([c.aceso, c.filamento], { opacity: 0.55, duration: 0.04, ease: 'none' }, pos0 + 0.23)
          .to([c.aceso, c.filamento], { opacity: 1, duration: 0.05, ease: 'none' }, pos0 + 0.29);
      }
      function abrir(pos0, dur) {
        tl.call(function () { fundo.classList.add('abrindo'); }, null, pos0)
          .to(fundo, { '--mr': diag + 'px', duration: dur, ease: 'power2.inOut' }, pos0)
          .to([svg, logo], { opacity: 0, duration: dur * 0.45, ease: 'power1.in' }, pos0 + dur * 0.15)
          .to(luz, { scale: 2.4, opacity: 0, duration: dur * 0.9, ease: 'power2.out' }, pos0)
          .call(fim, null, pos0 + dur + 0.05);
      }

      if (curta) {
        // Segunda visita ou recarga: tudo já ligado; a lâmpada pisca e a luz abre a página
        gsap.set(c.plugue, { x: 0, y: 0 });
        gsap.set([c.aceso, c.filamento, logo], { opacity: 1 });
        gsap.set(luz, { opacity: 1, scale: 1 });
        tl.to([c.aceso, c.filamento], { opacity: 0.3, duration: 0.05, ease: 'none' }, 0.05)
          .to([c.aceso, c.filamento], { opacity: 1, duration: 0.05, ease: 'none' }, 0.12);
        abrir(0.22, 0.65);
        tl.add(heroIn(true), 0.4);
      } else {
        // Primeira visita: a lâmpada e a tomada aparecem, o plugue encaixa com faísca, a lâmpada acende e mostra a logo
        gsap.set(fios, { opacity: 0.5 });
        gsap.set(c.cordao, { drawSVG: '0%' });
        gsap.set(c.cabo, { drawSVG: '0%' });
        gsap.set([c.lampada, c.tomada], { opacity: 0 });
        gsap.set(c.plugue, { x: c.plugueX, y: c.plugueY });
        gsap.set(logo, { opacity: 0, scale: 0.96, filter: 'brightness(0.35)' });
        tl.to(c.cordao, { drawSVG: '100%', duration: 0.45, ease: 'power2.out' }, 0.1)
          .to(c.lampada, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0.4)
          .to(c.tomada, { opacity: 1, duration: 0.35, ease: 'power2.out' }, 0.15)
          // O cabo sobe com o plugue na ponta e vira para a tomada
          .to(c.cabo, { drawSVG: (c.fracaoVertical * 100).toFixed(2) + '%', duration: 0.7, ease: 'power2.inOut' }, 0.45)
          .to(c.plugue, { y: 0, duration: 0.7, ease: 'power2.inOut' }, 0.45)
          .to(c.cabo, { drawSVG: '100%', duration: 0.18, ease: 'power2.in' }, 1.15)
          .to(c.plugue, { x: 0, duration: 0.18, ease: 'power2.in' }, 1.15)
          // Encaixe: um tranco, faísca e a tomada acende por um instante
          .to(c.plugue, { x: -1.5 * c.s, duration: 0.05, ease: 'power1.out' }, 1.33)
          .to(c.plugue, { x: 0, duration: 0.08, ease: 'power1.in' }, 1.38)
          .to(c.espelho, { attr: { 'stroke-width': 2.6 }, duration: 0.05, ease: 'none' }, 1.33)
          .to(c.espelho, { attr: { 'stroke-width': 1.6 }, duration: 0.3, ease: 'power2.out' }, 1.4)
          .to(c.furos, { attr: { fill: '#ffd978' }, duration: 0.04, ease: 'none' }, 1.33)
          .to(c.furos, { attr: { fill: '#000000' }, duration: 0.25, ease: 'power2.out' }, 1.45);
        c.fagulhas.forEach(function (fg, i) {
          var ang = (-150 + i * 50) * Math.PI / 180, comp = (10 + Math.random() * 8) * c.s;
          var x0 = c.PL, y0 = c.SC.y;
          tl.fromTo(fg, { attr: { x1: x0, y1: y0, x2: x0, y2: y0 }, opacity: 1 }, {
            attr: { x1: x0 + Math.cos(ang) * comp * 0.5, y1: y0 + Math.sin(ang) * comp * 0.5, x2: x0 + Math.cos(ang) * comp, y2: y0 + Math.sin(ang) * comp },
            opacity: 0, duration: 0.28, ease: 'power2.out'
          }, 1.33);
        });
        // A lâmpada pisca e acende; a luz dela mostra a logo
        piscarLampada(1.42);
        tl.to(luz, { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }, 1.62)
          .to(logo, { opacity: 1, scale: 1, filter: 'brightness(1)', duration: 0.65, ease: 'power3.out' }, 1.66);
        abrir(2.3, 1);
        tl.add(heroIn(false), 2.6);
      }
    }

    fontesProntas(1200).then(function () { ctx.add(playIntro); }, function () { ctx.add(playIntro); });

    /* Ao longo da página */
    ctx.add(function () {
      linhaNaRolagem();
      limpezas.push(titulos(ctx));
      limpezas.push(disjuntores());
      limpezas.push(fotosAcendem());
      limpezas.push(leds());
      resto();
    });
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { if (ctx.vivo) ScrollTrigger.refresh(); });

    return function () {
      ctx.vivo = false;
      limpezas.forEach(function (fn) { if (typeof fn === 'function') fn(); });
      desligarLenis();
      endIntro();
    };
  });
})();
