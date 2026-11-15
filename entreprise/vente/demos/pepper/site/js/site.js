/* PEPPER — site client : carte, panier, commande, suivi en direct, fidélité */
(function () {
  'use strict';
  const S = window.PPR, D = S.D;
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const img = n => 'img/carte/' + n + '.webp';

  /* ---------- préférences du visiteur ---------- */
  function me(k, v) {
    let m = {}; try { m = JSON.parse(localStorage.getItem('ppr-me') || '{}'); } catch (e) { /* bloqué */ }
    if (v === undefined) return m[k];
    m[k] = v; try { localStorage.setItem('ppr-me', JSON.stringify(m)); } catch (e) { /* bloqué */ }
  }
  let lang = me('lang') || 'fr';
  let branchId = me('branch') || 'gc';
  let mode = me('mode') || 'surplace';
  let cart = me('cart') || [];

  /* ---------- textes FR / AR ---------- */
  const T = {
    fr: {
      cart: 'Panier', ratings: '102 avis Yassir', seeMenu: 'Voir la carte & commander', delivery: 'Livraison via Yassir',
      heroSub: "Fini la file au comptoir : commande depuis ton téléphone, suis ton burger en direct et récupère-le dès que ton numéro s'affiche.",
      heroSubGc: "Fini la file au comptoir : commande depuis ton téléphone, suis ton burger en direct et récupère-le au 3e étage de Garden City dès que ton numéro s'affiche.",
      heroTitle: "Commande. <em>On t'appelle</em> quand c'est prêt.",
      howK: 'Sans attente', howT: '4 étapes, 0 file', s1t: 'Tu choisis', s1p: 'Ton burger, ta taille (Simple, XL, XXL), tes frites.',
      s2t: 'Tu commandes', s2p: "Sur place, ou avant d'arriver pour le récupérer à l'heure.", s3t: 'Tu suis en direct', s3p: 'Ton numéro passe en cuisine, puis « Prêt » : ton téléphone vibre.',
      s4t: 'Tu récupères', s4p: "Tu paies au comptoir, tu prends ton plateau. C'est tout.",
      sigK: 'Les incontournables', sigT: 'Nos signatures', loyK: 'Carte fidélité', loyP: 'Pas de carte en carton à perdre : ton numéro de téléphone suffit. Chaque burger commandé ajoute un tampon.',
      check: 'Voir mes tampons', brK: 'Nos restaurants', brT: '4 adresses à Alger', screen: 'Écran comptoir', staff: 'Espace équipe', made: 'site & système réalisés par Dzign Studio',
      open: 'Ouvert', closed: 'Fermé', until: "jusqu'à", opensAt: 'ouvre à', from: 'dès', add: 'Ajouter', size: 'Taille', sauce: 'Sauce', qty: 'Quantité', withIt: 'Avec ça ?',
      soldout: 'Bientôt de retour', star: 'Signature', hot: 'Piquant', viewCart: 'Voir le panier', empty: 'Ton panier est vide.', emptyP: 'Choisis un burger dans la carte 🍔',
      modeT: 'Comment tu manges ?', surplace: 'Sur place', surplaceS: 'On affiche ton numéro quand c\'est prêt', emporter: 'À emporter', emporterS: 'Je passe le récupérer',
      yassirS: 'Chez toi, via Yassir', when: 'Retrait', asap: 'Dès que possible', name: 'Ton prénom', phone: 'Ton téléphone (fidélité + appel si besoin)',
      pay: 'Paiement au comptoir, en espèces ou par carte, au moment du retrait.', order: 'Envoyer ma commande', total: 'Total',
      errName: 'Indique ton prénom pour qu\'on t\'appelle.', errPhone: 'Numéro algérien à 10 chiffres (05, 06 ou 07).', added: 'ajouté au panier',
      tTitle: 'Ta commande', tNum: 'Ton numéro', st_new: 'Reçue', st_prep: 'En cuisine', st_ready: 'Prête', st_done: 'Récupérée',
      tNew: 'La cuisine a reçu ta commande.', tPrep: 'Ton burger est sur le grill 🔥', tReady: 'Passe au comptoir Pepper avec ton numéro.', tDone: 'Bon appétit ! Merci d\'avoir choisi Pepper.',
      eta: 'Prêt dans environ', min: 'min', readyBig: 'C’est prêt !', newOrder: 'Nouvelle commande', back: 'Retour à la carte', keep: 'Garde cette page ouverte : ton téléphone vibre quand c\'est prêt.',
      at: 'au comptoir Pepper', stamps: 'tampons', free: 'Ton prochain burger est offert ! Montre ce message au comptoir.', left: 'encore', toFree: 'avant ton burger offert',
      loyalTitle: n => n + ' burgers = le ' + (n + 1) + 'e offert', chooseBr: 'Choisis ton restaurant', directions: 'Itinéraire', scheduled: 'Restaurant fermé : ta commande sera préparée à l\'ouverture',
      realK: 'Chez Pepper', realT: 'Fait minute, servi chaud', r1: 'Sur la planche', r2: 'Fromage fondant', r3: 'Jus maison', r4: 'Notre ardoise',
      band: ['Les artisans du burger', 'Simple · XL · XXL', 'Commande sans file', 'Garden City · Hydra · Sidi Yahia · Aïn Allah', 'Fait minute'],
      sizes: ['Simple', 'XL', 'XXL'], cats: c => c.fr, gift: 'OFFERT', yourStamps: 'Tes tampons', items: 'articles', branchNote: 'Retrait'
    },
    ar: {
      cart: 'السلة', ratings: '102 تقييم على ياسير', seeMenu: 'القائمة والطلب', delivery: 'التوصيل عبر ياسير',
      heroSub: 'لا مزيد من الطابور: اطلب من هاتفك، تابع طلبك مباشرة واستلمه عندما يظهر رقمك.',
      heroSubGc: 'لا مزيد من الطابور: اطلب من هاتفك، تابع طلبك مباشرة واستلمه في الطابق الثالث بغاردن سيتي عندما يظهر رقمك.',
      heroTitle: 'اطلب. <em>نناديك</em> عندما يكون جاهزاً.',
      howK: 'بدون انتظار', howT: '4 خطوات، بدون طابور', s1t: 'اختر', s1p: 'البرغر، الحجم (عادي، XL، XXL) والبطاطا.',
      s2t: 'اطلب', s2p: 'في المطعم، أو قبل وصولك لتستلمه في الوقت.', s3t: 'تابع مباشرة', s3p: 'رقمك يدخل المطبخ ثم «جاهز»: هاتفك يهتز.',
      s4t: 'استلم', s4p: 'ادفع عند الشباك وخذ طلبك. هذا كل شيء.',
      sigK: 'الأكثر طلباً', sigT: 'أطباقنا المميزة', loyK: 'بطاقة الوفاء', loyP: 'لا بطاقة ورقية: رقم هاتفك يكفي. كل برغر يضيف طابعاً.',
      check: 'عرض طوابعي', brK: 'مطاعمنا', brT: '4 عناوين في الجزائر العاصمة', screen: 'شاشة الشباك', staff: 'فضاء الفريق', made: 'الموقع والنظام من إنجاز Dzign Studio',
      open: 'مفتوح', closed: 'مغلق', until: 'حتى', opensAt: 'يفتح على', from: 'من', add: 'أضف', size: 'الحجم', sauce: 'الصلصة', qty: 'الكمية', withIt: 'مع ذلك؟',
      soldout: 'يعود قريباً', star: 'مميز', hot: 'حار', viewCart: 'عرض السلة', empty: 'سلتك فارغة.', emptyP: 'اختر برغر من القائمة 🍔',
      modeT: 'كيف تأكل؟', surplace: 'في المطعم', surplaceS: 'نعرض رقمك عندما يكون جاهزاً', emporter: 'سفري', emporterS: 'آتي لأستلمه',
      yassirS: 'إلى منزلك عبر ياسير', when: 'الاستلام', asap: 'في أقرب وقت', name: 'اسمك', phone: 'هاتفك (الوفاء + الاتصال عند الحاجة)',
      pay: 'الدفع عند الشباك نقداً أو بالبطاقة عند الاستلام.', order: 'أرسل طلبي', total: 'المجموع',
      errName: 'اكتب اسمك لنناديك.', errPhone: 'رقم جزائري من 10 أرقام (05، 06 أو 07).', added: 'أضيف إلى السلة',
      tTitle: 'طلبك', tNum: 'رقمك', st_new: 'مستلم', st_prep: 'في المطبخ', st_ready: 'جاهز', st_done: 'تم الاستلام',
      tNew: 'المطبخ استلم طلبك.', tPrep: 'البرغر على الشواية 🔥', tReady: 'توجه إلى شباك Pepper برقمك.', tDone: 'بالهناء! شكراً لاختيارك Pepper.',
      eta: 'جاهز خلال حوالي', min: 'د', readyBig: 'جاهز!', newOrder: 'طلب جديد', back: 'العودة إلى القائمة', keep: 'اترك هذه الصفحة مفتوحة: هاتفك يهتز عندما يكون جاهزاً.',
      at: 'عند شباك Pepper', stamps: 'طوابع', free: 'البرغر القادم مجاني! أظهر هذه الرسالة عند الشباك.', left: 'بقي', toFree: 'قبل البرغر المجاني',
      loyalTitle: n => n + ' برغر = ' + (n + 1) + ' مجاناً', chooseBr: 'اختر مطعمك', directions: 'الاتجاهات', scheduled: 'المطعم مغلق: سيُحضَّر طلبك عند الافتتاح',
      realK: 'عند Pepper', realT: 'يُحضَّر في الحين ويُقدَّم ساخناً', r1: 'على اللوح', r2: 'جبن ذائب', r3: 'عصير طبيعي', r4: 'لوحتنا',
      band: ['حِرفيّو البرغر', 'عادي · XL · XXL', 'اطلب بدون طابور', 'غاردن سيتي · حيدرة · سيدي يحيى · عين الله', 'يُحضَّر في الحين'],
      sizes: ['عادي', 'XL', 'XXL'], cats: c => c.ar, gift: 'مجاني', yourStamps: 'طوابعك', items: 'منتجات', branchNote: 'الاستلام'
    }
  };
  const t = k => (T[lang][k] != null ? T[lang][k] : T.fr[k]);

  /* ---------- outils ---------- */
  let toastTimer;
  function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('on'), 2200); }
  function openVeil(id) { $(id).classList.add('on'); document.body.style.overflow = 'hidden'; }
  function closeVeil(id) { $(id).classList.remove('on'); if (!document.querySelector('.veil.on') && !$('#track').classList.contains('on')) document.body.style.overflow = ''; }
  document.querySelectorAll('.veil').forEach(v => v.addEventListener('click', e => { if (e.target === v) closeVeil('#' + v.id); }));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') document.querySelectorAll('.veil.on').forEach(v => closeVeil('#' + v.id)); });
  function saveCart() { me('cart', cart); renderCartBadge(); }
  function lineKey(l) { return [l.pid, l.size, l.sauce].join('|'); }
  function linePrice(l) { const p = S.product(l.pid); if (!p) return 0; return p.sizes && l.size != null ? p.sizes[l.size] : p.price; }
  function cartTotal() { return cart.reduce((a, l) => a + linePrice(l) * l.qty, 0); }
  function cartCount() { return cart.reduce((a, l) => a + l.qty, 0); }
  function br() { return S.branch(branchId); }
  function fmtH(h) { return h.replace(':00', 'h').replace(':', 'h'); }

  /* ---------- en-tête, héros, statut ---------- */
  function renderStatic() {
    document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    $('#langBtn').textContent = lang === 'ar' ? 'FR' : 'ع';
    $('#logo').innerHTML = window.PEPPER_LOGO({ sub: true });
    $('#heroLogo').innerHTML = window.PEPPER_LOGO({ sub: true, shadow: 'rgba(27,23,20,.28)' });
    $('#flogo').innerHTML = window.PEPPER_LOGO({ sub: true, ink: '#F3EADC', shadow: 'rgba(0,0,0,.5)' });
    $('#band').innerHTML = (t('band').map(esc).join('<i>✦</i>') + '<i>✦</i>').repeat(6);
    document.querySelectorAll('[data-t]').forEach(el => { const v = t(el.dataset.t); if (typeof v === 'string') el.textContent = v; });
    $('#heroTitle').innerHTML = t('heroTitle');
    $('#heroSub').textContent = branchId === 'gc' ? t('heroSubGc') : t('heroSub');
    $('#loyT').textContent = t('loyalTitle')(S.settings().loyaltyGoal);
    ['#yassirLink', '#yLink'].forEach(s => { $(s).href = D.brand.yassir; });
    $('#igLink').href = branchId === 'gc' || branchId === 'aa' ? D.brand.instagramBranch : D.brand.instagram;
    $('#fbLink').href = D.brand.facebook;
    renderStatus();
  }
  function renderStatus() {
    const b = br(), open = S.isOpen(b.id), h = S.hoursFor(b.id, new Date().getDay());
    $('#branchLbl').textContent = b.name + (b.mall ? ' · 3e' : '');
    $('#branchDot').className = 'dot' + (open ? '' : ' off');
    $('#heroDot').className = 'dot' + (open ? '' : ' off');
    $('#heroStatus').textContent = b.name + ' · ' + (open ? t('open') + ' ' + t('until') + ' ' + fmtH(h[1]) : t('closed') + ' · ' + t('opensAt') + ' ' + fmtH(h[0]));
  }

  /* ---------- signatures ---------- */
  function renderSig() {
    const p = S.product('pepper'), r = S.product('rossini'), c = S.product('chili');
    $('#sig').innerHTML =
      '<div class="big"><img src="' + img(p.img) + '" alt="' + esc(p.name) + '" loading="lazy" style="background:#FAFAF8;height:100%;object-fit:cover"><div class="tx">' +
      '<span class="kicker">N°1 · ' + esc(t('star')) + '</span><h3 class="disp">' + esc(p.name) + '</h3><p class="lead" style="margin:0">' + esc(p.desc) + '</p>' +
      '<div class="price num">' + (lang === 'ar' ? 'من ' : t('from') + ' ') + S.money(p.sizes[0]) + '</div>' +
      '<div><button class="btn btn-red" data-open="pepper">' + esc(t('add')) + ' +</button></div></div></div>' +
      '<div class="side">' + [r, c].map(cardHTML).join('') + '</div>';
  }

  /* ---------- carte ---------- */
  function cardHTML(p) {
    const out = !p.available;
    const badge = out ? '<span class="badge b-out">' + esc(t('soldout')) + '</span>' : p.star ? '<span class="badge b-star">★ ' + esc(t('star')) + '</span>' : p.hot ? '<span class="badge b-hot">🌶 ' + esc(t('hot')) + '</span>' : '';
    const price = p.price == null ? '' : (p.sizes ? '<small>' + esc(t('from')) + ' </small>' : '') + S.money(p.sizes ? p.sizes[0] : p.price);
    return '<button class="card' + (out ? ' out' : '') + '" data-open="' + p.id + '"' + (out ? ' aria-disabled="true"' : '') + '>' + badge +
      '<div class="ph"><img src="' + img(p.img) + '" alt="' + esc(p.name) + '" loading="lazy"></div>' +
      '<div class="bd"><h4>' + esc(p.name) + '</h4>' + (p.desc ? '<p>' + esc(p.desc) + '</p>' : '<p></p>') +
      '<div class="ft"><span class="price num">' + price + '</span>' + (out ? '' : '<span class="add" aria-hidden="true">+</span>') + '</div></div></button>';
  }
  function renderMenu() {
    const ps = S.products();
    $('#tabs').innerHTML = D.categories.map((c, i) => '<button class="tab' + (i ? '' : ' on') + '" data-cat="' + c.id + '">' + c.icon + ' ' + esc(t('cats')(c)) + '</button>').join('');
    $('#menu').innerHTML = D.categories.map(c => {
      const list = ps.filter(p => p.cat === c.id).sort((a, b) => (b.available - a.available));
      return '<div class="cat" id="cat-' + c.id + '"><h3 class="disp">' + esc(t('cats')(c)) + ' <small>' + list.length + '</small></h3><div class="grid">' + list.map(cardHTML).join('') + '</div></div>';
    }).join('');
  }
  $('#tabs').addEventListener('click', e => {
    const b = e.target.closest('[data-cat]'); if (!b) return;
    document.getElementById('cat-' + b.dataset.cat).scrollIntoView({ behavior: 'smooth' });
  });
  const spy = () => {
    let cur = D.categories[0].id;
    D.categories.forEach(c => { const el = document.getElementById('cat-' + c.id); if (el && el.getBoundingClientRect().top < 180) cur = c.id; });
    document.querySelectorAll('.tab').forEach(x => {
      const on = x.dataset.cat === cur;
      if (on && !x.classList.contains('on')) x.scrollIntoView({ block: 'nearest', inline: 'center' });
      x.classList.toggle('on', on);
    });
  };
  window.addEventListener('scroll', () => { requestAnimationFrame(spy); }, { passive: true });
  document.addEventListener('click', e => {
    const o = e.target.closest('[data-open]'); if (!o) return;
    const p = S.product(o.dataset.open); if (p && p.available) openProduct(p.id);
  });

  /* ---------- feuille produit ---------- */
  let sel = null;
  function openProduct(id) {
    const p = S.product(id);
    sel = { pid: id, size: p.sizes ? 0 : null, sauce: p.sauce ? p.sauce[0] : null, qty: 1, pairs: [] };
    renderProduct(); openVeil('#pVeil');
  }
  function renderProduct() {
    const p = S.product(sel.pid);
    const unit = p.sizes ? p.sizes[sel.size] : p.price;
    const pairs = D.pairings.filter(x => x !== p.id && (p.cat === 'beef' || p.cat === 'chicken' || p.cat === 'sandwich')).map(S.product).filter(x => x.available);
    const total = unit * sel.qty + sel.pairs.reduce((a, id) => a + S.product(id).price, 0);
    $('#pSheet').innerHTML =
      '<div class="ph"><img src="' + img(p.img) + '" alt="' + esc(p.name) + '"><button class="x" data-close aria-label="Fermer">×</button></div>' +
      '<div class="bd"><div><h3 class="disp" id="pName">' + esc(p.name) + '</h3>' + (p.desc ? '<p class="lead" style="margin:6px 0 0">' + esc(p.desc) + '</p>' : '') + '</div>' +
      (p.sizes ? '<div><div class="opt-t">' + esc(t('size')) + '</div><div class="seg" style="margin-top:8px">' + p.sizes.map((v, i) =>
        '<button data-size="' + i + '" class="' + (i === sel.size ? 'on' : '') + '"><b>' + esc(t('sizes')[i]) + '</b><small class="num">' + S.money(v) + '</small></button>').join('') + '</div></div>' : '') +
      (p.sauce ? '<div><div class="opt-t">' + esc(t('sauce')) + '</div><div class="seg two" style="margin-top:8px">' + p.sauce.map(s =>
        '<button data-sauce="' + esc(s) + '" class="' + (s === sel.sauce ? 'on' : '') + '"><b>' + esc(s) + '</b></button>').join('') + '</div></div>' : '') +
      (pairs.length ? '<div><div class="opt-t">' + esc(t('withIt')) + '</div><div class="pair" style="margin-top:8px">' + pairs.map(x =>
        '<button data-pair="' + x.id + '" class="' + (sel.pairs.includes(x.id) ? 'on' : '') + '"><img src="' + img(x.img) + '" alt="">' + esc(x.name) + ' <span class="num" style="color:var(--muted)">+' + S.money(x.price) + '</span></button>').join('') + '</div></div>' : '') +
      '<div class="qty"><span class="opt-t">' + esc(t('qty')) + '</span><button data-q="-1" aria-label="Moins">−</button><b class="num">' + sel.qty + '</b><button data-q="1" aria-label="Plus">+</button></div></div>' +
      '<div class="cta"><button class="btn btn-red" data-addcart>' + esc(t('add')) + ' · <span class="num">' + S.money(total) + '</span></button></div>';
  }
  $('#pSheet').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.hasAttribute('data-close')) return closeVeil('#pVeil');
    if (b.dataset.size) sel.size = +b.dataset.size;
    if (b.dataset.sauce) sel.sauce = b.dataset.sauce;
    if (b.dataset.q) sel.qty = Math.max(1, Math.min(20, sel.qty + +b.dataset.q));
    if (b.dataset.pair) { const i = sel.pairs.indexOf(b.dataset.pair); i < 0 ? sel.pairs.push(b.dataset.pair) : sel.pairs.splice(i, 1); }
    if (b.hasAttribute('data-addcart')) {
      addLine({ pid: sel.pid, size: sel.size, sauce: sel.sauce, qty: sel.qty });
      sel.pairs.forEach(id => addLine({ pid: id, size: null, sauce: null, qty: 1 }));
      closeVeil('#pVeil'); toast('✓ ' + S.product(sel.pid).name + ' ' + t('added'));
      return;
    }
    renderProduct();
  });
  function addLine(l) {
    const k = lineKey(l); const ex = cart.find(x => lineKey(x) === k);
    if (ex) ex.qty += l.qty; else cart.push(l);
    saveCart();
  }

  /* ---------- panier ---------- */
  function renderCartBadge() {
    const n = cartCount();
    $('#cartCount').textContent = n;
    $('#floatCart').classList.toggle('on', n > 0);
    $('#floatLbl').textContent = t('viewCart') + ' · ' + n + ' ' + t('items');
    $('#floatTot').textContent = S.money(cartTotal());
  }
  function slots() {
    const b = br(), now = new Date(), h = S.hoursFor(b.id, now.getDay());
    const [ch, cm] = h[1].split(':').map(Number); const close = new Date(now); close.setHours(ch, cm, 0, 0);
    const out = []; const d = new Date(now.getTime() + 20 * 60000); d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
    while (d < close && out.length < 12) { out.push(d.toTimeString().slice(0, 5)); d.setMinutes(d.getMinutes() + 15); }
    return out;
  }
  function renderCart(errs) {
    errs = errs || {};
    const b = br(), open = S.isOpen(b.id);
    if (!cart.length) {
      $('#cSheet').innerHTML = '<div class="bd" style="position:relative;text-align:center;padding:40px 20px"><button class="x" data-close aria-label="Fermer">×</button><div style="font-size:54px">🍔</div><h3 class="disp">' + esc(t('empty')) + '</h3><p class="lead" style="margin:0 auto">' + esc(t('emptyP')) + '</p></div>';
      return;
    }
    const f = me('form') || {};
    $('#cSheet').innerHTML =
      '<div class="bd" style="position:relative"><button class="x" data-close aria-label="Fermer">×</button><h3 class="disp">' + esc(t('cart')) + '</h3>' +
      '<div>' + cart.map((l, i) => { const p = S.product(l.pid); return '<div class="line"><img src="' + img(p.img) + '" alt=""><div class="nm"><b>' + esc(p.name) + '</b><small>' +
        [l.size != null ? t('sizes')[l.size] : '', l.sauce ? t('sauce') + ' ' + l.sauce : ''].filter(Boolean).map(esc).join(' · ') + '</small><small class="num">' + S.money(linePrice(l)) + '</small></div>' +
        '<div class="mini"><button data-l="' + i + '" data-d="-1" aria-label="Moins">−</button><b class="num">' + l.qty + '</b><button data-l="' + i + '" data-d="1" aria-label="Plus">+</button></div></div>'; }).join('') + '</div>' +
      '<div class="tot"><span>' + esc(t('total')) + '</span><span class="num">' + S.money(cartTotal()) + '</span></div>' +
      '<div><div class="opt-t">' + esc(t('modeT')) + '</div><div class="modes" style="margin-top:8px">' +
        '<button class="mode' + (mode === 'surplace' ? ' on' : '') + '" data-mode="surplace"><span class="ic">🍽️</span><strong>' + esc(t('surplace')) + '</strong><small>' + esc(t('surplaceS')) + '</small></button>' +
        '<button class="mode' + (mode === 'emporter' ? ' on' : '') + '" data-mode="emporter"><span class="ic">🛍️</span><strong>' + esc(t('emporter')) + '</strong><small>' + esc(t('emporterS')) + '</small></button>' +
        '<a class="mode" href="' + D.brand.yassir + '" target="_blank" rel="noopener"><span class="ic">🛵</span><strong>' + esc(t('delivery')) + '</strong><small>' + esc(t('yassirS')) + '</small></a>' +
      '</div></div>' +
      (mode === 'emporter' ? '<div class="field"><label for="fWhen">' + esc(t('when')) + ' · ' + esc(b.name) + '</label><select id="fWhen"><option value="">' + esc(t('asap')) + '</option>' + slots().map(s => '<option>' + s + '</option>').join('') + '</select></div>' : '') +
      '<div class="field"><label for="fName">' + esc(t('name')) + '</label><input id="fName" autocomplete="given-name" value="' + esc(f.name || '') + '"><div class="err">' + esc(errs.name || '') + '</div></div>' +
      '<div class="field"><label for="fPhone">' + esc(t('phone')) + '</label><input id="fPhone" inputmode="tel" autocomplete="tel" placeholder="0X XX XX XX XX" value="' + esc(f.phone || '') + '"><div class="err">' + esc(errs.phone || '') + '</div></div>' +
      '<div class="note">📍 ' + esc(t('branchNote')) + ' : <b>Pepper ' + esc(b.name) + '</b>, ' + esc(lang === 'ar' ? b.placeAr : b.place) + '<br>💳 ' + esc(t('pay')) + (open ? '' : '<br>⏰ ' + esc(t('scheduled')) + ' (' + fmtH(S.hoursFor(b.id, new Date().getDay())[0]) + ').') + '</div>' +
      '</div><div class="cta"><button class="btn btn-red" data-send>' + esc(t('order')) + ' · <span class="num">' + S.money(cartTotal()) + '</span></button></div>';
  }
  function openCart() { renderCart(); openVeil('#cVeil'); }
  $('#cartBtn').addEventListener('click', openCart);
  $('#floatBtn').addEventListener('click', openCart);
  $('#cSheet').addEventListener('input', e => { if (e.target.id === 'fName' || e.target.id === 'fPhone') me('form', { name: $('#fName').value, phone: $('#fPhone').value }); });
  $('#cSheet').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.hasAttribute('data-close')) return closeVeil('#cVeil');
    if (b.dataset.l) { const l = cart[+b.dataset.l]; l.qty += +b.dataset.d; if (l.qty <= 0) cart.splice(+b.dataset.l, 1); saveCart(); renderCart(); return; }
    if (b.dataset.mode) { mode = b.dataset.mode; me('mode', mode); renderCart(); return; }
    if (b.hasAttribute('data-send')) send();
  });
  function send() {
    const name = $('#fName').value.trim(), phone = S.cleanPhone($('#fPhone').value);
    const errs = {};
    if (!name) errs.name = t('errName');
    if (!/^0[567]\d{8}$/.test(phone)) errs.phone = t('errPhone');
    if (Object.keys(errs).length) { renderCart(errs); return; }
    const items = cart.map(l => ({ pid: l.pid, size: l.size, sauce: l.sauce, qty: l.qty, price: linePrice(l) }));
    const o = S.addOrder({ branch: branchId, mode, pickupAt: mode === 'emporter' && $('#fWhen') ? $('#fWhen').value : '', items, total: cartTotal(), name, phone, source: 'web', paid: false });
    cart = []; saveCart(); me('active', o.id);
    closeVeil('#cVeil'); openTrack(o.id);
    unlockAudio();
  }

  /* ---------- suivi en direct ---------- */
  let lastStatus = null, actx = null;
  function unlockAudio() { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); actx.resume(); } catch (e) { /* pas de son */ } }
  function ding() {
    try {
      if (!actx) return;
      [880, 1175, 1568].forEach((f, i) => { const o = actx.createOscillator(), g = actx.createGain(); o.frequency.value = f; o.connect(g); g.connect(actx.destination);
        const t0 = actx.currentTime + i * .16; g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(.3, t0 + .02); g.gain.exponentialRampToValueAtTime(.0001, t0 + .4); o.start(t0); o.stop(t0 + .42); });
    } catch (e) { /* pas de son */ }
  }
  function openTrack(id) { lastStatus = null; renderTrack(id); $('#track').classList.add('on'); document.body.style.overflow = 'hidden'; }
  function renderTrack(id) {
    const o = S.getOrder(id); if (!o) { $('#track').classList.remove('on'); me('active', null); return; }
    const b = S.branch(o.branch);
    const order = ['new', 'prep', 'ready'];
    const idx = o.status === 'done' ? 3 : order.indexOf(o.status);
    const prep = S.settings().prepMin;
    const left = Math.max(1, Math.round(prep - (Date.now() - o.t.created) / 60000));
    const msg = { new: t('tNew'), prep: t('tPrep'), ready: t('tReady'), done: t('tDone') }[o.status] || '';
    $('#track').innerHTML = '<div class="wrap">' +
      '<div style="width:200px;margin:0 auto">' + window.PEPPER_LOGO({}) + '</div>' +
      '<div class="ticket' + (o.status === 'ready' ? ' ready' : '') + '"><span class="kicker">' + esc(t('tNum')) + '</span><div class="n num">' + o.num + '</div>' +
      '<div class="ready-banner">' + esc(t('readyBig')) + '</div>' +
      '<p style="margin:4px 0 0;font-size:17px">' + esc(msg) + '</p>' +
      (o.status === 'new' || o.status === 'prep' ? '<p style="margin:0;color:var(--muted)">' + esc(t('eta')) + ' <b class="num">' + left + ' ' + esc(t('min')) + '</b> · ' + esc(t('at')) + ' ' + esc(b.name) + (b.mall ? ' (3e)' : '') + '</p>' : '') + '</div>' +
      '<div class="prog">' + order.map((s, i) => '<div class="' + (i <= idx ? 'on' : '') + (i === idx && o.status !== 'ready' ? ' now' : '') + '"><i></i>' + esc(t('st_' + s)) + '</div>').join('') + '</div>' +
      (o.status === 'done' || o.status === 'ready' ? '' : '<p class="note">📳 ' + esc(t('keep')) + '</p>') +
      '<div class="recap"><b>' + esc(o.name) + '</b> · ' + esc(o.mode === 'emporter' ? t('emporter') + (o.pickupAt ? ' · ' + o.pickupAt : '') : t('surplace')) + '<br>' +
      o.items.map(i => i.qty + ' × ' + esc(S.product(i.pid).name) + (i.size != null ? ' ' + esc(t('sizes')[i.size]) : '') + (i.sauce ? ' (' + esc(i.sauce) + ')' : '')).join('<br>') +
      '<div class="tot"><span>' + esc(t('total')) + '</span><span class="num">' + S.money(o.total) + '</span></div><small style="color:var(--muted)">💳 ' + esc(t('pay')) + '</small></div>' +
      '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><button class="btn btn-ghost" data-tclose>' + esc(o.status === 'done' ? t('newOrder') : t('back')) + '</button></div>' +
      '</div>';
    if (lastStatus && lastStatus !== o.status && o.status === 'ready') { ding(); try { navigator.vibrate && navigator.vibrate([300, 120, 300, 120, 500]); } catch (e) { /* non supporté */ } }
    lastStatus = o.status;
  }
  $('#track').addEventListener('click', e => {
    if (!e.target.closest('[data-tclose]')) return;
    const o = S.getOrder(me('active'));
    if (o && o.status === 'done') me('active', null);
    $('#track').classList.remove('on'); document.body.style.overflow = '';
  });

  /* ---------- fidélité ---------- */
  function renderStamps(n) {
    const goal = S.settings().loyaltyGoal; const k = n % (goal + 1);
    $('#stamps').style.gridTemplateColumns = 'repeat(' + (goal + 1) + ',1fr)';
    $('#stamps').innerHTML = Array.from({ length: goal + 1 }, (_, i) => i === goal ? '<span class="stamp gift">' + esc(t('gift')) + '</span>' : '<span class="stamp' + (i < k ? ' on' : '') + '">' + (i < k ? '🍔' : '') + '</span>').join('');
    return { k, goal };
  }
  $('#loyForm').addEventListener('submit', e => {
    e.preventDefault();
    const ph = S.cleanPhone($('#loyPhone').value);
    if (!/^0[567]\d{8}$/.test(ph)) { $('#loyMsg').textContent = t('errPhone'); return; }
    const n = S.stamps(ph); const r = renderStamps(n);
    $('#loyMsg').textContent = r.k >= r.goal ? '🎉 ' + t('free') : t('yourStamps') + ' : ' + r.k + ' / ' + r.goal + ' · ' + t('left') + ' ' + (r.goal - r.k) + ' ' + t('toFree');
  });

  /* ---------- restaurants ---------- */
  function renderBranches() {
    const day = new Date().getDay();
    const html = D.branches.map(b => { const h = S.hoursFor(b.id, day), open = S.isOpen(b.id);
      return '<div class="br' + (b.id === branchId ? ' on' : '') + '"><h4>' + esc(b.name) + '</h4><small>' + esc(lang === 'ar' ? b.placeAr : b.place) + ' · ' + esc(b.area) + '</small>' +
        '<span class="chip" style="width:max-content"><span class="dot' + (open ? '' : ' off') + '"></span>' + (open ? t('open') : t('closed')) + ' · <span class="num">' + fmtH(h[0]) + '–' + fmtH(h[1]) + '</span></span>' +
        '<div style="display:flex;gap:14px;flex-wrap:wrap"><button class="btn btn-ghost" style="padding:8px 14px" data-br="' + b.id + '">' + (b.id === branchId ? '✓ ' : '') + esc(b.name) + '</button><a href="' + b.maps + '" target="_blank" rel="noopener" style="align-self:center">' + esc(t('directions')) + ' →</a></div></div>'; }).join('');
    $('#branches').innerHTML = html;
    $('#bSheet').innerHTML = '<div class="bd" style="position:relative"><button class="x" data-close aria-label="Fermer">×</button><h3 class="disp">' + esc(t('chooseBr')) + '</h3><div class="branches" style="grid-template-columns:1fr">' + html + '</div></div>';
  }
  function setBranch(id) { branchId = id; me('branch', id); renderAll(); closeVeil('#bVeil'); toast('📍 Pepper ' + br().name); }
  document.addEventListener('click', e => { const b = e.target.closest('[data-br]'); if (b) setBranch(b.dataset.br); });
  $('#branchBtn').addEventListener('click', () => openVeil('#bVeil'));
  $('#bSheet').addEventListener('click', e => { if (e.target.closest('[data-close]')) closeVeil('#bVeil'); });
  $('#langBtn').addEventListener('click', () => { lang = lang === 'fr' ? 'ar' : 'fr'; me('lang', lang); renderAll(); });

  function renderAll() {
    renderStatic(); renderSig(); renderMenu(); renderBranches(); renderStamps(0); renderCartBadge();
    if ($('#cVeil').classList.contains('on')) renderCart();
    if ($('#track').classList.contains('on')) renderTrack(me('active'));
  }

  /* ---------- synchronisation avec la cuisine / le gérant ---------- */
  S.on(k => {
    if (k === 'orders' && $('#track').classList.contains('on')) renderTrack(me('active'));
    if (k === 'menu' || k === 'settings') { renderAll(); }
  });
  setInterval(() => { renderStatus(); if ($('#track').classList.contains('on')) renderTrack(me('active')); }, 30000);

  renderAll();
  const act = me('active'); const ao = act && S.getOrder(act);
  if (ao && ao.status !== 'done') openTrack(act);
})();
