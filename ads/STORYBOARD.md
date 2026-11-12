# Story-board : film publicitaire 1:10, La Maison du Parquet × parquet EGGER

**Idée centrale : « Votre carrelage reste. Votre maison change. »**
Direction artistique inspirée des films EGGER (« More from wood ») :
- intérieurs baignés de lumière naturelle, matière du bois en très gros plan ;
- mouvements de caméra lents et réalistes ;
- palette chaude et douce ;
- une phrase courte par plan, pas de voix off.

Musique ajoutée à la publication (bibliothèque Meta ou Instagram), tempo de 100 à 110 BPM, coupes sur le temps.

## Méthode (budget de 150 crédits)
1. **Images de départ** 9:16 en 2K avec `gpt_image_2_5` (qualité medium, **1 crédit l'image**). Les vrais décors EGGER servent de référence (`ads/sources/ref-decor-*.jpg`).
   - **Le client valide chaque image avant toute vidéo.**
2. **Animation** avec Kling 3.0 pro, 5 s (**8,75 crédits**) : un seul mouvement de caméra, jamais de transformation, jamais de liquide en mouvement.
   - Le plan d'accroche peut passer en Veo 3.1 fast, 6 s (24 crédits), si le test Kling n'est pas parfait.
3. **Montage gratuit** : `ads/build/build3.py`.

| Poste | Quantité | Crédits |
|---|---|---|
| Images de départ (avec une retouche chacune) | 11 × 2 | ≈ 22 |
| Plans vidéo Kling pro 5 s | 11 | ≈ 96 |
| Marge (un plan à refaire, ou accroche en Veo) | | ≈ 30 |
| **Total maximum** | | **≤ 150** |

## Les plans
Légende : **IMG** = consigne de l'image de départ, **MVT** = consigne d'animation, **TXT** = texte à l'écran.

**Acte 1 : l'accroche (0 à 10 s)**
1. **La lame posée sur le carrelage** (macro)
   - IMG : gros plan au ras du sol. Carrelage gris clair existant, sous-couche fine blanche déroulée dessus, une lame de chêne miel EGGER (référence EL2863) déjà emboîtée et une deuxième en train d'être posée. Lumière du matin rasante, profondeur de champ faible, photo publicitaire.
   - MVT : la lame descend doucement et s'emboîte dans la précédente, caméra fixe, léger rapprochement.
   - TXT : « Votre carrelage reste. »
2. **La pièce finie**
   - IMG : même salon que le plan 1, entièrement en parquet chêne miel EL2863. Grande baie vitrée, soleil du matin, mobilier minimal clair.
   - MVT : lent travelling avant.
   - TXT : « Votre maison change. »

**Acte 2 : la matière et les bénéfices (10 à 45 s)**

3. **Glissé au ras du sol**, chêne miel, rayons de soleil.
   - MVT : glissé avant au ras du sol.
   - TXT : « Le parquet EGGER se pose par-dessus. »
4. **Macro du grain** : le relief de la texture qui suit les pores du bois.
   - MVT : un rayon de lumière balaie la surface, léger glissé.
   - TXT : « La vraie texture du bois. »
5. **Cuisine ouverte en Chêne Melba beige EL2416 (Aqua)**
   - IMG : gouttes d'eau déjà posées en perles sur le sol, au premier plan.
   - MVT : lent rapprochement vers les gouttes ; les gouttes restent immobiles.
   - TXT : « Aqua : 24 h de résistance à l'eau. »
6. **Chambre en Chêne Achensee EL1061, lumière douce du matin**
   - Option égérie : des pieds nus qui marchent sur le sol.
   - MVT : glissé latéral lent.
   - TXT : « Plus chaud que le carrelage. »
7. **Salon en Chêne du Nord naturel EL2970**, ambiance du soir, lampes chaudes.
   - MVT : lent travelling arrière.
   - TXT : « Posé en une journée. »
8. **Les 5 décors** : 5 lames EGGER posées en éventail sur une table en bois clair (références des 5 décors).
   - MVT : glissé latéral au-dessus des lames.
   - TXT : « 5 décors en stock à Alger. »

**Acte 3 : la preuve et l'appel (45 à 70 s)**

9. **Showroom réel** : animation de la vraie photo `v-show-floor`, échantillons au sol.
   - MVT : travelling avant.
   - TXT : « Choisissez-le en vrai. »
10. **Vraie vidéo du showroom** (`show-loop.mp4`, gratuite).
    - TXT : « Showroom de Dar El Beïda. »
11. **Plan final** : le salon du plan 2 à l'heure dorée.
    - MVT : grue lente qui recule.
    - Pas de texte.
12. **Carte de fin animée** (gratuite) : SARL MYF, La Maison du Parquet et EGGER, « WhatsApp 0794 70 93 23 », « Appel 0549 50 68 57 », lamaisonduparquet.org.

## Règles
- Pas de transformation entre deux images, pas de liquide en mouvement, pas de texte généré dans l'image.
- Le décor du sol doit correspondre au décor de référence. Une image où le décor est faux est rejetée avant l'animation.
- Le solde Higgsfield est noté avant et après chaque lot ; arrêt à 150 crédits.
