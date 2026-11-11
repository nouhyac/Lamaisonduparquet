# Prospect : Banet el Baraka (بنة البركة), Oran

## Qui ils sont (sources vérifiées)
- Restaurant et traiteur à **Oran**. Instagram et TikTok : **@banetelbaraka**.
- Concept : **plats traditionnels algériens en self-service + fast-food à côté**. Le restaurant vient d'ouvrir ou ouvre bientôt (aucune date connue).
- Fiche de livraison Yassir « Banet al Baraka » : https://delivery.yassir.com/fr/restaurants/6a0c42bd6a8d6ab0758af922/Banet-al-Baraka
  (coordonnées 35.6975625, -0.5778125, livraison en 20-30 min, note 3,5).
- Logo : disque crème, anneau bois/bronze, arche, cloche de service avec vapeur, « بنة البركة » et « RESTAURANT ».

## La démo (dossier `site/`)
Lancer : `cd site && python3 -m http.server 8000`, puis ouvrir http://localhost:8000/
Tout est en français, avec une **version arabe complète** (bouton FR / العربية, mise en page de droite à gauche).

### Site client (`index.html`)
- Haut de page : leur bannière, le logo recréé en SVG, une accroche neutre, les boutons Commander et Traiteur, l'état ouvert/fermé calculé sur les horaires, le délai de livraison et la mention « Aussi sur Yassir ».
- **Le self du jour** : les plats maison préparés aujourd'hui (le gérant les coche), avec le plat du jour mis en avant et la mention « disponibles au self et en livraison selon la journée ».
- **Carte** : 83 plats, uniquement les leurs (fiche Yassir), en 10 catégories avec onglets collants. Recherche, filtres (fait maison, épicé, végétarien), fiche plat avec suppléments (fromage, frites, sauce), badges « Épuisé » et « Pas au self aujourd'hui ». Les 5 plats sans photo ont un visuel typographique.
- **Panier et commande** : livraison, à emporter ou sur place. 10 zones d'Oran avec frais, minimum de commande et temps de livraison. Adresse détaillée (cité, bâtiment, étage, repère), commande programmée, contrôle du numéro algérien, remarque. Paiement à la livraison ou au comptoir.
- **Suivi en temps réel** (reçue → en préparation → en livraison/prête → livrée/récupérée) : il avance quand la cuisine, le gérant ou le livreur agit dans un autre onglet. Le suivi affiche aussi la fidélité et un bouton « Envoyer aussi sur WhatsApp ».
- **Traiteur & événements** :
  - 3 formules exemples, composées uniquement de leurs plats ;
  - mode « plateaux à la pièce » et plats en portions ;
  - devis instantané : type d'événement, calendrier (minimum J+3, dates très demandées, dates bloquées ou complètes), nombre d'invités (20 à 500), services, remise dégressive, prix par personne, acompte indicatif de 30 % ;
  - envoi : numéro DEV-xxxx, récapitulatif imprimable, WhatsApp prérempli.
- Infos pratiques : Oran avec un lien Google Maps sur les coordonnées, téléphone, horaires, Instagram, Yassir. Bandeau discret « Démo réalisée par Dzign Studio » avec un bouton « Espace gérant ».

### Espace gérant (`gestion.html`), accès par code PIN
| Rôle | Code | Pages |
|---|---|---|
| Gérant | **0328** | tout |
| Cuisine | **1111** | écran cuisine |
| Caisse | **2222** | caisse + commandes |
| Livreur | **3333** | ses courses |

- **Tableau de bord** : chiffre d'affaires du jour, nombre de commandes, panier moyen, commandes en attente, demandes traiteur nouvelles. On y trouve aussi un graphique du CA par heure (survol + vue tableau), les plats les plus vendus, et les files « en attente » et « traiteur ».
- **Commandes** : file en temps réel avec son et mise en évidence des nouvelles. Accepter ou refuser, changer le statut, assigner un livreur, imprimer un ticket 80 mm, écrire au client sur WhatsApp.
- **Cuisine** : 3 colonnes (Nouvelles / En préparation / Prêtes), minuteurs qui passent à l'orange après 15 min et au rouge après 25 min, gros bouton « Prêt ».
- **Caisse** : commande au comptoir en quelques touches, encaissement (espèces, TPE, BaridiMob), commandes à encaisser, clôture de journée (ticket Z) avec totaux par mode.
- **Livreur** : courses à prendre et courses en cours, itinéraire Google Maps, appel, « Je pars », « Livrée ».
- **Traiteur** :
  - demandes avec statuts Nouvelle → Devis envoyé → Acompte reçu → Confirmée → Réalisée / Annulée ;
  - fiche détaillée avec prix final modifiable, acompte reçu, note interne et devis WhatsApp prérempli ;
  - calendrier mensuel des couverts avec alerte au-delà de la capacité (600), blocage de dates et liste des prochains événements ;
  - réglages des formules, services, acompte, remises, capacité et délai.
- **Carte & self** :
  - self du jour très simple : cocher les plats préparés aujourd'hui, marquer « Épuisé » en cours de journée, choisir le plat du jour ;
  - modifier, ajouter ou supprimer un plat, avec une photo prise depuis le téléphone et compressée ;
  - catégories (renommer, ordre).
- **Clients** : fichier clients automatique, fidélité réglable (1 box offerte toutes les 10 commandes), liste des clients dont la prochaine commande est offerte.
- **Réglages** :
  - établissement, horaires, zones et frais de livraison, livreurs, codes PIN ;
  - **Mettre en service** : efface les données d'exemple et garde la carte et les réglages ;
  - Réinstaller la démo.
- Données d'exemple :
  - une journée commencée avec 22 commandes (prénoms algériens, uniquement leurs plats) ;
  - une livraison en cours et des commandes en cuisine ;
  - 6 demandes traiteur : mariage 250, khotba 80, iftar d'entreprise 120, sbouâ 60, tahara en plateaux de 300 pièces, repas d'entreprise réalisé.

## Ce qui est PROVISOIRE (à confirmer avec eux)
- **Accroche** : « Plats traditionnels en self & fast-food · Oran », une phrase neutre et descriptive qu'on peut remplacer par la leur. Aucun slogan, aucune histoire, aucun avis et aucun chiffre n'a été inventé.
- **Adresse exacte** : seulement « Oran » + les coordonnées Yassir.
- **Téléphone et WhatsApp** : 0550 00 00 00 (numéro de démo).
- **Horaires** : 11h-23h tous les jours.
- **Formules traiteur** (exemples modifiables) : Tradition 1 500 DA, Prestige 2 400 DA, Baraka 3 600 DA par personne. Leur contenu reprend uniquement des plats de leur carte.
- **Services traiteur**, affichés « à confirmer avec vous » :
  - serveurs : 3 000 DA par serveur, 1 pour 40 invités ;
  - vaisselle et nappage : 150 DA par personne ;
  - livraison et installation : 3 000 DA ;
  - barquettes individuelles : 60 DA par personne.
- **Conditions traiteur** : acompte de 30 %, remises de −5 % dès 150 et −8 % dès 300, capacité de 600 couverts par jour, délai de 3 jours.
- **Suppléments** : fromage +100 DA, frites +150 DA, sauces gratuites (mayonnaise, ketchup, harissa).
- **Zones et frais de livraison** : estimés selon la distance depuis le restaurant (Oran centre 150 DA → Gdyel 700 DA).
- **Fidélité** : 1 box offerte toutes les 10 commandes.
- **Livreurs** : prénoms de démo (Hichem, Bilal).
- **Photo d'ambiance traiteur** : `mariage2.jpg` (Unsplash, tables dressées sans nourriture), légendée « Photo d'ambiance ». À remplacer par une vraie photo. Toutes les photos de plats sont les leurs.
- **Badges « épicé » et « végétarien »** : déduits du nom des plats.
- **Plats épuisés dans la démo** : Chou farci, Pastilla et Tiramisu (pour montrer la fonction).

### Prix ESTIMÉS (plats « épuisés » chez Yassir, sans prix ; `estime: true` dans les données)
Salade de pâtes 500 · Salade de poivrons 500 · Salade de carottes 450 · Salade de riz 500 · Bourak à la viande hachée 150 · Chorba 200 · Chausson au thon 150 · Quiche 150 · Chausson au fromage 150 · Soupe de champignons 250 · Pastilla 250 · Soupe de légumes 200 · Tortilla 150 · Cheesecake 300 · Mhalbi 150 · Mousse au chocolat 200 · Tiramisu 300 · Salade de fruits 250 · Cake Baba 200 · Flan au caramel 150 · Eau Minérale GM 50 · Gratin de pommes de terre 500 · Légumes farcis (Dolma) 700 · Seffa Couscous sucré 600 · Gratin de chou-fleur 500 · Muhammar 700 · Chou farci 700 · Gratin au fromage 550 · Pommes de terre au four 400 · Merguez 600 · Rechta 600 · Cuisse de poulet farcie 700 · Chou-fleur 500 · Escalope à la crème 750 · Berkoukes 600 · Djelbana 600 · Spaghetti 500 · Tajine de poulet aux olives 700.

Sans photo (visuel typographique) : Pizza Baraka, Pizza Méga, Muhammar, Chou farci, Tajine de poulet aux olives.

## Message 1 : prise de contact Instagram (sans prix, sans lien)

> Bonjour et bienvenue à Banet el Baraka 🙏
>
> Nous sommes Dzign Studio, une agence web algérienne. Votre concept nous a beaucoup plu : un self de plats traditionnels et le fast-food au même endroit, à Oran.
>
> Nous avons pris un peu d'avance : nous avons préparé une démo à votre nom, avec votre vraie carte et vos photos. Le site permet à vos clients de voir le self du jour, de commander en livraison ou à emporter et de suivre leur commande en direct. Ils peuvent aussi demander un devis traiteur pour leurs fêtes, et vous avez un espace pour gérer tout ça depuis votre téléphone (cuisine, caisse, livreurs).
>
> La démo est gratuite, et si on travaille ensemble, la maquette est « satisfait ou remboursé ».
>
> Est-ce que vous voulez qu'on vous la montre ? Quelques minutes suffisent, ici ou sur WhatsApp, comme vous préférez.
>
> Belle journée à toute l'équipe,
> Dzign Studio
