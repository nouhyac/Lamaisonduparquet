# Mettre dzignstudio.store en ligne (Hostinger)

⚠️ À faire **seulement avec l'accord** de l'utilisateur·rice.

1. Acheter **dzignstudio.store** et un hébergement (offre « Premium » ou « Business » : plusieurs sites, emails inclus).
2. hPanel → **Sites web** → ajouter le site **dzignstudio.store** (site vide, sans WordPress).
3. **Gestionnaire de fichiers** → dossier `public_html` → envoyer `site-dzign-prod.zip` → clic droit → **Extraire** (ne pas laisser les fichiers dans un sous-dossier : `index.html` doit être directement dans `public_html`).
4. **Sécurité → SSL** : activer le certificat gratuit (le fichier `.htaccess` force ensuite le https).
5. **Emails** : créer `contact@dzignstudio.store`.
6. Tester : https://dzignstudio.store, la vidéo du haut, la 3D, le portfolio, le choix d'offre → WhatsApp 0549 50 68 57, la version arabe.
7. Pixel Meta : dans `index.html`, remplacer `VOTRE_PIXEL_ID` et retirer les commentaires `<!--` `-->` autour du script du pixel.
8. Google : ajouter le site dans **Google Search Console** et envoyer `sitemap.xml`. Créer la fiche **Google Business Profile** « Dzign Studio » (zone desservie : Algérie).

Contenu du paquet : `index.html`, `medias/` (images, vidéo, modèles 3D), `robots.txt`, `sitemap.xml`, `.htaccess`.
