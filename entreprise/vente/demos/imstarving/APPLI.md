# Application I'm Starving (option, réponse du 14/10)

## Trois niveaux
| Niveau | Ce que c'est | Délai | Outils | Prix conseillé (en plus du site) |
|---|---|---|---|---|
| **1. Appli installable (PWA)** | Le site s'installe sur l'écran d'accueil (Android, iPhone, PC), icône, plein écran, notifications | 1 semaine | Même code que le site | + 60 000 DA |
| **2. Vraie appli stores** (Play Store + App Store) | Appli native : notifications « commande prête », fidélité (points), recommander en 1 clic, adresses enregistrées | 4 à 6 semaines (+ 1 à 2 semaines de validation Apple) | React Native + Expo (un seul code pour Android et iPhone), base de données en ligne (Supabase ou Firebase), compilation iPhone dans le cloud (EAS, donc pas besoin de Mac) | + 250 000 à 350 000 DA |
| **3. Appli PC / caisse** | Le récepteur de bons en logiciel Windows qui imprime tout seul | 1 à 2 semaines | Electron ou Tauri | + 50 000 DA |

## Ce qu'il faut pour les stores
- Compte **Google Play Console** : 25 $ une fois (au nom du restaurant).
- Compte **Apple Developer** : 99 $ par an (au nom du restaurant, idéalement en société ; vérification d'identité 1 à 2 semaines).
- Téléphones de test : 1 Android + 1 iPhone.
- Politique de confidentialité (page sur le site), captures d'écran, icône, description FR/AR.
- Apple refuse les applis qui ne sont « qu'un site dans une boîte » (règle 4.2) : d'où les fonctions natives (notifications, fidélité, commande rapide). Le paiement à la livraison ou au comptoir ne pose pas de problème (produits physiques).
- Maintenance : mises à jour iOS/Android 1 à 2 fois par an, comprise dans Care+ si on l'inclut.
