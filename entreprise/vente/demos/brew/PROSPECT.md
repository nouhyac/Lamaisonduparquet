# BREW — Coffee & Brunch · fiche prospect

- **Contact** : Raid Mebarki (@Raid.Mebarki, WhatsApp) · Instagram @brew.coffee.brunch (« Coming soon »)
- **Statut** : démo à son nom prête (31/10/2026), à envoyer. Carte de lancement reçue (`CARTE.md`).
- **Démo** : `site/index.html` (site client) + `site/gestion.html` (espace gérant). Tout fonctionne en local, sans serveur (localStorage + BroadcastChannel, préfixe `brw-`).

## Ce qui est fait

### Site client (`index.html`)
- Héros : logo officiel, « Coffee & Brunch », bandeau **« Ouverture très bientôt »** + inscription **« Prévenez-moi à l'ouverture »** (téléphone / WhatsApp). Si le gérant saisit une date d'ouverture → **compte à rebours**. Mode **« Ouvert »** (horaires du jour + boutons Commander / Réserver) basculé par le gérant ou par le bandeau démo (« Aperçu du site : Avant l'ouverture / Ouvert »).
- **Carte complète (64 produits de CARTE.md, aucun ajout)** : Signature Drinks en tête, puis toutes les catégories, séparateur « Brunch — Salé · Sucré · Healthy », recherche, filtres Chaud / Glacé / Sucré / Salé / Healthy, navigation par catégories, fiche produit avec options.
- Options : Iced Latte **Caramel ou Vanille** (obligatoire) ; Avocado Sunrise **+ saumon fumé** ; Cheese Croissant **+ poulet fumé** ; œuf / avocat sur les plats où c'est logique ; **lait végétal (si disponible)** sur les boissons lactées. Le gérant peut désactiver chaque supplément.
- **Commander à l'avance & retrait au comptoir** (heure de retrait par créneaux de 15 min), **commande à table par QR code** (`index.html?table=5` → bandeau « Table 5 »), **livraison** désactivable (2 zones génériques « Zone 1 · proche / Zone 2 · étendue », frais et minimum réglables).
- **Formule Brunch** : choisir le plat (salé, sucré ou healthy) + la boisson chaude classique, jus d'orange inclus ; prix = somme − 10 % (arrondi aux 50 DA), remise réglable.
- **Suivi en temps réel** : Reçue → En préparation → Prête (détail Boissons / Cuisine), notification « Votre commande est prête ! », bouton WhatsApp.
- **Carte de fidélité** liée au téléphone : 1 boisson offerte toutes les 10 boissons (réglable), case « Utiliser ma boisson offerte » au panier.
- **Réservation brunch** (date, heure, personnes) → en attente → confirmée / refusée par le gérant, visible côté client.
- Infos : lien Google Maps (share.google/38PZvSdP12JilX6cp), Instagram, WhatsApp, horaires (8 h – 20 h tous les jours par défaut, modifiables).
- FR / العربية complet (RTL, polices Cairo / Baloo Bhaijaan 2), noms de produits laissés tels que le client les a écrits.
- Bandeau discret « Démo réalisée par Dzign Studio pour BREW » + lien « Espace gérant ».

### Identité
- Brun du logo #2B201C / crème #FBF3D9, accents doux par catégorie (matcha, fraise, caramel, passion…), titres en **Bagel Fat One** (rond et épais comme le lettrage BREW), texte DM Sans.
- **Logo recréé en SVG** (personnage bouclé, yeux fermés, tasse fumante, nappe à carreaux, lettrage « BReW ») : en-tête, favicon, espace gérant, cartes QR.
- **Système d'illustrations au trait** dans le style du logo (tasse, verre glacé, latte art, matcha, milkshake, frappé, théière, toasts, brioche, assiettes, bowls, croissant, brownies, granola, cookie, cheesecake, tiramisu, cinnamon roll…), une par produit, avec la petite nappe à carreaux en clin d'œil. Aucune photo de banque, aucune image IA.
- Photo client : le sac BREW, recadrée sans l'icône Instagram (`img/sac-brew-recadre.jpg`).

### Espace gérant (`gestion.html`)
| Rôle | PIN | Accès |
|---|---|---|
| Gérant | **0328** | tout |
| Bar | **1111** | écran Bar (boissons + vitrine + jus des formules) |
| Cuisine brunch | **1112** | écran Cuisine (plats) |
| Caisse | **2222** | caisse |

- Tableau de bord du jour : CA encaissé, commandes, panier moyen, en cours, **CA par heure**, top produits, commandes en cours, réservations à confirmer.
- **Bar** et **Cuisine brunch** séparés : chaque commande est éclatée vers le bon poste (une Formule Brunch envoie le plat en cuisine, la boisson et le jus au bar) ; colonnes À préparer / En préparation / Prêt, minuteurs (orange > 8 min, rouge > 15 min), alerte sonore + bandeau à chaque nouvelle commande ; « Prêt » → client notifié ; « Remis / Servi ».
- **Caisse** : vente comptoir (grille produits + options), commandes à encaisser (espèces / carte CIB-Edahabia), plan des tables (montant dû par table), **clôture Z** avec historique.
- **Carte** : prix, disponibilité, **vitrine du jour** (cocher les sweets présents selon le fournisseur), suppléments on/off + prix, catégories visibles, remise de la formule.
- Réservations (confirmer / refuser + message WhatsApp au client), fidélité (+1 tampon, offrir la boisson), liste **« Prévenez-moi »** (export CSV, copier les numéros, message pré-rempli, lien WhatsApp par numéro), **QR codes de tables** imprimables générés en local (aucun service externe), réglages (statut bientôt / ouvert, date d'ouverture, horaires par jour, retrait / table / livraison on-off, zones, minimum, fidélité, numéro WhatsApp, nombre de tables, PIN), **mise en service** (remise à zéro de l'activité en gardant carte et réglages).
- Données d'exemple : une journée commencée (18 commandes avec leurs produits, prénoms algériens, dont 4 en cours), 3 réservations, 3 cartes de fidélité, 4 inscrits « Prévenez-moi ».

## Prix proposés (à remplacer par vos prix)
Le client n'a pas encore fixé ses prix : prix indicatifs de coffee shop moderne à Alger, tous modifiables dans l'espace gérant (page Carte).

**BREW Signature Drinks** — Brew Passion 550 DA · Brew Strawberry 550 DA · Brew Red 550 DA

**Cafés chauds** — Espresso 200 DA · Double Espresso 300 DA · Ristretto 200 DA · Americano 250 DA · Cappuccino 350 DA · Café Latte 350 DA · Flat White 400 DA · Mocha 450 DA · Spanish Latte 450 DA

**Cafés glacés** — Iced Americano 300 DA · Iced Latte 450 DA · Iced Spanish Latte 500 DA · Iced Mocha 500 DA · Cold Brew 450 DA

**Signature Lattes** — Pistachio Latte 550 DA · Biscoff Latte 550 DA · Hazelnut Latte 550 DA

**Matcha Bar** — Hot Matcha Latte 550 DA · Iced Matcha Latte 600 DA · Strawberry Matcha 700 DA

**Chocolat** — Hot Chocolate 400 DA · Iced Chocolate 450 DA

**Refreshers & Lemonades** — Fresh Orange Juice 400 DA · Fresh Lemonade 350 DA

**Milkshakes** — Vanilla Milkshake 550 DA · Chocolate Milkshake 550 DA · Oreo Milkshake 650 DA · Biscoff Milkshake 700 DA · Pistachio Milkshake 750 DA

**Frappés** — Coffee Frappé 550 DA · Caramel Frappé 600 DA · Biscoff Frappé 650 DA

**Tea & Hot Drinks** — Classic Tea 150 DA · Mint Tea 200 DA · Lemon & Honey 250 DA

**Brunch salé** — Brew Scrambled Toast 850 DA · Avocado Sunrise 1 100 DA · Crispy Chicken Brioche 1 000 DA · Tuna Melt Toast 850 DA · Brew Breakfast Plate 1 200 DA · Burrata Garden 1 400 DA · Chicken Caesar Bowl 1 100 DA · Triple Layer Chicken 1 000 DA · Cheese Croissant Gratiné 700 DA · Œufs Turcs 900 DA

**Brunch sucré** — Brioche Perdue Fruits Rouges & Nutella 900 DA · Brownie à la Mode 750 DA · Brownie Fraise & Banane 700 DA · Brownie Biscoff Crunch 800 DA · Croissant Biscoff Banana 650 DA · Croissant Pistache & Fraise 750 DA · Peanut Butter & Banana Toast 600 DA

**Healthy Corner** — Banana Peanut Granola 750 DA · Red Berry Granola 750 DA · Tropical Granola 850 DA

**Sweets — Vitrine** — Cookie 250 DA · Brownie 350 DA · Croissant 200 DA · Cheesecake 550 DA · Tiramisu 500 DA · Cinnamon Roll 350 DA

**Suppléments** — Œuf supplémentaire +150 DA · Avocat +300 DA · Saumon fumé +600 DA · Poulet fumé +350 DA · Lait végétal +150 DA

**Formule Brunch** — plat + boisson chaude classique + Fresh Orange Juice, −10 % sur la somme (arrondi aux 50 DA inférieurs). Ex. Avocado Sunrise + Cappuccino + jus = 1 650 DA au lieu de 1 850 DA.

## Choix faits par nous (à valider après acompte)
- **Boissons chaudes « classiques » de la formule** : Espresso, Double Espresso, Ristretto, Americano, Cappuccino, Café Latte, Flat White, Classic Tea, Mint Tea, Lemon & Honey (pas Mocha, Spanish Latte ni Signature Lattes).
- **Suppléments par produit** (« selon les recettes ») : œuf sur Scrambled Toast, Avocado Sunrise, Crispy Chicken Brioche, Tuna Melt, Breakfast Plate, Caesar Bowl, Triple Layer, Œufs Turcs ; avocat sur Scrambled Toast, Avocado Sunrise, Breakfast Plate, Burrata, Caesar Bowl, Triple Layer, Œufs Turcs ; saumon fumé sur Avocado Sunrise et Scrambled Toast ; poulet fumé sur Cheese Croissant ; lait végétal sur toutes les boissons au lait (cafés, Signature Lattes, matcha, chocolat).
- **Fidélité** : 1 tampon par boisson commandée (formule = 2 boissons), 10 tampons = 1 boisson offerte (la moins chère du panier).
- **Postes** : la vitrine et les jus partent au bar, les plats en cuisine.
- Paiement : espèces ou carte CIB / Edahabia (pas de paiement en ligne).
- Note : le bilan de CARTE.md annonce « 36 boissons / 62 références », mais la liste détaillée en contient **38 / 64** ; la démo reprend fidèlement les 64 produits listés.

## À ajuster après l'acompte de 50 %
1. **Prix réels** (costing en cours chez le client) + prix des suppléments et remise de la formule.
2. **Adresse**, lien Maps final et **horaires** réels (par jour si besoin).
3. **Date d'ouverture** (compte à rebours) puis bascule en mode « Ouvert ».
4. **Numéro WhatsApp** de BREW (vide dans la démo : le bouton ouvre WhatsApp sans destinataire).
5. **Livraison** : oui / non, zones réelles (quartiers), frais, minimum.
6. **Fidélité** : règle exacte (nombre de boissons, quelles boissons comptent).
7. Liste des boissons de la formule et suppléments par recette.
8. Nombre de tables + impression des QR codes avec l'URL définitive (les QR encodent l'adresse du site en ligne).
9. Photos réelles des produits si le client en a (sinon on garde les illustrations), éventuels textes de présentation validés par lui.
10. Mise en ligne (nom de domaine, hébergement), PIN définitifs, **mise en service** (remise à zéro des données d'exemple).

## Message WhatsApp à envoyer à Raid
> Bonjour Raid, c'est Dzign Studio. Comme promis, la démo de BREW — Coffee & Brunch à votre nom est prête, avec toute votre carte de lancement : site avec commande à l'avance et retrait au comptoir, commande à table par QR code, formule brunch, carte de fidélité, réservations et page « Prévenez-moi à l'ouverture », plus un espace gérant (bar, cuisine, caisse). Les prix affichés sont indicatifs : nous les remplacerons par les vôtres. La démo est gratuite, et si la maquette ne vous plaît pas, vous êtes remboursé. Voici le lien : [lien]. Nous restons à votre disposition pour en parler.

## Fichiers
- `site/index.html`, `site/gestion.html`
- `site/css/base.css`, `site/css/site.css`, `site/css/gestion.css`
- `site/js/data.js` (carte + prix), `art.js` (illustrations + logo SVG), `i18n.js` (FR/AR), `store.js` (données + synchro), `site.js`, `gestion.js`, `qr.js` (QR codes en local)
- `site/img/logo.png`, `sac-brew.jpg` (originaux), `sac-brew-recadre.jpg`, `favicon.svg`
