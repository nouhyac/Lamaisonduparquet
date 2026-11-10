# Campagne Meta « Preuve + qualification » (novembre)

**Pourquoi cette campagne :** la campagne « restaurateur » a donné 34 conversations WhatsApp pour 40 €, mais 0 vente :
les gens écrivaient sans être qualifiés. Ici on change deux choses :
1. **On montre la preuve** : une vraie plateforme qui tourne (le client commande, la cuisine reçoit, le client suit en direct).
2. **On qualifie dès le premier message** : le client envoie **le nom de son commerce** (message pré-rempli), sinon il n'est pas compté.

Rappels : tout en français, on parle en « nous », **aucun lieu**, aucun nom ni logo de prospect (les démos sont filmées sous des
marques fictives : « Le Comptoir », « Maison Café », « Lalla Couture »). **Plus de programme Fondateurs (−20 %)** : il n'apparaît nulle part.

---

## 1. Les créas (dossier `entreprise/campagne/novembre/`)

| Fichier | Format | Durée | Rôle |
|---|---|---|---|
| `video-A-restaurants.mp4` | 9:16, 1080×1920, 30 i/s, musique, sous-titres intégrés | 24,8 s | **Restaurants** : accroche « Vos clients commandent sur VOTRE site. Sans commission. » → le client commande sur téléphone → la commande arrive en cuisine → suivi en direct → offre → « Envoyez-nous le nom de votre restaurant sur WhatsApp » → fin dzign |
| `video-B-tous-commerces.mp4` | 9:16, 1080×1920, 30 i/s | 19,4 s | **Tous commerces** : « Votre site à partir de 20 000 DA · Vous payez après l'avoir vu » → restaurant, coffee shop, boutique → les 4 offres et prix → CTA WhatsApp |
| `video-C-presentatrice.mp4` | 9:16, 1080×1920, 30 i/s, voix | 44,8 s | **Présentatrice** (mise à jour de `videos/pub-50s-avatar.mp4`) : nouveau badge « Zéro DA avant de voir votre site · 50 % à la validation · 50 % à la livraison », anciens prix masqués, phrase « −20 % » coupée, nouvel écran de fin |
| `post-avant-apres.png` | 4:5, 1080×1350 | – | Avant (Instagram seul, commandes perdues en message) → Après (votre propre site de commande) |
| `post-4-offres.png` | 4:5, 1080×1350 | – | Les 4 offres + garanties |
| `story-avant-apres.png` | 9:16, 1080×1920 | – | Version story de l'avant/après |
| `story-4-offres.png` | 9:16, 1080×1920 | – | Version story des 4 offres |

Les vidéos font toutes moins de 30 Mo. Les visuels fixes servent en **placements Fil / Story** de la même pub (Meta les choisit
selon l'emplacement) ou en relance plus tard. Sources et scripts : `sources/` (tournage Playwright en marque neutre, montage Python + ffmpeg, musique générée localement).

---

## 2. Textes prêts à coller

### Texte principal n°1 (restaurants, avec la vidéo A)
> Vos clients commandent directement sur **votre** site : carte, panier, livraison ou à emporter, et ils suivent leur commande en direct.
> La commande arrive tout de suite en cuisine. **Zéro commission** sur vos ventes.
>
> 👉 Nous préparons une **démo gratuite à votre nom en 24 h**. Vous payez seulement si elle vous plaît.
> Vous voyez votre site gratuitement avant de payer quoi que ce soit.
>
> Envoyez-nous **le nom de votre restaurant** sur WhatsApp pour recevoir votre démo.

### Texte principal n°2 (tous commerces, avec les vidéos B et C)
> Votre site **à partir de 20 000 DA**, et vous payez **après l'avoir vu**.
>
> ✔ Site vitrine dès 20 000 DA
> ✔ Boutique en ligne dès 50 000 DA
> ✔ Plateforme commerçants (commandes, cuisine, suivi) dès 80 000 DA
> ✔ Application dès 150 000 DA
>
> Démo gratuite à votre nom · 50 % à la validation, 50 % à la livraison · satisfait ou remboursé.
> Envoyez-nous **le nom de votre commerce** sur WhatsApp : votre démo est prête en 24 h.

### Titres (3)
1. Votre site, vu avant d'être payé
2. Vos clients commandent sur VOTRE site
3. Démo gratuite à votre nom en 24 h

### Description
> Zéro DA avant de voir votre site · satisfait ou remboursé.

(Facultatif, à dire en conversation plutôt que dans la pub : −5 % pour un paiement en une fois.)

---

## 3. Lien WhatsApp avec message pré-rempli (qualifiant)

Message pré-rempli :
> Bonjour, je veux voir mon site gratuit. Mon commerce : …

Lien à mettre comme destination (si Meta propose « Message pré-rempli », coller le texte ci-dessus) :
```
https://wa.me/213549506857?text=Bonjour%2C%20je%20veux%20voir%20mon%20site%20gratuit.%20Mon%20commerce%20%3A%20
```
Le client n'a plus qu'à taper le nom de son commerce : c'est **ça** qu'on compte comme « conversation qualifiée ».

---

## 4. Réponse automatique WhatsApp Business

⚠️ Le 0549 50 68 57 est aujourd'hui en WhatsApp normal : la réponse automatique (« Message d'accueil ») demande
**WhatsApp Business** (gratuit, même numéro, on garde les discussions). Outils pour les entreprises › Message d'accueil :

> Bonjour et merci pour votre message 👋 Ici Dzign Studio.
> Nous préparons votre **démo gratuite à votre nom en 24 h** : vous voyez votre site avant de payer quoi que ce soit.
>
> Pour la préparer, répondez à ces 3 questions :
> 1️⃣ Le **nom de votre commerce**
> 2️⃣ Votre **activité** (restaurant, coffee shop, boutique, beauté, autre…)
> 3️⃣ Le **lien de votre Instagram** (ou Facebook), s'il existe
>
> Nous revenons vers vous très vite avec votre démo.

Étiquettes conseillées : « Qualifié (nom reçu) », « Démo envoyée », « Validé 50 % », « Non qualifié ».

---

## 5. Réglages Meta recommandés

| Réglage | Valeur |
|---|---|
| Objectif | **Interactions** › conversion : **Applications de messagerie › WhatsApp** |
| Lieu | Algérie (ciblage seulement : jamais écrit dans les créas) |
| Âge | 25-55 ans |
| Intérêts | Propriétaires de petites entreprises · Administrateurs de pages Facebook (« Business page admins ») · Entrepreneuriat / petites entreprises |
| Langue | Français |
| Placements | **Advantage+** (automatiques) |
| Structure | **1 campagne › 1 ensemble de publicités › 3 pubs** (vidéo A, vidéo B, vidéo C), même texte d'accueil WhatsApp |
| Budget test | **4 €/jour pendant 5 jours** (≈ 20 €), au niveau de l'ensemble : Meta répartit entre les 3 vidéos |
| Textes | Pub A → texte n°1 ; pubs B et C → texte n°2 ; titres et description ci-dessus |
| Destination | WhatsApp 0549 50 68 57 + message pré-rempli |

---

## 6. Seuils de décision

**Indicateur principal : le coût par conversation qualifiée** = budget dépensé ÷ nombre de personnes qui ont envoyé **le nom de leur commerce**.
(Une conversation sans nom de commerce ne compte pas, même si Meta l'appelle « conversation ».)

Tenir un petit tableau chaque soir : pub (A / B / C) · dépense · conversations · **qualifiées** · démos envoyées · ventes.

| Moment | Décision |
|---|---|
| **J+3** | **Couper la vidéo la plus chère** en coût par conversation qualifiée (si une vidéo n'a aucune qualifiée après ≈ 4 € dépensés sur elle, elle est la plus chère). |
| J+5 | Bilan : coût par qualifiée **≤ 1,5 €** → on garde et on monte doucement (+20 %/jour max) ; **1,5 à 3 €** → on garde la meilleure vidéo, on change l'accroche des autres ; **> 3 €** ou aucune qualifiée → on arrête et on revoit l'offre/ciblage. |
| Toujours | Chaque qualifiée reçoit sa démo en 24 h. On mesure ensuite démo → validation (50 %) : c'est le vrai résultat. |

---

## 7. Ce qui a été vérifié

- Vidéos : planches contact image par image, durée, 1080×1920 à 30 i/s, son présent (A et B : musique générée localement, C : voix d'origine), taille < 30 Mo.
- Marque neutre : aucun nom, logo, téléphone, Instagram, adresse ou lieu des prospects dans les écrans filmés (contrôle du texte de chaque page filmée + contrôle visuel). Les photos de façade, d'enseigne, d'étal et le sac marqué ne sont pas filmées (remplacées).
- Vidéo C : plus de « −20 % » (badge, voix et écran de fin), plus de « BaridiMob / 50 % au début », anciens prix Dzign (30 000 / 80 000 / 150 000 / 250 000 DA) masqués ou retirés ; les vues par la fenêtre restent (aucun texte).
