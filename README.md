# Lamaisonduparquet
https://claude.ai/artifact/8py4yzba6srs7hHWEpCfjb

## Pilotage Instagram (`dashboard/`)

Tableau de bord d'analyse Instagram aux couleurs EGGER / La Maison du Parquet.
Il s'ouvre sur un jeu de données d'exemple (signalé comme tel) et analyse le vrai
compte dès qu'on importe un export Windsor.ai (CSV ou JSON) dans l'onglet « Données ».

- `index.html` : structure et styles
- `core.js` : données d'exemple, import Windsor.ai, classifications déduites, score 0-100
- `charts.js` : graphiques SVG et infobulles
- `app.js` / `app2.js` : analyse de la période et les 17 onglets
