/* Serveur Node.js de La Maison du Parquet (hébergement Node.js Hostinger).
   Sert le dossier site/ avec les mêmes protections que site/.htaccess, qu'un serveur Node n'applique pas :
   HTTPS + www, en-têtes de sécurité (CSP stricte, HSTS…), lecture seule, fichiers internes et robots d'attaque bloqués,
   compression, cache et lecture vidéo par plages. Aucune dépendance externe. Démarrage : npm start */
import http from "node:http";
import { createReadStream, readFileSync, existsSync } from "node:fs";
import { stat, realpath, readFile } from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
// dépôt de travail : le site est dans site/ ; branche « hostinger » : le site est à la racine, à côté de ce fichier
const ROOT = existsSync(path.join(HERE, "site", "index.html")) ? path.join(HERE, "site") : HERE;
const PORT = Number(process.env.PORT) || 3000;

// domaine canonique lu dans config.js, tenu à jour par « npm run domaine »
const SITE_URL = (readFileSync(path.join(ROOT, "assets/js/config.js"), "utf8").match(/siteUrl:\s*"([^"]+)"/) || [])[1] || "";
const CANON = SITE_URL ? new URL(SITE_URL).host : "";
const ALIAS = CANON.startsWith("www.") ? CANON.slice(4) : CANON ? "www." + CANON : "";

const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".webmanifest": "application/manifest+json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon",
  ".woff2": "font/woff2", ".mp4": "video/mp4", ".webm": "video/webm", ".pdf": "application/pdf"
};
const COMPRESSIBLE = new Set([".html", ".css", ".js", ".json", ".webmanifest", ".xml", ".txt", ".svg"]);
const REVALIDATE = new Set([".html", ".css", ".js", ".webmanifest", ".xml", ".txt"]);
const DENIED_EXT = /\.(md|txt~|bak|old|orig|save|swp|sql|log|ini|sh|zip|tar|gz|rar|7z|env|git|psd|config|lock|json)$/i;
const BAD_QUERY = /(<|%3C).*script.*(>|%3E)|\.\.\/|\.\.%2F|%00|base64_encode|GLOBALS|_REQUEST|union.*select|concat\(/i;
const BAD_PATH = /(wp-admin|wp-login|xmlrpc\.php|phpmyadmin|\.php$|\/cgi-bin\/)/i;
const BAD_AGENT = /(sqlmap|nikto|masscan|nmap|zgrab|acunetix|nessus|dirbuster|wpscan)/i;

export const SECURITY_HEADERS = {
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
  "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; media-src 'self'; connect-src 'self'; frame-src https://www.google.com https://maps.google.com; manifest-src 'self'; worker-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; upgrade-insecure-requests",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-site",
  "X-Permitted-Cross-Domain-Policies": "none"
};

function cacheControl(ext) {
  if (REVALIDATE.has(ext)) return "no-cache";            // revérifié à chaque visite : mises à jour visibles tout de suite
  if (ext === ".woff2") return "public, max-age=31536000, immutable";
  if (ext === ".mp4" || ext === ".webm") return "public, max-age=31536000";
  return "public, max-age=2592000";                      // images, PDF : 30 jours
}

let page404 = null;
async function notFound(res, status = 404, head = false) {
  page404 ??= await readFile(path.join(ROOT, "404.html")).catch(() => Buffer.from("Page introuvable"));
  res.writeHead(status, { "Content-Type": TYPES[".html"], "Cache-Control": "no-cache", "Content-Length": page404.length });
  res.end(head ? undefined : page404);
}

// fichier servi ou null : refuse les chemins hors de site/, les fichiers cachés et les documents internes
async function resolveFile(urlPath) {
  let p;
  try { p = decodeURIComponent(urlPath); } catch { return null; }
  if (p.includes("\0") || p.includes("\\")) return null;
  const segs = p.split("/").filter(Boolean);
  if (segs.some(s => s === ".." || (s.startsWith(".") && s !== ".well-known"))) return null;
  if (DENIED_EXT.test(p) && !p.endsWith(".webmanifest")) return null;
  if (segs[0] === "node_modules" || (segs.length === 1 && /^(server\.js|package(-lock)?\.json|readme\.md)$/i.test(segs[0]))) return null;
  let file = path.join(ROOT, ...segs);
  let st = await stat(file).catch(() => null);
  if (st?.isDirectory()) { file = path.join(file, "index.html"); st = await stat(file).catch(() => null); }
  if (!st?.isFile()) return null;
  const real = await realpath(file).catch(() => null);           // pas de lien symbolique vers l'extérieur
  if (!real || !(real === ROOT || real.startsWith(ROOT + path.sep))) return null;
  return { file: real, st };
}

const gzCache = new Map();                                // petits fichiers texte compressés une seule fois
async function compressed(file, st, enc) {
  const key = `${enc}:${file}:${st.mtimeMs}:${st.size}`;
  if (!gzCache.has(key)) {
    const raw = await readFile(file);
    gzCache.set(key, enc === "br"
      ? zlib.brotliCompressSync(raw, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 10 } })
      : zlib.gzipSync(raw, { level: 9 }));
  }
  return gzCache.get(key);
}

export async function handle(req, res) {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.setHeader(k, v);
  const host = String(req.headers.host || "").toLowerCase().replace(/:\d+$/, "");
  const proto = String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim();
  const rawUrl = req.url || "/";
  if (rawUrl.length > 2048) { res.writeHead(414); return res.end(); }

  // 1. HTTPS forcé (derrière le proxy Hostinger) et domaine sans www → www
  if (proto === "http" || (ALIAS && host === ALIAS)) {
    const target = (ALIAS && host === ALIAS ? CANON : host) || CANON;
    res.writeHead(301, { Location: `https://${target}${rawUrl}` });
    return res.end();
  }
  // 2. lecture seule
  if (req.method === "OPTIONS") { res.writeHead(204, { Allow: "GET, HEAD, OPTIONS" }); return res.end(); }
  if (req.method !== "GET" && req.method !== "HEAD") { res.writeHead(405, { Allow: "GET, HEAD, OPTIONS" }); return res.end(); }
  const head = req.method === "HEAD";
  // 3. robots d'attaque et requêtes malveillantes
  const q = rawUrl.indexOf("?"), urlPath = q < 0 ? rawUrl : rawUrl.slice(0, q), query = q < 0 ? "" : rawUrl.slice(q + 1);
  if (BAD_QUERY.test(query) || BAD_PATH.test(urlPath) || BAD_AGENT.test(String(req.headers["user-agent"] || ""))) return notFound(res, 403, head);

  // 4. fichier statique
  const found = await resolveFile(urlPath);
  if (!found) return notFound(res, 404, head);
  const { file, st } = found;
  const ext = path.extname(file).toLowerCase();
  const etag = `"${st.size.toString(16)}-${Math.floor(st.mtimeMs).toString(16)}"`;
  res.setHeader("Content-Type", TYPES[ext] || "application/octet-stream");
  res.setHeader("Cache-Control", cacheControl(ext));
  res.setHeader("ETag", etag);
  res.setHeader("Last-Modified", st.mtime.toUTCString());
  res.setHeader("Vary", "Accept-Encoding");
  if (req.headers["if-none-match"] === etag) { res.writeHead(304); return res.end(); }

  // texte : compressé (brotli ou gzip)
  const ae = String(req.headers["accept-encoding"] || "");
  const enc = COMPRESSIBLE.has(ext) ? (/\bbr\b/.test(ae) ? "br" : /\bgzip\b/.test(ae) ? "gzip" : null) : null;
  if (enc) {
    const body = await compressed(file, st, enc);
    res.writeHead(200, { "Content-Encoding": enc, "Content-Length": body.length });
    return res.end(head ? undefined : body);
  }

  // binaire : plages d'octets (indispensables à la vidéo sur iPhone)
  res.setHeader("Accept-Ranges", "bytes");
  const range = /^bytes=(\d*)-(\d*)$/.exec(String(req.headers.range || ""));
  if (range && (range[1] || range[2])) {
    let start = range[1] ? Number(range[1]) : Math.max(0, st.size - Number(range[2]));
    let end = range[1] && range[2] ? Math.min(Number(range[2]), st.size - 1) : st.size - 1;
    if (start > end || start >= st.size) { res.writeHead(416, { "Content-Range": `bytes */${st.size}` }); return res.end(); }
    res.writeHead(206, { "Content-Range": `bytes ${start}-${end}/${st.size}`, "Content-Length": end - start + 1 });
    if (head) return res.end();
    return createReadStream(file, { start, end }).on("error", () => res.destroy()).pipe(res);
  }
  res.writeHead(200, { "Content-Length": st.size });
  if (head) return res.end();
  createReadStream(file).on("error", () => res.destroy()).pipe(res);
}

export function createServer() {
  const server = http.createServer((req, res) => {
    handle(req, res).catch(() => { if (!res.headersSent) { res.writeHead(500); } res.end(); });
  });
  server.headersTimeout = 15000;     // coupe les connexions lentes (attaques « slowloris »)
  server.requestTimeout = 30000;
  server.keepAliveTimeout = 5000;
  return server;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createServer().listen(PORT, () => console.log(`La Maison du Parquet en ligne sur le port ${PORT} (${CANON || "domaine non défini"})`));
}
