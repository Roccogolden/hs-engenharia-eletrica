// Servidor local do dist/ para conferir o site (sem dependências). Responde 404 com o 404.html, como a Vercel.
// Uso: node publicar/servir.mjs [porta=8766]  →  http://127.0.0.1:8766/
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = resolve(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const PORTA = +(process.argv[2] || 8766);
const TIPOS = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml",
  ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml", ".mp4": "video/mp4",
};

createServer(async (req, res) => {
  const caminho = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let arquivo = normalize(join(DIST, caminho));
  if (!arquivo.startsWith(DIST)) { res.writeHead(403).end(); return; }
  try {
    if ((await stat(arquivo)).isDirectory()) arquivo = join(arquivo, "index.html");
    const corpo = await readFile(arquivo);
    res.writeHead(200, { "Content-Type": TIPOS[extname(arquivo)] || "application/octet-stream" }).end(corpo);
  } catch {
    try {
      const corpo = await readFile(join(DIST, "404.html"));
      res.writeHead(404, { "Content-Type": TIPOS[".html"] }).end(corpo);
    } catch { res.writeHead(404).end("404"); }
  }
}).listen(PORTA, "127.0.0.1", () => console.log(`dist/ em http://127.0.0.1:${PORTA}/`));
