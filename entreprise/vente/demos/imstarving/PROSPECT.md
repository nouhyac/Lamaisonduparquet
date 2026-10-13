# Prospect : I'm Starving (fast-food)

- **Constat** (13/10) : très forte présence Instagram, **aucun site**, commandes **uniquement par téléphone**.
- **Angle** : leur Instagram amène des clients affamés ; le téléphone est le goulot (ligne occupée aux heures de pointe = commandes perdues, erreurs de prise de commande).
- **Solution proposée** : un seul système à deux écrans
  1. Site client : menu, options, sur place (QR code par table) / à emporter (heure de retrait) / livraison, paiement au comptoir ou à la livraison, suivi en direct.
  2. Écran cuisine (tablette, protégé) : commandes en direct + sonnerie, statuts Reçue → En préparation → Prête, **impression automatique du ticket** (imprimante thermique Bluetooth 80 mm, ≈ 8 000-15 000 DA, achetée par le restaurant).
- **Offre** : Complète (commande + QR + écran cuisine + tickets) dès 150 000 DA → **120 000 DA** Fondateurs. Repli : Simple (menu + commande WhatsApp préremplie) dès 80 000 → 64 000 DA. Option Care+ 15 000 DA/mois.
- **Démo** : https://claude.ai/artifact/3bXb3y34qYW5rZzQLes3a4 (source `index.html`, photos générées `img/`). **v2 (14/10) à leur image** : logo, bleu nuit + rouge, slogan « Frais · Généreux · Fait pour toi », menu complet relevé sur leurs stories Instagram (Burgers ×7, Crogers ×7, Smash ×2, Tacos ×4 + fromage gratiné, Starvation ×5, Sandwichs ×5, Pâtes ×4) avec tailles et prix, vignettes recadrées depuis leurs visuels de menu, photo réelle de croger en bandeau.
- **Technique prévue pour la vraie version** : hébergement Hostinger (PHP + MySQL) ou base temps réel ; écran cuisine en page web sur tablette Android ; impression via appli RawBT (ESC/POS Bluetooth) ou Chrome en mode impression silencieuse.

## v3 « site double » (14/10) → https://claude.ai/artifact/M7a45ogePhTwVRw81NpiFo
Source : `site/` (`index.html` site client, `cuisine.html` back-office, `data.js` menu + synchro, `img/` leurs vraies photos recadrées).
- **Site client** : hero Croger, signatures, menu complet par catégories (tailles, suppléments), panier, sur place (table pré-remplie par QR `#table-N`) / à emporter (heure) / livraison (adresse), suivi en direct de la commande.
- **Back-office** (code **2026**) : commandes en direct + sonnerie, Nouvelles → En préparation → Prêtes, ticket 80 mm, alerte retard 15 min ; **Menu** (rupture et prix modifiés en direct sur le site) ; **Statistiques** (CA du jour, panier moyen, temps de préparation, commandes par heure, top plats, répartition des modes) ; **QR codes** des tables prêts à imprimer.
- Démo testée desktop + mobile (commande → cuisine → statut côté client, rupture, stats, QR), 0 erreur.
- Pour la montrer : ouvrir le site et le back-office dans **deux onglets du même navigateur**, passer une commande, elle arrive en cuisine.

### Offre conseillée (prix final = décision de l'utilisateur·rice)
- **Plateforme Restaurant** : prix affiché **300 000 DA**, Fondateurs -20 % → **240 000 DA** (acompte 120 000 DA).
- **+ Care+ 15 000 DA/mois** (obligatoire en pratique : hébergement de la base de commandes, modifications du menu, rapport mensuel, fiche Google Maps).
- Inclus : nom de domaine, fiche Google Maps (ils n'existent pas sur Google), QR codes imprimés, formation de l'équipe 1 h, garantie maquette satisfaite ou remboursée.
- Plancher de négociation : 180 000 DA (sans statistiques ni QR tables) ; ne jamais descendre sous la Complète 120 000 DA.
- Argument chiffré : 1 commande perdue par heure de pointe × 1 900 DA de panier moyen × 2 h × 30 j ≈ **114 000 DA/mois** qui partent quand la ligne sonne occupé.

## Message d'approche (Instagram, compte @dzignstudio)
Bonjour l'équipe I'm Starving 👋
Gros respect pour votre Instagram, vos Crogers donnent faim rien qu'à les regarder 🔥
On a remarqué que les commandes se font par téléphone. Aux heures de pointe, c'est souvent là qu'on perd des clients (ligne occupée, erreurs de commande).
On vous a préparé une démo avec VOTRE menu : le client commande depuis son téléphone (sur place avec QR code à table, à emporter ou livraison), et la commande arrive directement sur un écran en cuisine, avec le ticket qui s'imprime tout seul.
Et vous, vous gérez tout depuis une tablette : menu, ruptures, prix, statistiques du jour, QR codes des tables.
On peut passer vous la montrer en 5 minutes, ou vous l'envoyer en vidéo ?
Dzign Studio · 0549 50 68 57
