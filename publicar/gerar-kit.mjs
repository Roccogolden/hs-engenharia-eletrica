// Gera as imagens do kit de divulgação em divulgacao/ a partir de publicar/divulgacao.html e publicar/video-final.html.
// Uso: node publicar/gerar-kit.mjs   (Chrome ou Edge instalado; usa o renderizar-html.mjs da skill site-agencia)
// Antes, os prints de divulgacao/prints/ precisam estar atualizados (ver CLAUDE.md, "Kit de divulgação").
import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RENDER = join(homedir(), ".claude", "skills", "site-agencia", "scripts", "renderizar-html.mjs");
const pecas = [
  ["divulgacao.html", "card=apresentacao", "status-1-apresentacao.jpg", 1080, 1920],
  ["divulgacao.html", "card=servicos", "status-2-servicos.jpg", 1080, 1920],
  ["divulgacao.html", "card=obras", "status-3-obras.jpg", 1080, 1920],
  ["divulgacao.html", "card=horario", "status-4-horario.jpg", 1080, 1920],
  ["divulgacao.html", "card=contato", "status-5-contato.jpg", 1080, 1920],
  ["divulgacao.html", "card=grupos", "grupos.jpg", 1080, 1080],
  ["video-final.html", "-", "capa-vertical.jpg", 1080, 1920],
];
for (const [html, consulta, saida, w, h] of pecas) {
  const r = spawnSync(process.execPath, [RENDER, join(RAIZ, "publicar", html), consulta, join(RAIZ, "divulgacao", saida), String(w), String(h), "92"], { encoding: "utf8" });
  const linha = (r.stdout || "").split("\n").find((l) => l.includes(saida)) || (r.stderr || "").split("\n").filter((l) => !/ERROR:|DevTools/.test(l)).slice(-2).join(" ");
  console.log(linha.trim());
}
