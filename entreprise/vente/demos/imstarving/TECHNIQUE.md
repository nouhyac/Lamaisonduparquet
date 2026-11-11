# Plateforme restaurant : passage de la démo à la vraie version

## Ce qu'est la démo
- Tout fonctionne (commande, cuisine, caisse, compta, clients, livraisons, marketing, réglages, rôles, mise en service), **mais les données vivent dans le navigateur** (localStorage). Une commande passée sur un téléphone n'arrive donc pas sur la tablette d'un autre appareil.
- Tout le code passe par une seule couche de données : `site/data.js` (`window.IMS`). Pour la vraie version, on remplace cette couche ; les écrans (`index.html`, `gestion.js`) ne changent pas.

## Vraie version (à livrer après signature, dans les 3 semaines)
| Brique | Choix conseillé | Coût |
|---|---|---|
| Site + espace gérant | Fichiers statiques sur Hostinger (déjà payé) ou domaine du client | 0 |
| Base de données temps réel + comptes | Supabase (PostgreSQL + Realtime + Auth), offre gratuite au départ | 0 puis ≈ 25 $/mois si gros volume |
| Alternative 100 % Hostinger | PHP + MySQL + rafraîchissement toutes les 3 s | 0 |
| Photos du menu | Stockage Supabase ou dossier Hostinger | 0 |
| Impression automatique | Tablette Android + appli RawBT (ESC/POS Bluetooth) ou PC + QZ Tray (USB/réseau) | 0 (imprimante 8 000-15 000 DA au client) |
| WhatsApp automatique | API WhatsApp Business (Meta), facturée par Meta | option |
| SMS gérant | Fournisseur SMS algérien | option |
| Nom de domaine | ex. imstarving.dz / imstarving-food.com | 1re année incluse |

## Étapes
1. Tables : `restaurants`, `categories`, `plats`, `commandes`, `lignes`, `clients`, `clotures`, `reglages`, `utilisateurs` (rôles gérant / cuisine / caisse).
2. Remplacer `lire/ecrire/surChangement` de `data.js` par Supabase (requêtes + abonnement Realtime).
3. Codes d'accès → vrais comptes (code ou mot de passe par poste), règles d'accès côté serveur.
4. Mise en service : un clic (déjà prêt) qui vide les tables de démonstration.
5. Tests sur place : 2 téléphones clients, tablette cuisine, PC caisse, imprimante.
6. Formation 1 h, puis suivi Care+.
