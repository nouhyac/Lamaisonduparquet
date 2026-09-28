# Mettre le site en ligne sur Hostinger

1. **hPanel → Sites web → Gestionnaire de fichiers** du domaine `lamaisonduparquet.dz`.
2. Ouvrez le dossier `public_html` et supprimez la page par défaut (`default.php` ou `index.php`).
3. Envoyez **tout le contenu** du dossier `site/` (pas le dossier lui-même) dans `public_html` :
   `index.html`, `404.html`, `.htaccess`, `robots.txt`, `sitemap.xml`, `site.webmanifest`, et les dossiers `assets/`, `img/`, `fiches/`.
   Astuce : compressez `site/` en .zip, envoyez le zip, puis clic droit → **Extraire**.
4. **hPanel → Sécurité → SSL** : activez le certificat gratuit. Le fichier `.htaccess` redirige ensuite tout vers `https://www.`.
5. Le fichier `.htaccess` est caché par défaut : cochez « Afficher les fichiers cachés » pour le vérifier.

## Réglages (fichier `assets/js/main.js`, bloc CONFIG en haut)
- `whatsapp`, `phone`, `phone2` : numéros.
- `openDays`, `slots`, `hoursLabel` : jours et créneaux de visite.
- `siteUrl` : adresse finale du site (la carte Google Maps s'affiche uniquement sur cette adresse).
- `metaPixel` / `ga4` : identifiants de suivi publicitaire (facultatif). Les réservations et les envois du calculateur sont suivis comme « Lead ».

Si le domaine change, remplacez aussi `lamaisonduparquet.dz` dans `index.html`, `robots.txt` et `sitemap.xml`.
Après la mise en ligne, déclarez le sitemap dans Google Search Console.

## Sécurité (déjà en place, rien à faire)
- **HTTPS obligatoire** + HSTS (le navigateur refuse ensuite toute connexion non chiffrée).
- **Politique de contenu stricte (CSP)** : la page n'exécute que ses propres scripts. Aucun script, style ou police venant d'un autre site. Les polices sont hébergées sur votre serveur, sans appel à Google.
- **Protection contre l'intégration** du site dans une autre page (clickjacking), contre le « sniffing » de type de fichier, et contre la fuite d'adresse vers d'autres sites.
- **Fichiers internes inaccessibles** : `.htaccess`, fichiers cachés, `.md`, sauvegardes, archives.
- **Blocage automatique** des scanners d'attaque courants (sqlmap, nikto, wpscan…), des fausses pages WordPress/PHP, des injections dans l'adresse et de toute requête autre que la lecture (le site n'a pas de formulaire côté serveur : tout part sur WhatsApp).
- **Code durci** : tout ce que tape un visiteur est échappé et limité en longueur ; aucune donnée n'est stockée ni envoyée ailleurs que dans le message WhatsApp que le visiteur choisit d'envoyer.

### Si vous activez Meta Pixel ou Google Analytics
La politique de sécurité bloque par défaut ces scripts externes. Après avoir rempli `metaPixel` ou `ga4` dans `assets/js/main.js` :
1. dans `.htaccess`, remplacez la ligne `Content-Security-Policy` active par la version commentée juste en dessous ;
2. dans `index.html`, supprimez la ligne `<meta http-equiv="Content-Security-Policy" …>` (ou ajoutez-y les mêmes domaines).

### Conseils hPanel
- Activez l'**authentification à deux facteurs** sur votre compte Hostinger.
- Activez les **sauvegardes automatiques**.
- Une fois le site stable en HTTPS sur `www` et sans `www`, vous pouvez ajouter `; preload` à la ligne `Strict-Transport-Security` et inscrire le domaine sur hstspreload.org.
