# À reprendre (état au 12/11/2026)

Note de passation : lire ce fichier au début de chaque nouvelle conversation, puis le mettre à jour à la fin.

## Façon de travailler avec le client (à lire en premier)
- **Toujours répondre en français.** Messages courts, lus sur téléphone, souvent pendant que le client est face à son propre client.
- **Comprendre avant d'agir.** Si une consigne peut se lire de 2 façons, reformuler en une ligne ou poser la question. Ne jamais deviner quand ça coûte des crédits.
- **Ordre de travail** :
  1. 3D gratuite (three.js) ;
  2. le client vérifie et corrige ;
  3. seulement après son « vas-y » : photos Higgsfield à **~0,5 crédit par photo** (`gpt_image_2_5`, `quality: medium`).
- Jamais de 4K sans accord. Annoncer le coût avant chaque lancement et respecter le budget donné (ex. « 10 crédits max »).
- **Retouches ciblées** : ne corriger que ce qui est demandé, sur la photo concernée.
  - Si le client entoure une zone, c'est cette zone seulement.
  - « Une seule couleur » = tout le meuble dans le même décor.
- **« Arrête » / « Stop »** : ne plus lancer aucun outil et répondre en 2 lignes. Un appel refusé par le client = stop.
- **Chaque pièce est séparée** : ne pas mettre la coiffeuse dans la photo du dressing, etc.
- **Visuels** : style « Youcef » (vertical 3:4, carte blanche à barre rouge, `label.py`). Pas de prix sur les visuels.
- **Coordonnées** : WhatsApp 0794 70 93 23 ; site lamaisonduparquet.org.

## Higgsfield
- Solde vérifié le 30/10 : **54,69 crédits**.
- Le 30/10, les générations ont été bloquées par la limite quotidienne de la « période de grâce » de l'abonnement (pas un manque de crédits). Vérifier l'abonnement si ça recommence.

## Devis
- **Parquet** : skill `proforma-myf`.
  - Prix TTC dans `pttc` ; pose dans `surcharge_pose` (sans TVA), comptée sur la surface réelle.
  - Plinthes 1 800 DA la barre ; pose 1 200 DA/m² ; EL1055 et EL2416 à 4 800 DA TTC/m².
- **Meubles atelier** : section « Devis meubles sur mesure » du skill `proforma-myf`.
  - Panneau 17 mm d'une autre source qu'EGGER, 3200 × 2080, 10 000 DA.
  - Caissons séparés, prix coûtant sans bénéfice.
- Dernier numéro : voir `devis/dernier-numero.txt` (055/2026 au 11/11).
- Données clients (JSON, PDF) uniquement dans le scratchpad, jamais dans le dépôt.

## Projets

### Chambre H1357 / U705 — `chambre-H1357-U705/`
- Photos finales dans `photos-4k-v2/`. Mur TV sans lattes fait le 20/10 (retouche locale gratuite).

### Chambre fille H1357 / U705
- 5 photos et la planche livrées le 21/10.
- Le bureau a été refait 5 fois. Version finale : bureau grège U705 « comme la photo atelier » (meuble fermé, tiroirs, joue) et niche d'étagères sur tout le poteau.

### Cuisine en L 3200 — `cuisine-L-3200/`
- 3 photos réalistes livrées (U702 + chêne H1145 + W1000, plan noir).
- Colonne frigo supprimée ; rangée haute toute en chêne (niche et angle compris).

### Projet U156 (nouveau client, 30/10)
- Contenu : dressing parental 4,50 m, coiffeuse, couloir (banquette + chausseur 5 m), tout en U156.
- 5 photos livrées.
- **Manquent 2 photos du chausseur** (fermé et ouvert), bloquées par la limite Higgsfield : coût 1 crédit à la reprise.

### Dressing 3 × 2 m — `dressing-3x2/`
- 3D, liste de coupe 17 mm, calepinage, fournitures et modèle SketchUp (.dae) : `python3 debit.py out` ; meuble droit : `MODE=meuble`.
- Chiffrage coûtant de l'atelier : **101 000 DA** pour le L, **64 100 DA** pour le meuble droit 3 m.
- **Les devis 054 et 055 sont à refaire** : ils mentionnent EGGER et ne comptent que les panneaux. En attente :
  1. le détail du poste à 19 000 DA ;
  2. la marge à ajouter.
- Le client a montré un **échantillon de panneau chêne doré à fil fin**. Il faut savoir si le dressing se refait dans ce décor ; avec le fil du bois, ça tient toujours sur 6 panneaux.

### Instagram (12/11) — `ads/insta/`
- Plan sur 2 semaines, bio et légendes prêtes : `PLAN-INSTA.md`.
- Fichiers prêts dans `out/` :
  - carrousel dressing (6 slides) ;
  - reel 11 s ;
  - 6 couvertures de stories à la une ;
  - 2 slides de fin (meubles, parquet).
- Générés avec `python3 build.py <images u156> out`, 0 crédit.
- Prochaine étape : le client publie. Bilan dans 2 semaines avec une capture des statistiques. Lui demander de vraies photos de chantier.
