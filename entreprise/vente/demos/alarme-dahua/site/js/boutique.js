/* Boutique General Electric dz : catalogue, panier, commande (livraison ou retrait) */
(function () {
  'use strict';
  const G = window.GE, esc = G.esc, money = G.money;
  const $ = s => document.querySelector(s), $$ = s => document.querySelectorAll(s);
  const T = {
    fr: { nCat: 'Catalogue', nPts: 'Points de vente', hK: 'Électricité en général', hT: 'Électricité, sécurité, réseau :<br><span class="red">commandez en ligne.</span>', hP: 'Livraison à domicile ou retrait dans l\'un de nos 2 points de vente. On vous rappelle pour confirmer, vous payez à la réception.', sProd: 'produits', sPts: 'points de vente', sFb: 'abonnés Facebook', cT: 'Catalogue', qP: 'Rechercher un produit, une marque…', srt0: 'Trier', srt1: 'Prix croissant', srt2: 'Prix décroissant', srt3: 'Nom A → Z', none: 'Aucun produit trouvé. Écrivez-nous sur WhatsApp : on l\'a peut-être en magasin.', pK: 'Nos points de vente', pT: 'Passez nous voir, ou retirez votre commande', fT: 'Électricité en général · Shopping et vente au détail', cart: 'Mon panier',
      all: 'Tout', add: 'Ajouter au panier', added: 'Ajouté au panier', inS: 'En stock', few: 'Plus que {n}', onOrder: 'Sur commande', see: 'Voir la fiche', page: 'Page complète du produit →', brand: 'Marque', ref: 'Référence', cat: 'Catégorie', avail: 'Disponibilité', route: 'Itinéraire', call: 'Appeler', waT: 'WhatsApp',
      empty: 'Votre panier est vide.', goCat: 'Voir le catalogue', sub: 'Sous-total', del: 'Livraison', tot: 'Total', delTel: 'confirmée par téléphone', free: 'offerte', plusDel: '+ livraison', mDel: 'Livraison', mDelS: 'à domicile, 58 wilayas', mPick: 'Retrait', mPickS: 'en magasin, sans frais', name: 'Nom et prénom', phone: 'Téléphone', wil: 'Wilaya', com: 'Commune', adr: 'Adresse (facultatif)', choose: 'Choisir…', pickAt: 'Où retirer ?', allHere: 'Tout est disponible ici', notAll: 'Certains articles à faire venir : on vous prévient quand c\'est prêt', order: 'Valider la commande', pay: 'Paiement à la réception. On vous appelle pour confirmer.',
      eName: 'Indiquez votre nom', ePhone: 'Numéro de téléphone invalide (ex. 0555 12 34 56)', eWil: 'Choisissez votre wilaya', eCom: 'Indiquez votre commune', ok: 'Commande envoyée !', okP: 'Merci {n}. Nous vous appelons au {p} pour confirmer.', okWa: 'Envoyer aussi sur WhatsApp', back: 'Continuer mes achats', qty: 'Quantité' },
    ar: { nCat: 'المنتجات', nPts: 'نقاط البيع', hK: 'الكهرباء بشكل عام', hT: 'كهرباء، أمن، شبكات:<br><span class="red">اطلب عبر الإنترنت.</span>', hP: 'توصيل إلى المنزل أو استلام من إحدى نقطتي البيع. نتصل بك للتأكيد، والدفع عند الاستلام.', sProd: 'منتج', sPts: 'نقطتا بيع', sFb: 'متابع على فيسبوك', cT: 'المنتجات', qP: 'ابحث عن منتج أو علامة…', srt0: 'ترتيب', srt1: 'السعر تصاعدياً', srt2: 'السعر تنازلياً', srt3: 'الاسم أ → ي', none: 'لا يوجد منتج. راسلنا على واتساب: قد يكون متوفراً في المحل.', pK: 'نقاط البيع', pT: 'زورونا أو استلموا طلبيتكم', fT: 'الكهرباء بشكل عام · بيع بالتجزئة', cart: 'سلتي',
      all: 'الكل', add: 'أضف إلى السلة', added: 'تمت الإضافة', inS: 'متوفر', few: 'بقي {n} فقط', onOrder: 'حسب الطلب', see: 'التفاصيل', page: 'صفحة المنتج الكاملة ←', brand: 'العلامة', ref: 'المرجع', cat: 'الفئة', avail: 'التوفر', route: 'الاتجاهات', call: 'اتصال', waT: 'واتساب',
      empty: 'سلتك فارغة.', goCat: 'تصفح المنتجات', sub: 'المجموع الفرعي', del: 'التوصيل', tot: 'المجموع', delTel: 'يُؤكد بالهاتف', free: 'مجاني', plusDel: '+ التوصيل', mDel: 'توصيل', mDelS: 'إلى المنزل، 58 ولاية', mPick: 'استلام', mPickS: 'من المحل، بدون رسوم', name: 'الاسم واللقب', phone: 'الهاتف', wil: 'الولاية', com: 'البلدية', adr: 'العنوان (اختياري)', choose: 'اختر…', pickAt: 'أين تستلم؟', allHere: 'كل شيء متوفر هنا', notAll: 'بعض المنتجات تُجلب: نُعلمك عندما تكون جاهزة', order: 'تأكيد الطلب', pay: 'الدفع عند الاستلام. نتصل بك للتأكيد.',
      eName: 'أدخل اسمك', ePhone: 'رقم الهاتف غير صحيح', eWil: 'اختر ولايتك', eCom: 'أدخل بلديتك', ok: 'تم إرسال الطلب!', okP: 'شكراً {n}. سنتصل بك على {p} للتأكيد.', okWa: 'أرسل أيضاً عبر واتساب', back: 'مواصلة التسوق', qty: 'الكمية' }
  };
  let lang = 'fr'; try { lang = localStorage.getItem('ads-lang') || 'fr'; } catch (e) { /* bloqué */ }
  const d = k => (T[lang] && T[lang][k]) || T.fr[k];
  let tt; const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2200); };

  /* panier (propre à ce navigateur) */
  let cart = []; try { cart = JSON.parse(localStorage.getItem('adsc-cart') || '[]'); } catch (e) { cart = []; }
  const saveCart = () => { try { localStorage.setItem('adsc-cart', JSON.stringify(cart)); } catch (e) { /* bloqué */ } };
  const live = () => G.products().filter(p => p.web && p.price);
  function cleanCart() { const L = live(); cart = cart.filter(c => L.some(p => p.id === c.pid)); saveCart(); }

  const totalStock = p => G.depots().reduce((a, x) => a + Math.max(0, G.stockOf(p.id, x.id)), 0);
  function avail(p) { const s = totalStock(p); return s <= 0 ? ['no', d('onOrder')] : s <= G.lowOf(p) ? ['lo', d('few').replace('{n}', s)] : ['ok2', d('inS')]; }
  const pic = (p, cls) => p.img ? '<img src="' + esc(p.img) + '" alt="' + esc(p.short || p.name) + '"' + (cls ? ' class="' + cls + '"' : '') + ' loading="lazy">' : '<span class="ph" aria-hidden="true">🔌</span>';

  /* ---------- catalogue ---------- */
  let cat = '', q = '', sort = '';
  function renderCat() {
    const L = live(), cs = [...new Set(L.map(p => p.cat).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr'));
    if (cat && !cs.includes(cat)) cat = '';
    $('#stN').textContent = L.length;
    $('#chips').innerHTML = cs.length > 1 ? [''].concat(cs).map(c => '<button data-c="' + esc(c) + '" aria-pressed="' + (c === cat) + '">' + esc(c || d('all')) + '<small>' + (c ? L.filter(p => p.cat === c).length : L.length) + '</small></button>').join('') : '';
    let R = L.filter(p => (!cat || p.cat === cat) && (!q || (p.name + ' ' + (p.brand || '') + ' ' + (p.ref || '') + ' ' + (p.cat || '')).toLowerCase().includes(q.toLowerCase())));
    if (sort === 'pa') R.sort((a, b) => a.price - b.price); else if (sort === 'pd') R.sort((a, b) => b.price - a.price); else if (sort === 'n') R.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    $('#grid').innerHTML = R.map(p => { const a = avail(p); return '<article class="card"><button class="im" data-open="' + esc(p.id) + '" aria-label="' + esc(d('see') + ' : ' + (p.short || p.name)) + '">' + pic(p) + '</button><div class="bd"><span class="ct">' + esc(p.cat || '') + '</span><h3><button data-open="' + esc(p.id) + '">' + esc(p.short || p.name) + '</button></h3>' + (p.brand ? '<span class="br">' + esc(p.brand) + '</span>' : '') +
      '<div class="pr"><b>' + money(p.price) + '</b>' + (p.oldPrice ? '<s>' + money(p.oldPrice) + '</s>' : '') + '</div><span class="av ' + a[0] + '">' + esc(a[1]) + '</span><button class="btn btn-red sm add" data-add="' + esc(p.id) + '">' + d('add') + '</button></div></article>'; }).join('');
    $('#none').hidden = R.length > 0;
  }
  $('#chips').addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (b) { cat = b.dataset.c; renderCat(); } });
  $('#q').addEventListener('input', e => { q = e.target.value; renderCat(); });
  $('#sort').addEventListener('change', e => { sort = e.target.value; renderCat(); });

  /* ---------- fiche produit ---------- */
  let lastFocus = null;
  function openSheet(id) {
    const p = G.prod(id); if (!p) return; lastFocus = document.activeElement; const a = avail(p);
    $('#shB').innerHTML = '<div class="shb"><div class="pic">' + pic(p) + '</div><div class="info"><span class="eyebrow dark-t">' + esc(p.cat || '') + '</span><h2 id="shT">' + esc(p.name) + '</h2><div class="pr"><b>' + money(p.price) + '</b>' + (p.oldPrice ? '<s>' + money(p.oldPrice) + '</s>' : '') + '</div>' +
      (p.desc ? '<p class="desc">' + esc(p.desc) + '</p>' : '') +
      '<dl>' + (p.brand ? '<dt>' + d('brand') + '</dt><dd>' + esc(p.brand) + '</dd>' : '') + (p.ref ? '<dt>' + d('ref') + '</dt><dd>' + esc(p.ref) + '</dd>' : '') + '<dt>' + d('avail') + '</dt><dd><span class="av ' + a[0] + '">' + esc(a[1]) + '</span></dd></dl>' +
      '<div class="dav">' + G.depots().map(x => { const s = Math.max(0, G.stockOf(p.id, x.id)); return '<span><em>📍 ' + esc(x.name) + '</em><b>' + (s > 0 ? '✓' : '—') + '</b></span>'; }).join('') + '</div>' +
      '<button class="btn btn-red big full" data-add="' + esc(p.id) + '">' + d('add') + '</button>' + (p.page ? '<a class="btn btn-ln" href="' + esc(p.page) + '">' + d('page') + '</a>' : '') + '</div></div>';
    $('#ov').hidden = false; $('#sheet').hidden = false; $('#shX').focus();
  }
  function closeAll() { $('#ov').hidden = true; $('#sheet').hidden = true; $('#drawer').hidden = true; document.body.style.overflow = ''; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  document.addEventListener('click', e => {
    const o = e.target.closest('[data-open]'); if (o) { openSheet(o.dataset.open); return; }
    const a = e.target.closest('[data-add]'); if (a) { addCart(a.dataset.add); return; }
  });
  $('#shX').onclick = closeAll; $('#ov').onclick = closeAll; $('#drX').onclick = closeAll;
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && (!$('#sheet').hidden || !$('#drawer').hidden)) closeAll(); });

  /* ---------- panier ---------- */
  function addCart(id) {
    const p = G.prod(id); if (!p || !p.price) return; const c = cart.find(x => x.pid === id); if (c) c.qty = Math.min(99, c.qty + 1); else cart.push({ pid: id, qty: 1 }); saveCart(); badge(true); toast('✓ ' + d('added') + ' · ' + (p.short || p.name));
    if (!$('#sheet').hidden) { $('#sheet').hidden = true; openCart(); }
  }
  function badge(bump) { const n = cart.reduce((a, c) => a + c.qty, 0); $('#cartN').textContent = n; if (bump) { const b = $('#cartB'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); } }
  let mode = 'livraison', pickD = null, step = 'cart', doneO = null;
  const lines = () => cart.map(c => ({ c, p: G.prod(c.pid) })).filter(x => x.p);
  const sub = () => lines().reduce((a, x) => a + x.p.price * x.c.qty, 0);
  const hasAll = dep => lines().every(x => G.stockOf(x.p.id, dep) >= x.c.qty);
  function openCart() { lastFocus = lastFocus || document.activeElement; step = 'cart'; $('#ov').hidden = false; $('#drawer').hidden = false; document.body.style.overflow = 'hidden'; renderCart(); $('#drX').focus(); }
  $('#cartB').onclick = () => { lastFocus = $('#cartB'); openCart(); };
  function sumHtml() {
    const w = $('#oW') ? $('#oW').value : '', fee = mode === 'retrait' ? 0 : G.feeFor(w), s = sub();
    return '<div class="sum"><div class="r"><span>' + d('sub') + '</span><b>' + money(s) + '</b></div><div class="r"><span>' + d('del') + (mode === 'livraison' && w ? ' (' + esc(w.replace(/^\d+ /, '')) + ')' : '') + '</span><b>' + (mode === 'retrait' ? d('free') : fee == null ? d('delTel') : fee === 0 ? d('free') : money(fee)) + '</b></div><div class="r t"><span>' + d('tot') + '</span><b>' + money(s + (fee || 0)) + (mode === 'livraison' && fee == null ? ' <small style="font-size:12px;color:var(--muted)">' + d('plusDel') + '</small>' : '') + '</b></div></div>';
  }
  function renderCart() {
    cleanCart(); badge();
    if (step === 'done') {
      $('#drB').innerHTML = '<div class="done" style="box-shadow:none;padding:10px 0"><div class="ok" aria-hidden="true">✓</div><h3>' + d('ok') + '</h3><p>' + esc(d('okP').replace('{n}', doneO.name.split(' ')[0]).replace('{p}', doneO.phone.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4'))) + '</p>' +
        (G.SHOP.whatsapp ? '<a class="btn btn-red full" target="_blank" rel="noopener" href="' + esc(waLink(doneO)) + '">' + d('okWa') + '</a>' : '') + '<button class="btn btn-ln full" id="bk">' + d('back') + '</button></div>';
      $('#bk').onclick = closeAll; return;
    }
    const Ls = lines();
    if (!Ls.length) { $('#drB').innerHTML = '<p class="empty2">' + d('empty') + '</p><button class="btn btn-red" id="gc">' + d('goCat') + '</button>'; $('#gc').onclick = () => { closeAll(); location.hash = 'catalogue'; }; return; }
    const D = G.depots(); if (!pickD || !D.some(x => x.id === pickD)) pickD = (D.find(x => hasAll(x.id)) || D[0]).id;
    $('#drB').innerHTML = Ls.map(({ c, p }) => '<div class="cline"><div class="ci">' + pic(p) + '</div><div><b>' + esc(p.short || p.name) + '</b><small>' + money(p.price) + '</small></div><div class="cq"><button data-cq="' + esc(p.id) + '" data-d="-1" aria-label="−">−</button><b aria-label="' + d('qty') + '">' + c.qty + '</b><button data-cq="' + esc(p.id) + '" data-d="1" aria-label="+">+</button></div></div>').join('') +
      '<div class="seg" role="group" aria-label="' + d('del') + '"><button data-m="livraison" aria-pressed="' + (mode === 'livraison') + '">🚚 ' + d('mDel') + '<small>' + d('mDelS') + '</small></button><button data-m="retrait" aria-pressed="' + (mode === 'retrait') + '">🏬 ' + d('mPick') + '<small>' + d('mPickS') + '</small></button></div>' +
      '<form id="of" novalidate><div style="display:grid;gap:12px"><div class="f"><label for="oN">' + d('name') + '</label><input id="oN" autocomplete="name" required></div><div class="f"><label for="oP">' + d('phone') + '</label><input id="oP" inputmode="tel" autocomplete="tel" placeholder="05 / 06 / 07…" required></div>' +
      (mode === 'livraison' ? '<div class="f2"><div class="f"><label for="oW">' + d('wil') + '</label><select id="oW" required><option value="">' + d('choose') + '</option>' + window.WILAYAS.map(w => '<option>' + esc(w) + '</option>').join('') + '</select></div><div class="f"><label for="oC">' + d('com') + '</label><input id="oC" required></div></div><div class="f"><label for="oA">' + d('adr') + '</label><input id="oA" autocomplete="street-address"></div>'
        : '<fieldset class="pick" style="border:0;padding:0;margin:0"><legend class="f" style="font-size:13.5px;font-weight:800;color:var(--muted);margin-bottom:6px">' + d('pickAt') + '</legend>' + D.map(x => '<label><input type="radio" name="pk" value="' + esc(x.id) + '"' + (x.id === pickD ? ' checked' : '') + '><span>' + esc(x.name) + '<small>' + (hasAll(x.id) ? '✓ ' + d('allHere') : d('notAll')) + ' · <a href="' + esc(x.maps) + '" target="_blank" rel="noopener">' + d('route') + '</a></small></span></label>').join('') + '</fieldset>') +
      '<div id="oSum">' + sumHtml() + '</div><p class="err" id="oE" role="alert"></p><button class="btn btn-red big full" type="submit">' + d('order') + '</button><p class="dnote2">' + d('pay') + '</p></div></form>';
    if ($('#oW')) $('#oW').onchange = () => { $('#oSum').innerHTML = sumHtml(); };
    $$('input[name="pk"]').forEach(r => r.onchange = () => { pickD = r.value; });
    $('#of').onsubmit = submit;
  }
  $('#drB').addEventListener('click', e => {
    const q2 = e.target.closest('[data-cq]'); if (q2) { const c = cart.find(x => x.pid === q2.dataset.cq); if (c) { c.qty += +q2.dataset.d; if (c.qty <= 0) cart = cart.filter(x => x !== c); saveCart(); keep(renderCart); } return; }
    const m = e.target.closest('[data-m]'); if (m) { mode = m.dataset.m; keep(renderCart); }
  });
  function keep(fn) { const v = {}; ['oN', 'oP', 'oW', 'oC', 'oA'].forEach(id => { const el = document.getElementById(id); if (el) v[id] = el.value; }); fn(); Object.keys(v).forEach(id => { const el = document.getElementById(id); if (el) el.value = v[id]; }); if ($('#oSum')) $('#oSum').innerHTML = sumHtml(); }
  function waLink(o) {
    const msg = 'Bonjour ' + G.SHOP.name + ', je commande :\n' + G.items(o).map(i => '• ' + i.qty + ' × ' + i.name + ' (' + money(i.price * i.qty) + ')').join('\n') + '\nNom : ' + o.name + '\nTéléphone : ' + o.phone + '\n' +
      (o.mode === 'retrait' ? 'Retrait au : ' + G.depName(o.depot) : 'Livraison : ' + o.com + ', ' + o.wil + (o.adr ? ', ' + o.adr : '')) + '\nTotal : ' + money(G.orderTotal(o)) + (o.mode === 'livraison' && o.fee == null ? ' + livraison' : '');
    return 'https://wa.me/' + G.SHOP.whatsapp + '?text=' + encodeURIComponent(msg);
  }
  function submit(e) {
    e.preventDefault();
    const name = $('#oN').value.trim(), phone = $('#oP').value.replace(/\D/g, '').replace(/^213/, '0');
    const wil = mode === 'livraison' ? $('#oW').value : '', com = mode === 'livraison' ? $('#oC').value.trim() : '', adr = mode === 'livraison' ? $('#oA').value.trim() : '';
    const err = !name ? d('eName') : !/^0[567]\d{8}$/.test(phone) ? d('ePhone') : mode === 'livraison' && !wil ? d('eWil') : mode === 'livraison' && !com ? d('eCom') : '';
    $('#oE').textContent = err; if (err) return;
    const D = G.depots(), dep = mode === 'retrait' ? pickD : (D.find(x => hasAll(x.id)) || D[0]).id;
    const o = { id: Date.now().toString(36), at: Date.now(), src: 'Boutique', name, phone, mode, wil, com, adr, depot: dep, items: lines().map(({ c, p }) => ({ pid: p.id, name: p.short || p.name, price: p.price, qty: c.qty })), fee: mode === 'retrait' ? 0 : G.feeFor(wil), status: 'nouvelle' };
    const L = G.get('orders', []); L.unshift(o); G.put('orders', L);
    cart = []; saveCart(); doneO = o; step = 'done'; renderCart();
  }

  /* ---------- points de vente, contacts ---------- */
  function renderPts() {
    const S = G.SHOP, wa = 'https://wa.me/' + S.whatsapp;
    $('#pts').innerHTML = G.depots().map(x => '<div class="pt"><h3>📍 ' + esc(x.name) + '</h3><p>' + esc(S.name) + '</p><div class="acts"><a class="btn btn-dk sm" href="' + esc(x.maps) + '" target="_blank" rel="noopener">🗺️ ' + d('route') + '</a><a class="btn btn-red sm" href="' + wa + '" target="_blank" rel="noopener">' + d('waT') + '</a></div></div>').join('');
    $('#fc').innerHTML = '<span>WhatsApp : <a href="' + wa + '" target="_blank" rel="noopener">' + esc(S.whatsappShow) + '</a></span><span>' + d('call') + ' : ' + esc(S.phone) + '</span>';
    $('#waF').href = wa;
  }

  /* ---------- langue ---------- */
  function applyLang() {
    document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    $$('[data-t]').forEach(el => { const v = d(el.dataset.t); if (el.hasAttribute('data-html')) el.innerHTML = v; else el.textContent = v; });
    $$('[data-tp]').forEach(el => { el.placeholder = d(el.dataset.tp); });
    $('#lang').textContent = lang === 'ar' ? 'FR' : 'ع';
    renderCat(); renderPts(); if (!$('#drawer').hidden) keep(renderCart);
  }
  $('#lang').onclick = () => { lang = lang === 'ar' ? 'fr' : 'ar'; try { localStorage.setItem('ads-lang', lang); } catch (e) { /* bloqué */ } applyLang(); };

  G.onChange(() => { renderCat(); renderPts(); if (!$('#drawer').hidden && step === 'cart') keep(renderCart); });
  applyLang(); badge();
})();
