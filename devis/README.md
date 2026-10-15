# Factures proforma SARL MYF

Ce modèle reproduit la mise en page de la proforma papier (N 037/2026) : en-tête SARL M Y F, cadre client, tableau des lignes, totaux et montant en lettres.

1. Copier `exemple.json` sous un nouveau nom, par exemple `038-client.json`. Remplir le numéro, la date, le client et les lignes (`designation`, `quantite`, `puht`). On peut aussi préciser `code`, `unite` (M2 par défaut) et `tva` (19 par défaut) pour chaque ligne, ainsi que `surcharge_pose`.
2. Lancer `node devis/proforma.cjs devis/038-client.json`. La commande produit un PDF et un aperçu PNG à côté du fichier.
3. Les totaux de ligne, le total HT, la TVA, le TTC et le montant en lettres sont calculés automatiquement.

Repères de prix :
- prix TTC 5 400 DA/m² = **4 537,81 DA HT** ;
- sous-couche 200 DA HT/m² = 238 DA TTC.

Quantités : pour le parquet, compter des **cartons entiers**. Un colis EL2970 fait 1,99 m² : 377,017 m² correspondent à 189,46 cartons, on facture donc 190 cartons, soit 378,10 m².

Les proformas des clients (fichiers `.json`, `.pdf` et `.png` autres que l'exemple) ne sont pas versionnées, voir le `.gitignore`.
