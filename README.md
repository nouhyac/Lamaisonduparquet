# Lamaisonduparquet
https://claude.ai/artifact/8py4yzba6srs7hHWEpCfjb

## Site de vente (`site/`)

Site statique prêt pour Hostinger : envoyez le contenu du dossier `site/` dans `public_html`.
Mode d'emploi : `site/LISEZMOI-HOSTINGER.md`. Réglages (numéros, horaires, suivi pub) : `site/assets/js/config.js`. Catalogue : `site/assets/js/data.js`.

```
npm test      # tests de la logique (calculateur, réservation, quiz, sécurité des saisies)
npm run seo   # régénère les données structurées Google de index.html
```

Architecture JS : `core/` = logique pure testée sous Node, `ui/` = un module par section, reliés par un bus d'événements.
