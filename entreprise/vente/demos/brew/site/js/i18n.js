/* =====================================================================
   BREW — textes FR / العربية + petits utilitaires d'affichage
   ---------------------------------------------------------------------
   Les noms de produits ne sont jamais traduits (écrits par le client).
   La langue choisie est retenue dans localStorage (brw-lang).
   ===================================================================== */
(function () {
  'use strict';

  const T = {
    fr: {
      // bandeau démo + en-tête
      demo: 'Démo réalisée par Dzign Studio pour BREW',
      demoView: 'Aperçu du site :', viewSoon: 'Avant l\'ouverture', viewOpen: 'Ouvert',
      manager: 'Espace gérant', lang: 'العربية', langLabel: 'Afficher le site en arabe',
      navMenu: 'La carte', navBrunch: 'Formule Brunch', navLoyalty: 'Fidélité', navBook: 'Réserver', navInfo: 'Infos',
      cart: 'Panier', home: 'BREW — accueil', skip: 'Aller au contenu',
      tableBanner: 'Vous commandez depuis la table', tableHint: 'Votre commande arrive directement au bar et en cuisine.',
      // héros
      heroKicker: 'Coffee shop', heroTitle: 'Coffee & Brunch',
      heroLead: 'Signature Drinks, cafés chauds et glacés, Matcha Bar, milkshakes, et un brunch salé, sucré ou healthy.',
      soonTitle: 'Ouverture très bientôt', soonTitleDate: 'Ouverture dans',
      soonText: 'Laissez votre numéro : on vous prévient dès que les portes ouvrent.',
      d: 'j', h: 'h', m: 'min', s: 's',
      notifyName: 'Prénom (facultatif)', notifyPhone: 'Téléphone / WhatsApp', notifyBtn: 'Prévenez-moi à l\'ouverture',
      notifyOk: 'C\'est noté ! On vous prévient dès l\'ouverture.', notifyDup: 'Ce numéro est déjà inscrit, à très vite !',
      openNow: 'Ouvert aujourd\'hui', closedNow: 'Fermé pour le moment', ctaOrder: 'Commander', ctaBook: 'Réserver un brunch',
      openToday: 'Aujourd\'hui',
      // signature
      sigKicker: 'À goûter en premier', sigTitle: 'BREW Signature Drinks',
      // carte
      menuKicker: 'Carte de lancement', menuTitle: 'La carte', search: 'Rechercher un produit…', searchLabel: 'Rechercher dans la carte',
      fAll: 'Tout', fHot: 'Chaud', fIced: 'Glacé', fSweet: 'Sucré', fSalty: 'Salé', fHealthy: 'Healthy',
      noResult: 'Aucun produit ne correspond à votre recherche.', add: 'Ajouter', addLabel: 'Ajouter au panier :',
      soldOut: 'Indisponible aujourd\'hui', notShowcase: 'Pas en vitrine aujourd\'hui', vitrineNote: 'Prêts à servir, selon la vitrine du jour.',
      brunchSep: 'Brunch — Salé · Sucré · Healthy', from: 'dès',
      // fiche produit
      options: 'Options', extrasTitle: 'Suppléments', choose: 'Choisissez', qty: 'Quantité', close: 'Fermer',
      addToCart: 'Ajouter au panier', added: 'ajouté au panier', ifAvail: 'si disponible', required: 'obligatoire',
      // formule
      fKicker: 'Le bon plan du matin', fTitle: 'Formule Brunch',
      fLead: 'Un plat de brunch + une boisson chaude classique + un jus d\'orange frais.',
      fStep1: 'Votre plat', fStep2: 'Votre boisson chaude', fStep3: 'Fresh Orange Juice', fIncluded: 'inclus',
      fInstead: 'au lieu de', fAdd: 'Ajouter la formule', fSave: 'd\'économie',
      // modes
      modesTitle: 'Commandez comme vous voulez',
      mCollect: 'Commander à l\'avance', mCollectTxt: 'Choisissez votre heure, récupérez au comptoir sans attendre.',
      mTable: 'À table, par QR code', mTableTxt: 'Scannez le QR de votre table : la commande part au bar et en cuisine.',
      mDelivery: 'Livraison', mDeliveryTxt: 'Selon les zones desservies, avec suivi en temps réel.',
      // panier / commande
      cartTitle: 'Votre commande', cartEmpty: 'Votre panier est vide. Faites-vous plaisir !', subtotal: 'Sous-total',
      deliveryFee: 'Livraison', total: 'Total', modeCollect: 'Retrait au comptoir', modeTable: 'À table', modeDelivery: 'Livraison',
      pickupTime: 'Heure de retrait', asap: 'Dès que possible', tableNumber: 'Numéro de table',
      yourName: 'Prénom', yourPhone: 'Téléphone', address: 'Adresse de livraison', zone: 'Zone',
      note: 'Une précision ? (facultatif)', payInfo: 'Paiement au comptoir, à table ou à la livraison.',
      minDelivery: 'Minimum de commande en livraison :', freeDrink: 'Utiliser ma boisson offerte (carte de fidélité)',
      reward: 'Boisson offerte', send: 'Envoyer la commande', remove: 'Retirer', less: 'Moins', more: 'Plus',
      soonOrder: 'Les commandes en ligne ouvrent avec le café. Inscrivez-vous pour être prévenu·e !',
      errName: 'Indiquez votre prénom.', errPhone: 'Indiquez un numéro de téléphone valide.', errAddress: 'Indiquez l\'adresse de livraison.',
      errChoice: 'Choisissez une option.', errDish: 'Choisissez un plat et une boisson.',
      // suivi
      trackTitle: 'Suivi de commande', order: 'Commande', stReceived: 'Reçue', stPreparing: 'En préparation', stReady: 'Prête !', stDone: 'Remise',
      stCancelled: 'Annulée', bar: 'Boissons', kitchen: 'Cuisine', ready: 'prêt', inProgress: 'en cours', waiting: 'en attente',
      readyMsg: 'Votre commande est prête !', readyTable: 'On vous l\'apporte à table.', readyCollect: 'Passez la récupérer au comptoir.',
      readyDelivery: 'Elle part en livraison.', trackOpen: 'Suivre ma commande', whatsapp: 'Écrire sur WhatsApp',
      waText: 'Bonjour BREW, à propos de ma commande', since: 'il y a', newOrder: 'Nouvelle commande', pickupAt: 'Retrait prévu',
      // fidélité
      lKicker: 'Carte de fidélité', lTitle: 'Vos boissons comptent',
      lLead: 'Une boisson offerte toutes les {n} boissons. Votre carte est liée à votre numéro de téléphone, rien à imprimer.',
      lCheck: 'Voir ma carte', lStamps: '{s} / {n} tampons', lReward: 'Bravo ! Une boisson vous est offerte à la prochaine commande.',
      lLeft: 'Plus que {k} boisson(s) avant la prochaine offerte.', lNew: 'Pas encore de carte pour ce numéro : elle se crée à votre première commande.',
      // réservation
      bKicker: 'Brunch entre amis', bTitle: 'Réserver une table',
      bLead: 'Choisissez la date, l\'heure et le nombre de personnes. BREW confirme votre réservation.',
      bDate: 'Date', bTime: 'Heure', bPeople: 'Personnes', bSend: 'Demander la réservation', bMine: 'Mes réservations',
      bPending: 'En attente de confirmation', bConfirmed: 'Confirmée', bDeclined: 'Indisponible', bOk: 'Demande envoyée ! Vous verrez la confirmation ici.',
      bErrDate: 'Choisissez une date à venir.',
      // infos
      iKicker: 'Nous trouver', iTitle: 'Infos pratiques', iHours: 'Horaires', iMaps: 'Itinéraire Google Maps', iInsta: 'Instagram',
      iFollow: 'Suivez l\'ouverture sur Instagram', closed: 'Fermé', days: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
      everyDay: 'Tous les jours', footer: 'Site réalisé par Dzign Studio', photoAlt: 'Le sac kraft BREW tendu de main en main',
      logoAlt: 'Logo BREW : personnage aux cheveux bouclés savourant une tasse fumante',
      currency: 'DA'
    },
    ar: {
      demo: 'نسخة تجريبية من إنجاز Dzign Studio لـ BREW',
      demoView: 'معاينة الموقع:', viewSoon: 'قبل الافتتاح', viewOpen: 'مفتوح',
      manager: 'فضاء المسيّر', lang: 'Français', langLabel: 'Afficher le site en français',
      navMenu: 'القائمة', navBrunch: 'عرض البرانش', navLoyalty: 'بطاقة الوفاء', navBook: 'احجز', navInfo: 'معلومات',
      cart: 'السلة', home: 'BREW — الرئيسية', skip: 'انتقل إلى المحتوى',
      tableBanner: 'أنتم تطلبون من الطاولة', tableHint: 'يصل طلبكم مباشرة إلى البار والمطبخ.',
      heroKicker: 'مقهى', heroTitle: 'Coffee & Brunch',
      heroLead: 'مشروبات مميّزة، قهوة ساخنة ومثلّجة، ركن الماتشا، ميلك شيك، وبرانش مالح أو حلو أو صحّي.',
      soonTitle: 'الافتتاح قريبًا جدًا', soonTitleDate: 'الافتتاح بعد',
      soonText: 'اتركوا رقمكم وسنخبركم فور فتح الأبواب.',
      d: 'يوم', h: 'سا', m: 'د', s: 'ثا',
      notifyName: 'الاسم (اختياري)', notifyPhone: 'الهاتف / واتساب', notifyBtn: 'أعلموني عند الافتتاح',
      notifyOk: 'تمّ التسجيل! سنخبركم فور الافتتاح.', notifyDup: 'هذا الرقم مسجّل من قبل، نراكم قريبًا!',
      openNow: 'مفتوح اليوم', closedNow: 'مغلق حاليًا', ctaOrder: 'اطلب الآن', ctaBook: 'احجز برانش',
      openToday: 'اليوم',
      sigKicker: 'جرّبوها أوّلًا', sigTitle: 'BREW Signature Drinks',
      menuKicker: 'قائمة الافتتاح', menuTitle: 'القائمة', search: 'ابحث عن منتج…', searchLabel: 'البحث في القائمة',
      fAll: 'الكل', fHot: 'ساخن', fIced: 'مثلّج', fSweet: 'حلو', fSalty: 'مالح', fHealthy: 'صحّي',
      noResult: 'لا يوجد منتج يطابق بحثكم.', add: 'أضف', addLabel: 'أضف إلى السلة:',
      soldOut: 'غير متوفّر اليوم', notShowcase: 'غير معروض اليوم', vitrineNote: 'جاهزة للتقديم، حسب واجهة اليوم.',
      brunchSep: 'برانش — مالح · حلو · صحّي', from: 'من',
      options: 'الخيارات', extrasTitle: 'إضافات', choose: 'اختاروا', qty: 'الكمية', close: 'إغلاق',
      addToCart: 'أضف إلى السلة', added: 'أُضيف إلى السلة', ifAvail: 'حسب التوفّر', required: 'إجباري',
      fKicker: 'عرض الصباح', fTitle: 'عرض البرانش',
      fLead: 'طبق برانش + مشروب ساخن كلاسيكي + عصير برتقال طازج.',
      fStep1: 'طبقكم', fStep2: 'مشروبكم الساخن', fStep3: 'Fresh Orange Juice', fIncluded: 'مشمول',
      fInstead: 'بدلًا من', fAdd: 'أضف العرض', fSave: 'توفير',
      modesTitle: 'اطلبوا بالطريقة التي تناسبكم',
      mCollect: 'اطلب مسبقًا', mCollectTxt: 'اختاروا الوقت واستلموا من الكونتوار دون انتظار.',
      mTable: 'من الطاولة عبر رمز QR', mTableTxt: 'امسحوا رمز طاولتكم: يصل الطلب إلى البار والمطبخ.',
      mDelivery: 'التوصيل', mDeliveryTxt: 'حسب المناطق المخدومة، مع متابعة مباشرة.',
      cartTitle: 'طلبكم', cartEmpty: 'سلتكم فارغة. دلّلوا أنفسكم!', subtotal: 'المجموع الفرعي',
      deliveryFee: 'التوصيل', total: 'المجموع', modeCollect: 'استلام من الكونتوار', modeTable: 'على الطاولة', modeDelivery: 'توصيل',
      pickupTime: 'وقت الاستلام', asap: 'في أقرب وقت', tableNumber: 'رقم الطاولة',
      yourName: 'الاسم', yourPhone: 'الهاتف', address: 'عنوان التوصيل', zone: 'المنطقة',
      note: 'ملاحظة؟ (اختياري)', payInfo: 'الدفع في الكونتوار أو على الطاولة أو عند التوصيل.',
      minDelivery: 'الحدّ الأدنى للطلب مع التوصيل:', freeDrink: 'استعمل مشروبي المجاني (بطاقة الوفاء)',
      reward: 'مشروب مجاني', send: 'أرسل الطلب', remove: 'حذف', less: 'أقل', more: 'أكثر',
      soonOrder: 'الطلب عبر الإنترنت يُفتح مع افتتاح المقهى. سجّلوا لنُعلمكم!',
      errName: 'اكتبوا اسمكم.', errPhone: 'اكتبوا رقم هاتف صحيح.', errAddress: 'اكتبوا عنوان التوصيل.',
      errChoice: 'اختاروا خيارًا.', errDish: 'اختاروا طبقًا ومشروبًا.',
      trackTitle: 'متابعة الطلب', order: 'طلب', stReceived: 'تمّ الاستلام', stPreparing: 'قيد التحضير', stReady: 'جاهز!', stDone: 'تمّ التسليم',
      stCancelled: 'ملغى', bar: 'المشروبات', kitchen: 'المطبخ', ready: 'جاهز', inProgress: 'قيد التحضير', waiting: 'في الانتظار',
      readyMsg: 'طلبكم جاهز!', readyTable: 'سنحضره إلى طاولتكم.', readyCollect: 'تفضّلوا لاستلامه من الكونتوار.',
      readyDelivery: 'إنه في الطريق إليكم.', trackOpen: 'تابع طلبي', whatsapp: 'راسلونا على واتساب',
      waText: 'مرحبًا BREW، بخصوص طلبي', since: 'منذ', newOrder: 'طلب جديد', pickupAt: 'وقت الاستلام',
      lKicker: 'بطاقة الوفاء', lTitle: 'كل مشروب يُحتسب',
      lLead: 'مشروب مجاني بعد كل {n} مشروبات. بطاقتكم مرتبطة برقم هاتفكم، لا حاجة لأي ورق.',
      lCheck: 'اعرض بطاقتي', lStamps: '{s} / {n} طوابع', lReward: 'مبروك! مشروبكم القادم مجاني.',
      lLeft: 'بقي {k} مشروب(ات) قبل المشروب المجاني.', lNew: 'لا توجد بطاقة لهذا الرقم بعد: تُنشأ مع أوّل طلب.',
      bKicker: 'برانش مع الأصدقاء', bTitle: 'احجزوا طاولة',
      bLead: 'اختاروا التاريخ والساعة وعدد الأشخاص. BREW يؤكّد حجزكم.',
      bDate: 'التاريخ', bTime: 'الساعة', bPeople: 'الأشخاص', bSend: 'اطلب الحجز', bMine: 'حجوزاتي',
      bPending: 'في انتظار التأكيد', bConfirmed: 'مؤكَّد', bDeclined: 'غير متاح', bOk: 'تمّ إرسال الطلب! سترون التأكيد هنا.',
      bErrDate: 'اختاروا تاريخًا قادمًا.',
      iKicker: 'أين تجدوننا', iTitle: 'معلومات عملية', iHours: 'أوقات العمل', iMaps: 'الاتجاهات على Google Maps', iInsta: 'إنستغرام',
      iFollow: 'تابعوا الافتتاح على إنستغرام', closed: 'مغلق', days: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
      everyDay: 'كل الأيام', footer: 'موقع من إنجاز Dzign Studio', photoAlt: 'كيس BREW الورقي يُسلَّم من يد إلى يد',
      logoAlt: 'شعار BREW: شخصية بشعر مجعّد تستمتع بفنجان ساخن',
      currency: 'دج'
    }
  };

  let lang = 'fr';
  try { lang = localStorage.getItem('brw-lang') === 'ar' ? 'ar' : 'fr'; } catch (e) { }

  /* t('clé', {n: 10}) : texte traduit avec variables */
  function t(key, vars) {
    let s = (T[lang] && T[lang][key]) != null ? T[lang][key] : (T.fr[key] != null ? T.fr[key] : key);
    if (vars && typeof s === 'string') Object.keys(vars).forEach(k => { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }
  function setLang(l) {
    lang = l === 'ar' ? 'ar' : 'fr';
    try { localStorage.setItem('brw-lang', lang); } catch (e) { }
    apply();
  }
  /* Applique la langue aux éléments [data-i18n] / [data-i18n-ph] / [data-i18n-aria] */
  function apply(root) {
    const html = document.documentElement;
    html.lang = lang; html.dir = lang === 'ar' ? 'rtl' : 'ltr';
    (root || document).querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    (root || document).querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
    (root || document).querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    (root || document).querySelectorAll('[data-i18n-alt]').forEach(el => { el.alt = t(el.dataset.i18nAlt); });
  }

  /* Formats */
  const money = (n) => Math.round(n).toLocaleString('fr-FR').replace(/ | /g, ' ') + ' ' + t('currency');
  const hhmm = (ts) => { const d = new Date(ts); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const L = (o, base) => o[(base || '') + lang] || o[(base || '') + 'fr'] || '';
  const hourLabel = (hm) => { const [h, m] = hm.split(':'); return lang === 'ar' ? (+h) + ':' + m : (+h) + ' h' + (m !== '00' ? ' ' + m : ''); };

  window.BREW_I18N = { T, t, setLang, apply, money, hhmm, esc, L, hourLabel, get lang() { return lang; } };
})();
