# Client : magasin de sécurité · Kit alarme sans fil Dahua AirShield

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
- **Espace commandes** (`commandes.html`) : liste, statuts (nouvelle → confirmée → expédiée → livrée), lien WhatsApp du client, export Excel.
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
- Nom du magasin, téléphone et WhatsApp (sans numéro, le bouton WhatsApp de la page reste masqué).
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
