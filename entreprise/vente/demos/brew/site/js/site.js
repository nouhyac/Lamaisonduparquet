/* =====================================================================
   BREW — site client
   Carte, fiche produit, panier (retrait / table / livraison), formule
   brunch, suivi en temps réel, fidélité, réservation, « Prévenez-moi ».
   ===================================================================== */
(function () {
  'use strict';
  const D = window.BREW_DATA, S = window.BREW_STORE, A = window.BREW_ART, I = window.BREW_I18N;
  const { t, money, esc, L } = I;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* ---------- État local de la page ---------- */
  const params = new URLSearchParams(location.search);
  const tableNo = parseInt(params.get('table'), 10) || null;
  const state = { filter: 'all', q: '', mode: tableNo ? 'table' : 'collect', dish: null, drink: null, freeDrink: false, people: 2 };
  let cart = load('cart', []);
  let readyNotified = load('readyNotified', {});

  function load(k, def) { return S.read(k, def); }
  function saveCart() { S.write('cart', cart, true); renderCartCount(); }
  function mine() { return S.read('mine', { orders: [], resas: [] }); }
  function saveMine(m) { S.write('mine', m, true); }

  /* date locale AAAA-MM-JJ (évite les décalages UTC) */
  const isoDay = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const canSell = () => S.settings().status === 'open' || !!tableNo;

  /* ---------- Logos et illustrations statiques ---------- */
  function paintStatic() {
    $$('[data-logo]').forEach(el => {
      const k = el.dataset.logo;
      el.innerHTML = k === 'mark' ? A.logo({ mark: true }) : k === 'word' ? A.logo({ word: true, color: '#2B201C' })
        : k === 'word-dark' ? A.logo({ word: true, color: '#2B201C' }) : A.logo();
    });
    $$('[data-art]').forEach(el => { const [k, tint] = el.dataset.art.split(':'); el.innerHTML = A.draw(k, tint); });
  }

  /* ---------- Bandeau démo + héros (bientôt / ouvert) ---------- */
  let cdTimer = null;
  function renderView() {
    const s = S.settings();
    $$('.seg').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === s.status)));
    $('#soonBox').hidden = s.status !== 'soon';
    $('#openBox').hidden = s.status !== 'open';
    $('#modeDeliveryCard').hidden = !s.delivery;
    // horaires du jour
    const h = s.hours[new Date().getDay()];
    $('#openHours').textContent = h.closed ? t('closed') : I.range(h.open, h.close);
    $('#openState').textContent = isOpenNow() ? t('openNow') : t('closedNow');
    // compte à rebours si une date d'ouverture est saisie
    clearInterval(cdTimer);
    const cd = $('#countdown');
    const target = s.openingDate ? new Date(s.openingDate).getTime() : 0;
    if (s.status === 'soon' && target > Date.now()) {
      $('#soonTitle').textContent = t('soonTitleDate');
      cd.hidden = false;
      const tick = () => {
        let ms = Math.max(0, target - Date.now());
        const parts = [[86400e3, 'd'], [3600e3, 'h'], [60e3, 'm'], [1e3, 's']].map(([u, k]) => { const v = Math.floor(ms / u); ms -= v * u; return [v, k]; });
        cd.innerHTML = parts.map(([v, k]) => '<div><b>' + String(v).padStart(2, '0') + '</b><small>' + t(k) + '</small></div>').join('');
      };
      tick(); cdTimer = setInterval(tick, 1000);
    } else {
      $('#soonTitle').textContent = t('soonTitle');
      cd.hidden = true;
    }
    // WhatsApp
    $('#waLink').href = waUrl(t('waText') + ' BREW');
  }
  function isOpenNow() {
    const s = S.settings(), d = new Date(), h = s.hours[d.getDay()];
    if (h.closed) return false;
    const cur = d.getHours() * 60 + d.getMinutes(), toMin = (x) => +x.split(':')[0] * 60 + +x.split(':')[1];
    return cur >= toMin(h.open) && cur < toMin(h.close);
  }
  function waUrl(text) {
    const n = (S.settings().whatsapp || '').replace(/\D/g, '');
    return 'https://wa.me/' + n + '?text=' + encodeURIComponent(text);
  }

  /* ---------- Bandeau défilant ---------- */
  function renderRibbon() {
    const names = D.categories.map(c => '<span>' + esc(L(c)) + '</span>').join('');
    $('#ribbon').innerHTML = names + names;
  }

  /* ---------- Signature Drinks ---------- */
  function renderSig() {
    $('#sigGrid').innerHTML = S.products().filter(p => p.sig).map(p =>
      '<button type="button" class="sig-card" data-open="' + p.id + '">' + A.draw(p.art, p.tint) +
      '<span><h3>' + esc(p.name) + '</h3><p>' + esc(L(p, 'd')) + '</p><span class="sig-card__price">' + money(p.price) + '</span></span>' +
      '<span class="btn btn--s sig-card__add" aria-hidden="true">+ ' + esc(t('add')) + '</span></button>').join('');
  }

  /* ---------- Carte : filtres, catégories, produits ---------- */
  const FILTERS = [['all', 'fAll', ''], ['hot', 'fHot', '#E9B266'], ['iced', 'fIced', '#9CC3D1'], ['sweet', 'fSweet', '#F2A7B0'], ['salty', 'fSalty', '#C98340'], ['healthy', 'fHealthy', '#9CBB66']];
  function renderFilters() {
    $('#filters').innerHTML = FILTERS.map(([id, k, c]) =>
      '<button type="button" class="chip" data-filter="' + id + '" aria-pressed="' + (state.filter === id) + '">' +
      (c ? '<span class="chip__dot" style="background:' + c + '"></span>' : '') + esc(t(k)) + '</button>').join('');
  }
  function visibleCats() { const hid = S.settings().hiddenCats; return D.categories.filter(c => hid.indexOf(c.id) === -1); }
  function matches(p) {
    if (state.filter !== 'all' && p.f.indexOf(state.filter) === -1) return false;
    if (!state.q) return true;
    const q = norm(state.q);
    return norm(p.name + ' ' + p.dfr + ' ' + p.dar).indexOf(q) !== -1;
  }
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  function renderMenu() {
    const all = S.products();
    let html = '', count = 0, chips = '';
    visibleCats().forEach(c => {
      const items = all.filter(p => p.cat === c.id && matches(p));
      if (!items.length) return;
      count += items.length;
      if (c.id === 'savory') html += '<p class="brunch-sep">' + esc(t('brunchSep')) + '</p>';
      chips += '<a class="chip" href="#cat-' + c.id + '" data-cat="' + c.id + '">' + esc(L(c)) + '</a>';
      html += '<div class="cat" id="cat-' + c.id + '"><div class="cat__head"><span class="cat__art">' + A.draw(c.art, c.tint) + '</span><div><h3 id="h-' + c.id + '">' + esc(L(c)) + '</h3>' +
        (c.id === 'vitrine' ? '<p>' + esc(t('vitrineNote')) + '</p>' : '') + '</div></div><div class="grid">' +
        items.map(card).join('') + '</div></div>';
    });
    $('#menuList').innerHTML = html;
    $('#cats').innerHTML = chips;
    $('#noResult').hidden = count > 0;
    spy();
  }
  function card(p) {
    const ok = S.canOrder(p);
    const badge = !p.available ? t('soldOut') : !p.inShowcase ? t('notShowcase') : '';
    const extras = (p.x || []).filter(k => S.settings().extras[k]);
    return '<button type="button" class="prod' + (ok ? '' : ' is-off') + '" data-open="' + p.id + '"' + (ok ? '' : ' aria-disabled="true"') + '>' +
      '<span class="prod__art">' + A.draw(p.art, p.tint) + '</span><span class="prod__body"><span class="prod__name">' + esc(p.name) + '</span>' +
      (L(p, 'd') ? '<span class="prod__desc">' + esc(L(p, 'd')) + '</span>' : '') +
      (badge ? '<span class="prod__tags"><span class="tag tag--fraise">' + esc(badge) + '</span></span>'
        : (p.choice || extras.length) ? '<span class="prod__tags">' + (p.choice ? '<span class="tag tag--caramel">' + p.choice.opts.map(o => esc(L(o))).join(' / ') + '</span>' : '') +
          (extras.length ? '<span class="tag">+ ' + extras.map(k => esc(L(D.extras[k]))).join(' · ') + '</span>' : '') + '</span>' : '') +
      '<span class="prod__foot"><span class="prod__price">' + money(p.price) + '</span><span class="prod__plus" aria-hidden="true">+</span></span></span>' +
      '<span class="sr">' + (ok ? esc(t('addLabel')) + ' ' + esc(p.name) : esc(badge)) + '</span></button>';
  }
  // catégorie active pendant le défilement
  let spyObs = null;
  function spy() {
    if (spyObs) spyObs.disconnect();
    if (!('IntersectionObserver' in window)) return;
    spyObs = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      $$('#cats .chip').forEach(c => c.classList.toggle('is-on', c.dataset.cat === e.target.id.slice(4)));
      const on = $('#cats .chip.is-on');
      if (on && on.scrollIntoView && window.innerWidth < 900) { const box = $('#cats'); box.scrollLeft = on.offsetLeft - 20 - (I.lang === 'ar' ? box.clientWidth - on.clientWidth - 40 : 0); }
    }), { rootMargin: '-45% 0px -50% 0px' });
    $$('.cat').forEach(s => spyObs.observe(s));
  }

  /* ---------- Fiche produit ---------- */
  function openProduct(id) {
    const p = S.product(id);
    if (!p || !S.canOrder(p)) return;
    const s = S.settings();
    const extras = (p.x || []).filter(k => s.extras[k]);
    let html = '<button type="button" class="x" data-close aria-label="' + esc(t('close')) + '">×</button>' +
      '<div class="ps__art">' + A.draw(p.art, p.tint) + '</div><h2 class="ps__name" id="sheetTitle">' + esc(p.name) + '</h2>' +
      (L(p, 'd') ? '<p class="ps__desc">' + esc(L(p, 'd')) + '</p>' : '');
    if (p.choice) {
      html += '<fieldset class="ps__group"><legend>' + esc(L(p.choice)) + ' <span class="tag tag--caramel">' + esc(t('required')) + '</span></legend>' +
        p.choice.opts.map((o, i) => '<label class="opt"><input type="radio" name="choice" value="' + o.id + '"' + (i === 0 ? ' required' : '') + '> ' + esc(L(o)) + '</label>').join('') + '</fieldset>';
    }
    if (extras.length) {
      html += '<fieldset class="ps__group"><legend>' + esc(t('extrasTitle')) + '</legend>' +
        extras.map(k => '<label class="opt"><input type="checkbox" name="x" value="' + k + '"> <span>' + esc(L(D.extras[k])) +
          (k === 'veggie' ? ' <small>(' + esc(t('ifAvail')) + ')</small>' : '') + '</span><span class="opt__price">+ ' + money(S.extraPrice(k)) + '</span></label>').join('') + '</fieldset>';
    }
    html += '<p class="form-msg is-err" id="psErr" role="alert"></p><div class="ps__foot"><div class="stepper"><button type="button" data-q="-1" aria-label="' + esc(t('less')) + '">−</button><output id="psQty" aria-label="' + esc(t('qty')) + '">1</output><button type="button" data-q="1" aria-label="' + esc(t('more')) + '">+</button></div>' +
      '<button type="submit" class="btn" id="psAdd" value="add">' + esc(t('add')) + ' · <span id="psTotal"></span></button></div>';
    const f = $('#sheetForm');
    f.innerHTML = html; f.dataset.pid = id;
    const update = () => {
      const qty = +$('#psQty').value;
      const extra = $$('input[name=x]:checked', f).reduce((a, i) => a + S.extraPrice(i.value), 0);
      $('#psTotal').textContent = money((p.price + extra) * qty);
    };
    $('#psQty').value = 1;
    f.onchange = update;
    f.onclick = (e) => {
      const q = e.target.closest('[data-q]');
      if (q) { $('#psQty').value = Math.max(1, Math.min(20, +$('#psQty').value + +q.dataset.q)); update(); }
      if (e.target.closest('[data-close]')) $('#sheet').close();
    };
    f.onsubmit = (e) => {
      e.preventDefault();
      const ch = $('input[name=choice]:checked', f);
      if (p.choice && !ch) { $('#psErr').textContent = t('errChoice'); return; }
      const opts = (ch ? ['choice:' + ch.value] : []).concat($$('input[name=x]:checked', f).map(i => i.value));
      addToCart({ pid: id, qty: +$('#psQty').value, opts });
      $('#sheet').close();
      toast(p.name + ' ' + t('added'));
    };
    update();
    $('#sheet').showModal();
  }

  /* ---------- Panier ---------- */
  function lineKey(l) { return l.formule ? 'f:' + l.formule.dish + ':' + l.formule.drink : l.pid + '|' + (l.opts || []).slice().sort().join(','); }
  function addToCart(l) {
    const k = lineKey(l), ex = cart.find(x => lineKey(x) === k);
    if (ex) ex.qty += l.qty; else cart.push(Object.assign({ id: S.uid('c') }, l));
    saveCart();
  }
  /* Prix et libellés d'une ligne (toujours recalculés : un changement de prix gérant est reflété) */
  function priced(l) {
    if (l.formule) {
      const fp = S.formulePrice(l.formule.dish, l.formule.drink);
      const dish = S.product(l.formule.dish), drink = S.product(l.formule.drink);
      return { name: t('fTitle'), sub: dish.name + ' · ' + drink.name + ' · Fresh Orange Juice', unit: fp.price, art: dish, ok: S.canOrder(dish) && S.canOrder(drink) };
    }
    const p = S.product(l.pid);
    const opts = (l.opts || []).map(k => {
      if (k.indexOf('choice:') === 0) { const o = p.choice.opts.find(c => c.id === k.slice(7)); return { k, fr: o.fr, ar: o.ar, price: 0 }; }
      return { k, fr: D.extras[k].fr, ar: D.extras[k].ar, price: S.extraPrice(k) };
    });
    return { name: p.name, sub: opts.map(o => L(o) + (o.price ? ' (+' + money(o.price) + ')' : '')).join(' · '), unit: p.price + opts.reduce((a, o) => a + o.price, 0), art: p, opts, ok: S.canOrder(p) };
  }
  function cartTotals() {
    const s = S.settings();
    const sub = cart.reduce((a, l) => a + priced(l).unit * l.qty, 0);
    const fee = state.mode === 'delivery' ? (s.zones.find(z => z.id === state.zone) || s.zones[0] || { fee: 0 }).fee : 0;
    const gift = state.freeDrink ? freeDrinkValue() : 0;
    return { sub, fee, gift, total: Math.max(0, sub + fee - gift), count: cart.reduce((a, l) => a + l.qty, 0) };
  }
  function freeDrinkValue() {
    const drinks = cart.filter(l => !l.formule && S.isDrink(l.pid)).map(l => S.product(l.pid).price);
    return drinks.length ? Math.min.apply(null, drinks) : 0;
  }
  function renderCartCount() {
    const tt = cartTotals();
    $('#cartCount').textContent = tt.count; $('#cartCount').dataset.n = tt.count;
    $('#cartBar').hidden = tt.count === 0;
    $('#cartBarN').textContent = tt.count;
    $('#cartBarTotal').textContent = money(tt.total);
    $('#trackPill').classList.toggle('is-low', tt.count === 0);
  }
  function slots() {
    const s = S.settings(), d = new Date(), h = s.hours[d.getDay()], out = [];
    if (h.closed) return out;
    const toMin = (x) => +x.split(':')[0] * 60 + +x.split(':')[1];
    let m = Math.max(toMin(h.open), Math.ceil((d.getHours() * 60 + d.getMinutes() + 15) / 15) * 15);
    for (; m <= toMin(h.close) - 15; m += 15) out.push(String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'));
    return out;
  }
  function renderCart() {
    const s = S.settings(), box = $('#cartIn');
    const form = { name: val('#cName'), phone: val('#cPhone'), address: val('#cAddress'), note: val('#cNote'), pickup: val('#cPickup'), table: val('#cTable') };
    if (state.mode === 'delivery' && !s.delivery) state.mode = 'collect';
    if (state.mode === 'table' && !s.tableOrder && !tableNo) state.mode = 'collect';
    if (state.mode === 'collect' && !s.collect && s.tableOrder) state.mode = 'table';
    if (!state.zone && s.zones[0]) state.zone = s.zones[0].id;
    let html = '<button type="button" class="x" data-close aria-label="' + esc(t('close')) + '">×</button><div class="ct"><h2 id="cartTitle">' + esc(t('cartTitle')) + '</h2>';
    if (!cart.length) {
      box.innerHTML = html + '<div style="width:150px;margin:20px auto">' + A.draw('cup', 'caramel') + '</div><p class="empty">' + esc(t('cartEmpty')) + '</p></div>';
      return;
    }
    html += '<ul class="ct__lines">' + cart.map(l => {
      const pr = priced(l);
      return '<li class="ct__line"><span>' + A.draw(pr.art.art, pr.art.tint) + '</span><span><strong>' + esc(pr.name) + '</strong>' + (pr.sub ? '<small>' + esc(pr.sub) + '</small>' : '') +
        '<small>' + money(pr.unit * l.qty) + '</small></span><span class="ct__qty"><button type="button" data-ln="' + l.id + '" data-d="-1" aria-label="' + esc(t('less')) + ' ' + esc(pr.name) + '">−</button><span>' + l.qty +
        '</span><button type="button" data-ln="' + l.id + '" data-d="1" aria-label="' + esc(t('more')) + ' ' + esc(pr.name) + '">+</button></span></li>';
    }).join('') + '</ul>';
    // modes de commande
    const modes = [];
    if (s.collect) modes.push(['collect', 'modeCollect']);
    if (s.tableOrder || tableNo) modes.push(['table', 'modeTable']);
    if (s.delivery) modes.push(['delivery', 'modeDelivery']);
    html += '<div class="ct__modes" role="group" aria-label="Mode">' + modes.map(([m, k]) => '<button type="button" data-mode="' + m + '" aria-pressed="' + (state.mode === m) + '">' + esc(t(k)) + '</button>').join('') + '</div>';
    html += '<div class="ct__form">';
    if (state.mode === 'collect') {
      html += '<div class="field"><label for="cPickup">' + esc(t('pickupTime')) + '</label><select id="cPickup"><option value="">' + esc(t('asap')) + '</option>' +
        slots().map(x => '<option' + (x === form.pickup ? ' selected' : '') + '>' + x + '</option>').join('') + '</select></div>';
    }
    if (state.mode === 'table') {
      html += tableNo ? '<p class="tag tag--ink" style="font-size:15px;padding:8px 14px;width:max-content">' + esc(t('modeTable')) + ' · Table ' + tableNo + '</p>'
        : '<div class="field"><label for="cTable">' + esc(t('tableNumber')) + '</label><select id="cTable">' + Array.from({ length: s.tables }, (_, i) => '<option' + (String(i + 1) === form.table ? ' selected' : '') + '>' + (i + 1) + '</option>').join('') + '</select></div>';
    }
    html += '<div class="form-grid"><div class="field"><label for="cName">' + esc(t('yourName')) + '</label><input id="cName" autocomplete="given-name" value="' + esc(form.name) + '"></div>' +
      '<div class="field"><label for="cPhone">' + esc(t('yourPhone')) + '</label><input id="cPhone" type="tel" inputmode="tel" autocomplete="tel" value="' + esc(form.phone) + '"></div></div>';
    if (state.mode === 'delivery') {
      html += '<div class="field"><label for="cZone">' + esc(t('zone')) + '</label><select id="cZone">' + s.zones.map(z => '<option value="' + z.id + '"' + (z.id === state.zone ? ' selected' : '') + '>' + esc(L(z)) + ' · ' + money(z.fee) + '</option>').join('') + '</select></div>' +
        '<div class="field"><label for="cAddress">' + esc(t('address')) + '</label><input id="cAddress" autocomplete="street-address" value="' + esc(form.address) + '"></div>';
    }
    html += '<div class="field"><label for="cNote">' + esc(t('note')) + '</label><input id="cNote" value="' + esc(form.note) + '"></div>';
    // fidélité : boisson offerte si la carte est pleine
    const c = form.phone && S.card(form.phone);
    if (c && c.stamps >= s.loyaltyGoal && freeDrinkValue()) {
      html += '<label class="check"><input type="checkbox" id="cFree"' + (state.freeDrink ? ' checked' : '') + '> ' + esc(t('freeDrink')) + '</label>';
    } else state.freeDrink = false;
    html += '</div>';
    const tt = cartTotals();
    html += '<div class="ct__sum"><div><span>' + esc(t('subtotal')) + '</span><span>' + money(tt.sub) + '</span></div>' +
      (tt.fee ? '<div><span>' + esc(t('deliveryFee')) + '</span><span>' + money(tt.fee) + '</span></div>' : '') +
      (tt.gift ? '<div><span>' + esc(t('reward')) + '</span><span>− ' + money(tt.gift) + '</span></div>' : '') +
      '<div class="is-total"><span>' + esc(t('total')) + '</span><span id="cTotal">' + money(tt.total) + '</span></div></div>';
    if (state.mode === 'delivery' && s.deliveryMin) html += '<p class="ct__info">' + esc(t('minDelivery')) + ' ' + money(s.deliveryMin) + '</p>';
    html += '<p class="ct__info">' + esc(t('payInfo')) + '</p><p class="form-msg is-err" id="cErr" role="alert"></p>';
    if (canSell()) html += '<button type="button" class="btn" style="width:100%;margin-top:6px" id="cSend">' + esc(t('send')) + ' · ' + money(tt.total) + '</button>';
    else html += '<p class="ct__soon">' + esc(t('soonOrder')) + '</p>';
    box.innerHTML = html + '</div>';
  }
  function val(sel) { const el = $(sel); return el ? el.value : ''; }

  function submitOrder() {
    const s = S.settings(), err = $('#cErr');
    const name = val('#cName').trim(), phone = val('#cPhone').trim();
    const tt = cartTotals();
    if (!name) { err.textContent = t('errName'); $('#cName').focus(); return; }
    if (state.mode !== 'table' && S.normPhone(phone).length < 9) { err.textContent = t('errPhone'); $('#cPhone').focus(); return; }
    if (state.mode === 'delivery' && !val('#cAddress').trim()) { err.textContent = t('errAddress'); $('#cAddress').focus(); return; }
    if (state.mode === 'delivery' && tt.sub < s.deliveryMin) { err.textContent = t('minDelivery') + ' ' + money(s.deliveryMin); return; }
    const lines = cart.map(l => {
      const pr = priced(l);
      if (l.formule) {
        return { id: S.uid('l'), pid: D.formule.id, name: 'Formule Brunch', qty: l.qty, unit: pr.unit, opts: [], station: 'kitchen',
          parts: [l.formule.dish, l.formule.drink, D.formule.juice].map(id => ({ pid: id, name: S.product(id).name, station: S.product(id).station })) };
      }
      const p = S.product(l.pid);
      return { id: S.uid('l'), pid: l.pid, name: p.name, qty: l.qty, unit: pr.unit, opts: pr.opts, station: p.station };
    });
    const o = S.addOrder({
      name, phone, mode: state.mode, lines, note: val('#cNote').trim(),
      table: state.mode === 'table' ? (tableNo || +val('#cTable') || 1) : null,
      pickup: state.mode === 'collect' ? val('#cPickup') : '',
      zone: state.mode === 'delivery' ? state.zone : '', address: state.mode === 'delivery' ? val('#cAddress').trim() : '',
      fee: tt.fee, discount: tt.gift, freeDrink: !!tt.gift, total: tt.total, paid: false
    });
    const m = mine(); m.orders.push(o.id); saveMine(m);
    cart = []; state.freeDrink = false; saveCart();
    $('#cart').close();
    openTrack(o.id);
  }

  /* ---------- Formule Brunch ---------- */
  function renderFormule() {
    const all = S.products();
    const dishes = all.filter(p => D.formule.dishCats.indexOf(p.cat) !== -1 && S.canOrder(p));
    const drinks = all.filter(p => p.classic && S.canOrder(p));
    if (!state.dish || !dishes.some(p => p.id === state.dish)) state.dish = dishes[0] && dishes[0].id;
    if (!state.drink || !drinks.some(p => p.id === state.drink)) state.drink = drinks.find(p => p.id === 'cappuccino') ? 'cappuccino' : drinks[0] && drinks[0].id;
    const opt = (p, name, sel) => '<label class="pick__opt">' + A.draw(p.art, p.tint) + '<input type="radio" name="' + name + '" value="' + p.id + '"' + (sel ? ' checked' : '') + '>' + esc(p.name) + '<span class="pick__price">' + money(p.price) + '</span></label>';
    $('#fDish').innerHTML = dishes.map(p => opt(p, 'fdish', p.id === state.dish)).join('');
    $('#fDrink').innerHTML = drinks.map(p => opt(p, 'fdrink', p.id === state.drink)).join('');
    priceFormule();
  }
  function priceFormule() {
    if (!state.dish || !state.drink) return;
    const fp = S.formulePrice(state.dish, state.drink);
    $('#fNow').textContent = money(fp.price);
    $('#fWas').textContent = money(fp.sum);
  }

  /* ---------- Suivi de commande ---------- */
  let trackId = null;
  function openTrack(id) { trackId = id; renderTrack(); if (!$('#track').open) $('#track').showModal(); }
  function renderTrack() {
    renderTrackPill();
    if (!trackId) return;
    const o = S.orders().find(x => x.id === trackId);
    if (!o) return;
    const st = S.orderStatus(o);
    const order = ['received', 'preparing', 'ready'];
    const idx = st === 'done' ? 3 : order.indexOf(st);
    const lbl = { received: 'stReceived', preparing: 'stPreparing', ready: 'stReady' };
    const mins = Math.max(0, Math.round((Date.now() - o.createdAt) / 60000));
    let html = '<button type="button" class="x" data-close aria-label="' + esc(t('close')) + '">×</button><div class="tk"><h2 id="trackTitle">' + esc(t('trackTitle')) + '</h2>' +
      '<p class="tk__num">' + esc(t('order')) + ' ' + I.ltr('#' + String(o.num).padStart(3, '0')) + ' · ' + esc(o.name) + ' · ' + (o.mode === 'table' ? 'Table ' + o.table : o.mode === 'delivery' ? esc(t('modeDelivery')) : esc(t('modeCollect')) + (o.pickup ? ' · ' + esc(t('pickupAt')) + ' ' + o.pickup : '')) +
      ' · ' + esc(t('since')) + ' ' + mins + ' min</p>';
    if (st === 'cancelled') html += '<p class="ct__soon">' + esc(t('stCancelled')) + '</p>';
    else html += '<ol class="tk__steps" aria-label="' + esc(t('trackTitle')) + '">' + order.map((k, i) => '<li class="' + (i < idx || st === 'done' || (i === idx && k === 'ready') ? 'is-done' : i === idx ? 'is-now' : '') + '"' + (i === idx ? ' aria-current="step"' : '') + '>' + esc(t(lbl[k])) + '</li>').join('') + '</ol>';
    if (st === 'ready' || st === 'done') {
      html += '<div class="tk__ready" id="tkReady">' + A.draw('cup', 'matcha') + '<div><strong>' + esc(st === 'done' ? t('stDone') : t('readyMsg')) + '</strong>' +
        (st === 'ready' ? esc(o.mode === 'table' ? t('readyTable') : o.mode === 'delivery' ? t('readyDelivery') : t('readyCollect')) : '') + '</div></div>';
    }
    html += '<div class="tk__stations">' + Object.keys(o.st).map(k => '<div><b>' + esc(t(k)) + '</b>' + esc(o.st[k] === 'ready' ? t('ready') + ' ✓' : o.st[k] === 'doing' ? t('inProgress') : t('waiting')) + '</div>').join('') + '</div>';
    html += '<p class="tk__lines">' + o.lines.map(l => l.qty + ' × ' + esc(l.name) + (l.opts && l.opts.length ? ' (' + l.opts.map(x => esc(L(x))).join(', ') + ')' : '') + (l.parts ? ' — ' + l.parts.map(p => esc(p.name)).join(' · ') : '')).join('<br>') +
      '<br><strong>' + esc(t('total')) + ' : ' + money(o.total) + '</strong></p>';
    html += '<div class="tk__acts"><a class="btn btn--line" target="_blank" rel="noopener" href="' + waUrl(t('waText') + ' ' + I.ltr('#' + String(o.num).padStart(3, '0')) + ' (' + o.name + ')') + '">' + esc(t('whatsapp')) + '</a>' +
      '<button type="button" class="btn" data-close>' + esc(t('newOrder')) + '</button></div></div>';
    $('#trackIn').innerHTML = html;
    $('#trackIn').dataset.status = st;
  }
  function activeOrder() {
    const ids = mine().orders, list = S.orders();
    for (let i = ids.length - 1; i >= 0; i--) {
      const o = list.find(x => x.id === ids[i]);
      if (o && ['received', 'preparing', 'ready'].indexOf(S.orderStatus(o)) !== -1) return o;
    }
    return null;
  }
  function renderTrackPill() {
    const o = activeOrder(), pill = $('#trackPill');
    pill.hidden = !o;
    pill.classList.toggle('is-low', $('#cartBar').hidden);
    if (!o) return;
    const ready = S.orderStatus(o) === 'ready';
    pill.classList.toggle('is-ready', ready);
    $('#trackPillTxt').textContent = ready ? t('readyMsg') : t('trackOpen') + ' ' + I.ltr('#' + String(o.num).padStart(3, '0'));
    pill.dataset.id = o.id;
  }
  /* Notification quand le bar / la cuisine passe la commande en « prête » */
  function watchReady() {
    const list = S.orders();
    mine().orders.forEach(id => {
      const o = list.find(x => x.id === id);
      if (o && S.orderStatus(o) === 'ready' && !readyNotified[id]) {
        readyNotified[id] = true; S.write('readyNotified', readyNotified, true);
        toast(t('readyMsg') + ' ' + I.ltr('#' + String(o.num).padStart(3, '0')), true);
        try { navigator.vibrate && navigator.vibrate([120, 60, 120]); } catch (e) { }
        document.title = '✅ ' + t('readyMsg') + ' — BREW';
      }
    });
  }

  /* ---------- Fidélité ---------- */
  function renderLoyalty(c) {
    const goal = S.settings().loyaltyGoal;
    $('#lLead').textContent = t('lLead', { n: goal });
    const n = c ? Math.min(c.stamps, goal) : 0;
    $('#stampCount').textContent = t('lStamps', { s: n, n: goal });
    let h = '';
    for (let i = 0; i < goal; i++) {
      const last = i === goal - 1;
      h += '<span class="stamp' + (i < n ? ' is-on' : '') + (last ? ' is-gift' : '') + '">' + (i < n ? A.draw('cup', 'caramel', { nobg: true }) : last ? '<span>' + esc(t('reward')) + '</span>' : '') + '</span>';
    }
    $('#stamps').innerHTML = h;
  }

  /* ---------- Réservation ---------- */
  function renderBookTimes() {
    const s = S.settings(), d = $('#bDate').value ? new Date($('#bDate').value + 'T12:00') : new Date();
    const h = s.hours[d.getDay()], cur = $('#bTime').value;
    const toMin = (x) => +x.split(':')[0] * 60 + +x.split(':')[1];
    let opts = '';
    if (!h.closed) for (let m = toMin(h.open); m <= toMin(h.close) - 60; m += 30) {
      const v = String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
      opts += '<option' + (v === (cur || '10:30') ? ' selected' : '') + '>' + v + '</option>';
    }
    $('#bTime').innerHTML = opts || '<option value="">' + esc(t('closed')) + '</option>';
  }
  function renderMyResas() {
    const ids = mine().resas, all = S.resas().filter(r => ids.indexOf(r.id) !== -1);
    $('#myResas').hidden = !all.length;
    const lab = { pending: ['bPending', 'tag--caramel'], confirmed: ['bConfirmed', ''], declined: ['bDeclined', 'tag--fraise'] };
    $('#myResaList').innerHTML = all.map(r => '<li><span>' + esc(new Date(r.date + 'T12:00').toLocaleDateString(I.lang === 'ar' ? 'ar-DZ' : 'fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })) + ' · ' + r.time + ' · ' + r.people + ' pers.</span><span class="tag ' + lab[r.status][1] + '" data-resa="' + r.id + '">' + esc(t(lab[r.status][0])) + '</span></li>').join('');
  }

  /* ---------- Horaires ---------- */
  function renderHours() {
    const s = S.settings(), today = new Date().getDay(), days = t('days');
    const order = [6, 0, 1, 2, 3, 4, 5]; // semaine algérienne : samedi → vendredi
    const same = s.hours.every(h => h.open === s.hours[0].open && h.close === s.hours[0].close && h.closed === s.hours[0].closed);
    const txt = (h) => h.closed ? t('closed') : I.range(h.open, h.close);
    $('#hoursList').innerHTML = same
      ? '<dt>' + esc(t('everyDay')) + '</dt><dd>' + txt(s.hours[0]) + '</dd>'
      : order.map(d => '<dt' + (d === today ? ' class="is-today"' : '') + '>' + esc(days[d]) + '</dt><dd' + (d === today ? ' class="is-today"' : '') + '>' + txt(s.hours[d]) + '</dd>').join('');
  }

  /* ---------- Petites notifications ---------- */
  function toast(msg, ok) {
    const el = document.createElement('div');
    el.className = 'toast' + (ok ? ' toast--ok' : '');
    el.textContent = msg;
    $('#toasts').appendChild(el);
    setTimeout(() => el.remove(), ok ? 6000 : 2600);
  }

  /* ---------- Rendu complet (langue, réglages) ---------- */
  function renderAll() {
    I.apply();
    paintStatic();
    renderView(); renderRibbon(); renderSig(); renderFilters(); renderMenu(); renderFormule();
    renderLoyalty(lastCard); renderBookTimes(); renderMyResas(); renderHours(); renderCartCount(); renderTrackPill();
    if (tableNo) { $('#tableBanner').hidden = false; $('#tableNum').textContent = 'Table ' + tableNo; }
    if ($('#cart').open) renderCart();
    if ($('#track').open) renderTrack();
  }
  let lastCard = null;

  /* ---------- Événements ---------- */
  document.addEventListener('click', (e) => {
    const op = e.target.closest('[data-open]');
    if (op) { openProduct(op.dataset.open); return; }
    const fl = e.target.closest('[data-filter]');
    if (fl) { state.filter = fl.dataset.filter; renderFilters(); renderMenu(); return; }
    const seg = e.target.closest('.seg');
    if (seg) { S.saveSettings({ status: seg.dataset.view }); return; }
    if (e.target.closest('[data-close]')) { const d = e.target.closest('dialog'); if (d) d.close(); return; }
    const ln = e.target.closest('[data-ln]');
    if (ln) {
      const l = cart.find(x => x.id === ln.dataset.ln);
      if (l) { l.qty += +ln.dataset.d; if (l.qty <= 0) cart = cart.filter(x => x !== l); saveCart(); renderCart(); }
      return;
    }
    const md = e.target.closest('[data-mode]');
    if (md) { state.mode = md.dataset.mode; renderCart(); return; }
    if (e.target.closest('#cSend')) { submitOrder(); return; }
    if (e.target.closest('#trackPill')) { openTrack($('#trackPill').dataset.id); return; }
    const stp = e.target.closest('[data-step]');
    if (stp) { state.people = Math.max(1, Math.min(20, state.people + +stp.dataset.step)); $('#bPeople').value = state.people; }
  });
  $('#cartBtn').onclick = $('#cartBar').onclick = () => { renderCart(); $('#cart').showModal(); };
  $('#cart').addEventListener('change', (e) => {
    if (e.target.id === 'cZone') { state.zone = e.target.value; renderCart(); }
    if (e.target.id === 'cFree') { state.freeDrink = e.target.checked; renderCart(); }
  });
  $('#cart').addEventListener('input', (e) => {
    if (e.target.id === 'cPhone') {
      // affiche la case « boisson offerte » dès que le numéro correspond à une carte pleine
      const had = !!$('#cFree'), c = S.card(e.target.value), has = c && c.stamps >= S.settings().loyaltyGoal && freeDrinkValue();
      if (!!has !== had) { const pos = e.target.selectionStart; renderCart(); const p = $('#cPhone'); p.focus(); try { p.setSelectionRange(pos, pos); } catch (x) { } }
    }
  });
  // fermer une fenêtre en cliquant sur le fond
  $$('dialog').forEach(d => d.addEventListener('click', (e) => { if (e.target === d) d.close(); }));
  $('#track').addEventListener('close', () => { trackId = null; document.title = 'BREW — Coffee & Brunch'; });

  $('#langBtn').onclick = () => { I.setLang(I.lang === 'ar' ? 'fr' : 'ar'); renderAll(); };
  $('#q').addEventListener('input', (e) => { state.q = e.target.value.trim(); renderMenu(); });

  $('#formule').addEventListener('change', (e) => {
    if (e.target.name === 'fdish') state.dish = e.target.value;
    if (e.target.name === 'fdrink') state.drink = e.target.value;
    priceFormule();
  });
  $('#fAdd').onclick = () => {
    if (!state.dish || !state.drink) { toast(t('errDish')); return; }
    addToCart({ pid: D.formule.id, qty: 1, formule: { dish: state.dish, drink: state.drink } });
    toast(t('fTitle') + ' ' + t('added'));
  };

  $('#notifyForm').onsubmit = (e) => {
    e.preventDefault();
    const msg = $('#notifyMsg'), ph = $('#nPhone').value;
    if (S.normPhone(ph).length < 9) { msg.textContent = t('errPhone'); msg.classList.add('is-err'); return; }
    const ok = S.addNotify(ph, $('#nName').value);
    msg.classList.remove('is-err');
    msg.textContent = ok ? t('notifyOk') : t('notifyDup');
    if (ok) e.target.reset();
  };
  $('#loyalForm').onsubmit = (e) => {
    e.preventDefault();
    const ph = $('#lPhone').value, msg = $('#loyalMsg');
    if (S.normPhone(ph).length < 9) { msg.textContent = t('errPhone'); return; }
    lastCard = S.card(ph) || { stamps: 0 };
    const goal = S.settings().loyaltyGoal;
    renderLoyalty(lastCard);
    msg.textContent = !S.card(ph) ? t('lNew') : lastCard.stamps >= goal ? t('lReward') : t('lLeft', { k: goal - lastCard.stamps });
  };
  $('#bDate').addEventListener('change', renderBookTimes);
  $('#bookForm').onsubmit = (e) => {
    e.preventDefault();
    const msg = $('#bookMsg'); msg.classList.add('is-err');
    const date = $('#bDate').value, today = isoDay(new Date());
    if (!date || date < today) { msg.textContent = t('bErrDate'); return; }
    if (!$('#bName').value.trim()) { msg.textContent = t('errName'); return; }
    if (S.normPhone($('#bPhone').value).length < 9) { msg.textContent = t('errPhone'); return; }
    if (!$('#bTime').value) { msg.textContent = t('bErrDate'); return; }
    const r = S.addResa({ name: $('#bName').value.trim(), phone: $('#bPhone').value.trim(), date, time: $('#bTime').value, people: state.people, note: $('#bNote').value.trim() });
    const m = mine(); m.resas.push(r.id); saveMine(m);
    msg.classList.remove('is-err'); msg.textContent = t('bOk');
    renderMyResas();
  };

  /* Synchronisation avec le bar / la cuisine / le gérant (autres onglets) */
  S.on((key) => {
    if (key === 'orders') { watchReady(); renderTrack(); }
    if (key === 'resas') renderMyResas();
    if (key === 'settings' || key === 'menu') renderAll();
  });
  setInterval(() => { if ($('#track').open) renderTrack(); }, 30000);

  /* ---------- Démarrage ---------- */
  const tomorrow = new Date(Date.now() + 86400e3);
  $('#bDate').min = isoDay(new Date());
  $('#bDate').value = isoDay(tomorrow);
  renderAll();
  // Les commandes déjà prêtes au chargement ne déclenchent pas de nouvelle alerte
  mine().orders.forEach(id => { const o = S.orders().find(x => x.id === id); if (o && S.orderStatus(o) !== 'received' && S.orderStatus(o) !== 'preparing') readyNotified[id] = true; });
})();
