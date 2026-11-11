# Wood Pecker Draria : démo plateforme complète

Prospect : **Wood Pecker Draria**, restaurant à Draria (Alger) : pizzas, poissons, desserts, grillades, pâtes, menus enfants, jus et milk-shakes.
Instagram @woodpecker.draria · Facebook « WoodPecker Draria » · 0770 17 25 79 / 0550 64 77 46.

Démo : `site/index.html` (site client) et `site/gestion.html` (espace gérant).
Lancer en local : `cd entreprise/vente/demos/woodpecker/site && python3 -m http.server 8000`, puis ouvrir http://localhost:8000/

Base neuve : aucun code repris des autres démos. HTML, CSS et JavaScript sans framework, commentés en français.

---

## Ce qui est fait

### Site client (`index.html`)
- **Héros** : la façade réelle dans un cadre art déco, le médaillon du logo, « Goûtez la différence », un statut ouvert/fermé calculé sur leurs horaires (11 h – 1 h, vendredi à partir de 16 h, réglables) et trois boutons : Commander, Réserver une table, Appeler.
- **Les signatures Wood Pecker** : uniquement les produits qui portent leur nom sur la carte (Pizza WoodPecker, Surprise Wood, Salade WoodPecker, Tacos WoodPecker mixte, Cocktail WoodPecker).
- **Aujourd'hui** : le plat du jour choisi par le gérant (exemple réel : Nuggets avec frites 1 200 DA, Tajine de poulet à la marocaine 2 000 DA) avec la photo de leur tableau, et le poisson frais du jour avec la photo de leur étal. Le poisson affiche « Prix selon arrivage » tant que le gérant n'a pas saisi de prix au kg.
- **La carte complète** (101 plats, 18 suppléments, 6 sauces), recopiée de leur menu imprimé : onglets collants avec pictogrammes, recherche, et un bandeau art déco par catégorie (photo de pizza réelle pour les Pizzas, bloc dédié pour le Menu enfant).
  - Pizzas : choix de la taille (Mini, Simple, Semi ou Méga) avec leurs 4 prix, suppléments au prix Simple ou Méga, et option « Olives (à la demande) ».
  - Viandes et volailles grillées : sauce en option (+300 DA). L'Entrecôte sauce au choix inclut sa sauce.
  - Choix imposés quand le menu les donne : gratins, boureks, soufflé, tacos, mini pizza, accompagnement des menus enfants, pâtes des Pasta aux 4 fromages, sauce de la Trois Fromages.
  - Menus enfants : « servis avec un cadeau surprise + boisson ».
- **Panier et commande** : livraison (12 zones autour de Draria, chacune avec ses frais, son minimum et son délai), à emporter ou sur place. Adresse détaillée (cité, bâtiment, étage, repère), heure programmée (proposée uniquement pendant les heures d'ouverture), nom, téléphone algérien contrôlé (+213 accepté) et remarque. Paiement à la livraison ou au comptoir.
- **Suivi en temps réel** : Reçue → En préparation → En livraison (ou Prête) → Livrée (ou Remise). Il est synchronisé avec la cuisine, la caisse et le livreur grâce à localStorage + BroadcastChannel (préfixe `wpk-`). Bouton « Envoyer aussi sur WhatsApp » et bouton flottant « Suivre ma commande ».
- **Réservation de table** : date, heure (créneaux dans les horaires), nombre de personnes, chaises bébé, occasion, nom et téléphone. La demande reçoit un numéro RES-xxxx et son statut (en attente / confirmée) se met à jour en direct. Option : précommander les plats du panier.
- **Anniversaires & groupes d'enfants** : nombre d'enfants, date, l'un de leurs 4 menus enfants et un dessert de leur carte. L'estimation est calculée uniquement sur leurs prix. Aucune animation ni décoration inventée.
- **Infos** : Draria + lien Google Maps de leur bio, les deux mobiles, Instagram, Facebook et les horaires (jour courant mis en valeur).
- Version **arabe complète** (bouton FR / العربية, mise en page RTL, nom français exact gardé sous chaque nom arabe), barre panier collante sur mobile, animation d'ajout au panier, un seul message (toast) affiché à la fois.
- Visuels : des photos réelles découpées dans leurs captures (`site/img/` : logo, enseigne, façade, pizza garnie, salle, tableau du plat du jour, étal de poissons) et un **logo SVG redessiné** (pivert au chapeau rouge à plume jaune, monogramme WP) pour l'en-tête, le favicon et l'espace gérant. Pour les plats sans photo : 19 illustrations SVG au trait or. Aucune photo de banque d'images, aucun visuel IA.

### Espace gérant (`gestion.html`)
| Code | Rôle | Pages |
|---|---|---|
| **0328** | Gérant | toutes |
| **1111** | Cuisine | Cuisine |
| **2222** | Caisse | Commandes, Caisse, Réservations |
| **3333** | Livreur | Livraisons |

- **Tableau de bord** : CA du jour, nombre de commandes, panier moyen, commandes en cours, graphique par heure, plats les plus commandés, réservations du jour, livraisons en cours et dernières commandes.
- **Commandes en temps réel** : son et toast à chaque nouvelle commande, accepter ou refuser, statuts, choix du livreur, ticket 80 mm imprimable, WhatsApp au client.
- **Cuisine** : trois colonnes (Nouvelles, En préparation, Prêtes) avec un minuteur par commande. La durée cible dépend des plats : pizzas et pâtes 15 min, grillades 20 min, etc. Le minuteur passe à l'orange puis au rouge.
- **Caisse** : plan de salle (nombre de tables réglable, 12 par défaut), comptoir, prise de commande rapide avec les options (taille, choix, sauce), envoi en cuisine, encaissement avec calcul du rendu monnaie, clôture Z avec historique.
- **Livreur** : livraisons à récupérer, en cours et livrées, avec boutons appeler, itinéraire Google Maps et WhatsApp. Le montant est encaissé à la livraison.
- **Réservations** : planning jour ou semaine, remplissage par créneau comparé à la capacité réglable, confirmer ou refuser, WhatsApp. Les demandes d'anniversaire sont gérées sur la même page.
- **Plat du jour & poisson du jour** : nom FR/AR, prix, visibilité, et prix au kg du poisson (0 = « Prix selon arrivage »). Les changements sont visibles aussitôt sur le site.
- **Carte modifiable** : tous les prix (les 4 tailles de pizza et les suppléments Simple/Méga), noms FR/AR, disponibilité, photo prise au téléphone (compressée en JPEG 720 px), noms des catégories, ajout de plat.
- **Clients & fidélité** : la liste des clients est construite à partir des commandes. La fidélité est réglable (points par tranche de 100 DA, seuil, remise) et désactivée par défaut, pour ne rien promettre au client sans leur accord.
- **Réglages** : téléphones, numéro WhatsApp, prix des sauces, horaires jour par jour (dont l'exception du vendredi), zones de livraison (frais, minimum, délai, activation), nombre de tables, capacité, livreurs.
- **Mise en service** : efface les commandes, réservations, demandes et clôtures d'exemple en gardant la carte, les prix, les photos et les réglages, puis remet les compteurs à zéro.
- **Données d'exemple** : une journée commencée avec 20 commandes réalistes (leurs plats, des prénoms algériens) dont une livraison en cours, 4 réservations et une demande d'anniversaire. Elles sont regénérées chaque jour tant que la plateforme n'est pas mise en service.

### Qualité (tests Playwright, Chromium)
- Site client : **54/54**. Couvre une pizza Méga avec suppléments en livraison et son suivi qui avance depuis un autre onglet, une entrecôte avec sauce à emporter, une réservation avec précommande, une demande d'anniversaire, les signatures, le toast unique et la barre panier mobile. Aucun débordement à 390/768/1280/1440 px en FR et en AR, aucune image cassée, aucune mention « à confirmer ».
- Espace gérant + synchronisation : **91/91**. Couvre les 11 pages du gérant, la cuisine (1111), la caisse (2222) et le livreur (3333). Le parcours complet est testé : commande sur le site → acceptée → cuisine → livreur → « Livrée » chez le client. Sont aussi testés : refus, encaissement d'une table, clôture Z, confirmation de réservation, prix d'une pizza et d'un supplément, indisponibilité d'un plat, photo, plat du jour, prix au kg du poisson, horaires du vendredi, fidélité, FR/AR et mise en service.
- **0 erreur JS**, **axe-core : 0 défaut** sur tous les écrans audités (site FR/AR, fenêtre pizza, commande, mobile ; connexion et les 11 pages de gestion, tableau de bord en AR).
- Vérification de la carte par script : les **248 noms** affichés (101 plats, 18 suppléments, 6 sauces, options, plats du jour, poissons) existent dans `CARTE.md`. Les **121 prix** (dont les 4 tailles de chaque pizza et les suppléments Simple/Méga) correspondent aussi, sans écart.

### Sources
- `CARTE.md` : leur carte réelle, recopiée de la story Instagram « Menu wood… » du 17/07/2025.
- `sources/capture-01.png` à `capture-12.png` : captures Instagram (couverture du menu, affiche « Votre visite », profil, pages du menu, tableau « Plat du jour » du 21/10/2025, étal de poissons, grille de publications).

---

## À ajuster après acompte (rien de tout cela n'est affiché comme « provisoire » sur la démo)
- **Adresse exacte** : la démo affiche « Draria, Alger » avec leur lien Google Maps.
- **Numéro fixe** : il est coupé sur l'affiche (044…), donc il n'est pas affiché.
- **Fin des horaires du vendredi** : la bio est coupée (« vendredi à 16 h… »). La démo affiche 16 h – 1 h, réglable.
- **Prix des jus frais nature** : lignes inclinées sur la photo. Affichés tels quels (orange, citron, pomme, fraise 400 ; mangue, kiwi, ananas 600 ; raisin, pêche 500) : à vérifier.
- **Poisson du jour** : aucun prix publié. La démo affiche « Prix selon arrivage » et le gérant peut saisir un prix au kg. Les espèces affichées (dorades, loups, crevettes, calamars) viennent de leur story.
- **Livraison** : à confirmer qu'ils livrent. Les 12 zones, frais (150 à 400 DA), minimums (1 000 à 2 000 DA) et délais (30 à 55 min) sont des valeurs de départ réglables.
- **Capacité de la salle** (60 couverts par créneau) et **nombre de tables** (12) : valeurs de départ réglables.
- **Suppléments en Mini et Semi** : la carte ne donne que les prix Simple et Méga. Choix le plus honnête : les suppléments ne sont proposés qu'en Simple et en Méga, avec la mention « Suppléments disponibles en Simple et Méga » (pas de prix inventé).
- **Olives** : le menu dit « les olives sont à la demande ». La démo propose une case « Olives (à la demande) » sans supplément : confirmer qu'elles sont gratuites.
- **Sauces** (+300 DA) : proposées en option sur les viandes et volailles grillées (steak haché, entrecôtes, filet, escalope grillée, cuisse marinée). Elles ne sont pas proposées sur les brochettes, le cordon bleu (déjà en sauce fromagère), l'escalope gratinée et le poulet crispy. À valider avec eux.
- **Pizza « Fruits de Mer »** : leur menu ne détaille pas les ingrédients, donc aucun n'est affiché.
- **Instagram** : l'affiche indique « Wood.peckerdraria », mais le vrai compte est **@woodpecker.draria** (profil). La démo utilise le profil.
- **Livreurs** (« Livreur 1 », « Livreur 2 ») et **codes PIN** : à remplacer par leurs vrais noms et leurs propres codes.
- **Fidélité** : désactivée par défaut, à paramétrer avec eux si elle les intéresse.
- **Photos de plats** : la démo utilise des illustrations. Le gérant peut ajouter ses photos depuis son téléphone (Carte → appareil photo).
- Les données d'exemple (commandes, réservations) sont fictives : à effacer via « Mise en service » le jour du lancement.

---

## Message 1 (Instagram, @woodpecker.draria)

> Bonjour l'équipe Wood Pecker 👋
>
> Nous sommes Dzign Studio, une agence web algérienne. Nous avons découvert votre page, et votre carte nous a donné envie de travailler pour vous : pizzas, poisson frais, plat du jour… et ce fameux « Goûtez la différence » !
>
> Nous avons préparé une démo à votre nom, avec votre vraie carte (toutes vos pizzas en Mini, Simple, Semi et Méga, vos suppléments, vos menus enfants, vos desserts…). Vos clients peuvent y commander en livraison ou à emporter, réserver une table et demander un anniversaire. De votre côté, un espace gérant vous permet de suivre les commandes en cuisine, à la caisse et pour le livreur, et de changer le plat du jour en un clic. Le tout en français et en arabe.
>
> Démo gratuite · maquette satisfaite ou remboursée.
>
> Est-ce qu'on peut vous la montrer ? Quelques minutes suffisent, au restaurant ou ici.
>
> Belle journée à vous,
> Dzign Studio
