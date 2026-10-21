# Site da HS Engenharia e Elétrica

Site de negócio local (Senador Canedo – GO) feito em 20/10/2026 com as skills `site-premium` (conteúdo e estrutura)
e `site-agencia` (acabamento). Cliente: HS Engenharia e Elétrica (contato: Hugo).

## Fonte dos dados (nada inventado)

- Nome, endereço e horários: ficha do Google, copiada em `HS ENGENHARIA E ELETRICA.txt`.
- WhatsApp (62) 99165-3028 e Instagram @hsservicoseletricos: o mesmo arquivo; o número aparece na camisa da equipe.
- Serviços: bio do Instagram (engenharia civil e elétrica, projetos, obras, regularização, segurança contra incêndio,
  aprovações, alvarás, RT) e o que aparece nas fotos (LED, quadros, carregador de carro elétrico, interfone coletivo).
- Fotos: pasta `HS servicos eletricos (@hsservicoseletricos) • Fotos e vídeos do Instagram` (fora do git).
- Tudo fica em **`dados/hs.mjs`**, com as pendências marcadas como `PENDENTE` (lista no fim deste arquivo).

## Stack e comandos

Site estático, sem framework: o HTML é gerado a partir dos dados (bom para o Google e funciona sem JavaScript).
GSAP 3.15 (ScrollTrigger, SplitText, DrawSVG) e Lenis 1.3 ficam copiados em `site/vendor/`. Fontes Saira (variável,
largura 50–125%) e Barlow auto-hospedadas em `site/fonts/` (a Archivo que fica lá é só da og-image e do kit).

- `python publicar/preparar-imagens.py`: gera `site/img/` (WebP em 3 tamanhos, logo transparente, ícones). Nada é ampliado.
- `node publicar/build.mjs`: gera `dist/` (index, 404, robots, sitemap, JSON-LD, og-image com `?v=hash`, só a mídia usada).
  Opcional: `GA_ID=G-...` (Analytics com aviso de cookies, `publicar/aviso-cookies-ga4.html`) e `GSC=<token>`.
- Ver local: `node publicar/servir.mjs` → http://127.0.0.1:8766/ (o `http.server` do Python recusa conexões paralelas)
- Prévia do link: `node ~/.claude/skills/site-agencia/scripts/renderizar-html.mjs publicar/og-image.html - publicar/og-image.jpg 1200 630 88`
- Kit: prints reais em `divulgacao/prints/` (roteiro no histórico: rolar até a seção, esperar a animação, esconder o rótulo
  "Fale com a gente"), depois `node publicar/gerar-kit.mjs`. Vídeo: `filmar-celular.mjs` com `publicar/roteiro-filmagem.json`
  e `montar-video.mjs` com `divulgacao/capa-vertical.jpg` (conferir `High,yuv420p`).
- `vercel.json`: build `node publicar/build.mjs`, saída `dist`, cache de 7 dias em `/img` (imagem trocada = nome novo).

Arquivos: `site/pagina.mjs` (HTML), `site/css/hs.css`, `site/js/hs.js` (horário ao vivo, menu, carrosséis, foto ampliada,
WhatsApp flutuante), `site/js/movimento.js` (abertura, fio com faísca, revelações, fechamento).

## Identidade (tema elétrico, pedido do usuário)

- Cores do logo: preto `#0b0b0c`, amarelo `#f4b81c` (média medida no logo, #F1B517 a #FBD00F), luz de LED `#ffd978`,
  texto `#f2f0eb`, secundário `#a9a59d`. Botão amarelo com texto `#111` (contraste AA). Faixa zebrada amarela e preta
  (fita de quadro elétrico) no topo do rodapé.
- Fontes: **Saira** (largura variável, cantos retos, parecida com o "ENGENHARIA" do logo) em caixa alta nos títulos, botões
  e rótulos; **Barlow** (letra de placa industrial) no texto. Nada das fontes do portfólio do usuário (Sora, Manrope, Inter).
- Serviços como circuitos do quadro: etiqueta de disjuntor com LED (C1 a C7). Lista do orçamento com LEDs indicadores.
- Voz: "a gente", direta, sem slogan. Títulos sem ponto final.

## Assinatura: energia e luz (refeita em 20/10/2026 a pedido do usuário)

O usuário pediu a abertura com tomada e lâmpada, o fio como "um tipo de curto-circuito" que acende o botão do WhatsApp,
tudo no tema de serviços elétricos, e sem lembrar o portfólio dele.
- **Abertura** (primeira visita, ~3,3 s; curta ao recarregar ou voltar na sessão; pula com toque, rolagem ou tecla):
  uma lâmpada desce do teto e uma tomada de três pinos aparece ao lado da logo (perto do plugue do desenho da logo);
  o cabo sobe com o plugue, que encaixa com uma faísca; a lâmpada pisca e acende, e a luz dela mostra a logo; a luz se
  espalha (máscara radial a partir da lâmpada) e abre a página. Depois, os perfis de LED da foto do topo acendem.
- **Ao longo**: o cabo fica instalado e apagado pelas margens; a energia corre por ele com a rolagem (ScrollTrigger com
  scrub), com uma faísca crepitando na ponta (raios e fagulhas). Antes de rolar, a faísca espera no canto da foto.
  Títulos acendem como letreiro (palavra por palavra), os disjuntores dos serviços ligam um por um, as fotos acendem
  como lâmpada e os LEDs da lista ligam em sequência.
- **Fechamento**: a faísca contorna o botão "Chamar no WhatsApp", estoura em fagulhas e o botão liga (piscada).
  Acontece quando o centro do botão chega a ~66% da tela. Uma vez.
- **Fora do site**: a og-image e o kit ainda usam a moldura de luz em volta do logo (o usuário pediu para não mexer nas
  artes de divulgação ao mudar a página); a 404 é um fio interrompido.
- **Reduzir movimento**: sem abertura, cabo inteiro energizado e parado, botão aceso, LEDs acesos, tudo visível.

Alternativas consideradas no início (quadros em `publicar/assinaturas-consideradas.jpg`): "Disjuntor que liga" e
"Cota de projeto". Revelações que **não** podem voltar (são do portfólio): títulos em máscara, réguas que se desenham,
cortina nas fotos, ✓ desenhado, botão magnético, caixa que abre a página.

## Decisões e armadilhas deste projeto

- **Não use o Draggable do GSAP com `type: "scrollLeft"` nos carrosséis**: ele envolve os itens numa div e quebra o
  flex do trilho (a página foi a 34 mil px). O arrastar com mouse é próprio (`hs.js`), com inércia num tween de `scrollLeft`
  e o scroll-snap nativo no toque.
- A métrica `dpr2/dpr3` do `auditar-pagina.mjs` não vale para imagens com `srcset` (o Chrome normaliza `naturalWidth`):
  confira pela conta (largura exibida × densidade ≤ largura do arquivo escolhido).
- Prints de story do Instagram (360 px) só em cartões de 124 px no celular e 168 px no resto. Lustre (271 px) e interfone
  (com figurinha de texto) ficaram fora por borrarem.
- Feriados: a ficha não informa. Nos feriados nacionais o status diz "confirme pelo WhatsApp" até `holidayHours` ser preenchido.
- O mapa busca "HS Engenharia e Elétrica, R. RP-11..." e mostra a ficha do Google com o pino.
- Sem botão de WhatsApp no cabeçalho do computador (preferência do usuário na Fino Trato): "Orçamento" leva à seção final.

## Publicação

Regra do usuário: sites de clientes vão para o GitHub **Roccogolden** e para a **Vercel** (time `huiataribeiro-6837`).
Repositório `Roccogolden/hs-engenharia-eletrica`, com o credential helper local fixado na conta Roccogolden (a conta
ativa do `gh` neste PC é outra). Endereço: `https://hs-engenharia-eletrica.vercel.app` (em `siteUrl`, no kit e em
`divulgacao/mensagens.txt`). No ar desde 20/10/2026.
- A publicação automática a cada push ainda não está ligada: o app da Vercel no GitHub da Roccogolden só acessa
  repositórios escolhidos. Quando o usuário liberar este (github.com/settings/installations → Vercel → Configure),
  rode `vercel git connect` aqui. Até lá: `vercel deploy --prod --scope huiataribeiro-6837` (a CLI vai numa pasta de
  rascunho com `npm i vercel` e roda com `node <pasta>/node_modules/vercel/dist/index.js`, porque o `npx` quebra com o
  "&" do nome do usuário). `.vercelignore` deixa de fora as fotos originais e o kit.
- Depois de cada publicação, conferir o deploy (`vercel inspect <url>`) e o site no ar. Ao mudar a página, não refazer as
artes de divulgação (pedido do usuário). Kit comercial da `site-premium`: `publicar/mensagem-cliente.txt`; o contrato
precisa da razão social e do CNPJ.

## Pendências do cliente

Ver `pendencias` em `dados/hs.mjs`: logo original em alta, link da ficha do Google (avaliações), horário nos feriados,
cidades atendidas, responsável técnico e CREA (se quiser mostrar), ano de início, vídeos originais dos reels,
domínio, razão social e CNPJ, ID do Google Analytics.
