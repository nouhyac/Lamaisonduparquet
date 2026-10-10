# Armoire noir mat en 3D
Scène three.js (WebGL) rendue avec Playwright, sans crédits Higgsfield.
- `scene.html` contient la scène : armoire de 2,40 × 2,50 × 0,60 m en noir mat EGGER, avec une porte entrouverte côté penderie, une niche de rangement en chêne Bardolino, des LED dans les joints et sous le socle, et un sol en parquet Chêne Asgil miel.
- `shot.cjs` fait le rendu : `node shot.cjs still out.png` pour une image, `node shot.cjs frames dossier 180` pour les images d'un orbit vidéo.
- Le rendu a besoin, dans le même dossier que la scène, de :
  - three.js 0.160 (`three.module.js`, `RoomEnvironment.js`, `RoundedBoxGeometry.js` et `jsm/postprocessing`, `jsm/shaders` pour le halo) ;
  - des textures `floor.jpg` (ads/sources/ref-decor-el2863.jpg) et `oak.jpg` (ref-decor-el1055.jpg) ;
  - des polices Fira (site/assets/fonts).
