// Gera o site pronto em dist/ (é o que a Vercel publica). Sem dependências: Node 20+.
// Uso: node publicar/build.mjs
// Opcional por variável de ambiente: GA_ID=G-XXXX (Google Analytics com aviso de cookies), GSC=<token do Search Console>.
//
// O que faz:
// - monta index.html e 404.html a partir de dados/hs.mjs (site/pagina.mjs);
// - título, descrição, canonical, og:*, og-image.jpg?v=<hash> (o WhatsApp só busca a prévia nova se o endereço mudar);
// - JSON-LD (Electrician + GeneralContractor) com endereço, telefone, horário e serviços;
// - copia CSS, JS, bibliotecas, fonte e só as imagens que a página usa (falha se faltar alguma);
// - robots.txt e sitemap.xml.
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = join(RAIZ, "site");
const DIST = join(RAIZ, "dist");
const d = await import(pathToFileURL(join(RAIZ, "dados", "hs.mjs")).href);
const { paginaInicial, pagina404 } = await import(pathToFileURL(join(SITE, "pagina.mjs")).href);

const hash = (arquivo) => createHash("sha1").update(readFileSync(arquivo)).digest("hex").slice(0, 8);

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

// Prévia do link (gerada por publicar/og-image.html, ver CLAUDE.md)
const og = join(RAIZ, "publicar", "og-image.jpg");
let ogImage = null;
if (existsSync(og)) {
  cpSync(og, join(DIST, "og-image.jpg"));
  ogImage = `${d.siteUrl}/og-image.jpg?v=${hash(og)}`;
} else {
  console.warn("Aviso: publicar/og-image.jpg não existe; a página sai sem prévia do link.");
}

const versoes = {
  css: hash(join(SITE, "css", "hs.css")),
  hs: hash(join(SITE, "js", "hs.js")),
  movimento: hash(join(SITE, "js", "movimento.js")),
};

const b = d.brand;
const semana = d.hours.filter((h) => h.open && h.weekday >= 1 && h.weekday <= 5);
const sab = d.hours.find((h) => h.weekday === 6 && h.open);
const jsonld = {
  "@context": "https://schema.org",
  "@type": ["Electrician", "GeneralContractor"],
  "@id": `${d.siteUrl}/#empresa`,
  name: b.name,
  description:
    "Engenharia civil e elétrica em Senador Canedo – GO: projetos, obras e instalações elétricas, iluminação em LED, carregador de carro elétrico, interfone coletivo, segurança contra incêndio, aprovações, alvarás e RT.",
  url: `${d.siteUrl}/`,
  ...(ogImage ? { image: ogImage.split("?")[0] } : {}),
  logo: `${d.siteUrl}/img/logo-hs.png`,
  telephone: b.phoneSchema,
  address: {
    "@type": "PostalAddress",
    streetAddress: b.street,
    addressLocality: b.city,
    addressRegion: b.state,
    postalCode: b.postalCode,
    addressCountry: "BR",
  },
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: semana[0].open, closes: semana[0].close },
    ...(sab ? [{ "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: sab.open, closes: sab.close }] : []),
  ],
  hasMap: d.maps.href,
  sameAs: [b.instagramHref],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Serviços",
    itemListElement: d.services.map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s.name, description: s.text } })),
  },
};

// Google Analytics só com o ID (sem ID = sem aviso de cookies e sem medição)
const GA_ID = (process.env.GA_ID || "").trim();
const ga = GA_ID ? readFileSync(join(RAIZ, "publicar", "aviso-cookies-ga4.html"), "utf8").replaceAll("{{GA_ID}}", GA_ID) : "";
const gsc = (process.env.GSC || "").trim();

const titulo = `${b.name} | Engenharia civil e elétrica em ${b.city} – ${b.state}`;
const descricao = `Engenharia civil e elétrica em ${b.city} – ${b.state}: projetos, obras, instalações elétricas, iluminação em LED, segurança contra incêndio, alvarás e RT.`;
const ctxBase = { dados: d, versoes, ogImage, ga, gsc };
const helpers = { ...d, whatsappLink: d.whatsappLink, serviceMessage: d.serviceMessage };

const index = paginaInicial(helpers, { ...ctxBase, titulo, descricao, url: `${d.siteUrl}/`, jsonld });
const erro = pagina404(helpers, { ...ctxBase, titulo: `Página não encontrada | ${b.name}`, descricao, url: `${d.siteUrl}/404` });
writeFileSync(join(DIST, "index.html"), index);
writeFileSync(join(DIST, "404.html"), erro);

// Arquivos estáticos
for (const pasta of ["css", "js", "vendor", "fonts"]) cpSync(join(SITE, pasta), join(DIST, pasta), { recursive: true });
for (const f of readdirSync(join(SITE, "raiz"))) cpSync(join(SITE, "raiz", f), join(DIST, f));

// Só as imagens que as páginas usam (src, srcset, data-src, href)
const usadas = new Set();
for (const html of [index, erro]) {
  for (const m of html.matchAll(/\/img\/([\w.-]+\.(?:webp|png|jpg|jpeg|svg))/g)) usadas.add(m[1]);
}
usadas.add("logo-hs.png"); // logo do JSON-LD
mkdirSync(join(DIST, "img"), { recursive: true });
const faltando = [];
let pesoImg = 0;
for (const nome of usadas) {
  const origem = join(SITE, "img", nome);
  if (!existsSync(origem)) { faltando.push(nome); continue; }
  cpSync(origem, join(DIST, "img", nome));
  pesoImg += statSync(origem).size;
}
if (faltando.length) {
  console.error("Imagens que a página usa e não existem em site/img:\n  " + faltando.join("\n  "));
  process.exit(1);
}

writeFileSync(join(DIST, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${d.siteUrl}/sitemap.xml\n`);
const hoje = new Date().toISOString().slice(0, 10);
writeFileSync(
  join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${d.siteUrl}/</loc><lastmod>${hoje}</lastmod></url>\n</urlset>\n`,
);

const kb = (n) => `${Math.round(n / 1024)} KB`;
console.log(`dist/ pronto: index.html ${kb(index.length)}, ${usadas.size} imagens (${kb(pesoImg)}), og-image ${ogImage ? "sim" : "não"}, GA ${GA_ID || "não"}`);
