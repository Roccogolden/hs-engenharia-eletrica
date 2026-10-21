/* HS Engenharia e Elétrica: interface (sem dependências; a inércia do arrastar usa o GSAP se ele carregou).
   Horário ao vivo, menu do celular, carrosséis, foto ampliada e botão do WhatsApp.
   O movimento (abertura, linha de luz, revelações) fica em movimento.js. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mouse = window.matchMedia('(hover: hover) and (pointer: fine)');

  // Trava e solta a rolagem da página (menu e foto ampliada). movimento.js escuta para parar a rolagem suave.
  var travas = 0;
  function travar() {
    if (travas++ === 0) { root.style.overflow = 'hidden'; doc.dispatchEvent(new CustomEvent('hs:travar')); }
  }
  function soltar() {
    if (travas > 0 && --travas === 0) { root.style.overflow = ''; doc.dispatchEvent(new CustomEvent('hs:soltar')); }
  }

  /* ---------- Horário (fuso de Goiás, independente do fuso de quem visita) ---------- */
  var dados = {};
  try { dados = JSON.parse(doc.getElementById('hs-dados').textContent); } catch (e) {}
  var DIA = 86400000;
  var FERIADOS_FIXOS = ['01-01', '04-21', '05-01', '09-07', '10-12', '11-02', '11-15', '11-20', '12-25'];
  var NOMES = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function minutos(t) { var p = t.split(':'); return +p[0] * 60 + +p[1]; }
  function hora(t) { var p = t.split(':'); return +p[0] + 'h' + (p[1] === '00' ? '' : p[1]); }

  // Sexta-feira Santa: dois dias antes da Páscoa (algoritmo de Meeus/Jones/Butcher)
  function sextaSanta(ano) {
    var a = ano % 19, b = Math.floor(ano / 100), c = ano % 100, d = Math.floor(b / 4), e = b % 4;
    var f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    var i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    var mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
    var sexta = new Date(Date.UTC(ano, mes - 1, dia) - 2 * DIA);
    return pad(sexta.getUTCMonth() + 1) + '-' + pad(sexta.getUTCDate());
  }

  function diaDaEmpresa(utc) {
    var dt = new Date(utc), md = pad(dt.getUTCMonth() + 1) + '-' + pad(dt.getUTCDate());
    var feriado = FERIADOS_FIXOS.indexOf(md) > -1 || md === sextaSanta(dt.getUTCFullYear());
    var regra = (dados.hours || []).filter(function (h) { return h.weekday === dt.getUTCDay(); })[0];
    var faixa = regra && regra.open ? { open: regra.open, close: regra.close } : null;
    if (feriado) {
      if (dados.holidayHours === 'fechado') faixa = null;
      else if (dados.holidayHours && faixa) faixa = dados.holidayHours;
    }
    return { utc: utc, weekday: dt.getUTCDay(), feriado: feriado, faixa: faixa };
  }

  var formato = null;
  function agora() {
    try {
      formato = formato || new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Sao_Paulo', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hourCycle: 'h23'
      });
      var partes = {};
      formato.formatToParts(new Date()).forEach(function (p) { partes[p.type] = +p.value; });
      return { hoje: diaDaEmpresa(Date.UTC(partes.year, partes.month - 1, partes.day)), min: partes.hour * 60 + partes.minute };
    } catch (e) {
      var d = new Date();
      return { hoje: diaDaEmpresa(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())), min: d.getHours() * 60 + d.getMinutes() };
    }
  }

  function situacao() {
    var a = agora(), hoje = a.hoje;
    if (hoje.feriado && !dados.holidayHours) return { classe: 'feriado', texto: 'Hoje é feriado · confirme o atendimento pelo WhatsApp', hoje: hoje };
    if (hoje.faixa) {
      if (a.min >= minutos(hoje.faixa.open) && a.min < minutos(hoje.faixa.close)) {
        return { classe: 'aberto', texto: 'Atendendo agora · até ' + hora(hoje.faixa.close), hoje: hoje };
      }
      if (a.min < minutos(hoje.faixa.open)) {
        return { classe: 'fechado', texto: 'Fechado agora · abre hoje às ' + hora(hoje.faixa.open), hoje: hoje };
      }
    }
    for (var i = 1; i <= 7; i++) {
      var prox = diaDaEmpresa(hoje.utc + i * DIA);
      if (prox.faixa) {
        var quando = i === 1 ? 'amanhã' : NOMES[prox.weekday];
        return { classe: 'fechado', texto: 'Fechado agora · abre ' + quando + ' às ' + hora(prox.faixa.open), hoje: hoje };
      }
    }
    return { classe: 'fechado', texto: 'Fechado agora', hoje: hoje };
  }

  function atualizarHorario() {
    var s = situacao();
    doc.querySelectorAll('[data-status]').forEach(function (el) {
      el.classList.remove('aberto', 'fechado', 'feriado');
      el.classList.add(s.classe, 'pronto');
      var t = el.querySelector('[data-status-texto]');
      if (t && t.textContent !== s.texto) t.textContent = s.texto;
    });
    doc.querySelectorAll('[data-horario] > div').forEach(function (linha) {
      var alvo = s.hoje.feriado ? 'feriado' : String(s.hoje.weekday);
      linha.classList.toggle('hoje', linha.getAttribute('data-dia') === alvo);
    });
  }
  atualizarHorario();
  setInterval(atualizarHorario, 60000);

  /* ---------- Topo e menu do celular ---------- */
  var topo = doc.querySelector('[data-topo]');
  var menu = doc.querySelector('[data-menu]');
  var botaoMenu = doc.querySelector('[data-menu-botao]');
  var rotuloMenu = doc.querySelector('[data-menu-rotulo]');
  function aoRolar() { if (topo) topo.classList.toggle('rolou', window.scrollY > 24); }
  window.addEventListener('scroll', aoRolar, { passive: true });
  aoRolar();

  function abrirMenu(abrir) {
    if (!menu || !botaoMenu) return;
    var aberto = !menu.hidden;
    if (abrir === aberto) return;
    menu.hidden = !abrir;
    botaoMenu.setAttribute('aria-expanded', String(abrir));
    if (rotuloMenu) rotuloMenu.textContent = abrir ? 'Fechar menu' : 'Abrir menu';
    topo.classList.toggle('menu-aberto', abrir);
    if (abrir) { travar(); var primeiro = menu.querySelector('a'); if (primeiro) primeiro.focus(); }
    else soltar();
  }
  if (botaoMenu) botaoMenu.addEventListener('click', function () { abrirMenu(menu.hidden); });
  if (menu) {
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) abrirMenu(false); });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { abrirMenu(false); botaoMenu.focus(); }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (m) { if (m.matches) abrirMenu(false); });
  }

  /* ---------- Carrosséis ---------- */
  doc.querySelectorAll('[data-carrossel]').forEach(function (car) {
    var trilho = car.querySelector('[data-trilho]');
    var ant = car.querySelector('[data-anterior]');
    var prox = car.querySelector('[data-proxima]');
    if (!trilho) return;
    var itens = [].slice.call(trilho.children);

    function estado() {
      var max = trilho.scrollWidth - trilho.clientWidth;
      car.classList.toggle('cabe', max <= 2);
      if (ant) ant.disabled = trilho.scrollLeft <= 2;
      if (prox) prox.disabled = trilho.scrollLeft >= max - 2;
    }
    // Vai até o próximo cartão que está fora da tela (ou o anterior)
    function passo(direcao) {
      var esq = trilho.getBoundingClientRect().left + parseFloat(getComputedStyle(trilho).scrollPaddingLeft || 0);
      var alvo = null;
      if (direcao > 0) {
        for (var i = 0; i < itens.length; i++) {
          if (itens[i].getBoundingClientRect().left > esq + 4) { alvo = itens[i]; break; }
        }
      } else {
        for (var j = itens.length - 1; j >= 0; j--) {
          if (itens[j].getBoundingClientRect().left < esq - 4) { alvo = itens[j]; break; }
        }
      }
      if (!alvo) return;
      var delta = alvo.getBoundingClientRect().left - esq;
      trilho.scrollBy({ left: delta, behavior: reduzir.matches ? 'auto' : 'smooth' });
    }
    if (ant) ant.addEventListener('click', function () { passo(-1); });
    if (prox) prox.addEventListener('click', function () { passo(1); });
    trilho.addEventListener('scroll', estado, { passive: true });
    window.addEventListener('resize', estado);
    trilho.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); passo(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); passo(-1); }
    });
    estado();

    // Arrastar com o mouse, com inércia, parando num cartão. No toque, a rolagem nativa já faz isso.
    // (O Draggable do GSAP no modo scrollLeft envolve os itens numa div e quebra o flex do trilho, por isso é feito aqui.)
    if (mouse.matches) {
      var x0 = 0, s0 = 0, arrastou = false, apertado = false, amostras = [], solta = null;
      var pontos = function () {
        var base = trilho.getBoundingClientRect().left - trilho.scrollLeft;
        var max = trilho.scrollWidth - trilho.clientWidth;
        return itens.map(function (it) { return Math.min(max, Math.max(0, it.getBoundingClientRect().left - base)); });
      };
      trilho.addEventListener('pointerdown', function (e) {
        if (e.pointerType !== 'mouse' || e.button !== 0 || car.classList.contains('cabe')) return;
        if (solta) { solta.kill(); solta = null; }
        apertado = true; arrastou = false;
        x0 = e.clientX; s0 = trilho.scrollLeft; amostras = [{ x: e.clientX, t: e.timeStamp }];
      });
      window.addEventListener('pointermove', function (e) {
        if (!apertado) return;
        var dx = e.clientX - x0;
        if (!arrastou && Math.abs(dx) < 6) return;
        if (!arrastou) { arrastou = true; trilho.classList.add('arrastando'); }
        trilho.scrollLeft = s0 - dx;
        amostras.push({ x: e.clientX, t: e.timeStamp });
        if (amostras.length > 5) amostras.shift();
      });
      window.addEventListener('pointerup', function () {
        if (!apertado) return;
        apertado = false;
        if (!arrastou) return;
        var a = amostras[0], b = amostras[amostras.length - 1];
        var v = b.t > a.t ? (b.x - a.x) / (b.t - a.t) : 0; // px por ms
        var alvo = trilho.scrollLeft - (reduzir.matches ? 0 : v * 320);
        var p = pontos(), melhor = p[0];
        p.forEach(function (x) { if (Math.abs(x - alvo) < Math.abs(melhor - alvo)) melhor = x; });
        var fim = function () {
          trilho.classList.remove('arrastando');
          estado();
          setTimeout(function () { arrastou = false; }, 0);
        };
        if (window.gsap && !reduzir.matches) {
          solta = window.gsap.to(trilho, { scrollLeft: melhor, duration: 0.7, ease: 'power3.out', onComplete: fim });
        } else { trilho.scrollLeft = melhor; fim(); }
      });
      // O clique que encerra um arraste não abre a foto
      trilho.addEventListener('click', function (e) {
        if (arrastou) { e.preventDefault(); e.stopPropagation(); }
      }, true);
      trilho.addEventListener('dragstart', function (e) { e.preventDefault(); });
      trilho.style.cursor = 'grab';
    }
  });

  /* ---------- Foto ampliada ---------- */
  var caixa = null, lista = [], atual = 0, origem = null, toqueX = null;
  function montarCaixa() {
    caixa = doc.createElement('div');
    caixa.className = 'caixa-foto';
    caixa.hidden = true;
    caixa.setAttribute('role', 'dialog');
    caixa.setAttribute('aria-modal', 'true');
    caixa.innerHTML =
      '<button type="button" class="caixa-foto__botao caixa-foto__fechar" aria-label="Fechar">' + icone('M6 6l12 12M18 6 6 18') + '</button>' +
      '<button type="button" class="caixa-foto__botao caixa-foto__ant" aria-label="Foto anterior">' + icone('M20 12H5M11 6l-6 6 6 6') + '</button>' +
      '<button type="button" class="caixa-foto__botao caixa-foto__prox" aria-label="Próxima foto">' + icone('M4 12h15M13 6l6 6-6 6') + '</button>' +
      '<figure><img alt=""><figcaption><span class="caixa-foto__legenda"></span><span class="caixa-foto__conta"></span></figcaption></figure>';
    doc.body.appendChild(caixa);
    caixa.querySelector('.caixa-foto__fechar').addEventListener('click', fechar);
    caixa.querySelector('.caixa-foto__ant').addEventListener('click', function (e) { e.stopPropagation(); ir(-1); });
    caixa.querySelector('.caixa-foto__prox').addEventListener('click', function (e) { e.stopPropagation(); ir(1); });
    caixa.addEventListener('click', function (e) { if (e.target === caixa) fechar(); });
    caixa.addEventListener('touchstart', function (e) { toqueX = e.touches[0] ? e.touches[0].clientX : null; }, { passive: true });
    caixa.addEventListener('touchend', function (e) {
      var fimX = e.changedTouches[0] ? e.changedTouches[0].clientX : null;
      if (toqueX !== null && fimX !== null && Math.abs(fimX - toqueX) > 50 && lista.length > 1) ir(fimX < toqueX ? 1 : -1);
      toqueX = null;
    });
    caixa.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') fechar();
      else if (e.key === 'ArrowRight') ir(1);
      else if (e.key === 'ArrowLeft') ir(-1);
      else if (e.key === 'Tab') {
        var bts = [].slice.call(caixa.querySelectorAll('button')).filter(function (b) { return !b.hidden; });
        var i = bts.indexOf(doc.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); bts[bts.length - 1].focus(); }
        else if (!e.shiftKey && i === bts.length - 1) { e.preventDefault(); bts[0].focus(); }
      }
    });
  }
  function icone(d) {
    return '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="square" aria-hidden="true"><path d="' + d + '"/></svg>';
  }
  function mostrar() {
    var item = lista[atual];
    var img = caixa.querySelector('img');
    img.src = item.src;
    img.alt = item.alt;
    caixa.querySelector('.caixa-foto__legenda').textContent = item.legenda;
    caixa.querySelector('.caixa-foto__conta').textContent = lista.length > 1 ? (atual + 1) + ' / ' + lista.length : '';
    caixa.setAttribute('aria-label', item.legenda);
    caixa.querySelector('.caixa-foto__ant').hidden = lista.length < 2;
    caixa.querySelector('.caixa-foto__prox').hidden = lista.length < 2;
  }
  function ir(d) { if (lista.length < 2) return; atual = (atual + d + lista.length) % lista.length; mostrar(); }
  function abrir(botoes, i) {
    if (!caixa) montarCaixa();
    lista = botoes.map(function (b) {
      var img = b.querySelector('img');
      return { src: b.getAttribute('data-src'), alt: img ? img.alt : '', legenda: b.getAttribute('data-legenda') || '' };
    });
    atual = i;
    origem = botoes[i]; // no Safari o clique não foca o botão: guarda o próprio botão para devolver o foco
    mostrar();
    caixa.hidden = false;
    travar();
    caixa.querySelector('.caixa-foto__fechar').focus();
  }
  function fechar() {
    if (!caixa || caixa.hidden) return;
    caixa.hidden = true;
    soltar();
    if (origem && origem.focus) origem.focus({ preventScroll: true });
  }
  doc.querySelectorAll('[data-carrossel]').forEach(function (car) {
    var botoes = [].slice.call(car.querySelectorAll('[data-foto]'));
    botoes.forEach(function (b, i) { b.addEventListener('click', function () { abrir(botoes, i); }); });
  });

  /* ---------- WhatsApp flutuante: o rótulo aparece sozinho uma vez por sessão ---------- */
  var zap = doc.querySelector('[data-zap]');
  if (zap) {
    var jaViu = false;
    try { jaViu = sessionStorage.getItem('hs-zap') === '1'; } catch (e) {}
    if (!jaViu) {
      (function esperar() {
        if (root.classList.contains('has-intro')) return setTimeout(esperar, 400);
        setTimeout(function () {
          zap.classList.add('chamando');
          try { sessionStorage.setItem('hs-zap', '1'); } catch (e) {}
          setTimeout(function () { zap.classList.remove('chamando'); }, 7000);
        }, 6000);
      })();
    }
  }
})();
