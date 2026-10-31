/* =====================================================================
   BREW — espace gérant
   Connexion PIN par rôle : gérant (tout), bar, cuisine brunch, caisse.
   Tableau de bord, écrans Bar / Cuisine, caisse + clôture Z, carte,
   réservations, fidélité, « Prévenez-moi », QR codes de tables, réglages.
   Synchronisé en direct avec le site client (BroadcastChannel).
   ===================================================================== */
(function () {
  'use strict';
  const D = window.BREW_DATA, S = window.BREW_STORE, A = window.BREW_ART, I = window.BREW_I18N, Q = window.BREW_QR;
  const { t, money, esc, L, hhmm } = I;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* ---------- Textes de l'espace gérant (FR / AR) ---------- */
  Object.assign(I.T.fr, {
    gTitle: 'Espace gérant', gPin: 'Code PIN', gPinHint: 'Entrez votre code PIN', gDel: 'Effacer', gBadPin: 'Code incorrect, réessayez.',
    gDemoCodes: 'Démo : gérant 0328 · bar 1111 · cuisine brunch 1112 · caisse 2222', gBackSite: '← Retour au site',
    gSeeSite: 'Voir le site', gLogout: 'Déconnexion',
    rManager: 'Gérant', rBar: 'Bar', rKitchen: 'Cuisine brunch', rCash: 'Caisse',
    tDash: 'Tableau de bord', tBar: 'Bar', tKitchen: 'Cuisine brunch', tCash: 'Caisse', tMenu: 'Carte', tResas: 'Réservations',
    tLoyalty: 'Fidélité', tNotify: 'Prévenez-moi', tQr: 'QR codes tables', tSettings: 'Réglages',
    kCA: 'Chiffre d\'affaires du jour', kOrders: 'Commandes du jour', kAvg: 'Panier moyen', kLive: 'En cours maintenant',
    chartTitle: 'Chiffre d\'affaires par heure (encaissé)', topTitle: 'Top produits du jour', liveTitle: 'Commandes en cours', resaTodo: 'Réservations à confirmer',
    hour: 'Heure', amount: 'Montant', none: 'Rien pour le moment.',
    colNew: 'À préparer', colDoing: 'En préparation', colReady: 'Prêt', start: 'Commencer', markReady: 'Prêt', handed: 'Remis', served: 'Servi',
    kdsBarSub: 'Boissons, vitrine et jus des formules', kdsKitchenSub: 'Plats du brunch salé, sucré et healthy',
    whereTable: 'Table', whereCollect: 'Retrait', whereDelivery: 'Livraison', whereCounter: 'Comptoir', formuleOf: 'Formule Brunch',
    posTitle: 'Vente au comptoir', ticket: 'Ticket', cash: 'Espèces', card: 'Carte CIB / Edahabia', payCash: 'Encaisser espèces', payCard: 'Encaisser carte',
    clearTicket: 'Vider', ongoing: 'Commandes en cours & à encaisser', tablesTitle: 'Tables', paid: 'Payée', unpaid: 'À encaisser',
    cancel: 'Annuler', confirmCancel: 'Annuler cette commande ?', zTitle: 'Clôture de caisse (Z)', zBtn: 'Clôture Z', zConfirm: 'Clôturer la caisse',
    zCount: 'Tickets encaissés', zTotal: 'Total encaissé', zHistory: 'Clôtures précédentes', zDone: 'Caisse clôturée.', zEmpty: 'Aucun encaissement depuis la dernière clôture.',
    menuSub: 'Prix, disponibilité, vitrine du jour, suppléments et catégories. Les changements sont visibles tout de suite sur le site.',
    price: 'Prix', available: 'Disponible', inShowcase: 'En vitrine aujourd\'hui', product: 'Produit', visible: 'Visible sur le site',
    extrasAdmin: 'Suppléments (selon les recettes)', formuleAdmin: 'Formule Brunch', discount: 'Remise sur la somme (%)', saved: 'Enregistré',
    resasSub: 'Demandes de réservation brunch : confirmez ou refusez, le client voit la réponse sur le site.',
    confirm: 'Confirmer', decline: 'Refuser', people: 'pers.', notify: 'Prévenir sur WhatsApp',
    waResaOk: 'Bonjour {n}, votre réservation chez BREW le {d} à {h} pour {p} personne(s) est confirmée. À bientôt !',
    waResaKo: 'Bonjour {n}, désolé, nous ne pouvons pas vous recevoir le {d} à {h}. Souhaitez-vous un autre créneau ?',
    loyaltySub: 'Cartes liées au numéro de téléphone : 1 boisson offerte toutes les {n} boissons.',
    stamps: 'Tampons', rewards: 'Offertes', visits: 'Visites', last: 'Dernière visite', addStamp: '+1 tampon', giveReward: 'Offrir la boisson', phone: 'Téléphone', name: 'Nom',
    searchPhone: 'Rechercher un numéro…',
    notifySub: 'Personnes inscrites pour être prévenues de l\'ouverture.', exportCsv: 'Exporter (CSV)', copyMsg: 'Copier le message', copyNums: 'Copier les numéros',
    msgLabel: 'Message à envoyer', defaultMsg: 'Bonjour, c\'est BREW — Coffee & Brunch ! Nos portes sont ouvertes : venez goûter nos Signature Drinks et notre brunch. À très vite ! Instagram : @brew.coffee.brunch',
    copied: 'Copié', registered: 'Inscrit le', send: 'Envoyer',
    qrSub: 'À imprimer et poser sur chaque table : le client scanne, commande, et la commande arrive au bar et en cuisine.', print: 'Imprimer', tablesCount: 'Nombre de tables', scanOrder: 'Scannez pour commander',
    sStatus: 'Statut du café', sSoon: 'Ouverture prochaine', sOpen: 'Ouvert', sOpening: 'Date et heure d\'ouverture (compte à rebours)',
    sHours: 'Horaires', sClosed: 'Fermé', sOrdering: 'Commande en ligne', sCollect: 'Commander à l\'avance & retrait au comptoir', sTable: 'Commande à table (QR)',
    sDelivery: 'Livraison', sZones: 'Zones de livraison', sZoneName: 'Nom de la zone', sFee: 'Frais', sMin: 'Minimum de commande en livraison',
    sLoyalty: 'Fidélité : boissons pour 1 offerte', sWhatsapp: 'Numéro WhatsApp de BREW (ex. 213550000000)', sPins: 'Codes PIN', sPinErr: 'Chaque PIN doit faire 4 chiffres et être différent.',
    sReset: 'Mise en service', sResetTxt: 'Efface les commandes, réservations, cartes de fidélité, inscriptions et clôtures d\'exemple. La carte, les prix et les réglages sont conservés.',
    sResetBtn: 'Remettre à zéro pour l\'ouverture', sResetConfirm: 'Confirmer la remise à zéro ?', sResetDone: 'Activité remise à zéro. Prêt pour l\'ouverture !',
    sApplyAll: 'Appliquer à tous les jours', yes: 'Oui', no: 'Non', newOrderToast: 'Nouvelle commande',
    newZone: 'Nouvelle zone', gSave: 'Enregistrer les codes'
  });
  Object.assign(I.T.ar, {
    gTitle: 'فضاء المسيّر', gPin: 'الرمز السري', gPinHint: 'أدخلوا رمزكم السري', gDel: 'مسح', gBadPin: 'رمز خاطئ، حاولوا مجددًا.',
    gDemoCodes: 'تجريبي: المسيّر 0328 · البار 1111 · مطبخ البرانش 1112 · الصندوق 2222', gBackSite: '→ العودة إلى الموقع',
    gSeeSite: 'عرض الموقع', gLogout: 'خروج',
    rManager: 'المسيّر', rBar: 'البار', rKitchen: 'مطبخ البرانش', rCash: 'الصندوق',
    tDash: 'لوحة القيادة', tBar: 'البار', tKitchen: 'مطبخ البرانش', tCash: 'الصندوق', tMenu: 'القائمة', tResas: 'الحجوزات',
    tLoyalty: 'الوفاء', tNotify: 'أعلموني', tQr: 'رموز QR للطاولات', tSettings: 'الإعدادات',
    kCA: 'رقم أعمال اليوم', kOrders: 'طلبات اليوم', kAvg: 'متوسط السلة', kLive: 'قيد التنفيذ الآن',
    chartTitle: 'رقم الأعمال حسب الساعة (المحصّل)', topTitle: 'المنتجات الأكثر طلبًا اليوم', liveTitle: 'الطلبات الجارية', resaTodo: 'حجوزات للتأكيد',
    hour: 'الساعة', amount: 'المبلغ', none: 'لا شيء حاليًا.',
    colNew: 'للتحضير', colDoing: 'قيد التحضير', colReady: 'جاهز', start: 'ابدأ', markReady: 'جاهز', handed: 'تمّ التسليم', served: 'تمّ التقديم',
    kdsBarSub: 'المشروبات، الواجهة وعصير العروض', kdsKitchenSub: 'أطباق البرانش المالح والحلو والصحّي',
    whereTable: 'طاولة', whereCollect: 'استلام', whereDelivery: 'توصيل', whereCounter: 'الكونتوار', formuleOf: 'عرض البرانش',
    posTitle: 'البيع في الكونتوار', ticket: 'التذكرة', cash: 'نقدًا', card: 'بطاقة CIB / الذهبية', payCash: 'تحصيل نقدًا', payCard: 'تحصيل بالبطاقة',
    clearTicket: 'إفراغ', ongoing: 'الطلبات الجارية وللتحصيل', tablesTitle: 'الطاولات', paid: 'مدفوع', unpaid: 'للتحصيل',
    cancel: 'إلغاء', confirmCancel: 'إلغاء هذا الطلب؟', zTitle: 'إغلاق الصندوق (Z)', zBtn: 'إغلاق Z', zConfirm: 'أغلق الصندوق',
    zCount: 'التذاكر المحصّلة', zTotal: 'المجموع المحصّل', zHistory: 'الإغلاقات السابقة', zDone: 'تمّ إغلاق الصندوق.', zEmpty: 'لا تحصيل منذ آخر إغلاق.',
    menuSub: 'الأسعار، التوفّر، واجهة اليوم، الإضافات والأصناف. تظهر التغييرات فورًا على الموقع.',
    price: 'السعر', available: 'متوفّر', inShowcase: 'في الواجهة اليوم', product: 'المنتج', visible: 'ظاهر على الموقع',
    extrasAdmin: 'الإضافات (حسب الوصفات)', formuleAdmin: 'عرض البرانش', discount: 'التخفيض على المجموع (%)', saved: 'تمّ الحفظ',
    resasSub: 'طلبات حجز البرانش: أكّدوا أو ارفضوا، ويرى الزبون الردّ على الموقع.',
    confirm: 'تأكيد', decline: 'رفض', people: 'أشخاص', notify: 'إعلام عبر واتساب',
    waResaOk: 'مرحبًا {n}، تمّ تأكيد حجزكم في BREW يوم {d} على الساعة {h} لـ {p} أشخاص. نراكم قريبًا!',
    waResaKo: 'مرحبًا {n}، نعتذر، لا يمكننا استقبالكم يوم {d} على الساعة {h}. هل تودّون موعدًا آخر؟',
    loyaltySub: 'بطاقات مرتبطة برقم الهاتف: مشروب مجاني بعد كل {n} مشروبات.',
    stamps: 'الطوابع', rewards: 'المجانية', visits: 'الزيارات', last: 'آخر زيارة', addStamp: '+1 طابع', giveReward: 'قدّم المشروب', phone: 'الهاتف', name: 'الاسم',
    searchPhone: 'ابحث عن رقم…',
    notifySub: 'الأشخاص المسجّلون ليُعلَموا بالافتتاح.', exportCsv: 'تصدير (CSV)', copyMsg: 'نسخ الرسالة', copyNums: 'نسخ الأرقام',
    msgLabel: 'الرسالة المرسلة', defaultMsg: 'مرحبًا، معكم BREW — Coffee & Brunch! أبوابنا مفتوحة: تعالوا لتذوّق مشروباتنا المميّزة والبرانش. نراكم قريبًا! إنستغرام: @brew.coffee.brunch',
    copied: 'تمّ النسخ', registered: 'سُجّل في', send: 'إرسال',
    qrSub: 'للطباعة ووضعها على كل طاولة: يمسح الزبون الرمز ويطلب، فيصل الطلب إلى البار والمطبخ.', print: 'طباعة', tablesCount: 'عدد الطاولات', scanOrder: 'امسحوا للطلب',
    sStatus: 'حالة المقهى', sSoon: 'الافتتاح قريبًا', sOpen: 'مفتوح', sOpening: 'تاريخ وساعة الافتتاح (العدّ التنازلي)',
    sHours: 'أوقات العمل', sClosed: 'مغلق', sOrdering: 'الطلب عبر الإنترنت', sCollect: 'الطلب المسبق والاستلام من الكونتوار', sTable: 'الطلب من الطاولة (QR)',
    sDelivery: 'التوصيل', sZones: 'مناطق التوصيل', sZoneName: 'اسم المنطقة', sFee: 'الرسوم', sMin: 'الحدّ الأدنى للطلب مع التوصيل',
    sLoyalty: 'الوفاء: عدد المشروبات مقابل مشروب مجاني', sWhatsapp: 'رقم واتساب BREW (مثال 213550000000)', sPins: 'الرموز السرية', sPinErr: 'كل رمز من 4 أرقام ومختلف عن الآخرين.',
    sReset: 'التشغيل الفعلي', sResetTxt: 'يمسح الطلبات والحجوزات وبطاقات الوفاء والتسجيلات والإغلاقات التجريبية. تبقى القائمة والأسعار والإعدادات.',
    sResetBtn: 'إعادة التعيين للافتتاح', sResetConfirm: 'تأكيد إعادة التعيين؟', sResetDone: 'تمّت إعادة التعيين. جاهزون للافتتاح!',
    sApplyAll: 'تطبيق على كل الأيام', yes: 'نعم', no: 'لا', newOrderToast: 'طلب جديد',
    newZone: 'منطقة جديدة', gSave: 'حفظ الرموز'
  });

  /* ---------- Rôles et onglets ---------- */
  const TABS = {
    dash: 'tDash', bar: 'tBar', kitchen: 'tKitchen', cash: 'tCash', menu: 'tMenu', resas: 'tResas',
    loyalty: 'tLoyalty', notify: 'tNotify', qr: 'tQr', settings: 'tSettings'
  };
  const ROLES = {
    manager: { name: 'rManager', tabs: Object.keys(TABS) },
    bar: { name: 'rBar', tabs: ['bar'] },
    kitchen: { name: 'rKitchen', tabs: ['kitchen'] },
    cash: { name: 'rCash', tabs: ['cash'] }
  };
  let role = null, tab = null;
  try { role = sessionStorage.getItem('brw-role'); tab = sessionStorage.getItem('brw-tab'); } catch (e) { }
  const pos = { cat: 'hot', lines: [] };
  const seen = new Set(S.orders().map(o => o.id));

  /* ---------- Connexion PIN ---------- */
  let pin = '';
  function pinPaint() { $$('#pinDots i').forEach((d, i) => d.classList.toggle('on', i < pin.length)); }
  function pinKey(k) {
    if (k === 'del') pin = pin.slice(0, -1);
    else if (k === 'lang') { I.setLang(I.lang === 'ar' ? 'fr' : 'ar'); paintStatic(); return; }
    else if (pin.length < 4) pin += k;
    pinPaint();
    $('#pinErr').textContent = '';
    if (pin.length === 4) {
      const pins = S.settings().pins;
      const r = Object.keys(pins).find(k2 => pins[k2] === pin);
      if (r) { login(r); } else { $('#pinErr').textContent = t('gBadPin'); }
      pin = ''; setTimeout(pinPaint, 150);
    }
  }
  $('#pad').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) pinKey(b.dataset.k || b.textContent.trim()); });
  document.addEventListener('keydown', (e) => {
    if ($('#login').hidden) return;
    if (/^\d$/.test(e.key)) pinKey(e.key);
    if (e.key === 'Backspace') pinKey('del');
  });
  function login(r) {
    role = r;
    if (!tab || ROLES[r].tabs.indexOf(tab) === -1) tab = ROLES[r].tabs[0];
    try { sessionStorage.setItem('brw-role', r); sessionStorage.setItem('brw-tab', tab); } catch (e) { }
    $('#login').hidden = true; $('#app').hidden = false;
    render();
  }
  $('#logout').onclick = () => {
    role = null; tab = null;
    try { sessionStorage.removeItem('brw-role'); sessionStorage.removeItem('brw-tab'); } catch (e) { }
    $('#app').hidden = true; $('#login').hidden = false;
  };

  /* ---------- Rendu général ---------- */
  function paintStatic() {
    I.apply();
    $$('[data-logo]').forEach(el => { el.innerHTML = el.dataset.logo === 'mark' ? A.logo({ mark: true }) : A.logo(); });
  }
  function renderTabs() {
    const pending = S.resas().filter(r => r.status === 'pending').length;
    const st = (k) => S.orders().filter(o => !o.done && !o.cancelled && o.st[k] && o.st[k] !== 'ready').length;
    const badge = { resas: pending, bar: st('bar'), kitchen: st('kitchen'), cash: S.orders().filter(o => !o.paid && !o.cancelled).length };
    const tabs = ROLES[role].tabs;
    $('#tabs').hidden = tabs.length < 2;
    $('#tabs').innerHTML = tabs.map(k => '<button type="button" data-tab="' + k + '"' + (k === tab ? ' aria-current="page"' : '') + '>' + esc(t(TABS[k])) +
      (badge[k] ? '<span class="badge">' + badge[k] + '</span>' : '') + '</button>').join('');
  }
  const VIEWS = {};
  function render() {
    if (!role) return;
    paintStatic();
    $('#roleName').textContent = t(ROLES[role].name);
    renderTabs();
    VIEWS[tab]();
    tick();
  }
  $('#tabs').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tab]');
    if (!b) return;
    tab = b.dataset.tab;
    try { sessionStorage.setItem('brw-tab', tab); } catch (x) { }
    render();
    $('#view').focus({ preventScroll: true });
  });
  $('#langBtn').onclick = () => { I.setLang(I.lang === 'ar' ? 'fr' : 'ar'); render(); };

  /* ---------- Utilitaires ---------- */
  const isToday = (ts) => S.dayKey(ts) === S.dayKey();
  const num = (o) => '#' + String(o.num).padStart(3, '0');
  const statusLbl = { received: 'stReceived', preparing: 'stPreparing', ready: 'stReady', done: 'stDone', cancelled: 'stCancelled' };
  const pill = (o) => { const s = S.orderStatus(o); return '<span class="pill pill--' + s + '">' + esc(t(statusLbl[s])) + '</span>'; };
  function where(o) {
    if (o.mode === 'table') return t('whereTable') + ' ' + o.table;
    if (o.mode === 'collect') return t('whereCollect') + ' · ' + (o.pickup || t('asap').toLowerCase());
    if (o.mode === 'delivery') return t('whereDelivery');
    return t('whereCounter');
  }
  function itemsFor(o, station) {
    const out = [];
    o.lines.forEach(l => {
      if (l.parts) l.parts.forEach(p => { if (!station || p.station === station) out.push({ qty: l.qty, name: p.name, sub: t('formuleOf') }); });
      else if (!station || l.station === station) out.push({ qty: l.qty, name: l.name, sub: (l.opts || []).map(x => L(x)).join(' · ') });
    });
    return out;
  }
  const elapsed = (ts) => { const s = Math.max(0, Math.floor((Date.now() - ts) / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  function toast(msg, ok) {
    const el = document.createElement('div');
    el.className = 'toast' + (ok ? ' toast--ok' : '');
    el.textContent = msg; $('#toasts').appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }
  function modal(html) { $('#modalIn').innerHTML = '<button type="button" class="x" data-close aria-label="' + esc(t('close')) + '">×</button>' + html; if (!$('#modal').open) $('#modal').showModal(); }
  $('#modal').addEventListener('click', (e) => { if (e.target === $('#modal') || e.target.closest('[data-close]')) $('#modal').close(); });
  const waPhone = (p) => S.normPhone(p).replace(/^0/, '213');
  const dateLbl = (d) => new Date(d + 'T12:00').toLocaleDateString(I.lang === 'ar' ? 'ar-DZ' : 'fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  function beep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)(), o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = 880; g.gain.value = .08; o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + .18);
    } catch (e) { }
  }

  /* ================= Tableau de bord ================= */
  VIEWS.dash = function () {
    const today = S.orders().filter(o => isToday(o.createdAt) && !o.cancelled);
    const paid = today.filter(o => o.paid);
    const ca = paid.reduce((a, o) => a + o.total, 0);
    const live = today.filter(o => !o.done);
    // CA par heure
    const hours = {}; for (let h = 7; h <= 21; h++) hours[h] = 0;
    paid.forEach(o => { const h = new Date(o.createdAt).getHours(); hours[h] = (hours[h] || 0) + o.total; });
    // top produits
    const top = {};
    today.forEach(o => o.lines.forEach(l => { top[l.name] = (top[l.name] || 0) + l.qty; }));
    const topList = Object.entries(top).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const pend = S.resas().filter(r => r.status === 'pending');
    $('#view').innerHTML = '<div class="vh"><h1>' + esc(t('tDash')) + '</h1><p>' + esc(new Date().toLocaleDateString(I.lang === 'ar' ? 'ar-DZ' : 'fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })) + '</p></div>' +
      '<div class="kpis"><div class="kpi kpi--dark"><small>' + esc(t('kCA')) + '</small><b id="kCA">' + money(ca) + '</b></div>' +
      '<div class="kpi"><small>' + esc(t('kOrders')) + '</small><b>' + today.length + '</b></div>' +
      '<div class="kpi"><small>' + esc(t('kAvg')) + '</small><b>' + money(paid.length ? ca / paid.length : 0) + '</b></div>' +
      '<div class="kpi"><small>' + esc(t('kLive')) + '</small><b>' + live.length + '</b></div></div>' +
      '<div class="cols"><div class="panel"><h2 id="chartT">' + esc(t('chartTitle')) + '</h2>' + chart(hours) + '</div>' +
      '<div class="panel"><h2>' + esc(t('topTitle')) + '</h2>' + (topList.length ? '<ul class="top">' + topList.map(([n, q]) =>
        '<li><span>' + esc(n) + '</span><b>' + q + '</b><span class="track" aria-hidden="true"><span class="fill" style="display:block;width:' + Math.round(q / topList[0][1] * 100) + '%"></span></span></li>').join('') + '</ul>' : '<p>' + esc(t('none')) + '</p>') + '</div>' +
      '<div class="panel"><h2>' + esc(t('liveTitle')) + '</h2>' + (live.length ? '<ul class="mini">' + live.map(o => '<li><span><b>' + num(o) + '</b> · ' + esc(where(o)) + ' · ' + esc(o.name) + '</span><span>' + pill(o) + ' ' + money(o.total) + '</span></li>').join('') + '</ul>' : '<p>' + esc(t('none')) + '</p>') + '</div>' +
      '<div class="panel"><h2>' + esc(t('resaTodo')) + '</h2>' + (pend.length ? '<ul class="mini">' + pend.map(r => '<li><span><b>' + esc(r.name) + '</b> · ' + esc(dateLbl(r.date)) + ' · ' + r.time + '</span><span>' + r.people + ' ' + esc(t('people')) + '</span></li>').join('') + '</ul>' : '<p>' + esc(t('none')) + '</p>') + '</div></div>';
    bindChart();
  };
  /* Histogramme du CA par heure : une seule série, une teinte, info-bulle au survol + tableau accessible */
  function chart(hours) {
    const keys = Object.keys(hours).map(Number).sort((a, b) => a - b);
    const max = Math.max(1000, ...keys.map(k => hours[k]));
    const nice = Math.ceil(max / 5000) * 5000;
    const W = 600, H = 240, pl = 44, pb = 26, pt = 10, bw = (W - pl) / keys.length;
    let g = '';
    [0, .5, 1].forEach(f => { const y = pt + (H - pt - pb) * (1 - f); g += '<line x1="' + pl + '" x2="' + W + '" y1="' + y + '" y2="' + y + '" stroke="rgba(43,32,28,.12)"/><text x="' + (pl - 6) + '" y="' + (y + 4) + '" text-anchor="end">' + Math.round(nice * f / 1000) + 'k</text>'; });
    keys.forEach((k, i) => {
      const v = hours[k], h = (H - pt - pb) * v / nice, x = pl + i * bw + 3, y = H - pb - h;
      if (v) g += '<path class="bar-r" tabindex="0" data-tip="' + k + ' h · ' + money(v) + '" d="M' + x + ' ' + (H - pb) + 'V' + (y + 4) + 'q0-4 4-4h' + (bw - 14) + 'q4 0 4 4V' + (H - pb) + 'z"><title>' + k + ' h : ' + money(v) + '</title></path>';
      if (i % 2 === 0) g += '<text x="' + (x + (bw - 6) / 2) + '" y="' + (H - 8) + '" text-anchor="middle">' + k + 'h</text>';
    });
    return '<div class="chart"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-labelledby="chartT">' + g + '<line x1="' + pl + '" x2="' + W + '" y1="' + (H - pb) + '" y2="' + (H - pb) + '" stroke="#2B201C" stroke-width="1.5"/></svg><div class="tip" hidden></div></div>' +
      '<table class="sr"><caption>' + esc(t('chartTitle')) + '</caption><tr><th>' + esc(t('hour')) + '</th><th>' + esc(t('amount')) + '</th></tr>' + keys.filter(k => hours[k]).map(k => '<tr><td>' + k + ' h</td><td>' + money(hours[k]) + '</td></tr>').join('') + '</table>';
  }
  function bindChart() {
    const box = $('.chart'); if (!box) return;
    const tip = $('.tip', box);
    const show = (el) => { const r = el.getBoundingClientRect(), b = box.getBoundingClientRect(); tip.textContent = el.dataset.tip; tip.style.left = (r.left - b.left + r.width / 2) + 'px'; tip.style.top = (r.top - b.top) + 'px'; tip.hidden = false; };
    $$('.bar-r', box).forEach(el => { el.addEventListener('mouseenter', () => show(el)); el.addEventListener('focus', () => show(el)); el.addEventListener('mouseleave', () => { tip.hidden = true; }); el.addEventListener('blur', () => { tip.hidden = true; }); });
  }

  /* ================= Écrans Bar / Cuisine ================= */
  function kds(station) {
    const list = S.orders().filter(o => !o.done && !o.cancelled && o.st[station]).sort((a, b) => a.createdAt - b.createdAt);
    const col = (state, title) => {
      const items = list.filter(o => o.st[station] === state);
      return '<section class="kds__col" aria-label="' + esc(title) + '"><h2>' + esc(title) + ' <span class="pill">' + items.length + '</span></h2><div class="kds__list">' +
        (items.length ? items.map(o => ticket(o, station, state)).join('') : '<p class="empty-col">' + esc(t('none')) + '</p>') + '</div></section>';
    };
    $('#view').innerHTML = '<div class="vh"><h1>' + esc(t(station === 'bar' ? 'tBar' : 'tKitchen')) + '</h1><p>' + esc(t(station === 'bar' ? 'kdsBarSub' : 'kdsKitchenSub')) + '</p></div>' +
      '<div class="kds">' + col('new', t('colNew')) + col('doing', t('colDoing')) + col('ready', t('colReady')) + '</div>';
  }
  function ticket(o, station, state) {
    const all = S.orderStatus(o) === 'ready';
    let acts = '';
    if (state === 'new') acts = '<button type="button" class="btn btn--s" data-act="doing" data-id="' + o.id + '" data-st="' + station + '">' + esc(t('start')) + '</button>';
    if (state === 'doing') acts = '<button type="button" class="btn btn--s btn--ok" data-act="ready" data-id="' + o.id + '" data-st="' + station + '">' + esc(t('markReady')) + ' ✓</button>';
    if (state === 'ready') acts = all ? '<button type="button" class="btn btn--s btn--line" data-act="done" data-id="' + o.id + '">' + esc(t(o.mode === 'table' ? 'served' : 'handed')) + '</button>' : '<span class="pill pill--preparing">' + esc(t('stPreparing')) + '</span>';
    const age = Date.now() - o.createdAt;
    return '<article class="ticket' + (Date.now() - o.createdAt < 20000 ? ' is-new' : '') + '" data-order="' + o.id + '"><div class="ticket__top"><span class="ticket__num">' + num(o) + '</span><span class="ticket__where">' + esc(where(o)) + '</span>' +
      '<span class="ticket__timer' + (age > 15 * 60e3 ? ' is-late' : age > 8 * 60e3 ? ' is-warn' : '') + '" data-t="' + o.createdAt + '">' + elapsed(o.createdAt) + '</span></div>' +
      '<p class="ticket__name">' + esc(o.name) + ' · ' + hhmm(o.createdAt) + '</p><ul>' +
      itemsFor(o, station).map(i => '<li><b>' + i.qty + ' ×</b> ' + esc(i.name) + (i.sub ? '<small>' + esc(i.sub) + '</small>' : '') + '</li>').join('') + '</ul>' +
      (o.note ? '<p class="ticket__note">' + esc(o.note) + '</p>' : '') + '<div class="ticket__acts">' + acts + '</div></article>';
  }
  VIEWS.bar = () => kds('bar');
  VIEWS.kitchen = () => kds('kitchen');
  function tick() {
    $$('[data-t]').forEach(el => {
      const age = Date.now() - +el.dataset.t;
      el.textContent = elapsed(+el.dataset.t);
      el.classList.toggle('is-warn', age > 8 * 60e3 && age <= 15 * 60e3);
      el.classList.toggle('is-late', age > 15 * 60e3);
    });
    const d = new Date();
    $('#clock').textContent = d.toLocaleDateString(I.lang === 'ar' ? 'ar-DZ' : 'fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) + ' · ' + hhmm(d);
  }
  setInterval(tick, 1000);

  /* ================= Caisse ================= */
  VIEWS.cash = function () {
    const s = S.settings();
    const cats = D.categories;
    const prods = S.products().filter(p => p.cat === pos.cat);
    const posTotal = pos.lines.reduce((a, l) => a + linePrice(l) * l.qty, 0);
    const open = S.orders().filter(o => !o.cancelled && (!o.done || !o.paid)).sort((a, b) => a.createdAt - b.createdAt);
    const tables = Array.from({ length: s.tables }, (_, i) => {
      const n = i + 1, due = open.filter(o => o.mode === 'table' && o.table === n && !o.paid).reduce((a, o) => a + o.total, 0);
      return '<div class="tbl' + (due ? ' is-busy' : '') + '"><b>' + n + '</b>' + (due ? money(due) : '—') + '</div>';
    }).join('');
    $('#view').innerHTML = '<div class="vh"><h1>' + esc(t('tCash')) + '</h1><button type="button" class="btn btn--s" data-act="z">' + esc(t('zBtn')) + '</button></div>' +
      '<div class="pos"><div class="panel"><h2>' + esc(t('posTitle')) + '</h2><div class="pos__cats" role="group" aria-label="' + esc(t('tMenu')) + '">' +
      cats.map(c => '<button type="button" data-poscat="' + c.id + '" aria-pressed="' + (c.id === pos.cat) + '">' + esc(L(c)) + '</button>').join('') + '</div>' +
      '<div class="pos__grid">' + prods.map(p => '<button type="button" class="pos__item" data-pos="' + p.id + '"' + (S.canOrder(p) ? '' : ' disabled') + '>' + A.draw(p.art, p.tint) + esc(p.name) + '<span>' + money(p.price) + '</span></button>').join('') + '</div></div>' +
      '<div class="panel"><h2>' + esc(t('ticket')) + '</h2>' + (pos.lines.length ? '<ul class="ticket-lines">' + pos.lines.map((l, i) => '<li><span>' + esc(S.product(l.pid).name) + (l.opts.length ? ' <small>(' + l.opts.map(k => optLabel(l.pid, k)).join(', ') + ')</small>' : '') + '</span><button type="button" data-posq="' + i + '" data-d="-1" aria-label="' + esc(t('less')) + '">−</button><b>' + l.qty + '</b><button type="button" data-posq="' + i + '" data-d="1" aria-label="' + esc(t('more')) + '">+</button><span>' + money(linePrice(l) * l.qty) + '</span></li>').join('') + '</ul>' : '<p>' + esc(t('none')) + '</p>') +
      '<div class="sum"><span>' + esc(t('total')) + '</span><span id="posTotal">' + money(posTotal) + '</span></div>' +
      '<div class="row-acts"><button type="button" class="btn btn--ok" data-act="pos-pay" data-pay="cash"' + (pos.lines.length ? '' : ' disabled') + '>' + esc(t('payCash')) + '</button><button type="button" class="btn" data-act="pos-pay" data-pay="card"' + (pos.lines.length ? '' : ' disabled') + '>' + esc(t('payCard')) + '</button><button type="button" class="btn btn--line" data-act="pos-clear">' + esc(t('clearTicket')) + '</button></div>' +
      '<h2 style="margin-top:22px">' + esc(t('tablesTitle')) + '</h2><div class="tables">' + tables + '</div></div></div>' +
      '<div class="panel" style="margin-top:16px"><h2>' + esc(t('ongoing')) + '</h2><div class="unpaid" id="unpaid">' + (open.length ? open.map(o =>
        '<article class="uo" data-order="' + o.id + '"><div class="uo__top"><strong>' + num(o) + '</strong><span>' + esc(where(o)) + ' · ' + esc(o.name) + '</span>' + pill(o) +
        '<span class="pill' + (o.paid ? ' pill--ready' : ' pill--received') + '">' + esc(o.paid ? t('paid') : t('unpaid')) + '</span><span class="uo__total">' + money(o.total) + '</span></div>' +
        '<p>' + itemsFor(o).map(i => i.qty + ' × ' + esc(i.name)).join(' · ') + '</p><div class="row-acts">' +
        (o.paid ? '' : '<button type="button" class="btn btn--s btn--ok" data-act="pay" data-pay="cash" data-id="' + o.id + '">' + esc(t('payCash')) + '</button><button type="button" class="btn btn--s" data-act="pay" data-pay="card" data-id="' + o.id + '">' + esc(t('payCard')) + '</button>') +
        (S.orderStatus(o) === 'ready' ? '<button type="button" class="btn btn--s btn--line" data-act="done" data-id="' + o.id + '">' + esc(t(o.mode === 'table' ? 'served' : 'handed')) + '</button>' : '') +
        (o.paid ? '' : '<button type="button" class="btn btn--s btn--line" data-act="cancel" data-id="' + o.id + '">' + esc(t('cancel')) + '</button>') +
        '</div></article>').join('') : '<p>' + esc(t('none')) + '</p>') + '</div></div>';
  };
  function optLabel(pid, k) {
    if (k.indexOf('choice:') === 0) { const o = S.product(pid).choice.opts.find(c => c.id === k.slice(7)); return L(o); }
    return L(D.extras[k]);
  }
  const linePrice = (l) => S.product(l.pid).price + l.opts.filter(k => k.indexOf('choice:') !== 0).reduce((a, k) => a + S.extraPrice(k), 0);
  function posAdd(pid, opts) {
    const key = pid + '|' + opts.slice().sort().join(',');
    const ex = pos.lines.find(l => l.pid + '|' + l.opts.slice().sort().join(',') === key);
    if (ex) ex.qty++; else pos.lines.push({ pid, opts, qty: 1 });
    VIEWS.cash();
  }
  function posOptions(pid) {
    const p = S.product(pid), extras = (p.x || []).filter(k => S.settings().extras[k]);
    if (!p.choice && !extras.length) { posAdd(pid, []); return; }
    modal('<h2 id="modalTitle" class="ps__name">' + esc(p.name) + '</h2><form id="posOpt">' +
      (p.choice ? '<fieldset class="ps__group"><legend>' + esc(L(p.choice)) + '</legend>' + p.choice.opts.map((o, i) => '<label class="opt"><input type="radio" name="c" value="' + o.id + '"' + (i ? '' : ' checked') + '> ' + esc(L(o)) + '</label>').join('') + '</fieldset>' : '') +
      (extras.length ? '<fieldset class="ps__group"><legend>' + esc(t('extrasTitle')) + '</legend>' + extras.map(k => '<label class="opt"><input type="checkbox" name="x" value="' + k + '"> ' + esc(L(D.extras[k])) + '<span class="opt__price">+ ' + money(S.extraPrice(k)) + '</span></label>').join('') + '</fieldset>' : '') +
      '<div class="modal-acts"><button class="btn" type="submit">' + esc(t('add')) + '</button></div></form>');
    $('#posOpt').onsubmit = (e) => {
      e.preventDefault();
      const c = $('#posOpt input[name=c]:checked');
      posAdd(pid, (c ? ['choice:' + c.value] : []).concat($$('#posOpt input[name=x]:checked').map(i => i.value)));
      $('#modal').close();
    };
  }
  function zModal() {
    const list = S.orders().filter(o => o.paid && !o.z && !o.cancelled);
    const sum = (f) => list.filter(f).reduce((a, o) => a + o.total, 0);
    const hist = S.read('z', []);
    modal('<h2 id="modalTitle" class="ps__name">' + esc(t('zTitle')) + '</h2>' +
      (list.length ? '<div class="z-sum"><span>' + esc(t('zCount')) + '</span><b>' + list.length + '</b><span>' + esc(t('cash')) + '</span><b>' + money(sum(o => o.pay !== 'card')) + '</b><span>' + esc(t('card')) + '</span><b>' + money(sum(o => o.pay === 'card')) + '</b><span>' + esc(t('zTotal')) + '</span><b id="zTotal">' + money(sum(() => true)) + '</b></div>' +
        '<div class="modal-acts"><button type="button" class="btn" data-act="z-ok">' + esc(t('zConfirm')) + '</button></div>' : '<p>' + esc(t('zEmpty')) + '</p>') +
      (hist.length ? '<h3 style="margin-top:20px">' + esc(t('zHistory')) + '</h3><ul class="mini">' + hist.slice().reverse().map(z => '<li><span>Z ' + z.n + ' · ' + new Date(z.at).toLocaleString(I.lang === 'ar' ? 'ar-DZ' : 'fr-FR') + '</span><b>' + money(z.total) + '</b></li>').join('') + '</ul>' : ''));
  }
  function zClose() {
    const list = S.orders(), hist = S.read('z', []);
    const id = 'z' + (hist.length + 1);
    const paid = list.filter(o => o.paid && !o.z && !o.cancelled);
    paid.forEach(o => { o.z = id; });
    hist.push({ id, n: hist.length + 1, at: Date.now(), count: paid.length, total: paid.reduce((a, o) => a + o.total, 0), cash: paid.filter(o => o.pay !== 'card').reduce((a, o) => a + o.total, 0), card: paid.filter(o => o.pay === 'card').reduce((a, o) => a + o.total, 0) });
    S.write('z', hist);
    S.saveOrders(list);
    $('#modal').close();
    toast(t('zDone'), true);
  }

  /* ================= Carte ================= */
  VIEWS.menu = function () {
    const s = S.settings();
    let h = '<div class="vh"><h1>' + esc(t('tMenu')) + '</h1><p>' + esc(t('menuSub')) + '</p></div>';
    h += '<div class="settings"><div class="panel"><h2>' + esc(t('extrasAdmin')) + '</h2><div class="tbl-wrap"><table class="data"><thead><tr><th>' + esc(t('product')) + '</th><th>' + esc(t('price')) + '</th><th>' + esc(t('available')) + '</th></tr></thead><tbody>' +
      Object.keys(D.extras).map(k => '<tr><td>' + esc(L(D.extras[k])) + '</td><td><label class="sr" for="xp-' + k + '">' + esc(t('price')) + ' ' + esc(L(D.extras[k])) + '</label><input type="number" min="0" step="50" id="xp-' + k + '" data-xprice="' + k + '" value="' + S.extraPrice(k) + '"></td>' +
        '<td><label class="switch"><input type="checkbox" data-xon="' + k + '"' + (s.extras[k] ? ' checked' : '') + '><span class="sr">' + esc(t('available')) + ' ' + esc(L(D.extras[k])) + '</span></label></td></tr>').join('') + '</tbody></table></div></div>' +
      '<div class="panel"><h2>' + esc(t('formuleAdmin')) + '</h2><div class="field"><label for="fDisc">' + esc(t('discount')) + '</label><input id="fDisc" type="number" min="0" max="50" value="' + s.formuleDiscount + '" data-set="formuleDiscount"></div><p class="lead" style="font-size:14px">' + esc(t('fLead')) + '</p></div></div>';
    D.categories.forEach(c => {
      const hid = s.hiddenCats.indexOf(c.id) !== -1;
      h += '<div class="panel" style="margin-top:16px"><div class="cat-title" style="margin-top:0">' + A.draw(c.art, c.tint) + '<h2>' + esc(L(c)) + '</h2><label class="switch">' + esc(t('visible')) + '<input type="checkbox" data-catvis="' + c.id + '"' + (hid ? '' : ' checked') + '></label></div>' +
        '<div class="tbl-wrap"><table class="data"><thead><tr><th>' + esc(t('product')) + '</th><th>' + esc(t('price')) + ' (DA)</th><th>' + esc(t('available')) + '</th>' + (c.id === 'vitrine' ? '<th>' + esc(t('inShowcase')) + '</th>' : '') + '</tr></thead><tbody>' +
        S.products().filter(p => p.cat === c.id).map(p => '<tr><td><b>' + esc(p.name) + '</b></td><td><label class="sr" for="pp-' + p.id + '">' + esc(t('price')) + ' ' + esc(p.name) + '</label><input type="number" min="0" step="50" id="pp-' + p.id + '" data-price="' + p.id + '" value="' + p.price + '"></td>' +
          '<td><label class="switch"><input type="checkbox" data-avail="' + p.id + '"' + (p.available ? ' checked' : '') + '><span class="sr">' + esc(t('available')) + ' ' + esc(p.name) + '</span></label></td>' +
          (c.id === 'vitrine' ? '<td><label class="switch"><input type="checkbox" data-show="' + p.id + '"' + (p.inShowcase ? ' checked' : '') + '><span class="sr">' + esc(t('inShowcase')) + ' ' + esc(p.name) + '</span></label></td>' : '') + '</tr>').join('') +
        '</tbody></table></div></div>';
    });
    $('#view').innerHTML = h;
  };

  /* ================= Réservations ================= */
  VIEWS.resas = function () {
    const list = S.resas().slice().sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    const lab = { pending: ['bPending', 'pill--received'], confirmed: ['bConfirmed', 'pill--ready'], declined: ['bDeclined', 'pill--cancelled'] };
    $('#view').innerHTML = '<div class="vh"><h1>' + esc(t('tResas')) + '</h1><p>' + esc(t('resasSub')) + '</p></div><div class="unpaid">' +
      (list.length ? list.map(r => {
        const msg = t(r.status === 'declined' ? 'waResaKo' : 'waResaOk', { n: r.name, d: dateLbl(r.date), h: r.time, p: r.people });
        return '<article class="uo" data-resa="' + r.id + '"><div class="uo__top"><strong>' + esc(r.name) + '</strong><span>' + esc(dateLbl(r.date)) + ' · ' + r.time + ' · ' + r.people + ' ' + esc(t('people')) + '</span><span class="pill ' + lab[r.status][1] + '">' + esc(t(lab[r.status][0])) + '</span><span class="uo__total">' + esc(r.phone) + '</span></div>' +
          (r.note ? '<p>' + esc(r.note) + '</p>' : '<p></p>') + '<div class="row-acts">' +
          (r.status !== 'confirmed' ? '<button type="button" class="btn btn--s btn--ok" data-act="resa" data-v="confirmed" data-id="' + r.id + '">' + esc(t('confirm')) + '</button>' : '') +
          (r.status !== 'declined' ? '<button type="button" class="btn btn--s btn--line" data-act="resa" data-v="declined" data-id="' + r.id + '">' + esc(t('decline')) + '</button>' : '') +
          (r.status !== 'pending' ? '<a class="btn btn--s" target="_blank" rel="noopener" href="https://wa.me/' + waPhone(r.phone) + '?text=' + encodeURIComponent(msg) + '">' + esc(t('notify')) + '</a>' : '') +
          '</div></article>';
      }).join('') : '<p>' + esc(t('none')) + '</p>') + '</div>';
  };

  /* ================= Fidélité ================= */
  let loyalQ = '';
  VIEWS.loyalty = function () {
    const goal = S.settings().loyaltyGoal, all = S.loyalty();
    const rows = Object.keys(all).filter(k => !loyalQ || k.indexOf(S.normPhone(loyalQ)) !== -1).sort((a, b) => (all[b].last || 0) - (all[a].last || 0));
    $('#view').innerHTML = '<div class="vh"><h1>' + esc(t('tLoyalty')) + '</h1><p>' + esc(t('loyaltySub', { n: goal })) + '</p></div><div class="panel">' +
      '<label class="sr" for="lq">' + esc(t('searchPhone')) + '</label><input id="lq" type="search" placeholder="' + esc(t('searchPhone')) + '" value="' + esc(loyalQ) + '" style="max-width:320px;margin-bottom:12px">' +
      '<div class="tbl-wrap"><table class="data"><thead><tr><th>' + esc(t('name')) + '</th><th>' + esc(t('phone')) + '</th><th>' + esc(t('stamps')) + '</th><th>' + esc(t('rewards')) + '</th><th>' + esc(t('visits')) + '</th><th>' + esc(t('last')) + '</th><th><span class="sr">Actions</span></th></tr></thead><tbody>' +
      (rows.length ? rows.map(k => { const c = all[k]; return '<tr><td>' + esc(c.name || '—') + '</td><td>' + esc(k) + '</td><td><b>' + c.stamps + ' / ' + goal + '</b></td><td>' + c.rewards + '</td><td>' + c.visits + '</td><td>' + (c.last ? new Date(c.last).toLocaleDateString(I.lang === 'ar' ? 'ar-DZ' : 'fr-FR') : '—') + '</td>' +
        '<td><div class="row-acts"><button type="button" class="btn btn--s btn--line" data-act="stamp" data-ph="' + k + '">' + esc(t('addStamp')) + '</button>' + (c.stamps >= goal ? '<button type="button" class="btn btn--s btn--ok" data-act="reward" data-ph="' + k + '">' + esc(t('giveReward')) + '</button>' : '') + '</div></td></tr>'; }).join('') : '<tr><td colspan="7">' + esc(t('none')) + '</td></tr>') +
      '</tbody></table></div></div>';
    const q = $('#lq'); q.oninput = () => { loyalQ = q.value; VIEWS.loyalty(); const n = $('#lq'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); };
  };

  /* ================= Prévenez-moi ================= */
  let notifyMsg = null;
  VIEWS.notify = function () {
    const list = S.notifyList();
    if (notifyMsg === null) notifyMsg = t('defaultMsg');
    $('#view').innerHTML = '<div class="vh"><h1>' + esc(t('tNotify')) + ' <span class="pill">' + list.length + '</span></h1><p>' + esc(t('notifySub')) + '</p></div>' +
      '<div class="cols"><div class="panel"><div class="tbl-wrap"><table class="data"><thead><tr><th>' + esc(t('name')) + '</th><th>' + esc(t('phone')) + '</th><th>' + esc(t('registered')) + '</th><th><span class="sr">WhatsApp</span></th></tr></thead><tbody>' +
      (list.length ? list.map(n => '<tr><td>' + esc(n.name || '—') + '</td><td>' + esc(n.phone) + '</td><td>' + new Date(n.at).toLocaleDateString(I.lang === 'ar' ? 'ar-DZ' : 'fr-FR') + '</td><td><a class="btn btn--s btn--line" target="_blank" rel="noopener" data-wa href="https://wa.me/' + waPhone(n.phone) + '?text=' + encodeURIComponent(notifyMsg) + '">WhatsApp</a></td></tr>').join('') : '<tr><td colspan="4">' + esc(t('none')) + '</td></tr>') +
      '</tbody></table></div></div><div class="panel"><div class="field"><label for="nMsg">' + esc(t('msgLabel')) + '</label><textarea id="nMsg" rows="6">' + esc(notifyMsg) + '</textarea></div>' +
      '<div class="row-acts" style="margin-top:12px"><button type="button" class="btn btn--s" data-act="copy-msg">' + esc(t('copyMsg')) + '</button><button type="button" class="btn btn--s btn--line" data-act="copy-nums">' + esc(t('copyNums')) + '</button><button type="button" class="btn btn--s btn--line" data-act="csv">' + esc(t('exportCsv')) + '</button></div></div></div>';
    $('#nMsg').oninput = (e) => { notifyMsg = e.target.value; $$('[data-wa]').forEach(a => { a.href = a.href.split('?')[0] + '?text=' + encodeURIComponent(notifyMsg); }); };
  };
  function copy(text) {
    const done = () => toast(t('copied'), true);
    try { navigator.clipboard.writeText(text).then(done, done); } catch (e) { done(); }
  }
  function exportCsv() {
    const rows = [['Nom', 'Téléphone', 'Inscrit le']].concat(S.notifyList().map(n => [n.name, n.phone, new Date(n.at).toLocaleDateString('fr-FR')]));
    const csv = '﻿' + rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(';')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'brew-prevenez-moi.csv'; document.body.appendChild(a); a.click(); a.remove();
  }

  /* ================= QR codes de tables ================= */
  VIEWS.qr = function () {
    const s = S.settings();
    const base = location.href.split('#')[0].split('?')[0].replace(/gestion\.html$/, '') + 'index.html?table=';
    $('#view').innerHTML = '<div class="vh"><h1>' + esc(t('tQr')) + '</h1><p>' + esc(t('qrSub')) + '</p><button type="button" class="btn btn--s" data-act="print">' + esc(t('print')) + '</button></div>' +
      '<div class="panel no-print" style="margin-bottom:16px"><div class="inline"><div class="field"><label for="qrN">' + esc(t('tablesCount')) + '</label><input id="qrN" type="number" min="1" max="60" value="' + s.tables + '" data-set="tables"></div></div></div>' +
      '<div class="qr-grid">' + Array.from({ length: s.tables }, (_, i) => '<div class="qr-card">' + A.logo({ word: true }) + Q.svg(base + (i + 1), { label: 'QR Table ' + (i + 1) }) + '<b>Table ' + (i + 1) + '</b><small>' + esc(t('scanOrder')) + '</small></div>').join('') + '</div>';
  };

  /* ================= Réglages ================= */
  VIEWS.settings = function () {
    const s = S.settings(), days = t('days'), order = [6, 0, 1, 2, 3, 4, 5];
    const sw = (key, label) => '<label class="switch"><input type="checkbox" data-setb="' + key + '"' + (s[key] ? ' checked' : '') + '> ' + esc(t(label)) + '</label>';
    $('#view').innerHTML = '<div class="vh"><h1>' + esc(t('tSettings')) + '</h1></div><div class="settings">' +
      '<div class="panel"><h2>' + esc(t('sStatus')) + '</h2><div class="form-rows"><div class="row-acts" role="group" aria-label="' + esc(t('sStatus')) + '">' +
      '<button type="button" class="btn btn--s' + (s.status === 'soon' ? '' : ' btn--line') + '" data-status="soon" aria-pressed="' + (s.status === 'soon') + '">' + esc(t('sSoon')) + '</button>' +
      '<button type="button" class="btn btn--s' + (s.status === 'open' ? '' : ' btn--line') + '" data-status="open" aria-pressed="' + (s.status === 'open') + '">' + esc(t('sOpen')) + '</button></div>' +
      '<div class="field"><label for="sOpening">' + esc(t('sOpening')) + '</label><input id="sOpening" type="datetime-local" value="' + esc(s.openingDate ? s.openingDate.slice(0, 16) : '') + '" data-set="openingDate"></div></div></div>' +
      '<div class="panel"><h2>' + esc(t('sHours')) + '</h2><div class="hours-grid">' + order.map(d => { const h = s.hours[d]; return '<span class="hd">' + esc(days[d]) + '</span>' +
        '<label class="sr" for="ho' + d + '">' + esc(days[d]) + ' ouverture</label><input type="time" id="ho' + d + '" data-hour="' + d + '" data-k="open" value="' + h.open + '">' +
        '<label class="sr" for="hc' + d + '">' + esc(days[d]) + ' fermeture</label><input type="time" id="hc' + d + '" data-hour="' + d + '" data-k="close" value="' + h.close + '">' +
        '<label class="switch"><input type="checkbox" data-hour="' + d + '" data-k="closed"' + (h.closed ? ' checked' : '') + '> ' + esc(t('sClosed')) + '</label>'; }).join('') +
      '</div><button type="button" class="btn btn--s btn--line" style="margin-top:12px" data-act="hours-all">' + esc(t('sApplyAll')) + '</button></div>' +
      '<div class="panel"><h2>' + esc(t('sOrdering')) + '</h2><div class="form-rows">' + sw('collect', 'sCollect') + sw('tableOrder', 'sTable') + sw('delivery', 'sDelivery') +
      '<div class="field"><label for="sMin">' + esc(t('sMin')) + ' (DA)</label><input id="sMin" type="number" min="0" step="100" value="' + s.deliveryMin + '" data-set="deliveryMin"></div>' +
      '<h3 style="font-size:15px">' + esc(t('sZones')) + '</h3>' + s.zones.map((z, i) => '<div class="inline"><div class="field"><label for="zn' + i + '">' + esc(t('sZoneName')) + '</label><input id="zn' + i + '" data-zone="' + i + '" data-k="name" value="' + esc(L(z)) + '"></div><div class="field"><label for="zf' + i + '">' + esc(t('sFee')) + ' (DA)</label><input id="zf' + i + '" type="number" min="0" step="50" data-zone="' + i + '" data-k="fee" value="' + z.fee + '"></div></div>').join('') +
      '<button type="button" class="btn btn--s btn--line" data-act="zone-add">+ ' + esc(t('newZone')) + '</button></div></div>' +
      '<div class="panel"><h2>' + esc(t('tLoyalty')) + ' · WhatsApp</h2><div class="form-rows"><div class="field"><label for="sGoal">' + esc(t('sLoyalty')) + '</label><input id="sGoal" type="number" min="2" max="30" value="' + s.loyaltyGoal + '" data-set="loyaltyGoal"></div>' +
      '<div class="field"><label for="sWa">' + esc(t('sWhatsapp')) + '</label><input id="sWa" inputmode="tel" value="' + esc(s.whatsapp) + '" data-set="whatsapp"></div></div></div>' +
      '<div class="panel"><h2>' + esc(t('sPins')) + '</h2><form id="pinForm" class="form-grid">' + ['manager', 'bar', 'kitchen', 'cash'].map(k => '<div class="field"><label for="pin-' + k + '">' + esc(t(ROLES[k].name)) + '</label><input id="pin-' + k + '" inputmode="numeric" maxlength="4" pattern="\\d{4}" value="' + s.pins[k] + '"></div>').join('') +
      '<button class="btn btn--s field--full" type="submit">' + esc(t('gSave')) + '</button><p class="form-msg field--full" id="pinMsg" role="status"></p></form></div>' +
      '<div class="panel danger"><h2>' + esc(t('sReset')) + '</h2><p>' + esc(t('sResetTxt')) + '</p><button type="button" class="btn btn--warn" style="margin-top:12px" data-act="reset">' + esc(t('sResetBtn')) + '</button></div></div>';
    $('#pinForm').onsubmit = (e) => {
      e.preventDefault();
      const pins = {}; ['manager', 'bar', 'kitchen', 'cash'].forEach(k => { pins[k] = $('#pin-' + k).value.trim(); });
      const vals = Object.values(pins), msg = $('#pinMsg');
      if (vals.some(v => !/^\d{4}$/.test(v)) || new Set(vals).size !== 4) { msg.classList.add('is-err'); msg.textContent = t('sPinErr'); return; }
      msg.classList.remove('is-err'); msg.textContent = t('saved');
      S.saveSettings({ pins });
    };
  };

  /* ---------- Modifications (carte, réglages) ---------- */
  document.addEventListener('change', (e) => {
    const el = e.target, s = S.settings();
    let did = true;
    if (el.dataset.price) S.setProduct(el.dataset.price, { price: Math.max(0, Math.round(+el.value || 0)) });
    else if (el.dataset.avail) S.setProduct(el.dataset.avail, { available: el.checked });
    else if (el.dataset.show) S.setProduct(el.dataset.show, { inShowcase: el.checked });
    else if (el.dataset.xprice) { const p = Object.assign({}, s.extraPrices); p[el.dataset.xprice] = Math.max(0, +el.value || 0); S.saveSettings({ extraPrices: p }); }
    else if (el.dataset.xon) { const x = Object.assign({}, s.extras); x[el.dataset.xon] = el.checked; S.saveSettings({ extras: x }); }
    else if (el.dataset.catvis) { const h = s.hiddenCats.filter(c => c !== el.dataset.catvis); if (!el.checked) h.push(el.dataset.catvis); S.saveSettings({ hiddenCats: h }); }
    else if (el.dataset.set) {
      const k = el.dataset.set, v = el.type === 'number' ? Math.max(0, +el.value || 0) : el.value;
      S.saveSettings({ [k]: k === 'openingDate' && v ? new Date(v).toISOString() : v });
      if (k === 'tables' && tab === 'qr') VIEWS.qr();
    } else if (el.dataset.setb) S.saveSettings({ [el.dataset.setb]: el.checked });
    else if (el.dataset.hour) {
      const hours = s.hours.map(h => Object.assign({}, h)), h = hours[+el.dataset.hour];
      h[el.dataset.k] = el.type === 'checkbox' ? el.checked : el.value;
      S.saveSettings({ hours });
    } else if (el.dataset.zone) {
      const zones = s.zones.map(z => Object.assign({}, z)), z = zones[+el.dataset.zone];
      if (el.dataset.k === 'fee') z.fee = Math.max(0, +el.value || 0); else { z.fr = el.value; z.ar = el.value; }
      S.saveSettings({ zones });
    } else did = false;
    if (did) toast(t('saved'), true);
  });

  /* ---------- Actions (boutons) ---------- */
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act],[data-poscat],[data-pos],[data-posq],[data-status]');
    if (!b || $('#app').hidden) return;
    if (b.dataset.poscat) { pos.cat = b.dataset.poscat; VIEWS.cash(); return; }
    if (b.dataset.pos) { posOptions(b.dataset.pos); return; }
    if (b.dataset.posq) { const l = pos.lines[+b.dataset.posq]; l.qty += +b.dataset.d; if (l.qty <= 0) pos.lines.splice(+b.dataset.posq, 1); VIEWS.cash(); return; }
    if (b.dataset.status) { S.saveSettings({ status: b.dataset.status }); VIEWS.settings(); toast(t('saved'), true); return; }
    const id = b.dataset.id;
    switch (b.dataset.act) {
      case 'doing': case 'ready': S.setStation(id, b.dataset.st, b.dataset.act); break;
      case 'done': S.updateOrder(id, o => { o.done = true; o.times.done = Date.now(); }); break;
      case 'pay': S.updateOrder(id, o => { o.paid = true; o.pay = b.dataset.pay; o.times.paid = Date.now(); }); break;
      case 'cancel': if (confirm(t('confirmCancel'))) S.updateOrder(id, o => { o.cancelled = true; }); break;
      case 'pos-clear': pos.lines = []; VIEWS.cash(); break;
      case 'pos-pay': {
        const lines = pos.lines.map(l => { const p = S.product(l.pid); return { id: S.uid('l'), pid: l.pid, name: p.name, qty: l.qty, unit: linePrice(l), station: p.station,
          opts: l.opts.map(k => k.indexOf('choice:') === 0 ? Object.assign({ k, price: 0 }, (({ fr, ar }) => ({ fr, ar }))(p.choice.opts.find(c => c.id === k.slice(7)))) : { k, fr: D.extras[k].fr, ar: D.extras[k].ar, price: S.extraPrice(k) }) }; });
        S.addOrder({ name: t('whereCounter'), mode: 'counter', lines, total: lines.reduce((a, l) => a + l.unit * l.qty, 0), paid: true, pay: b.dataset.pay, fee: 0 });
        pos.lines = []; VIEWS.cash(); toast(t('saved'), true); break;
      }
      case 'z': zModal(); break;
      case 'z-ok': zClose(); break;
      case 'resa': S.setResa(id, b.dataset.v); break;
      case 'stamp': S.addStamps(b.dataset.ph, '', 1); break;
      case 'reward': { const all = S.loyalty(), c = all[b.dataset.ph], g = S.settings().loyaltyGoal; c.stamps = Math.max(0, c.stamps - g); c.rewards += 1; S.write('loyalty', all); break; }
      case 'copy-msg': copy(notifyMsg); break;
      case 'copy-nums': copy(S.notifyList().map(n => n.phone).join('\n')); break;
      case 'csv': exportCsv(); break;
      case 'print': window.print(); break;
      case 'hours-all': { const s = S.settings(), f = s.hours[6]; S.saveSettings({ hours: s.hours.map(h => ({ d: h.d, open: f.open, close: f.close, closed: f.closed })) }); VIEWS.settings(); toast(t('saved'), true); break; }
      case 'zone-add': { const s = S.settings(); const n = s.zones.length + 1; S.saveSettings({ zones: s.zones.concat([{ id: 'z' + Date.now(), fr: 'Zone ' + n, ar: 'المنطقة ' + n, fee: 300 }]) }); VIEWS.settings(); break; }
      case 'reset':
        modal('<h2 id="modalTitle" class="ps__name">' + esc(t('sResetConfirm')) + '</h2><p style="text-align:center;margin-top:10px">' + esc(t('sResetTxt')) + '</p><div class="modal-acts"><button type="button" class="btn btn--line" data-close>' + esc(t('no')) + '</button><button type="button" class="btn btn--warn" data-act="reset-ok">' + esc(t('yes')) + '</button></div>');
        break;
      case 'reset-ok': S.resetActivity(); $('#modal').close(); toast(t('sResetDone'), true); render(); break;
    }
  });

  /* ---------- Synchronisation en direct ---------- */
  const LIVE = ['dash', 'bar', 'kitchen', 'cash', 'resas', 'loyalty', 'notify'];
  S.on((key, local) => {
    if (!role) return;
    if (key === 'orders') {
      const fresh = S.orders().filter(o => !seen.has(o.id));
      fresh.forEach(o => seen.add(o.id));
      if (fresh.length && !local && tab !== 'menu' && tab !== 'settings') { beep(); toast(t('newOrderToast') + ' ' + num(fresh[fresh.length - 1]) + ' · ' + where(fresh[fresh.length - 1])); }
    }
    if (LIVE.indexOf(tab) !== -1 && !(tab === 'loyalty' && document.activeElement && document.activeElement.id === 'lq')) {
      if (!$('#modal').open || key !== 'orders') VIEWS[tab]();
      tick();
    }
    renderTabs();
  });

  /* ---------- Démarrage ---------- */
  paintStatic();
  if (role && ROLES[role]) login(role);
})();
