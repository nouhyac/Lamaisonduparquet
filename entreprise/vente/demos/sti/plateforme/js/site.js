/* STI Bureautique · site public : catalogue, fiche, conseiller, configurateur, panier, devis */
(function () {
  'use strict';
  const X = window.STIX, STI = X.STI, esc = X.esc, money = X.money;
  const $ = s => document.querySelector(s), $$ = s => document.querySelectorAll(s);

  /* ---------- textes FR / AR ---------- */
  const T = {
    fr: {},
    ar: { skip: 'انتقل إلى المنتجات', nCat: 'المنتجات', nQuiz: 'اختر كرسيك', nPack: 'تجهيز مكتب', nPro: 'المؤسسات', nShow: 'المعرض', devis: 'عرض سعر',
      hK: 'أثاث مكتبي · جملة وتجزئة', hT: 'مكاتب <em>تعمل فيها أفضل.</em>', hP: 'كراسي مريحة، كراسي المدراء، مكاتب وخزائن معدنية: 87 موديلاً بأسعار معروضة، للأفراد والمؤسسات.', hC1: 'تصفح المنتجات', hC2: 'جهّز مؤسستي',
      p1: '🚚 توصيل إلى 58 ولاية', p2: '💵 الدفع عند الاستلام', p3: '📄 عرض سعر للمؤسسات خلال 24 ساعة', p4: '🔁 تعويض المنتج التالف', from: 'ابتداءً من', refT: 'وثقوا بنا',
      cK: 'تشكيلاتنا', cT: 'اختر حسب الاستعمال', kCat: 'المنتجات', models: 'موديل متوفر', qP: 'ابحث: مريح، 1m60، جلد…', s0: 'الأنسب', s1: 'السعر تصاعدياً', s2: 'السعر تنازلياً', s3: 'الاسم', budget: 'الميزانية القصوى', none: 'لا يوجد موديل مطابق. راسلنا: قد يكون متوفراً في المعرض.', more: 'عرض المزيد',
      qK: 'مستشار في 3 أسئلة', qT: 'أي كرسي يناسبك؟', qzP: 'أجب عن 3 أسئلة ونقترح عليك من الكتالوج الموديلات المناسبة لاستعمالك وميزانيتك.', pkK: 'أداة المؤسسات', pkT: 'جهّز مكاتبك في دقيقة', pkP: 'اختر عدد المكاتب والموديلات: يُحسب المجموع بأسعار الكتالوج. أرسله كطلب عرض سعر ونرد خلال 24 ساعة.',
      proK: 'مؤسسات، إدارات، مهن حرة', proT: 'محاور واحد لتجهيز موقع كامل', b1T: 'عرض سعر خلال 24 ساعة', b1P: 'أرسل قائمتك أو استعمل الأداة: عرض سعر تجاري خلال 24 ساعة وملف جبائي مطابق.', b2T: 'جملة وتجزئة', b2P: 'من كرسي واحد إلى تجهيز طابق كامل، في مكان واحد.', b3T: '58 ولاية', b3P: 'شحن إلى كل الجزائر والدفع عند الاستلام. كل منتج تالف يُعوَّض.', proC: 'اطلب عرض سعر', proW: 'تحدث مع مستشار',
      shK: 'المعرض', shT: 'تعال وجرّبها', shP: 'اجلس، اضبط، قارن: أهم موديلاتنا معروضة في المعرض.', route: 'الاتجاهات', fT: 'أثاث مكتبي · جملة وتجزئة · الجزائر العاصمة',
      add: 'أضف إلى السلة', addDv: '+ عرض سعر', see: 'التفاصيل', added: 'تمت الإضافة إلى السلة', addedDv: 'أُضيف إلى عرض السعر', colors: 'ألوان', sizes: 'مقاسات', onOrder: 'حسب الطلب', best: 'الأكثر مبيعاً', qtyL: 'الكمية', askWa: 'سؤال عبر واتساب',
      tk1: '🚚 توصيل إلى 58 ولاية · الدفع عند الاستلام', tk2: '🔁 كل منتج تالف يُعوَّض', tk3: '🏢 للمؤسسات: عرض سعر خلال 24 ساعة', cart: 'سلتي', dv: 'طلب عرض سعر', empty: 'السلة فارغة.', emptyDv: 'لا توجد منتجات في عرض السعر بعد.', goCat: 'تصفح المنتجات',
      sub: 'المجموع الفرعي', del: 'التوصيل', tot: 'المجموع', delTel: 'يُؤكد بالهاتف', free: 'مجاني', plusDel: '+ التوصيل', mDel: 'توصيل', mDelS: '58 ولاية', mPick: 'استلام', mPickS: 'من المعرض، المحمدية', name: 'الاسم واللقب', phone: 'الهاتف', wil: 'الولاية', com: 'البلدية', adr: 'العنوان (اختياري)', choose: 'اختر…', srcL: 'كيف عرفتنا؟',
      order: 'تأكيد الطلب', pay: 'الدفع عند الاستلام. نتصل بك للتأكيد.', eName: 'أدخل اسمك', ePhone: 'رقم الهاتف غير صحيح', eWil: 'اختر ولايتك', eCom: 'أدخل بلديتك', eCo: 'أدخل اسم المؤسسة', ok: 'تم إرسال الطلب!', okP: 'شكراً {n}. سنتصل بك على {p} للتأكيد.', okWa: 'أرسل أيضاً عبر واتساب', back: 'مواصلة التصفح',
      co: 'المؤسسة', ct: 'الشخص المسؤول', em: 'البريد الإلكتروني (اختياري)', nif: 'NIF / RC (اختياري)', msg: 'رسالة (آجال، تركيب…)', sendDv: 'إرسال طلب عرض السعر', dvNote: 'عرض سعر تجاري خلال 24 ساعة، أسعار شاملة الرسوم. لا التزام.', okDv: 'تم إرسال الطلب!', okDvP: 'رقم الطلب {r}. سنرسل لك عرض السعر خلال 24 ساعة على {p}.', toDv: 'إرسال إلى عرض السعر', postes: 'مكاتب عمل', pDesk: 'المكتب', pChair: 'الكرسي', pStore: 'خزائن', pVis: 'كراسي الزوار', pBoss: 'كراسي المدراء', pTot: 'المجموع التقديري', pTtc: 'بالأسعار المعروضة، شامل الرسوم', pNo: '— بدون —',
      qs: 'سؤال {i} من 3', q1: 'لأي استعمال؟', q2: 'كم ساعة جلوس يومياً؟', q3: 'ميزانيتك للكرسي؟', qRes: 'اقتراحاتنا لك', qAgain: 'إعادة', qMatch: 'التوافق' }
  };
  const FR = { add: 'Ajouter au panier', addDv: '+ Devis', see: 'Voir la fiche', added: 'Ajouté au panier', addedDv: 'Ajouté au devis', colors: 'coloris', sizes: 'tailles', onOrder: 'Sur commande', best: 'Meilleure vente', qtyL: 'Quantité', askWa: 'Une question sur WhatsApp',
    tk1: '🚚 Livraison 58 wilayas · paiement à la livraison', tk2: '🔁 Tout produit endommagé est remplacé', tk3: '🏢 Entreprises : devis sous 24 h', cart: 'Mon panier', dv: 'Ma demande de devis', empty: 'Votre panier est vide.', emptyDv: 'Aucun article dans votre devis pour l\'instant.', goCat: 'Voir le catalogue',
    sub: 'Sous-total', del: 'Livraison', tot: 'Total', delTel: 'confirmée par téléphone', free: 'offerte', plusDel: '+ livraison', mDel: 'Livraison', mDelS: '58 wilayas', mPick: 'Retrait', mPickS: 'au showroom, Mohammadia', name: 'Nom et prénom', phone: 'Téléphone', wil: 'Wilaya', com: 'Commune', adr: 'Adresse (facultatif)', choose: 'Choisir…', srcL: 'Comment nous avez-vous connus ?',
    order: 'Valider la commande', pay: 'Paiement à la livraison. Nous vous appelons pour confirmer.', eName: 'Indiquez votre nom', ePhone: 'Numéro invalide (ex. 0555 12 34 56)', eWil: 'Choisissez votre wilaya', eCom: 'Indiquez votre commune', eCo: 'Indiquez le nom de l\'entreprise', ok: 'Commande envoyée !', okP: 'Merci {n}. Nous vous appelons au {p} pour confirmer.', okWa: 'Envoyer aussi sur WhatsApp', back: 'Continuer',
    co: 'Entreprise / organisme', ct: 'Nom du contact', em: 'E-mail (facultatif)', nif: 'NIF / RC (facultatif)', msg: 'Message (délais, montage, quantités…)', sendDv: 'Envoyer la demande de devis', dvNote: 'Devis commercial sous 24 h, prix TTC, sans engagement.', okDv: 'Demande envoyée !', okDvP: 'Demande n° {r}. Nous vous envoyons votre devis sous 24 h au {p}.', toDv: 'Envoyer en demande de devis', postes: 'Postes de travail', pDesk: 'Bureau', pChair: 'Chaise', pStore: 'Rangements', pVis: 'Chaises visiteurs', pBoss: 'Fauteuils de direction', pTot: 'Total estimé', pTtc: 'aux prix du catalogue, TTC', pNo: '— Aucun —',
    qs: 'Question {i} sur 3', q1: 'Pour quel usage ?', q2: 'Combien d\'heures assis par jour ?', q3: 'Votre budget pour la chaise ?', qRes: 'Nos recommandations', qAgain: 'Recommencer', qMatch: 'Correspondance' };
  let lang = 'fr'; try { lang = localStorage.getItem('sti-lang') || 'fr'; } catch (e) { /* bloqué */ }
  const FRX = {}; $$('[data-t]').forEach(el => { FRX[el.dataset.t] = el.hasAttribute('data-html') ? el.innerHTML : el.textContent; });
  const d = k => (lang === 'ar' && T.ar[k] != null && T.ar[k] !== '') ? T.ar[k] : FR[k] != null ? FR[k] : FRX[k] != null ? FRX[k] : k;
  const catName = c => lang === 'ar' ? (X.CAT_AR[c] || c) : c;
  let tt; const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2300); };
  const wa = msg => 'https://wa.me/' + STI.whatsapp + (msg ? '?text=' + encodeURIComponent(msg) : '');
  const img = (p, i) => p.img && p.img.length ? '<img src="' + esc(p.img[i || 0] || p.img[0]) + '" alt="' + esc(p.name) + '" loading="lazy">' : '';
  const live = () => X.products().filter(p => p.web);

  /* ---------- paniers (propres au navigateur) ---------- */
  const ls = (k, d0) => { try { return JSON.parse(localStorage.getItem('stic-' + k) || 'null') || d0; } catch (e) { return d0; } };
  const lsSet = (k, v) => { try { localStorage.setItem('stic-' + k, JSON.stringify(v)); } catch (e) { /* bloqué */ } };
  let cart = ls('cart', []), dv = ls('dv', []);
  const clean = L => L.filter(l => { const p = X.prod(l.pid); return p && p.web && p.v[l.vi]; });
  function badges(which) { cart = clean(cart); dv = clean(dv); $('#ctN').textContent = cart.reduce((a, l) => a + l.qty, 0); $('#dvN').textContent = dv.reduce((a, l) => a + l.qty, 0); if (which) { const b = $(which); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); } }
  function addTo(list, pid, vi, qty) { const l = list.find(x => x.pid === pid && x.vi === vi); if (l) l.qty = Math.min(999, l.qty + qty); else list.push({ pid, vi, qty }); }
  function addCart(pid, vi, qty) { addTo(cart, pid, vi || 0, qty || 1); lsSet('cart', cart); badges('#ctB'); X.track('cart', pid); toast('✓ ' + d('added')); }
  function addDevis(pid, vi, qty, silent) { addTo(dv, pid, vi || 0, qty || 1); lsSet('dv', dv); badges('#dvB'); X.track('devis', pid); if (!silent) toast('✓ ' + d('addedDv')); }

  /* ---------- références, catégories ---------- */
  function renderRefs() { $('#refs').innerHTML = STI.refs.map(([f, n]) => '<img src="img/ref/' + f + '.webp" alt="' + esc(n) + '" title="' + esc(n) + '" loading="lazy">').join(''); }
  let cat = '', q = '', sort = '', pmax = 650000, shown = 24;
  function renderCats() {
    const P = live();
    $('#cats').innerHTML = X.CATS.filter(c => P.some(p => p.cat === c)).map(c => { const L = P.filter(p => p.cat === c), rep = L.find(p => p.img.length) || L[0];
      return '<button class="cat" data-cat="' + esc(c) + '">' + (rep ? img(rep) : '') + '<b>' + esc(catName(c)) + '</b><small>' + L.length + ' · ' + d('from') + ' ' + money(Math.min(...L.map(X.minP))) + '</small></button>'; }).join('');
  }
  document.addEventListener('click', e => { const c = e.target.closest('[data-cat]'); if (c) { cat = c.dataset.cat; shown = 24; renderGrid(); $('#catalogue').scrollIntoView({ behavior: 'smooth' }); } });

  /* ---------- catalogue ---------- */
  function filtered() {
    let R = live().filter(p => (!cat || p.cat === cat) && X.minP(p) <= pmax && (!q || (p.name + ' ' + p.raw + ' ' + p.cat + ' ' + p.v.map(v => v.t).join(' ') + ' ' + p.b.join(' ')).toLowerCase().includes(q.toLowerCase())));
    if (sort === 'pa') R.sort((a, b) => X.minP(a) - X.minP(b)); else if (sort === 'pd') R.sort((a, b) => X.minP(b) - X.minP(a)); else if (sort === 'n') R.sort((a, b) => a.name.localeCompare(b.name, 'fr')); else R.sort((a, b) => (b.best - a.best));
    return R;
  }
  function card(p) {
    const mn = X.minP(p), mx = X.maxP(p), o = p.v[0].o, out = p.stock === 0;
    return '<article class="card">' + (p.best ? '<span class="badge">' + d('best') + '</span>' : '') + '<button class="im" data-open="' + esc(p.id) + '" aria-label="' + esc(d('see') + ' : ' + p.name) + '">' + img(p) + '</button><div class="bd"><span class="ct">' + esc(catName(p.cat)) + '</span><h3><button data-open="' + esc(p.id) + '">' + esc(p.name) + '</button></h3>' +
      '<div class="pr">' + (mn !== mx ? '<small>' + d('from') + '</small>' : '') + '<b>' + money(mn) + '</b>' + (o ? '<s>' + money(o) + '</s>' : '') + '</div>' +
      (p.v.length > 1 ? '<span class="sw">' + p.v.length + ' ' + (p.opt.join(' ').match(/col|coul/i) ? d('colors') : d('sizes')) + '</span>' : '') + (out ? '<span class="sw" style="color:#B45309">' + d('onOrder') + '</span>' : '') +
      '<div class="cacts"><button class="btn btn-red sm" data-add="' + esc(p.id) + '">' + d('add') + '</button><button class="ib" data-adv="' + esc(p.id) + '" aria-label="' + esc(d('addDv') + ' : ' + p.name) + '">' + d('addDv') + '</button></div></div></article>';
  }
  function renderGrid() {
    const P = live(), cs = X.CATS.filter(c => P.some(p => p.cat === c)), R = filtered();
    $('#ctCount').textContent = P.length;
    $('#chips').innerHTML = [''].concat(cs).map(c => '<button data-c="' + esc(c) + '" aria-pressed="' + (c === cat) + '">' + esc(c ? catName(c) : (lang === 'ar' ? 'الكل' : 'Tout')) + '<small>' + (c ? P.filter(p => p.cat === c).length : P.length) + '</small></button>').join('');
    $('#grid').innerHTML = R.slice(0, shown).map(card).join('');
    $('#none').hidden = R.length > 0; $('#moreB').hidden = R.length <= shown;
  }
  $('#chips').addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (b) { cat = b.dataset.c; shown = 24; renderGrid(); } });
  $('#q').addEventListener('input', e => { q = e.target.value; shown = 24; renderGrid(); });
  $('#sort').addEventListener('change', e => { sort = e.target.value; renderGrid(); });
  $('#pmax').addEventListener('input', e => { pmax = +e.target.value; $('#pmaxV').textContent = money(pmax); shown = 24; renderGrid(); });
  $('#moreB').onclick = () => { shown += 24; renderGrid(); };

  /* ---------- fiche produit ---------- */
  let lastFocus = null, cur = null;
  function openSheet(id) {
    const p = X.prod(id); if (!p) return; lastFocus = document.activeElement; cur = { p, vi: 0, qty: 1, im: 0 }; X.track('view', id); renderSheet();
    $('#ov').hidden = false; $('#sheet').hidden = false; document.body.style.overflow = 'hidden'; $('#shX').focus();
  }
  function renderSheet() {
    const { p, vi, qty, im } = cur, v = p.v[vi];
    $('#shBody').innerHTML = '<div class="shb"><div class="gal"><div class="main">' + img(p, im) + '</div>' + (p.img.length > 1 ? '<div class="thumbs">' + p.img.map((s, i) => '<button data-th="' + i + '" aria-pressed="' + (i === im) + '" aria-label="Photo ' + (i + 1) + '"><img src="' + esc(s) + '" alt=""></button>').join('') + '</div>' : '') + '</div>' +
      '<div class="sinfo"><span class="kick dk">' + esc(catName(p.cat)) + '</span><h2 id="shName">' + esc(p.name) + '</h2><div class="pr"><b style="font-size:28px">' + money(v.p) + '</b>' + (v.o ? '<s>' + money(v.o) + '</s>' : '') + '<small>TTC</small></div>' +
      (p.v.length > 1 ? '<div><div class="f"><label>' + esc(p.opt.join(' · ') || 'Option') + '</label></div><div class="vsel" role="group">' + p.v.map((x, i) => '<button data-vi="' + i + '" aria-pressed="' + (i === vi) + '">' + esc(x.t) + (x.p !== p.v[0].p ? ' · ' + money(x.p) : '') + '</button>').join('') + '</div></div>' : '') +
      (p.b.length ? '<ul>' + p.b.slice(0, 8).map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '') +
      '<div class="srow"><span class="f"><label>' + d('qtyL') + '</label></span><div class="qty"><button data-sq="-1" aria-label="−">−</button><b>' + qty + '</b><button data-sq="1" aria-label="+">+</button></div>' + (p.stock === 0 ? '<span class="sw" style="color:#B45309">' + d('onOrder') + '</span>' : '') + '</div>' +
      '<div class="sacts"><button class="btn btn-red" data-sadd="1">' + d('add') + '</button><button class="btn btn-blue" data-sdv="1">' + d('addDv') + '</button></div>' +
      '<a class="btn btn-ln sm" href="' + esc(wa('Bonjour STI Bureautique, une question sur : ' + X.lineName(p, vi) + ' (' + money(v.p) + ').')) + '" target="_blank" rel="noopener" data-wa="1">💬 ' + d('askWa') + '</a>' +
      '<div class="ticks"><span>' + d('tk1') + '</span><span>' + d('tk2') + '</span><span>' + d('tk3') + '</span></div></div></div>';
  }
  $('#sheet').addEventListener('click', e => {
    const t = e.target.closest('[data-th]'); if (t) { cur.im = +t.dataset.th; renderSheet(); return; }
    const v = e.target.closest('[data-vi]'); if (v) { cur.vi = +v.dataset.vi; renderSheet(); return; }
    const s = e.target.closest('[data-sq]'); if (s) { cur.qty = Math.max(1, Math.min(999, cur.qty + +s.dataset.sq)); renderSheet(); return; }
    if (e.target.closest('[data-sadd]')) { addCart(cur.p.id, cur.vi, cur.qty); closeAll(); openDrawer('cart'); return; }
    if (e.target.closest('[data-sdv]')) { addDevis(cur.p.id, cur.vi, cur.qty); return; }
  });
  function closeAll() { $('#ov').hidden = true; $('#sheet').hidden = true; $('#drawer').hidden = true; document.body.style.overflow = ''; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  $('#shX').onclick = closeAll; $('#ov').onclick = closeAll; $('#drX').onclick = closeAll;
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && (!$('#sheet').hidden || !$('#drawer').hidden)) closeAll(); });
  document.addEventListener('click', e => {
    const o = e.target.closest('[data-open]'); if (o) { openSheet(o.dataset.open); return; }
    const a = e.target.closest('[data-add]'); if (a) { addCart(a.dataset.add, 0, 1); return; }
    const b = e.target.closest('[data-adv]'); if (b) { addDevis(b.dataset.adv, 0, 1); return; }
    if (e.target.closest('[data-wa], .waf, #waB, #proWa')) X.track('wa');
  });

  /* ---------- conseiller (3 questions) ---------- */
  const QZ = [
    { k: 'use', o: [['op', 'Accueil, opérateur', 'Poste polyvalent', 'مكتب استقبال أو موظف'], ['screen', 'Écran toute la journée', 'Informatique, comptabilité…', 'العمل على الشاشة طوال اليوم'], ['boss', 'Cadre, direction', 'Bureau de responsable', 'إطار أو مدير'], ['game', 'Gaming', 'Jeu, streaming', 'ألعاب'], ['vis', 'Visiteurs, réunion', 'Salle d\'attente, réunion', 'زوار واجتماعات']] },
    { k: 'h', o: [['1', 'Moins de 4 h', '', 'أقل من 4 ساعات'], ['2', '4 à 8 h', '', 'من 4 إلى 8 ساعات'], ['3', 'Plus de 8 h', '', 'أكثر من 8 ساعات']] },
    { k: 'b', o: [['15000', 'Moins de 15 000 DA', '', 'أقل من 15 000 دج'], ['25000', '15 000 à 25 000 DA', '', 'من 15 000 إلى 25 000 دج'], ['40000', '25 000 à 40 000 DA', '', 'من 25 000 إلى 40 000 دج'], ['999999', 'Plus de 40 000 DA', '', 'أكثر من 40 000 دج']] }];
  let qa = {}, qi = 0;
  const USE = { op: ['Opérateur', 'Ergonomiques'], screen: ['Ergonomiques', 'Opérateur'], boss: ['Direction'], game: ['Gaming', 'Ergonomiques'], vis: ['Visiteurs & réunion'] };
  function quiz() {
    if (qi < 3) {
      const Q = QZ[qi];
      $('#qbox').innerHTML = '<span class="qstep">' + d('qs').replace('{i}', qi + 1) + '</span><div class="qbar"><i style="width:' + ((qi) / 3 * 100) + '%"></i></div><div class="qq">' + d('q' + (qi + 1)) + '</div><div class="qopts">' + Q.o.map(o => '<button data-qa="' + o[0] + '">' + esc(lang === 'ar' ? o[3] : o[1]) + (o[2] && lang !== 'ar' ? '<small>' + esc(o[2]) + '</small>' : '') + '</button>').join('') + '</div>';
      return;
    }
    const cats = USE[qa.use], bud = +qa.b, lo = bud === 25000 ? 15000 : bud === 40000 ? 25000 : bud === 999999 ? 40000 : 0, h = +qa.h;
    const feat = /lombaire|r[ée]glable|maille|mesh|filet|accoudoirs? r[ée]glables?|repose-t[êe]te|appui-t[êe]te|basculant|synchron/i;
    const sc = live().filter(p => cats.includes(p.cat)).map(p => { const pr = X.minP(p); let s = cats[0] === p.cat ? 4 : 2;
      s += pr <= bud && pr >= lo ? 4 : pr <= bud ? 2 : pr <= bud * 1.15 ? 1 : -3;
      const f = p.b.filter(x => feat.test(x)).length; if (h >= 2 && qa.use !== 'vis') s += Math.min(3, f) * (h === 3 ? 1 : 0.6); if (p.best) s += 1;
      return { p, s, f }; }).sort((a, b) => b.s - a.s).slice(0, 3);
    const mx = 12;
    $('#qbox').innerHTML = '<span class="qstep">' + d('qRes') + '</span><div class="qres">' + (sc.map(({ p, s }) => '<div class="qr">' + img(p) + '<div><b>' + esc(p.name) + '</b><small>' + money(X.minP(p)) + ' · ' + d('qMatch') + ' ' + Math.max(50, Math.min(99, Math.round(s / mx * 100))) + ' %</small></div><button class="btn btn-red sm" data-open="' + esc(p.id) + '">' + (lang === 'ar' ? 'عرض' : 'Voir') + '</button></div>').join('') || '<p class="empty">' + d('none') + '</p>') + '</div><button class="btn btn-ln sm" id="qAgain" style="justify-self:start">↺ ' + d('qAgain') + '</button>';
    $('#qAgain').onclick = () => { qa = {}; qi = 0; quiz(); };
    X.track('quiz');
  }
  $('#qbox').addEventListener('click', e => { const b = e.target.closest('[data-qa]'); if (!b) return; qa[QZ[qi].k] = b.dataset.qa; qi++; quiz(); });

  /* ---------- configurateur d'espace ---------- */
  const opts = cats => { const R = []; live().filter(p => cats.includes(p.cat)).sort((a, b) => X.minP(a) - X.minP(b)).forEach(p => p.v.forEach((v, i) => R.push({ k: p.id + '|' + i, p, i, price: v.p, label: X.lineName(p, i) + ' · ' + money(v.p) }))); return R; };
  const pk = { postes: 4, desk: '', chair: '', storeN: 1, store: '', visN: 2, vis: '', bossN: 0, boss: '' };
  const ROWS = [['desk', 'pDesk', ['Bureaux'], 'postes'], ['chair', 'pChair', ['Opérateur', 'Ergonomiques'], 'postes'], ['store', 'pStore', ['Rangement'], 'storeN'], ['vis', 'pVis', ['Visiteurs & réunion'], 'visN'], ['boss', 'pBoss', ['Direction'], 'bossN']];
  function pick(row, O) { if (!pk[row] || !O.some(o => o.k === pk[row])) pk[row] = (O.find(o => /fonctionnel\|0|nova|2501|metallique-02-porte\||boston|6037/i.test(o.k)) || O[0] || {}).k || ''; return O.find(o => o.k === pk[row]); }
  function pack() {
    const lines = [];
    const rows = ROWS.map(([row, lab, cats, nk]) => { const O = opts(cats), sel = pick(row, O), n = pk[nk]; if (sel && n) lines.push({ sel, n, lab });
      return '<div class="prow">' + (sel && sel.p.img.length ? '<img src="' + esc(sel.p.img[0]) + '" alt="">' : '<span></span>') + '<div class="f"><label for="pk-' + row + '">' + d(lab) + (nk === 'postes' ? ' · ' + pk.postes + ' ' + d('postes').toLowerCase() : '') + '</label><select id="pk-' + row + '" data-pk="' + row + '">' + O.map(o => '<option value="' + esc(o.k) + '"' + (o.k === pk[row] ? ' selected' : '') + '>' + esc(o.label) + '</option>').join('') + '</select></div>' +
        (nk === 'postes' ? '<span></span>' : '<div class="step"><button data-pn="' + nk + '" data-d="-1" aria-label="−">−</button><b>' + n + '</b><button data-pn="' + nk + '" data-d="1" aria-label="+">+</button></div>') + '</div>'; });
    const tot = lines.reduce((a, l) => a + l.sel.price * l.n, 0);
    $('#packB').innerHTML = '<div><div class="prow" style="grid-template-columns:1fr auto"><div><b style="font-size:18px">' + d('postes') + '</b><br><small style="color:var(--muted);font-weight:700">' + (lang === 'ar' ? 'مكتب + كرسي لكل موظف' : 'un bureau + une chaise par personne') + '</small></div><div class="step"><button data-pn="postes" data-d="-1" aria-label="−">−</button><b>' + pk.postes + '</b><button data-pn="postes" data-d="1" aria-label="+">+</button></div></div>' + rows.join('') + '</div>' +
      '<aside class="ptot">' + lines.map(l => '<div class="r"><span>' + l.n + ' × ' + esc(l.sel.p.name) + '</span><b>' + money(l.sel.price * l.n) + '</b></div>').join('') + '<div class="t"><span>' + d('pTot') + '</span><span>' + money(tot) + '</span></div><small>' + d('pTtc') + '</small><button class="btn btn-red full" id="pkDv"' + (lines.length ? '' : ' disabled') + '>' + d('toDv') + '</button></aside>';
    $('#pkDv').onclick = () => { lines.forEach(l => addDevis(l.sel.p.id, l.sel.i, l.n, true)); X.track('pack'); toast('✓ ' + d('addedDv')); openDrawer('dv'); };
  }
  $('#packB').addEventListener('change', e => { const s = e.target.closest('[data-pk]'); if (s) { pk[s.dataset.pk] = s.value; pack(); } });
  $('#packB').addEventListener('click', e => { const b = e.target.closest('[data-pn]'); if (b) { const k = b.dataset.pn; pk[k] = Math.max(k === 'postes' ? 1 : 0, Math.min(200, pk[k] + +b.dataset.d)); pack(); } });

  /* ---------- panier et devis ---------- */
  let dmode = 'cart', mode = 'livraison', done = null;
  const full = L => L.map(l => { const p = X.prod(l.pid); return { pid: l.pid, vi: l.vi, qty: l.qty, p, name: X.lineName(p, l.vi), price: X.vPrice(p, l.vi) }; });
  const srcSel = () => '<div class="f"><label for="oS">' + d('srcL') + '</label><select id="oS"><option value="">' + d('choose') + '</option>' + X.SOURCES.map(s => '<option value="' + s[0] + '"' + (s[0] === X.source() ? ' selected' : '') + '>' + esc(s[1]) + '</option>').join('') + '</select></div>';
  function openDrawer(m) { dmode = m; done = null; lastFocus = lastFocus || document.activeElement; $('#ov').hidden = false; $('#drawer').hidden = false; document.body.style.overflow = 'hidden'; renderDrawer(); $('#drX').focus(); }
  $('#ctB').onclick = () => { lastFocus = $('#ctB'); openDrawer('cart'); };
  $('#dvB').onclick = () => { lastFocus = $('#dvB'); openDrawer('dv'); };
  $('#proDv').onclick = () => { lastFocus = $('#proDv'); openDrawer('dv'); };
  function sumHtml(L) {
    const w = $('#oW') ? $('#oW').value : '', fee = dmode === 'dv' || mode === 'retrait' ? 0 : X.feeFor(w), s = X.sub(L);
    if (dmode === 'dv') return '<div class="sum"><div class="r t"><span>' + d('tot') + ' (TTC)</span><b>' + money(s) + '</b></div></div>';
    return '<div class="sum"><div class="r"><span>' + d('sub') + '</span><b>' + money(s) + '</b></div><div class="r"><span>' + d('del') + '</span><b>' + (mode === 'retrait' ? d('free') : fee == null ? d('delTel') : fee === 0 ? d('free') : money(fee)) + '</b></div><div class="r t"><span>' + d('tot') + '</span><b>' + money(s + (fee || 0)) + (mode === 'livraison' && fee == null ? ' <small style="font-size:12px;color:var(--muted)">' + d('plusDel') + '</small>' : '') + '</b></div></div>';
  }
  function renderDrawer() {
    badges(); $('#drT').textContent = dmode === 'cart' ? d('cart') : d('dv');
    if (done) {
      const isDv = done.kind === 'dv';
      $('#drB').innerHTML = '<div class="done"><div class="okc" aria-hidden="true">✓</div><h3>' + (isDv ? d('okDv') : d('ok')) + '</h3><p>' + esc((isDv ? d('okDvP').replace('{r}', done.o.ref) : d('okP').replace('{n}', done.o.name.split(' ')[0])).replace('{p}', done.o.phone.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4'))) + '</p><a class="btn btn-wa full" target="_blank" rel="noopener" data-wa="1" href="' + esc(wa(waMsg(done))) + '">' + d('okWa') + '</a><button class="btn btn-ln full" id="bk">' + d('back') + '</button></div>';
      $('#bk').onclick = closeAll; return;
    }
    const L = full(dmode === 'cart' ? cart : dv);
    if (!L.length) { $('#drB').innerHTML = '<p class="empty">' + (dmode === 'cart' ? d('empty') : d('emptyDv')) + '</p><button class="btn btn-red" id="gc">' + d('goCat') + '</button>' + (dmode === 'dv' ? '<a class="btn btn-ln" href="#pack" id="gp">' + d('nPack') + '</a>' : ''); $('#gc').onclick = () => { closeAll(); $('#catalogue').scrollIntoView(); }; if ($('#gp')) $('#gp').onclick = closeAll; return; }
    const lines = L.map((l, k) => '<div class="ln">' + (l.p.img.length ? '<img src="' + esc(l.p.img[0]) + '" alt="">' : '<span></span>') + '<div><b>' + esc(l.name) + '</b><small>' + money(l.price) + '</small></div><div class="mq"><button data-lq="' + k + '" data-d="-1" aria-label="−">−</button><b>' + l.qty + '</b><button data-lq="' + k + '" data-d="1" aria-label="+">+</button></div></div>').join('');
    const form = dmode === 'cart'
      ? '<div class="seg" role="group"><button data-m="livraison" aria-pressed="' + (mode === 'livraison') + '">🚚 ' + d('mDel') + '<small>' + d('mDelS') + '</small></button><button data-m="retrait" aria-pressed="' + (mode === 'retrait') + '">🏬 ' + d('mPick') + '<small>' + d('mPickS') + '</small></button></div>' +
        '<form id="of" novalidate style="display:grid;gap:12px"><div class="f"><label for="oN">' + d('name') + '</label><input id="oN" autocomplete="name"></div><div class="f"><label for="oP">' + d('phone') + '</label><input id="oP" inputmode="tel" autocomplete="tel" placeholder="05 / 06 / 07…"></div>' +
        (mode === 'livraison' ? '<div class="f2"><div class="f"><label for="oW">' + d('wil') + '</label><select id="oW"><option value="">' + d('choose') + '</option>' + WIL.map(w => '<option>' + esc(w) + '</option>').join('') + '</select></div><div class="f"><label for="oC">' + d('com') + '</label><input id="oC"></div></div><div class="f"><label for="oA">' + d('adr') + '</label><input id="oA" autocomplete="street-address"></div>' : '') +
        srcSel() + '<div id="oSum">' + sumHtml(L) + '</div><p class="err" id="oE" role="alert"></p><button class="btn btn-red full" type="submit">' + d('order') + '</button><p class="note">' + d('pay') + '</p></form>'
      : '<form id="of" novalidate style="display:grid;gap:12px"><div class="f"><label for="dCo">' + d('co') + '</label><input id="dCo" autocomplete="organization"></div><div class="f2"><div class="f"><label for="oN">' + d('ct') + '</label><input id="oN" autocomplete="name"></div><div class="f"><label for="oP">' + d('phone') + '</label><input id="oP" inputmode="tel" autocomplete="tel"></div></div>' +
        '<div class="f2"><div class="f"><label for="dEm">' + d('em') + '</label><input id="dEm" type="email" autocomplete="email"></div><div class="f"><label for="oW">' + d('wil') + '</label><select id="oW"><option value="">' + d('choose') + '</option>' + WIL.map(w => '<option>' + esc(w) + '</option>').join('') + '</select></div></div>' +
        '<div class="f"><label for="dNif">' + d('nif') + '</label><input id="dNif"></div><div class="f"><label for="dMsg">' + d('msg') + '</label><textarea id="dMsg" rows="3"></textarea></div>' + srcSel() + '<div id="oSum">' + sumHtml(L) + '</div><p class="err" id="oE" role="alert"></p><button class="btn btn-blue full" type="submit">' + d('sendDv') + '</button><p class="note">' + d('dvNote') + '</p></form>';
    $('#drB').innerHTML = lines + form;
    if ($('#oW')) $('#oW').onchange = () => { $('#oSum').innerHTML = sumHtml(full(dmode === 'cart' ? cart : dv)); };
    $('#of').onsubmit = submit;
  }
  $('#drB').addEventListener('click', e => {
    const b = e.target.closest('[data-lq]'); if (b) { const L = dmode === 'cart' ? cart : dv, l = L[+b.dataset.lq]; l.qty += +b.dataset.d; if (l.qty <= 0) L.splice(+b.dataset.lq, 1); lsSet(dmode === 'cart' ? 'cart' : 'dv', L); keep(); return; }
    const m = e.target.closest('[data-m]'); if (m) { mode = m.dataset.m; keep(); }
  });
  function keep() { const v = {}; ['oN', 'oP', 'oW', 'oC', 'oA', 'oS', 'dCo', 'dEm', 'dNif', 'dMsg'].forEach(id => { const el = document.getElementById(id); if (el) v[id] = el.value; }); renderDrawer(); Object.keys(v).forEach(id => { const el = document.getElementById(id); if (el) el.value = v[id]; }); if ($('#oSum')) $('#oSum').innerHTML = sumHtml(full(dmode === 'cart' ? cart : dv)); }
  const val = id => ($('#' + id) ? $('#' + id).value.trim() : '');
  function submit(e) {
    e.preventDefault();
    const name = val('oN'), phone = val('oP').replace(/\D/g, '').replace(/^213/, '0'), wil = val('oW'), com = val('oC'), co = val('dCo');
    const err = dmode === 'dv' && !co ? d('eCo') : !name ? d('eName') : !/^0[567]\d{8}$/.test(phone) ? d('ePhone') : (dmode === 'dv' || mode === 'livraison') && !wil ? d('eWil') : dmode === 'cart' && mode === 'livraison' && !com ? d('eCom') : '';
    $('#oE').textContent = err; if (err) return;
    const L = full(dmode === 'cart' ? cart : dv).map(l => ({ pid: l.pid, vi: l.vi, name: l.name, price: l.price, qty: l.qty })), at = Date.now(), src = val('oS');
    if (dmode === 'cart') {
      const o = { id: at.toString(36), at, src, mode, name, phone, wil: mode === 'livraison' ? wil : '', com: mode === 'livraison' ? com : '', adr: mode === 'livraison' ? val('oA') : '', lines: L, fee: mode === 'retrait' ? 0 : X.feeFor(wil), status: 'nouvelle' };
      const O = X.get('orders', []); O.unshift(o); X.put('orders', O); cart = []; lsSet('cart', cart); X.track('order'); done = { kind: 'cart', o };
    } else {
      const s = X.S(), n = (s.devisN || 0) + 1; X.save({ devisN: n });
      const o = { id: 'd' + at.toString(36), ref: 'DV-' + new Date().getFullYear() + '-' + String(n).padStart(3, '0'), at, src, company: co, name, phone, email: val('dEm'), wil, nif: val('dNif'), msg: val('dMsg'), lines: L, disc: 0, status: 'nouveau' };
      const D = X.get('devis', []); D.unshift(o); X.put('devis', D); dv = []; lsSet('dv', dv); X.track('quote'); done = { kind: 'dv', o };
    }
    renderDrawer();
  }
  function waMsg(dn) {
    const o = dn.o, L = o.lines.map(l => '• ' + l.qty + ' × ' + l.name + ' (' + money(l.price * l.qty) + ')').join('\n');
    if (dn.kind === 'dv') return 'Bonjour STI Bureautique, demande de devis ' + o.ref + '\nEntreprise : ' + o.company + '\nContact : ' + o.name + ' · ' + o.phone + '\nWilaya : ' + o.wil + '\n' + L + '\nTotal catalogue TTC : ' + money(X.sub(o.lines)) + (o.msg ? '\nMessage : ' + o.msg : '');
    return 'Bonjour STI Bureautique, je commande :\n' + L + '\nNom : ' + o.name + '\nTéléphone : ' + o.phone + '\n' + (o.mode === 'retrait' ? 'Retrait au showroom (Mohammadia)' : 'Livraison : ' + o.com + ', ' + o.wil + (o.adr ? ', ' + o.adr : '')) + '\nTotal : ' + money(X.orderTotal(o)) + (o.mode === 'livraison' && o.fee == null ? ' + livraison' : '');
  }
  const WIL = X.WILAYAS;

  /* ---------- showroom, FAQ, pied de page ---------- */
  const FAQ = {
    fr: [['Livrez-vous dans ma wilaya ?', 'Oui : nous expédions vers les 58 wilayas. Les frais dépendent de la wilaya et vous sont confirmés au téléphone avant l\'envoi.'], ['Comment se passe le paiement ?', 'Vous payez à la livraison. Pour les entreprises, nous établissons un devis commercial avec dossier fiscal conforme.'], ['Et si un produit arrive abîmé ?', 'Tout produit endommagé est remplacé.'], ['Vendez-vous en gros ?', 'Oui, nous vendons en gros et au détail. Pour plusieurs postes, utilisez le configurateur ou envoyez votre liste en demande de devis : réponse sous 24 h.'], ['Puis-je essayer avant d\'acheter ?', 'Bien sûr : passez au showroom à Mohammadia, du samedi au jeudi de 8 h 30 à 17 h 00.']],
    ar: [['هل توصلون إلى ولايتي؟', 'نعم: نشحن إلى 58 ولاية. تكاليف التوصيل حسب الولاية ونؤكدها لك بالهاتف قبل الإرسال.'], ['كيف يتم الدفع؟', 'الدفع عند الاستلام. للمؤسسات نعدّ عرض سعر تجاري مع ملف جبائي مطابق.'], ['وإذا وصل المنتج تالفاً؟', 'كل منتج تالف يُعوَّض.'], ['هل تبيعون بالجملة؟', 'نعم، جملة وتجزئة. لعدة مكاتب استعمل الأداة أو أرسل قائمتك كطلب عرض سعر: الرد خلال 24 ساعة.'], ['هل يمكن التجربة قبل الشراء؟', 'طبعاً: زورونا في المعرض بالمحمدية من السبت إلى الخميس، 8:30 – 17:00.']] };
  function renderInfo() {
    const lab = lang === 'ar' ? ['العنوان', 'الأوقات', 'الهاتف', 'البريد'] : ['Adresse', 'Horaires', 'Téléphone', 'E-mail'];
    $('#info').innerHTML = '<dt>' + lab[0] + '</dt><dd>' + esc(STI.address) + '</dd><dt>' + lab[1] + '</dt><dd>' + esc(lang === 'ar' ? STI.hoursAr : STI.hours) + '</dd><dt>' + lab[2] + '</dt><dd>' + STI.phones.map(esc).join(' · ') + '</dd><dt>' + lab[3] + '</dt><dd>' + esc(STI.email) + '</dd>';
    $('#faq').innerHTML = FAQ[lang].map(f => '<details><summary>' + esc(f[0]) + '</summary><p>' + esc(f[1]) + '</p></details>').join('');
    $('#fl').innerHTML = '<span>WhatsApp : ' + esc(STI.phones[0]) + '</span><span>' + esc(STI.address) + '</span><span><a href="' + STI.social.instagram + '" target="_blank" rel="noopener">Instagram</a> · <a href="' + STI.social.facebook + '" target="_blank" rel="noopener">Facebook</a> · <a href="' + STI.social.tiktok + '" target="_blank" rel="noopener">TikTok</a> · <a href="' + STI.social.youtube + '" target="_blank" rel="noopener">YouTube</a></span>';
    $('#mapB').href = STI.maps; $('#waB').href = wa('Bonjour STI Bureautique,'); $('#waF').href = wa('Bonjour STI Bureautique,'); $('#proWa').href = wa('Bonjour STI Bureautique, je souhaite équiper nos bureaux.');
  }

  /* ---------- héros : modèles phares ---------- */
  const HERO = ['chaise-ergonomique-galaxy', 'fauteuil-pdg-luxe-6037', 'chaise-gamer-kirogi-5d', 'chaise-ergonomique-extra'];
  let hi = 0;
  function heroTick() { const P = HERO.map(X.prod).filter(p => p && p.web && p.img.length); if (!P.length) return; const p = P[hi % P.length]; hi++; const im = $('#heroImg'); im.style.opacity = 0; setTimeout(() => { im.src = p.img[0]; $('#heroP').textContent = money(X.minP(p)); $('#heroN').textContent = p.name; im.style.opacity = 1; }, 250); }

  /* ---------- langue ---------- */
  function applyLang() {
    document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    $$('[data-t]').forEach(el => { const v = d(el.dataset.t); if (el.hasAttribute('data-html')) el.innerHTML = v; else el.textContent = v; });
    $$('[data-tp]').forEach(el => { el.placeholder = lang === 'ar' ? d(el.dataset.tp) : el.getAttribute('placeholder') && FRX['_p' + el.id] || el.placeholder; });
    $('#lang').textContent = lang === 'ar' ? 'FR' : 'ع';
    renderCats(); renderGrid(); quiz(); pack(); renderInfo(); if (!$('#sheet').hidden) renderSheet(); if (!$('#drawer').hidden) keep();
  }
  $$('[data-tp]').forEach(el => { FRX['_p' + el.id] = el.placeholder; });
  $('#lang').onclick = () => { lang = lang === 'ar' ? 'fr' : 'ar'; try { localStorage.setItem('sti-lang', lang); } catch (e) { /* bloqué */ } applyLang(); };

  X.onChange(k => { if (k === 'prod') { renderCats(); renderGrid(); pack(); badges(); } if (k === 'settings' && !$('#drawer').hidden && !done) keep(); });
  renderRefs(); applyLang(); badges(); heroTick(); setInterval(heroTick, 5000); X.track('visit');
})();
