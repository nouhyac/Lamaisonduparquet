// Serveur Node.js : mêmes protections que .htaccess (sécurité, redirections, cache, vidéo)
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createServer } from "../server.js";

let srv, port;
before(() => new Promise(r => { srv = createServer().listen(0, () => { port = srv.address().port; r(); }); }));
after(() => srv.close());

const get = (path, { method = "GET", headers = {} } = {}) => new Promise((resolve, reject) => {
  const req = http.request({ port, path, method, headers: { host: "www.lamaisonduparquet.org", "x-forwarded-proto": "https", ...headers } }, res => {
    const chunks = []; res.on("data", c => chunks.push(c)); res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
  });
  req.on("error", reject); req.end();
});

test("accueil servi avec les en-têtes de sécurité", async () => {
  const r = await get("/");
  assert.equal(r.status, 200);
  assert.match(r.headers["content-type"], /text\/html/);
  assert.match(r.headers["content-security-policy"], /script-src 'self'/);
  assert.ok(r.headers["strict-transport-security"]);
  assert.equal(r.headers["x-frame-options"], "SAMEORIGIN");
  assert.equal(r.headers["cache-control"], "no-cache");
  assert.equal(r.headers["x-powered-by"], undefined);
  assert.match(r.body.toString(), /SARL MYF/);
});

test("HTTP et domaine sans www redirigent vers https://www", async () => {
  let r = await get("/?a=1", { headers: { "x-forwarded-proto": "http" } });
  assert.equal(r.status, 301); assert.equal(r.headers.location, "https://www.lamaisonduparquet.org/?a=1");
  r = await get("/fiches/", { headers: { host: "lamaisonduparquet.org" } });
  assert.equal(r.status, 301); assert.equal(r.headers.location, "https://www.lamaisonduparquet.org/fiches/");
});

test("fichiers internes, cachés et remontée de dossier refusés", async () => {
  for (const p of ["/LISEZMOI-HOSTINGER.md", "/.htaccess", "/.git/config", "/../server.js", "/%2e%2e/package.json",
                   "/assets/../../server.js", "/assets/", "/img", "/x%00.html", "/nexiste-pas"]) {
    const r = await get(p);
    assert.equal(r.status, 404, p);
    assert.doesNotMatch(r.body.toString(), /createServer|"scripts"/, p);
  }
  assert.equal((await get("/.well-known/security.txt")).status, 200);
  assert.equal((await get("/site.webmanifest")).status, 200);
});

test("lecture seule et blocage des attaques courantes", async () => {
  assert.equal((await get("/", { method: "POST" })).status, 405);
  assert.equal((await get("/", { method: "PUT" })).status, 405);
  assert.equal((await get("/", { method: "OPTIONS" })).status, 204);
  assert.equal((await get("/wp-login.php")).status, 403);
  assert.equal((await get("/?q=<script>alert(1)</script>")).status, 403);
  assert.equal((await get("/?f=../../etc/passwd")).status, 403);
  assert.equal((await get("/", { headers: { "user-agent": "sqlmap/1.7" } })).status, 403);
  assert.equal((await get("/" + "a".repeat(3000))).status, 414);
});

test("compression, cache et 304", async () => {
  const r = await get("/assets/css/style.css", { headers: { "accept-encoding": "gzip, br" } });
  assert.equal(r.status, 200); assert.equal(r.headers["content-encoding"], "br");
  const r2 = await get("/assets/css/style.css", { headers: { "if-none-match": r.headers.etag } });
  assert.equal(r2.status, 304);
  assert.match((await get("/assets/fonts/fira-sans-400.woff2")).headers["cache-control"], /immutable/);
});

test("vidéo servie par plages d'octets", async () => {
  const r = await get("/img/show-loop.mp4", { headers: { range: "bytes=0-99" } });
  assert.equal(r.status, 206); assert.equal(r.body.length, 100);
  assert.match(r.headers["content-range"], /^bytes 0-99\/\d+$/);
  assert.equal((await get("/img/show-loop.mp4", { headers: { range: "bytes=999999999-" } })).status, 416);
});

test("branche hostinger : site à la racine, fichiers du serveur jamais servis", async () => {
  const { mkdtempSync, cpSync, rmSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { spawn } = await import("node:child_process");
  const dir = mkdtempSync(join(tmpdir(), "lmdp-"));
  cpSync("site", dir, { recursive: true });
  for (const f of ["server.js", "package.json"]) cpSync(f, join(dir, f));
  const p = 40000 + Math.floor(Math.random() * 20000);
  const child = spawn(process.execPath, ["server.js"], { cwd: dir, env: { ...process.env, PORT: String(p) } });
  await new Promise(r => child.stdout.once("data", r));
  const hit = path => new Promise((resolve, reject) => http.get({ port: p, path, headers: { host: "www.lamaisonduparquet.org" } },
    res => { res.resume(); resolve(res.statusCode); }).on("error", reject));
  try {
    assert.equal(await hit("/"), 200);
    assert.equal(await hit("/assets/js/main.js"), 200);
    for (const f of ["/server.js", "/package.json", "/README.md", "/node_modules/x.js"]) assert.equal(await hit(f), 404, f);
  } finally { child.kill(); rmSync(dir, { recursive: true, force: true }); }
});
