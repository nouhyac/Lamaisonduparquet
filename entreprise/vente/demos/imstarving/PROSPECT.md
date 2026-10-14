# Prospect : I'm Starving (fast-food)

- **Constat** (13/10) : très forte présence Instagram, **aucun site**, commandes **uniquement par téléphone**.
- **Profil (14/10)** : **52,4 K abonnés**, 169 publications. **Deux restaurants** : Bab Ezzouar 11h-23h (0659 56 46 11) et **Aïn Allah 11h-02h** (07 97 88 38 97). Livraison disponible. Bio « Trouve-nous sur Google Maps » → une fiche Maps existe (pas trouvée par notre recherche, à vérifier : avis, photos, horaires).
- ⚠️ **Concurrence** : suivis par **webmastery.agency** (agence web) → une agence les a peut-être déjà approchés. Aller vite, et se différencier par la démo à leur nom déjà fonctionnelle.
- **Angle** : leur Instagram amène des clients affamés ; le téléphone est le goulot (ligne occupée aux heures de pointe = commandes perdues, erreurs de prise de commande).
- **Solution proposée** : un seul système à deux écrans
  1. Site client : menu, options, sur place (QR code par table) / à emporter (heure de retrait) / livraison, paiement au comptoir ou à la livraison, suivi en direct.
  2. Écran cuisine (tablette, protégé) : commandes en direct + sonnerie, statuts Reçue → En préparation → Prête, **impression automatique du ticket** (imprimante thermique Bluetooth 80 mm, ≈ 8 000-15 000 DA, achetée par le restaurant).
- **Offre** : Complète (commande + QR + écran cuisine + tickets) dès 150 000 DA → **120 000 DA** Fondateurs. Repli : Simple (menu + commande WhatsApp préremplie) dès 80 000 → 64 000 DA. Option Care+ 15 000 DA/mois.
- **Démo** : https://claude.ai/artifact/3bXb3y34qYW5rZzQLes3a4 (source `index.html`, photos générées `img/`). **v2 (14/10) à leur image** : logo, bleu nuit + rouge, slogan « Frais · Généreux · Fait pour toi », menu complet relevé sur leurs stories Instagram (Burgers ×7, Crogers ×7, Smash ×2, Tacos ×4 + fromage gratiné, Starvation ×5, Sandwichs ×5, Pâtes ×4) avec tailles et prix, vignettes recadrées depuis leurs visuels de menu, photo réelle de croger en bandeau.
- **Technique prévue pour la vraie version** : hébergement Hostinger (PHP + MySQL) ou base temps réel ; écran cuisine en page web sur tablette Android ; impression via appli RawBT (ESC/POS Bluetooth) ou Chrome en mode impression silencieuse.

## v4 : rendus 3D + réception au choix (14/10)
- **34 rendus 3D** (un par plat) + bannière Croger + bandeau « festin » → `site/img3d/` (Higgsfield gpt_image_2_5 low, 0,25 crédit/image, ≈ 9,75 crédits). Bannières refaites **sans bacon** (halal). La galerie « La salle » garde leurs vraies photos du lieu.
- **Récepteur de bons** `site/recepteur.html` (PC de caisse, code 0328) : impression auto de chaque commande en 1 à 3 copies (cuisine / caisse / livreur), 58 ou 80 mm, journal du jour, Encaisser, Réimprimer, WhatsApp, copie Excel pour la caisse, bon de test, filtre par restaurant.
- **Onglet Réception** du back-office : le restaurant choisit ses canaux (écran cuisine, récepteur de bons, WhatsApp du restaurant, prévenir le client sur WhatsApp, logiciel de caisse aucune/Excel/API, SMS gérant, e-mail, acceptation manuelle ou automatique).
- **Vidéo démo 25 s** verticale : `demo-imstarving.mp4` (cuisine en haut, téléphone en bas, 4 étapes, écran de fin). Sources : `video/`.
- Version réelle : WhatsApp automatique = API WhatsApp Business (Meta, coût par conversation) ; impression = imprimante thermique ESC/POS + petit logiciel ou Chrome en impression silencieuse ; caisse = export ou API selon l'éditeur.

## v3.1 : deux restaurants (14/10)
Choix du restaurant dans le panier (ouvert/fermé en direct, celui qui est ouvert est choisi par défaut), section « Nos deux adresses » (horaires, téléphones, itinéraire), back-office filtrable Bab Ezzouar / Aïn Allah / les 2 (commandes, stats comparées), ticket au nom du restaurant, QR codes par restaurant (`#ain-table-7`).

## v3 « site double » (14/10) → https://claude.ai/artifact/M7a45ogePhTwVRw81NpiFo
Source : `site/` (`index.html` site client, `cuisine.html` back-office, `data.js` menu + synchro, `img/` leurs vraies photos recadrées).
- **Site client** : hero Croger, signatures, menu complet par catégories (tailles, suppléments), panier, sur place (table pré-remplie par QR `#table-N`) / à emporter (heure) / livraison (adresse), suivi en direct de la commande.
- **Back-office** (code **0328**) : commandes en direct + sonnerie, Nouvelles → En préparation → Prêtes, ticket 80 mm, alerte retard 15 min ; **Menu** (rupture et prix modifiés en direct sur le site) ; **Statistiques** (CA du jour, panier moyen, temps de préparation, commandes par heure, top plats, répartition des modes) ; **QR codes** des tables prêts à imprimer.
- Démo testée desktop + mobile (commande → cuisine → statut côté client, rupture, stats, QR), 0 erreur.
- Pour la montrer : ouvrir le site et le back-office dans **deux onglets du même navigateur**, passer une commande, elle arrive en cuisine.

### Offre conseillée (prix final = décision de l'utilisateur·rice)
- **Formule Plateforme** (2 restaurants, écran cuisine, récepteur de bons, réception au choix, stats) : prix affiché **400 000 DA** (= minimum « dès 400 000 DA » de notre site), Fondateurs -20 % → **320 000 DA** (acompte 160 000 DA).
- **+ Care+ 15 000 DA/mois** (obligatoire en pratique : hébergement de la base de commandes, modifications du menu, rapport mensuel, fiche Google Maps).
- Inclus : nom de domaine, optimisation des 2 fiches Google Maps (photos, horaires, lien de commande), QR codes imprimés, formation de l'équipe 1 h, garantie maquette satisfaite ou remboursée.
- Si trop cher : on ne baisse pas la Plateforme, on redescend vers **Commerce** en retirant des fonctions (sans stats, récepteur de bons, QR, un seul canal) ≈ 200 000-250 000 DA ; ne jamais descendre sous la Complète 120 000 DA.
- Argument chiffré : 1 commande perdue par heure de pointe × 1 900 DA de panier moyen × 2 h × 30 j ≈ **114 000 DA/mois par restaurant**, donc ≈ 228 000 DA/mois sur les deux, qui partent quand la ligne sonne occupé.

## Message d'approche (Instagram, compte @dzignstudio)
Bonjour l'équipe I'm Starving 👋
52 000 abonnés, deux restaurants : gros respect 🔥 Vos Crogers donnent faim rien qu'à les regarder.
On a remarqué que les commandes se font par téléphone. Aux heures de pointe, c'est souvent là qu'on perd des clients (ligne occupée, erreurs de commande).
On vous a préparé une démo avec VOTRE menu et vos deux adresses : le client choisit Bab Ezzouar ou Aïn Allah, commande depuis son téléphone (sur place avec QR code à table, à emporter ou livraison), et la commande arrive directement sur un écran en cuisine, avec le ticket qui s'imprime tout seul.
Et vous, vous gérez tout depuis une tablette : menu, ruptures, prix, statistiques du jour, QR codes des tables.
On peut passer vous la montrer en 5 minutes, ou vous l'envoyer en vidéo ?
Dzign Studio · 0549 50 68 57

## Kit d'envoi réseaux (14/10)
1. DM Instagram depuis @dzignstudio, entre 15h et 17h : la vidéo `demo-imstarving.mp4`, puis le message (52 000 abonnés, téléphone = clients perdus, 4 points ✅, proposition de passer 5 min, « quel jour vous arrange ? »). **Pas de prix dans le message.**
2. Si « c'est combien ? » → « ça dépend de ce que vous gardez, on vous montre en 5 min et on fait le devis sur place ».
3. Relance J+2 (démo prête, 34 recettes, 2 restaurants) ; relance J+5 (places Fondateurs limitées, répondez « oui »).
4. Variante WhatsApp au 0659 56 46 11 si pas de réponse sur Instagram.
5. Lien de la démo : seulement s'ils le demandent (la démo est plus forte montrée en personne).

## Visite en personne (prévue par l'utilisateur·rice)
- Dossier imprimé 4 pages : `dossier/Proposition-ImStarving-DzignStudio.pdf` (couverture 3D, constat + 3 écrans, captures, devis Plateforme 400 000 → 320 000 DA, acompte 160 000, Care+, garantie, appli en option). Source : `dossier/dossier.html`.
- À imprimer en couleur, A4, papier épais (2 exemplaires : un pour eux, un signé pour nous).

## À envoyer (14/10, nuit)
1. Vidéo démo `demo-imstarving-v3.mp4` + message 1 (Instagram).
2. S'ils répondent : lien de la démo + mode d'emploi (bouton jaune Espace gérant, code 0328).
3. S'ils demandent le prix ou montrent de l'intérêt : passer en personne avec le dossier PDF.
4. Vidéo de lancement `lancement-imstarving.mp4` : argument de clôture (« voilà ce que vous publierez le jour J, offert »). Ne pas l'envoyer avant la signature.

## Prix révisé (14/10, décision de l'utilisateur·rice)
- **Plateforme complète : 300 000 DA → 240 000 DA avec Fondateurs (-20 %)**, acompte 120 000 DA, solde 120 000 DA. Care+ 15 000 DA/mois en option. Vidéo de lancement offerte.
- Vente à distance (pas de visite) : WhatsApp + démonstration en appel vidéo.
- Instagram sans réponse → relance sur WhatsApp 0659 56 46 11 puis 07 97 88 38 97.
- **Décision finale (14/10)** : on propose **deux options** au choix du client : **Achat 240 000 DA** (120 000 + 120 000) **ou formule mensuelle 90 000 DA (45 000 + 45 000) + 18 000 DA/mois pendant 12 mois** (hébergement, mises à jour, modifications compris) = 306 000 DA sur un an. Dossier PDF mis à jour.
