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
