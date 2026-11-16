# Client : General Electric dz · Kit alarme sans fil Dahua AirShield

Page Facebook « General Electric dz » (65 K abonnés, électricité en général, shopping et vente au détail). WhatsApp 0666 23 53 30 · Tél. 0792 54 50 57 (noté « Apple ») · El Hamiz · https://maps.google.com/?q=36.717319,3.228126 (capture dans `sources/`).
Intégré dans la page (vendu par, bandeau de confiance, contacts, bouton WhatsApp flottant, commande envoyée sur WhatsApp) et à la fin des 4 vidéos.

Demande (15/11/2026) : une landing page simple et des vidéos publicitaires pour le kit Dahua réf. **DHI-ART-ARC3000H-03-GW2(868)** (photos de la boîte dans `sources/`).

Démo (privée, à partager avant envoi) : https://claude.ai/artifact/RhZLFy1SkDhwJE2otZDmWJ
Espace commandes : lien en bas de la page, code **0328**.

## Ce qui est livré
- **Landing page** FR/AR (`site/`) :
  - héros de nuit avec alertes animées ;
  - 3 scénarios (vacances, nuit, animal) ;
  - les 4 pièces du kit avec les vrais chiffres ;
  - **simulateur interactif** : armer, ouvrir la porte, chat, coupure Internet / courant, SOS, avec sirène, SMS et appel sur un téléphone ;
  - installation en 3 étapes, réseau et batterie (schéma officiel Dahua), application DMSS, évolutivité (150 accessoires) ;
  - fiche technique complète, FAQ (8 questions) ;
  - formulaire de commande (58 wilayas) et bouton collant sur mobile.
- **Espace gérant** (`gestion.html`, lien « Espace gérant » en bas de la page) · codes : gérant **0328**, caisse **2222**
  - Tableau de bord : chiffre d'affaires, commandes à confirmer, kits vendus, stock, ventes sur 7 jours, wilayas, dernières commandes.
  - Commandes du site en direct : statuts, « Confirmer WhatsApp » (message prérempli), « Appeler », filtre, copie vers Excel.
  - Caisse au comptoir : kit + tout autre article du magasin (désignation + prix), espèces/carte, ticket.
  - Stock : réceptions, sorties automatiques (caisse + commandes), alerte de stock bas.
  - Clients : historique et WhatsApp.
  - Réglages : prix, ancien prix, rupture → la page publique change en direct ; codes d'accès ; remise à zéro de la démo.
- **Vidéo pub 24 s**, 4 formats (`marketing/`) : 9:16 (Reels, Stories, TikTok, Shorts, statut WhatsApp) · 4:5 (fil IG/FB) · 1:1 · 16:9 (YouTube, Facebook, site). Musique originale. Couvertures fournies.

## Sources (aucune caractéristique inventée)
- Fiches techniques officielles Dahua (kit + centrale) dans `sources/`.
- Photos produits : visuels officiels Dahua (fond transparent).
- 4 photos d'ambiance générées par IA à partir des vraies photos des produits (Higgsfield, environ 1 crédit). Elles sont signalées comme illustrations en bas de page.

## Chiffres utilisés (fiche officielle)
| Élément | Chiffres |
|---|---|
| Centrale | Ethernet + Wi-Fi 2,4 GHz + SIM 2G (GSM 900/1800, double SIM en veille simple) · batterie 12 h · buzzer · SMS et appels vers 5 numéros · 2 000 m |
| Télécommande | Absent / Maison / Désarmer / SOS · 900 m · CR2032 5 ans |
| Détecteur d'ouverture | < 40 mm · 1 200 m · CR123A 5 ans |
| Détecteur de mouvement | 12 m à 90° (pose à 2,2 m) · animaux ≤ 18 kg · 1 600 m · CR123A 4 ans |
| Système | 150 accessoires (6 sirènes, 64 télécommandes) · AES-128 · 868 MHz · application DMSS |

## À demander au client (réglage en 1 minute dans `site/js/config.js`)
- ✅ Nom, WhatsApp, téléphone, lieu : intégrés. Vérifier que 0792 54 50 57 est bien un numéro à afficher.
- **Prix de vente** et éventuel ancien prix. Sans prix, la page affiche « Prix et disponibilité : réponse rapide ». Repère marché : aivar.dz affiche une version voisine (W2, sans SIM) à 43 000 DA ; à confirmer par le client.
- Conditions : livraison (wilayas, délais, frais), paiement à la livraison, garantie. Rien n'est affiché tant que ce n'est pas confirmé.
- Adresse et horaires du magasin (pour la vidéo de fin et le pied de page).

## Textes de pub prêts (Instagram / Facebook / TikTok)
**Accroche principale**
Une porte s'ouvre à 2 h du matin ? Votre téléphone sonne. 🚨
Kit d'alarme sans fil Dahua AirShield :
✔ appel + SMS vers 5 numéros
✔ marche même si Internet est coupé (carte SIM)
✔ 12 h sur batterie en cas de coupure de courant
✔ détecteur qui ignore les animaux jusqu'à 18 kg
✔ installation sans câble
👉 Commandez en 30 secondes : lien en bio

**Variante courte (Stories/TikTok)**
Votre maison vous prévient. Même sans Internet. 🔐 Kit alarme Dahua AirShield · commande en ligne.

**Variante arabe**
باب يُفتح في الساعة 2 ليلاً؟ هاتفك يرنّ 🚨
مجموعة إنذار لاسلكية Dahua AirShield: مكالمة ورسالة إلى 5 أرقام، تعمل حتى بدون إنترنت (شريحة SIM)، 12 ساعة على البطارية.
👉 اطلب الآن، الرابط في البايو

## Ciblage pub conseillé (Meta)
- Âge 25-60, propriétaires, parents, commerçants.
- Centres d'intérêt : maison, sécurité, voyages, petites entreprises.
- Vidéo 9:16 en Reels et Stories, 4:5 dans le fil. Objectif : messages WhatsApp ou formulaire de la page.
- Test de départ : 2 publicités (vidéo 24 s et extrait des 8 premières secondes), budget à fixer par le client.

## Version B « rassurante » (inspirée de la pub Tike Sécurité)
Référence envoyée : « Publicité 2026 Tike Sécurité » (YouTube). Codes repris, sans rien copier : ouverture sur les maisons avec « Protégez votre maison ou votre entreprise », gestes concrets (pose du détecteur, téléphone), sous-titres en bande en bas, ambiance claire et familiale, fin avec les coordonnées.
Fichiers : `marketing/pub-B-rassurante-30s-{16x9,9x16,4x5,1x1}.mp4` (30 s, musique originale, lisible sans le son).
Sans voix off : Higgsfield a atteint sa limite journalière (compte en période de grâce). Une voix off française est possible plus tard (0,3 crédit).

## Plan de test conseillé (A/B)
- **A « choc »** (nuit, 24 s) : arrêter le scroll, ciblage large (maisons, villas).
- **B « rassurante »** (jour, 30 s) : familles et commerçants, reciblage des personnes qui ont vu A.
- Même budget sur les 2 pendant 3 jours. On garde celle qui donne le plus de messages WhatsApp au meilleur coût.

## Version C « style Tike » (16/11/2026)
Même déroulé que B, avec de vraies scènes générées (Higgsfield, 4 images, ≈ 1 crédit) : quartier au coucher du soleil, alerte sur téléphone en plein jour, commerçant qui baisse son rideau avec la télécommande Dahua, famille sur le canapé (centrale Dahua visible). Fichiers : `marketing/pub-C-style-tike-33s-{16x9,9x16,4x5,1x1}.mp4`.
Voix off française : toujours bloquée par la limite journalière Higgsfield (compte en période de grâce). À ajouter dès que possible (0,3 crédit).

## Finitions du 16/11/2026
- Vidéo C intégrée dans la page (section « La vidéo » : 16:9 sur ordinateur, verticale sur téléphone, environ 2 Mo chacune).
- 4e scénario « Vous fermez votre magasin » (photo du commerçant).
- Aperçu de partage (image + titre) et icône d'onglet.
- Livraison : texte neutre « on vous rappelle pour organiser la livraison ou le retrait au magasin », en attendant les vraies conditions.
- Prix : à saisir par le gérant dans Espace gérant → Réglages (la page se met à jour seule).
- Voix off : nouvelle tentative programmée le 17/11 à 10 h 30 (heure d'Alger).
