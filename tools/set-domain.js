/* Change le nom de domaine du site partout (canonique, partage, sitemap, robots, redirections, JSON-LD).
   Usage : npm run domaine -- www.monsite.com      (ou monsite.hostingersite.com, sans www)
   Avec « www. », la version sans www redirige vers www ; sans, c'est l'inverse. */
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { CONFIG } from "../site/assets/js/config.js";

const arg = (process.argv[2] || "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
if (!/^(?=.{4,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(arg)) {
  console.error("Domaine invalide. Exemple : npm run domaine -- www.lamaisonduparquet.com");
  process.exit(1);
}
const oldHost = new URL(CONFIG.siteUrl).host, host = arg;
const bare = host.replace(/^www\./, ""), esc = h => h.replace(/\./g, "\\.");
const site = p => new URL("../site/" + p, import.meta.url);

for (const p of ["index.html", "robots.txt", "sitemap.xml", "assets/js/config.js", ".well-known/security.txt"]) {
  const s = readFileSync(site(p), "utf8");
  writeFileSync(site(p), s.split("https://" + oldHost).join("https://" + host));
}

// redirection www ↔ sans www, entre les marqueurs DOMAINE de .htaccess
const [from, to] = host.startsWith("www.") ? [bare, host] : ["www." + host, host];
const block = `# DOMAINE:début (géré par « npm run domaine -- votre-domaine.com », ne pas modifier à la main)
# ${from} → ${to}
RewriteCond %{HTTP_HOST} ^${esc(from)}$ [NC]
RewriteRule ^ https://${to}%{REQUEST_URI} [L,NE,R=301]
# DOMAINE:fin`;
const ht = readFileSync(site(".htaccess"), "utf8");
if (!/# DOMAINE:début[\s\S]*?# DOMAINE:fin/.test(ht)) { console.error("Marqueurs DOMAINE absents de .htaccess"); process.exit(1); }
writeFileSync(site(".htaccess"), ht.replace(/# DOMAINE:début[\s\S]*?# DOMAINE:fin/, block));

// le JSON-LD se recalcule à partir de config.js (relu dans un nouveau processus)
execFileSync(process.execPath, [new URL("./build-seo.js", import.meta.url).pathname], { stdio: "inherit" });
console.log(`Domaine : ${oldHost} → ${host}`);
