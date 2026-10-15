---
name: proforma-myf
description: Facture proforma ou devis SARL MYF (La Maison du Parquet) à partir d'un brouillon manuscrit, d'une photo ou d'un message du client. Utiliser dès que l'utilisateur envoie un brouillon de devis (décor EGGER, cartons, m², sous-couche, plinthes, pose, nom ou téléphone du client) ou demande une proforma ou un devis.
---

# Proforma SARL MYF à partir d'un brouillon

Le modèle `devis/proforma.cjs` reproduit la proforma papier N 037/2026 : en-tête SARL M Y F, Tel 0555 24 36 83, Mob 0549 50 68 57, WhatsApp 0794 70 93 23, cadre client, tableau, totaux, montant en lettres. Mode d'emploi : `devis/README.md`.

## Dès qu'un brouillon arrive
1. **Lire chaque ligne** : désignation, quantité, unité, prix ; puis le nom et le téléphone du client.
   - Décors : EL2863 Asgil miel, EL1061 Achensee, EL2970 Chêne du Nord naturel, EL2416 Melba beige Aqua, EL1055 Bardolino. Colis de 1,99 m² dans `site/assets/js/data.js`.
   - Si le brouillon donne un nombre de cartons, l'indiquer dans la désignation (« … (17 cartons) »).
2. **Prix** : les prix notés à la main sont des **prix TTC**, à mettre dans `pttc`. Le modèle en déduit le HT ; la TVA de 19 % et le TTC tombent juste.
   - Repère : 5 400 DA TTC = 4 537,81 DA HT.
   - Si l'utilisateur dit que ce sont des prix HT, utiliser `puht` à la place.
3. **Pose** : elle ne va pas dans le tableau. Elle passe dans `surcharge_pose` (m² × prix), avec `libelle_pose` « SURCHARGE POSE (32 m²) ». Elle s'ajoute au TTC sans TVA, comme sur la 037.
4. **Plinthes** : unité `U`, désignation « Plinthe (barre de 2,4 m) ».
5. **Vérifier les calculs du brouillon** ligne par ligne : quantité × prix, puis le total.
   - En cas d'écart (par exemple 33,74 m² notés mais montant calculé sur 33 m²), faire **2 versions** :
     - **A**, avec les quantités exactes ;
     - **B**, au montant total du brouillon (ajuster les quantités pour que les lignes retombent sur les montants notés).
   - Expliquer l'écart en une ligne pour chaque poste.
6. **Numéro** : prendre le numéro suivant celui de `devis/dernier-numero.txt` (format `NNN/AAAA`), puis mettre ce fichier à jour, faire le commit et le push. La date est celle du jour (JJ/MM/AAAA).
7. **Générer** :
   - écrire le JSON dans le **scratchpad**, jamais dans le dépôt, car les données clients restent privées ;
   - lancer `node devis/proforma.cjs <json> <scratchpad>/Proforma-NNN-<Nom>.pdf`, qui produit le PDF et un PNG en haute définition ;
   - regarder le PNG avant d'envoyer.
8. **Envoyer** le PDF (pour l'impression) et le PNG (pour WhatsApp) avec `SendUserFile`. Ajouter un récapitulatif court :
   - le total TTC ;
   - les écarts éventuels ;
   - ce qui manque (adresse, R.C du client).

## Par défaut
- Titre : « Facture proforma ». Mettre `"titre": "Devis"` seulement si l'utilisateur demande un devis.
- Paiement : « A terme (Chèque ou Virement bancaire) ».
- Téléphone client : format `0555 57 09 99`.
- Ne jamais inventer d'adresse ni de R.C : laisser vide et le signaler.
- Conseils à rappeler quand c'est utile :
  - facturer des cartons entiers ;
  - ajouter RC, NIF, NIS, article d'imposition, RIB et durée de validité (à faire valider par le comptable).
