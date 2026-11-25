# Pub vidéo : brief pour la reprise (session suivante)

## Règles fixées par le client
- **Budget : 150 crédits Higgsfield maximum** (solde au 02/10/2026 au soir : ≈ 168,5).
- **Validation du client avant chaque lot de génération** : story-board et coût exact (`get_cost`) d'abord, puis un plan test, puis le reste par lots.
- Objectif : film de **1:10**, niveau des films de marque EGGER, en 9:16 et 4:5, plus une version de 15 s.
- **Pas de voix IA, pas de musique synthétique.** Sous-titres au style du site. La musique sera ajoutée par le client depuis la bibliothèque Meta ou Instagram, ou ce sera sa propre voix.
- Jamais « représentant officiel EGGER ». Jamais de délai d'importation.
- Question à poser avant le story-board : **faut-il une égérie (une personne à l'écran) ?** Générée par l'IA ou filmée en vrai ?

## Ce qui n'a pas plu dans la version du 02/10 (`ads/build/build2.py`)
Effet « IA », voix off, musique, rythme, textes, images « pas au niveau d'EGGER ».

## Leçons techniques
- Kling 3.0 en transformation entre deux images (carrelage → parquet) : lames qui « explosent », carrelage qui a l'air cassé. **À proscrire.**
- Liquides (verre, gouttes) mal rendus par Kling.
- Les recadrages 9:16 des visuels 16:9 du site (`ads/sources/v-*.jpg`) sont trop doux : prévoir des images de départ verticales nettes.
- Ce qui a bien marché : mouvements de caméra simples sur une photo réelle (`ai4` salon, `ai3` ras du sol, `ai12` plan large, `ai8` grain en lumière, `ai9` lame qui se clipse, `ai10` échantillons du showroom).

## Coûts mesurés (`get_cost`, 9:16, sans son)
| Modèle | Réglage | Crédits |
|---|---|---|
| Kling 3.0 | pro, 6 s | 10,5 |
| Kling 3.0 | std, 6 s | 9 |
| Kling 3.0 | 4K, 6 s | 36 |
| Cinema Studio Video v2 | pro, 6 s | 9 |
| Veo 3.1 | fast, 8 s | 32 |
| Veo 3.1 | preview high, 8 s | 80 |
| Voix seed_audio | une phrase | 0,4 |

## Ressources déjà payées (réutilisables gratuitement)
- Plans générés : identifiants dans `ads/build/jobs.json` (index 1 à 13), retrouvables dans le compte Higgsfield.
- Photos déjà importées (media_id Higgsfield) :
  - `v-tile` 7ae6f214-e6d1-401b-80d3-897776aa2431
  - `v-el2863` 3582c556-873a-45bc-a928-3cec9465080a
  - `v-el2416` 4ce6e800-f8a6-48e2-aba5-a85a46a03065
  - `v-el2970` 788e1de4-6be5-4d8f-bdbd-27171f23d6cb
  - `v-el1061` 33425fe1-7944-4357-a8fd-a6e418247f5c
  - `v-el1055` 81190852-0532-40a0-9751-c6aa755fcf41
  - `v-egger-el2416` ff76f3cb-3961-40d6-b93c-4c16d1dbf032
  - `v-egger-el1055` 8910636c-f5c5-41a9-b374-e0008dad30a2
  - `v-egger-el2863` 93076887-22a9-4266-98f2-0a864b0b117a
  - `v-sw-el2863` ac43c224-18b9-44e1-abec-7db9740f9d31
  - `v-sw-el1055` af1f3bb4-710c-4685-b2e5-16a0c0f21b87
  - `v-show-floor` 4fe37aee-6f78-4548-9897-8b59e6f5f00b
- Préréglage Kling à refuser à chaque génération : `declined_preset_id` 24bae836-2c4a-48e0-89b6-49fcc0b21612.

## Préparé le soir du 02/10 (sans crédits)
- **Story-board complet** : `ads/STORYBOARD.md` (11 plans, consignes image, mouvement et texte, budget détaillé).
- **Coûts vérifiés** : image `gpt_image_2_5` 2K medium = **1 crédit** (high = 2,75) ; Kling 3.0 pro 5 s = **8,75** ; Veo 3.1 fast 6 s = 24.
- **Références des vrais décors EGGER** (tirées du kit) : `ads/sources/ref-decor-{el2863,el1061,el2970,el2416,el1055}.jpg`. Importer avec `media_import_url` via l'adresse raw GitHub de la branche (gratuit).
- **Montage prêt et testé** : `ads/build/build3.py` + textes `ads/build/cards3.cjs`.
  - Il met les plans générés dans `ads/build/clips3/s01..s09.mp4` et `s11.mp4` (s10 = vraie vidéo du showroom).
  - Un plan absent est remplacé par une image fixe : on peut monter à tout moment.
  - Sorties : `out/film-1m10-9x16.mp4` (71 s), `out/film-1m10-4x5.mp4`, `out/film-15s-9x16.mp4`.

## Méthode de la reprise
1. Analyser les pubs EGGER publiques (cadrages, rythme, couleurs, ton) et en tirer une direction créative d'une page.
2. Story-board de 1:10 plan par plan, avec le coût de chaque plan, **soumis au client**.
3. Modèles :
   - Veo 3.1 pour 2 ou 3 plans « héros » ultra réalistes ;
   - Kling 3.0 pro ou Cinema Studio pour le reste, en mouvements simples, sans transformation.
4. Un plan test validé, puis les lots. Solde noté avant et après chaque lot, arrêt à 150 crédits.
5. Montage gratuit en adaptant `ads/build/build2.py` (fonctions `clip`, `still`, `concat`, étalonnage `GRADE`, export 4:5 avec fond flouté) : retirer la voix et la musique, ajouter des sous-titres et des coupes au tempo de 100 à 110 BPM.

## Outils dans ce conteneur
- ffmpeg : `pip install imageio-ffmpeg`, puis le binaire indiqué par `python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"` (mettre à jour la variable `FF` de `build2.py`).
- Cartes texte : `node ads/build/cards.cjs` (Playwright, polices du site).

## Motion design (ajouté le 03/10, gratuit)
- Référence du client : reel « Motion Design Opus 5.5 » (instagram.com/reel/Dd30EeIu-jP), des vidéos animées créées par Claude avec du code.
- Moteur : `ads/motion/` (`base.css`, `seek.js`, `render.cjs`). Les scènes HTML sont pilotées dans le temps par `seek(t)` et rendues image par image en 1080x1920 à 30 i/s.
  - Rendre une scène : `node ads/motion/render.cjs <scène> <durée_s>` → `ads/motion/out/<scène>.mp4`.
- Scène faite : `m1-intro` (7 s), le carrelage gris puis les vraies lames EGGER EL2863 qui se posent, « Votre carrelage reste. » puis « Votre maison change. ».
- À créer :
  - `m2` : lame éclatée en 3D, 4 couches nommées (reprendre la lame 3D du site, `site/assets/css/style.css`) ;
  - `m3` : chiffres animés « 0 gravat · 1 journée · 24 h Aqua » ;
  - `m4` : carrousel 3D des 5 décors réels (`ads/sources/ref-decor-*.jpg`) ;
  - `m5` : carte de fin animée.
- Film final : alterner les scènes de motion design et les plans photoréalistes dans `ads/build/build3.py`.
- Première question à poser au client : faut-il une égérie ?
