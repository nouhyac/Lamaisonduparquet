# Lancement des pubs Meta : fiche de reprise

État au 04/10/2026 :
- Rien n'est créé, rien n'est dépensé.
- Le compte publicitaire « Sofiane Yacoubi » (`act_2860172500875914`) a **un solde impayé**. La carte, elle, est acceptée.
- Aucun boost récent sur le compte : seulement 3 vieux boosts de 2020-2021.

## 1. Check-list du client (avant tout)
- [ ] **Payer le solde** : business.facebook.com/billing → compte « Sofiane Yacoubi » → **Payer maintenant**.
- [ ] WhatsApp **+213 549 50 68 57** relié à la Page : Paramètres de la Page → WhatsApp.
- [ ] Publication de la nouvelle collection : choisir l'option **A** (boost dans l'appli) ou **B** (envoyer le média et le texte à Claude).

## 2. Pub 1 : dernière publication de la nouvelle collection, 8 $
**Option A : boost dans l'appli (recommandé, la publication garde ses likes)**
- Instagram → la publication → **Booster**
- Objectif : **Plus de messages → WhatsApp**
- Audience : personnalisée, **Algérie**, 25-60 ans, intérêt « Décoration intérieure »
- Budget : **8 $ sur 4 jours**
- Cocher **« Aussi sur Facebook »**

**Option B : créée par Claude via Adspirer (en pause jusqu'à « lance »)**

Le média est déposé dans `ads/pub/` puis commité. Appel `meta_ads` → `create_meta_image_campaign` (ou `create_meta_video_campaign` avec `video_url`) :
```json
{"ad_account_id":"act_2860172500875914","facebook_page_id":"108020917397215","instagram_account_id":"17841429516584815",
 "campaign_name":"LMDP · Nouvelle collection · WhatsApp · Algérie","objective":"OUTCOME_ENGAGEMENT","destination_type":"WHATSAPP",
 "whatsapp_phone_number":"+213 549 50 68 57",
 "whatsapp_welcome_message":"Bonjour ! Quelle surface et quelle pièce ? Nous vous envoyons votre devis et les décors EGGER en stock.",
 "whatsapp_ice_breakers":["Voir les prix","Réserver une visite","Livraison en Algérie"],
 "image_url":"https://raw.githubusercontent.com/nouhyac/Lamaisonduparquet/claude/instagram-dashboard-egger-txjhhy/ads/pub/<FICHIER>",
 "landing_page_url":"https://www.lamaisonduparquet.org/","url_tags":"utm_source=meta&utm_medium=paid&utm_campaign=collection",
 "budget_lifetime":8,"end_time":"<J+4>T23:59:59","locations":["DZ"],"age_min":25,"age_max":60,"advantage_audience":true,
 "interests":[{"id":"6002920953955","name":"Décoration intérieure (conception)"}],
 "publisher_platforms":["facebook","instagram"],
 "primary_text":"<TEXTE DE LA PUBLICATION>\n👉 lamaisonduparquet.org","headline":"Nouvelle collection EGGER en stock à Alger"}
```
Vérifier le schéma avec `get_tool_schema` avant l'appel (gratuit).

## 3. Pub 2 : vidéo 50 s, 15 $ sur 7 jours (arguments déjà testés)
Vidéo publique : `ads/pub/film-50s-sarl-myf.mp4`, accessible via l'URL raw GitHub ci-dessous.
```json
{"ad_account_id":"act_2860172500875914","facebook_page_id":"108020917397215","instagram_account_id":"17841429516584815",
 "campaign_name":"LMDP · Vidéo 50 s · WhatsApp · Algérie","objective":"OUTCOME_ENGAGEMENT","destination_type":"WHATSAPP",
 "whatsapp_phone_number":"+213 549 50 68 57",
 "whatsapp_welcome_message":"Bonjour ! Quelle surface et quelle pièce ? Nous vous envoyons votre devis et les décors EGGER en stock.",
 "whatsapp_ice_breakers":["Voir les prix","Réserver une visite","Livraison en Algérie"],
 "video_url":"https://raw.githubusercontent.com/nouhyac/Lamaisonduparquet/claude/instagram-dashboard-egger-txjhhy/ads/pub/film-50s-sarl-myf.mp4",
 "optimize_for_reels":true,"landing_page_url":"https://www.lamaisonduparquet.org/",
 "url_tags":"utm_source=meta&utm_medium=paid&utm_campaign=lancement","budget_lifetime":15,"end_time":"<J+7>T23:59:59",
 "locations":["DZ"],"age_min":25,"age_max":60,"advantage_audience":true,
 "interests":[{"id":"6002920953955","name":"Décoration intérieure (conception)"}],
 "publisher_platforms":["facebook","instagram"],"instagram_positions":["reels","story","stream"],
 "facebook_positions":["facebook_reels","story","feed"],
 "primary_text":"Changez de sol sans casser votre carrelage. Le parquet EGGER se clipse directement dessus : posé en une journée, sans gravats, sans poussière. 5 décors en stock à Dar El Beïda, livraison partout en Algérie. Écrivez-nous pour votre devis.\n👉 Calculez vos cartons : lamaisonduparquet.org",
 "headline":"Parquet EGGER posé sur carrelage"}
```

## 4. Ordre des appels
1. Création de la campagne. Elle sert aussi de test du solde : si Meta répond « unsettled balance », c'est que le solde n'est toujours pas payé.
2. `get_meta_campaign_details` : contrôler l'audience, le budget et la destination WhatsApp.
3. Sur **« lance »** du client, `resume_meta_campaign`.
4. Bilans avec `get_meta_campaign_performance` :
   - publication : à J+2 et J+4 ;
   - vidéo : à J+3 et J+7.

Quota Adspirer (offre gratuite) : 15 appels par mois, environ 7 utilisés, remise à zéro le 02/11. Il faut environ 6 appels pour tout ce qui précède.

## Règles
- Un seul numéro : 0549 50 68 57.
- lamaisonduparquet.org partout.
- Jamais « représentant EGGER », jamais de délai d'importation.
- Rien n'est lancé sans « lance ».
- Aucun crédit Higgsfield dépensé sans accord.
