# Pub Meta en cours : vidéo 50 s → WhatsApp

| Élément | Valeur |
|---|---|
| Campagne | « LMDP · Vidéo 50 s · WhatsApp · Algérie » `120252281416110105` (le nom dit « 80 $ », mais le budget réel est de 65 €) |
| Ensemble de publicités | `120252281416600105` : **ACTIF** (activé par le client le 05/10) |
| Pub qui tourne | « Vidéo 50 s v3 (corrigée) » `120252282830600105`, vidéo `ads/pub/film-50s-pub-v3.mp4` |
| Pubs à laisser sur OFF | « Vidéo 50 s v2 (3 photos) · active » `120252281418350105` et « Vidéo 50 s v2 (3 photos) » `120252282765570105` |
| Destination | **WhatsApp 0794 70 93 23**. Message d'accueil + 3 boutons (« Voir les prix », « Réserver une visite », « Livraison en Algérie ») |
| Budget | **65 €** au total (compte facturé en €, plafond client 80 $), du 04/10 au **18/10** |
| Audience | Toute l'Algérie, 25-65 ans (Advantage+ impose 65 au minimum), intérêt Décoration intérieure, Advantage+ activé |
| Emplacements | Partout : Facebook, Instagram, Messenger, Audience Network |
| Texte | « Changez de sol sans casser votre carrelage. Le parquet EGGER se clipse directement dessus : posé en une journée, sans gravats, sans poussière. 5 décors en stock à Dar El Beïda, livraison partout en Algérie. Écrivez-nous pour votre devis. 👉 Calculez vos cartons : lamaisonduparquet.org » |
| Titre | Parquet EGGER posé sur carrelage |

À côté tourne aussi le boost manuel « NOUVEL ARRIVAGE » : **0,16 € par conversation**, c'est la référence.

## Pilotage
- Suivi par **captures Business Suite** du client. Le quota Adspirer est épuisé jusqu'au **02/11/2026**.
- Ne rien modifier pendant l'apprentissage, sauf si le coût par conversation dépasse **0,80 €**.
- J+7 (11/10) : retirer les emplacements ou les âges qui coûtent plus de 2 fois la moyenne. Audience Network est le premier à surveiller.
- J+14 (18/10) : bilan des messages, des visites et des ventes, puis décision pour la campagne suivante.
- Prochaine campagne : remettre la vidéo à jour avec le 0549 en numéro d'appel (`ads/v50/fix/fix-v2.sh`, version actuelle : 0794 en WhatsApp et 0549 en appel sur les cartes).

## Historique et pièges rencontrés
- 03/10 et 04/10 : création refusée à cause d'un **solde impayé**, puis d'un **numéro WhatsApp non relié** à la Page (le 0549). Le 0794 a été accepté.
- `resume_meta_campaign` n'avait réactivé que la campagne. L'**ensemble de publicités et la pub étaient restés en pause**, et le client les a activés lui-même.
- 04/10 : v2 du client corrigée en v3. Le WhatsApp passe au 0794 sur les cartes et la fin, et « Représentant EGGER en Algérie » est remplacé par « Parquet EGGER · en stock à Alger ».
