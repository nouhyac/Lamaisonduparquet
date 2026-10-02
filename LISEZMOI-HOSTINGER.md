# Mettre le site en ligne sur Hostinger

1. **hPanel → Sites web → Gestionnaire de fichiers** du domaine `lamaisonduparquet.org`.
2. Ouvrez le dossier `public_html` et supprimez la page par défaut (`default.php` ou `index.php`).
3. Envoyez **tout le contenu** du dossier `site/` (pas le dossier lui-même) dans `public_html` :
   `index.html`, `404.html`, `.htaccess`, `robots.txt`, `sitemap.xml`, `site.webmanifest`, et les dossiers `assets/`, `img/`, `fiches/`.
   Astuce : compressez `site/` en .zip, envoyez le zip, puis clic droit → **Extraire**.
4. **hPanel → Sécurité → SSL** : activez le certificat gratuit. Le fichier `.htaccess` redirige ensuite tout vers `https://www.`.
5. Le fichier `.htaccess` est caché par défaut : cochez « Afficher les fichiers cachés » pour le vérifier.

## Réglages (fichier `assets/js/config.js`)
- `whatsapp`, `phone`, `phone2` : numéros.
- `openDays`, `slots`, `hoursLabel` : jours et créneaux de visite.
- `siteUrl` : adresse finale du site (la carte Google Maps s'affiche uniquement sur cette adresse).
- `metaPixel` / `ga4` : identifiants de suivi publicitaire (facultatif). Les réservations et les envois du calculateur sont suivis comme « Lead ».

## Changer le nom de domaine
Le site est réglé pour `https://www.lamaisonduparquet.org`. Pour un autre domaine, une seule commande depuis le dépôt :
`npm run domaine -- www.votre-domaine.com` (ou `votre-site.hostingersite.com`, sans www).
Elle met à jour l'adresse canonique, l'aperçu de partage, le sitemap, robots.txt, security.txt, les données Google
et la redirection www ↔ sans www de `.htaccess`. Ne modifiez pas ces adresses à la main.

## Liste de contrôle le jour de la mise en ligne
1. SSL actif dans hPanel, puis ouvrez `http://` + votre domaine : il doit basculer seul en `https://www.…`.
2. Ouvrez `https://www.votre-domaine/LISEZMOI-HOSTINGER.md` : la page « introuvable » doit s'afficher (fichier protégé).
3. Testez les en-têtes sur **securityheaders.com** (note attendue : A ou A+) et le SSL sur **ssllabs.com/ssltest**.
4. Sur un téléphone : bouton WhatsApp, réservation, calculateur et appel doivent ouvrir la bonne application.
5. Google Search Console : ajoutez le domaine et déclarez `sitemap.xml`.
6. Partagez le lien dans WhatsApp pour vérifier l'aperçu (image et titre).

## Sécurité (déjà en place, rien à faire)
- **HTTPS obligatoire** + HSTS (le navigateur refuse ensuite toute connexion non chiffrée).
- **Politique de contenu stricte (CSP)** : la page n'exécute que ses propres scripts. Aucun script, style ou police venant d'un autre site. Les polices sont hébergées sur votre serveur, sans appel à Google.
- **Protection contre l'intégration** du site dans une autre page (clickjacking), contre le « sniffing » de type de fichier, et contre la fuite d'adresse vers d'autres sites.
- **Fichiers internes inaccessibles** : `.htaccess`, fichiers cachés, `.md`, sauvegardes, archives (seul `/.well-known/security.txt` reste public : il indique comment signaler une faille).
- **Mises à jour visibles tout de suite** : HTML, CSS et JS sont revérifiés à chaque visite, les images et polices restent en cache.
- **Blocage automatique** des scanners d'attaque courants (sqlmap, nikto, wpscan…), des fausses pages WordPress/PHP, des injections dans l'adresse et de toute requête autre que la lecture (le site n'a pas de formulaire côté serveur : tout part sur WhatsApp).
- **Code durci** : tout ce que tape un visiteur est échappé et limité en longueur ; aucune donnée n'est stockée ni envoyée ailleurs que dans le message WhatsApp que le visiteur choisit d'envoyer.

### Si vous activez Meta Pixel ou Google Analytics
La politique de sécurité bloque par défaut ces scripts externes. Après avoir rempli `metaPixel` ou `ga4` dans `assets/js/config.js` :
1. dans `.htaccess`, remplacez la ligne `Content-Security-Policy` active par la version commentée juste en dessous ;
2. dans `index.html`, supprimez la ligne `<meta http-equiv="Content-Security-Policy" …>` (ou ajoutez-y les mêmes domaines).

### Conseils hPanel
- Activez l'**authentification à deux facteurs** sur votre compte Hostinger.
- Activez les **sauvegardes automatiques**.
- Une fois le site stable en HTTPS sur `www` et sans `www`, vous pouvez ajouter `; preload` à la ligne `Strict-Transport-Security` et inscrire le domaine sur hstspreload.org.

## Modifier le catalogue
- Décors, pièces et FAQ : `assets/js/data.js`. Pour un nouveau décor, ajoutez aussi ses images `img/sw-…`, `img/v-<pièce>-…` et `img/ba-…` (WebP + JPEG).
- Après une modification, mettez à jour les données Google depuis le dépôt : `npm run seo`, puis vérifiez avec `npm test`.
