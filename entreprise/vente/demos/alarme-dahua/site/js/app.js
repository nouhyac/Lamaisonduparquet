/* Kit alarme Dahua AirShield — page de vente : textes FR/AR, kit, simulateur, commande */
(function () {
  'use strict';
  const $ = s => document.querySelector(s), $$ = s => document.querySelectorAll(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => n.toLocaleString('fr-FR').replace(/ | /g, ' ') + ' DA';
  const store = { get(k, d) { try { const v = localStorage.getItem('ads-' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem('ads-' + k, JSON.stringify(v)); } catch (e) { /* bloqué */ } } };
  let lang = store.get('lang', 'fr');

  const AR = {
    nKit: 'المجموعة', nHow: 'كيف يعمل', nFaq: 'أسئلة', order: 'اطلب', heroK: 'مجموعة إنذار لاسلكية · Dahua AirShield',
    heroT: 'منزلك<br><span class="red">ينبّهك.</span><br>أينما كنت.',
    heroP: 'باب يُفتح في الساعة 2 ليلاً؟ يرنّ هاتفك، تنطلق الصفارة وتصلك رسالة. حتى بدون إنترنت. حتى عند انقطاع الكهرباء.',
    h1: 'تركيب بدون أسلاك في دقائق', h2: 'واي فاي + كابل + شريحة SIM: لا ينقطع أبداً', h3: 'مكالمة ورسالة إلى 5 أرقام', h4: 'بطاريات تدوم حتى 5 سنوات في الكواشف',
    ctaHero: 'اطلب مجموعتي', ctaSim: 'جرّب الإنذار ▶', nt1: 'إنذار · الباب الرئيسي', ns1: 'تم كشف فتح · 02:14', nt2: 'الإنذار يتصل بك', ns2: '+ رسالة إلى 5 أرقام',
    tr1: 'علامة عالمية في الأمن', tr2: 'اتصال مشفّر', tr3: 'مدى لاسلكي', tr4: 'على البطارية',
    scK: 'لماذا', scT: 'ثلاث لحظات يغيّر فيها كل شيء', sc1t: 'تسافر في عطلة', sc1p: 'نقرة على «خارج المنزل» عند إغلاق الباب، وترى حالة المنزل من هاتفك.',
    sc2t: 'أنت نائم', sc2p: 'وضع «المنزل»: الأبواب مراقبة وتتحرك بحرية في الداخل.', sc3t: 'لديك حيوان أليف', sc3p: 'الكاشف يتجاهل الحيوانات حتى 18 كغ: لا إنذار كاذب بسبب القط.',
    kitK: 'داخل العلبة', kitT: '4 قطع. كل شيء جاهز.', kitP: 'المجموعة الأصلية Dahua AirShield، المرجع DHI-ART-ARC3000H-03-GW2(868). الأرقام من الوثيقة التقنية للمصنّع.',
    simK: 'كيف يعمل', simT: 'جرّب الإنذار هنا والآن', simP: 'فعّل النظام ثم تسبّب في اقتحام: شاهد ما يصل إلى الهاتف.',
    c1: '1 · تفعيل', c2: '2 · اقتحام', c3: '3 · أسوأ الحالات', aAway: 'خارج المنزل', aHome: 'في المنزل (ليلاً)', aDis: 'إيقاف', aDoor: 'فتح الباب', aMove: 'حركة في الصالون', aCat: 'مرور القط', aNet: 'قطع الإنترنت', aPow: 'انقطاع الكهرباء', aSos: 'نجدة SOS',
    stOff: 'متوقف', callT: 'الإنذار يتصل بك', callS: 'اقتحام: الباب الرئيسي',
    simF: 'محاكاة مطابقة لطريقة العمل التي تصفها Dahua. التطبيق الرسمي اسمه DMSS.',
    inK: 'التركيب', inT: 'جاهز في 3 خطوات بدون أي سلك', s1t: 'وصّل الجهاز المركزي', s1p: 'في مقبس وسط المنزل. اربطه بالواي فاي أو بكابل المودم، وضع شريحة SIM للأمان.',
    s2t: 'أضفه في DMSS', s2p: 'تطبيق Dahua المجاني. تُضاف كواشف المجموعة في ثوانٍ.', s3t: 'ثبّت الكواشف', s3p: 'كاشف الفتح على الباب، وكاشف الحركة على الحائط بارتفاع 2.2 م في زاوية الغرفة.',
    neK: 'لا ينقطع أبداً', neT: 'ثلاث اتصالات وبطارية', neP: 'لصّ قطع الإنترنت؟ يتحول الجهاز إلى شريحة SIM ويتصل بك. انقطعت الكهرباء؟ بطاريته تدوم 12 ساعة.',
    eth: 'كابل RJ-45', sim: 'شريحة SIM', bat: 'بطارية', bat2: '12 ساعة احتياط', schC: 'المخطط الرسمي من Dahua',
    apK: 'تطبيق DMSS · مجاني', apT: 'المنزل كله في جيبك', ap1: 'التفعيل والإيقاف عن بعد أو في أوقات محددة', ap2: 'تنبيهات فورية وسجل الأحداث', ap3: 'مستوى البطارية والإشارة لكل كاشف', ap4: 'مشاركة مع العائلة: الجميع يتلقى التنبيهات', ap5: 'ربط بالفيديو مع كاميرات Dahua',
    evK: 'قابل للتوسيع', evP: 'ملحق لاسلكي على جهاز واحد: كواشف أخرى، حتى 6 صفارات و64 جهاز تحكم.', f1: '🏡 منزل وفيلا', f2: '🏢 شقة', f3: '🏪 محل ومكتب',
    spT: 'الوثيقة التقنية الكاملة', fqK: 'أسئلة شائعة', fqT: 'تتساءل…', orK: 'الطلب', orT: 'احمِ منزلك هذا الأسبوع',
    o1: 'المجموعة الأصلية من Dahua (4 قطع)', o2: 'نتصل بك لتأكيد الطلب', o3: 'متوافق مع كاميرات Dahua',
    fName: 'الاسم واللقب', fPhone: 'الهاتف', fWil: 'الولاية', fCom: 'البلدية', fAdr: 'العنوان', fQty: 'الكمية', fSend: 'أطلب', fNote: 'لا دفع عبر الإنترنت. المحل يتصل بك للتأكيد.',
    dT: 'تم استلام طلبك!', dWa: 'أرسله أيضاً عبر واتساب', legal: 'Dahua و AirShield علامتان لشركة Zhejiang Dahua Vision Technology. الخصائص من الوثيقة التقنية الرسمية. صور الأجواء: رسوم توضيحية.', admin: 'فضاء الطلبات', stk: 'اطلب المجموعة'
  };
  const FRX = {}; // textes FR d'origine, relevés dans la page
  $$('[data-t]').forEach(el => { FRX[el.dataset.t] = el.hasAttribute('data-html') ? el.innerHTML : el.textContent; });
  const t = k => (lang === 'ar' && AR[k] != null ? AR[k] : FRX[k] != null ? FRX[k] : (DYN.fr[k] || k));
  const DYN = {
    fr: { ask: 'Prix et disponibilité : réponse rapide', save: 'Économisez', ordered: 'Merci {n} ! Nous vous appelons au {p} pour confirmer votre commande.', eName: 'Indiquez votre nom.', ePhone: 'Numéro algérien à 10 chiffres (05, 06 ou 07).', eWil: 'Choisissez votre wilaya.', eCom: 'Indiquez votre commune.', choose: 'Choisir…', shop: 'Commandez en ligne : le magasin vous rappelle pour confirmer.' },
    ar: { ask: 'السعر والتوفر: رد سريع', save: 'وفّر', ordered: 'شكراً {n}! سنتصل بك على {p} لتأكيد طلبك.', eName: 'اكتب اسمك.', ePhone: 'رقم جزائري من 10 أرقام (05، 06 أو 07).', eWil: 'اختر ولايتك.', eCom: 'اكتب بلديتك.', choose: 'اختر…', shop: 'اطلب عبر الإنترنت: المحل يتصل بك للتأكيد.' }
  };
  const d = k => DYN[lang][k];

  /* ---------- prix ---------- */
  function renderPrice() {
    const S = window.SHOP;
    const html = S.price ? '<span class="p">' + money(S.price) + '</span>' + (S.oldPrice ? '<span class="o">' + money(S.oldPrice) + '</span><span class="pill">' + d('save') + ' ' + money(S.oldPrice - S.price) + '</span>' : '') : '<span class="ask">' + d('ask') + '</span>';
    ['#priceRow', '#priceRow2'].forEach(s => { $(s).innerHTML = html; });
    $('#stkPrice').textContent = S.price ? money(S.price) : '→';
    $('#shopLine').textContent = S.name ? S.name + (S.phone ? ' · ' + S.phone : '') : d('shop');
    if (S.name) document.title = S.name + ' · Kit alarme Dahua AirShield';
  }

  /* ---------- kit ---------- */
  function renderKit() {
    $('#kitGrid').innerHTML = window.KIT.items.map(i => '<article class="kc"><div class="im"><img src="img/' + i.img + '.webp" alt="' + esc(i.name.fr) + '" loading="lazy"></div><div><h3>' + esc(i.name[lang]) + '</h3><span class="ref">' + esc(i.ref) + '</span></div><p>' + esc(i.role[lang]) + '</p><ul>' + i.specs[lang].map(s => '<li>' + esc(s) + '</li>').join('') + '</ul></article>').join('');
  }

  /* ---------- fiche technique (fiche officielle) ---------- */
  const SPEC = [
    ['Référence du kit', 'DHI-ART-ARC3000H-03-GW2(868) : centrale, télécommande, détecteur d\'ouverture, détecteur de mouvement'],
    ['Capacité', '150 accessoires sans fil (dont 6 sirènes et 64 télécommandes)'],
    ['Réseau de la centrale', 'Ethernet RJ-45 10/100 M · Wi-Fi 2,4 GHz · GPRS (carte SIM GSM 900/1800 MHz, double SIM en veille simple, bascule automatique)'],
    ['Alertes', 'Application DMSS (notifications) · SMS vers 5 numéros · appels vers 5 numéros · SOS · buzzer intégré'],
    ['Radio', '868,0 à 868,6 MHz · communication bidirectionnelle · saut de fréquence · chiffrement AES-128'],
    ['Portée (champ libre)', 'Centrale 2 000 m · télécommande 900 m · détecteur d\'ouverture 1 200 m · détecteur de mouvement 1 600 m'],
    ['Alimentation', 'Centrale 12 V DC 1,5 A + batterie lithium (12 h) · télécommande CR2032 (5 ans) · ouverture CR123A (5 ans) · mouvement CR123A (4 ans)'],
    ['Détecteur de mouvement', '12 m à 90° (pose à 2,2 m) · immunité animaux ≤ 18 kg · 3 niveaux de sensibilité · compensation de température'],
    ['Détecteur d\'ouverture', 'Contact à lame souple · déclenchement à moins de 40 mm · 1 entrée filaire externe · portes non métalliques'],
    ['Autres', 'Alarme d\'arrachement (centrale et détecteurs) · alarme pile faible · mise à jour par le cloud · mesure de température'],
    ['Dimensions', 'Centrale 163 × 163 × 32 mm (0,38 kg) · télécommande 60 × 39,5 × 15 mm · ouverture 100,2 × 20,8 × 20,3 mm · mouvement 104 × 60 × 50 mm'],
    ['Utilisation', 'Intérieur · −10 °C à +55 °C · villas, magasins, appartements · certifié CE']
  ];
  function renderSpecs() { $('#specTable').innerHTML = SPEC.map(r => '<tr><th>' + esc(r[0]) + '</th><td>' + esc(r[1]) + '</td></tr>').join(''); }

  /* ---------- FAQ ---------- */
  const FAQ = {
    fr: [
      ['Et si le cambrioleur coupe Internet ?', 'La centrale passe automatiquement sur la carte SIM (réseau 2G) : elle vous envoie quand même un SMS et vous appelle, jusqu\'à 5 numéros.'],
      ['Et en cas de coupure de courant ?', 'La centrale a une batterie intégrée qui tient jusqu\'à 12 heures. Les détecteurs fonctionnent sur piles.'],
      ['J\'ai un chat ou un petit chien.', 'Le détecteur de mouvement ignore les animaux jusqu\'à 18 kg. Vous pouvez aussi régler sa sensibilité sur 3 niveaux.'],
      ['Faut-il un abonnement ?', 'Non. L\'application DMSS de Dahua est gratuite. Les SMS et appels d\'alerte passent par la carte SIM que vous mettez dans la centrale.'],
      ['Combien de temps durent les piles ?', 'Jusqu\'à 5 ans pour la télécommande et le détecteur d\'ouverture, jusqu\'à 4 ans pour le détecteur de mouvement. L\'application vous prévient quand une pile est faible.'],
      ['Est-ce difficile à installer ?', 'Non : tout est sans fil. On branche la centrale, on l\'ajoute dans l\'application, on fixe les deux détecteurs.'],
      ['Je peux ajouter des détecteurs plus tard ?', 'Oui. La centrale accepte jusqu\'à 150 accessoires sans fil, dont 6 sirènes et 64 télécommandes. Elle se relie aussi aux caméras Dahua dans l\'application.'],
      ['Et si on arrache un détecteur ?', 'La centrale et les détecteurs ont une alarme anti-arrachement : vous êtes prévenu.']
    ],
    ar: [
      ['ماذا لو قطع اللص الإنترنت؟', 'يتحول الجهاز تلقائياً إلى شريحة SIM (شبكة 2G): يرسل لك رسالة ويتصل بك، حتى 5 أرقام.'],
      ['وعند انقطاع الكهرباء؟', 'للجهاز المركزي بطارية مدمجة تدوم حتى 12 ساعة. الكواشف تعمل بالبطاريات.'],
      ['لدي قط أو كلب صغير.', 'كاشف الحركة يتجاهل الحيوانات حتى 18 كغ، ويمكن ضبط حساسيته على 3 مستويات.'],
      ['هل يلزم اشتراك؟', 'لا. تطبيق DMSS من Dahua مجاني. رسائل ومكالمات الإنذار تمر عبر شريحة SIM التي تضعها في الجهاز.'],
      ['كم تدوم البطاريات؟', 'حتى 5 سنوات لجهاز التحكم وكاشف الفتح، وحتى 4 سنوات لكاشف الحركة. التطبيق ينبهك عند ضعف البطارية.'],
      ['هل التركيب صعب؟', 'لا: كل شيء لاسلكي. توصل الجهاز، تضيفه في التطبيق، وتثبت الكاشفين.'],
      ['هل يمكن إضافة كواشف لاحقاً؟', 'نعم. يقبل الجهاز حتى 150 ملحقاً لاسلكياً منها 6 صفارات و64 جهاز تحكم، ويرتبط بكاميرات Dahua.'],
      ['وإذا نُزع كاشف؟', 'للجهاز والكواشف إنذار ضد النزع: يتم تنبيهك.']
    ]
  };
  function renderFaq() { $('#faqList').innerHTML = FAQ[lang].map(q => '<details><summary>' + esc(q[0]) + '</summary><p>' + esc(q[1]) + '</p></details>').join(''); }

  /* ---------- langue ---------- */
  function applyLang() {
    document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    $('#lang').textContent = lang === 'ar' ? 'FR' : 'ع';
    $$('[data-t]').forEach(el => { const v = t(el.dataset.t); if (el.hasAttribute('data-html')) el.innerHTML = v; else el.textContent = v; });
    renderKit(); renderFaq(); renderPrice(); fillWilayas(); simLang();
  }
  $('#lang').onclick = () => { lang = lang === 'fr' ? 'ar' : 'fr'; store.set('lang', lang); applyLang(); };

  /* ---------- simulateur ---------- */
  const SL = {
    fr: { off: 'Désarmé', away: 'Absent', home: 'Maison', al: 'ALARME', wifi: 'Wi-Fi ✓', simnet: 'Internet coupé → carte SIM ✓', bat: 'Courant coupé → batterie ✓', both: 'SIM + batterie ✓',
      eAway: ['Système armé · Absent', 'Portes et mouvements surveillés'], eHome: ['Mode Maison activé', 'Portes surveillées, vous circulez à l\'intérieur'], eDis: ['Système désarmé', 'Bon retour à la maison'],
      eDoor: ['Intrusion : porte d\'entrée', 'Ouverture détectée · sirène déclenchée'], eMove: ['Intrusion : salon', 'Mouvement détecté · sirène déclenchée'], eSos: ['SOS déclenché', 'Alerte d\'urgence envoyée'],
      eSms: ['SMS envoyé', 'à 5 numéros (famille, voisin…)'], eCall: ['Appel en cours', 'vers le 1er numéro'], eDoorOff: ['Porte ouverte', 'Système désarmé : pas d\'alarme'], eMoveOff: ['Mouvement dans le salon', 'Système désarmé : pas d\'alarme'],
      eMoveHome: ['Mouvement dans le salon', 'Mode Maison : l\'intérieur n\'est pas surveillé'], eCat: ['Animal détecté (moins de 18 kg)', 'Pas de fausse alerte'], eNet: ['Internet coupé', 'La centrale passe sur la carte SIM'], eNetBack: ['Internet rétabli', 'Retour sur le Wi-Fi'],
      ePow: ['Coupure de courant', 'La centrale continue sur sa batterie (12 h)'], ePowBack: ['Courant rétabli', 'Batterie en recharge'], viaSim: ' · via la carte SIM', callS: 'Intrusion : ', door: 'porte d\'entrée', salon: 'salon', sos: 'SOS', hint: ['Bienvenue dans la démo', 'Commencez par « Absent », puis ouvrez la porte'] },
    ar: { off: 'متوقف', away: 'خارج', home: 'منزل', al: 'إنذار', wifi: 'واي فاي ✓', simnet: 'الإنترنت مقطوع ← شريحة SIM ✓', bat: 'الكهرباء مقطوعة ← بطارية ✓', both: 'SIM + بطارية ✓',
      eAway: ['النظام مفعّل · خارج المنزل', 'الأبواب والحركة مراقبة'], eHome: ['وضع المنزل مفعّل', 'الأبواب مراقبة وتتحرك بالداخل'], eDis: ['تم إيقاف النظام', 'مرحباً بعودتك'],
      eDoor: ['اقتحام: الباب الرئيسي', 'تم كشف فتح · الصفارة تعمل'], eMove: ['اقتحام: الصالون', 'تم كشف حركة · الصفارة تعمل'], eSos: ['تم تفعيل النجدة', 'أُرسل تنبيه طارئ'],
      eSms: ['تم إرسال رسالة', 'إلى 5 أرقام (العائلة، الجار…)'], eCall: ['مكالمة جارية', 'إلى الرقم الأول'], eDoorOff: ['الباب مفتوح', 'النظام متوقف: لا إنذار'], eMoveOff: ['حركة في الصالون', 'النظام متوقف: لا إنذار'],
      eMoveHome: ['حركة في الصالون', 'وضع المنزل: الداخل غير مراقب'], eCat: ['تم كشف حيوان (أقل من 18 كغ)', 'لا إنذار كاذب'], eNet: ['الإنترنت مقطوع', 'الجهاز يتحول إلى شريحة SIM'], eNetBack: ['عاد الإنترنت', 'العودة إلى الواي فاي'],
      ePow: ['انقطاع الكهرباء', 'الجهاز يواصل على بطاريته (12 ساعة)'], ePowBack: ['عادت الكهرباء', 'البطارية تشحن'], viaSim: ' · عبر شريحة SIM', callS: 'اقتحام: ', door: 'الباب الرئيسي', salon: 'الصالون', sos: 'نجدة', hint: ['مرحباً بك في التجربة', 'ابدأ بـ «خارج المنزل» ثم افتح الباب'] }
  };
  const L = () => SL[lang];
  const sim = { mode: 'off', net: true, power: true, alarm: false, clock: 2 * 60 + 14, timers: [] };
  let actx = null, sirenNodes = null;
  function audio() { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); actx.resume(); } catch (e) { actx = null; } }
  function sirenOn() {
    if (!actx || sirenNodes) return;
    try { const o = actx.createOscillator(), g = actx.createGain(), l = actx.createOscillator(), lg = actx.createGain();
      o.type = 'sawtooth'; o.frequency.value = 900; l.frequency.value = 2.2; lg.gain.value = 350; l.connect(lg); lg.connect(o.frequency);
      g.gain.value = 0.05; o.connect(g); g.connect(actx.destination); o.start(); l.start(); sirenNodes = [o, l, g];
      sim.timers.push(setTimeout(sirenOff, 4500)); } catch (e) { /* pas de son */ }
  }
  function sirenOff() { if (sirenNodes) { try { sirenNodes[0].stop(); sirenNodes[1].stop(); } catch (e) { /* déjà arrêté */ } sirenNodes = null; } }
  function clock() { sim.clock++; const h = Math.floor(sim.clock / 60) % 24, m = sim.clock % 60; return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'); }
  function ev(kind, ico, pair) { const c = clock(); $('#phClock').textContent = c; const e = document.createElement('div'); e.className = 'ev' + (kind ? ' ev-' + kind : ''); e.innerHTML = '<span>' + ico + '</span><div><b>' + esc(pair[0]) + '</b><small>' + esc(pair[1]) + ' · ' + c + '</small></div>'; $('#feed').prepend(e); }
  function setState() {
    const st = $('#phState'); st.className = 'st ' + (sim.alarm ? 'al' : sim.mode);
    st.textContent = sim.alarm ? L().al : L()[sim.mode];
    $('#hubLed').setAttribute('class', 'hubled' + (sim.alarm ? ' al' : sim.mode !== 'off' ? ' armed' : ''));
    $('#pirCone').setAttribute('class', 'cone' + (sim.mode === 'away' ? ' on' : ''));
    ['#dsLed', '#pirLed'].forEach(s => $(s).setAttribute('class', 'led' + (sim.alarm && sim.alLed === s ? ' al' : sim.mode !== 'off' ? ' ok' : '')));
    if (sim.alarm && sim.alLed === '#pirLed') $('#pirCone').setAttribute('class', 'cone al');
    $('#netTag').textContent = !sim.net && !sim.power ? L().both : !sim.net ? L().simnet : !sim.power ? L().bat : L().wifi;
    $('#phNet').textContent = sim.net ? '📶 Wi-Fi' : '📶 SIM 2G';
    $$('.cb').forEach(b => b.classList.toggle('on', (b.dataset.a === sim.mode) || (b.dataset.a === 'net' && !sim.net) || (b.dataset.a === 'power' && !sim.power)));
  }
  function simLang() { setState(); }
  function alarm(where, led) {
    sim.alarm = true; sim.alLed = led || null; setState();
    $('#siren').classList.add('on'); sirenOn();
    const ph = $('.phone'); ph.classList.remove('shake'); void ph.offsetWidth; ph.classList.add('shake');
    try { navigator.vibrate && navigator.vibrate([400, 150, 400, 150, 600]); } catch (e) { /* non supporté */ }
    ev('al', '🚨', where === 'door' ? L().eDoor : where === 'move' ? L().eMove : L().eSos);
    sim.timers.push(setTimeout(() => ev('info', '✉️', [L().eSms[0], L().eSms[1] + (sim.net ? '' : L().viaSim)]), 1200));
    sim.timers.push(setTimeout(() => { ev('info', '📞', [L().eCall[0], L().eCall[1] + (sim.net ? '' : L().viaSim)]); $('#call small').textContent = L().callS + (where === 'door' ? L().door : where === 'move' ? L().salon : L().sos); $('#call').classList.add('on'); }, 2300));
  }
  function walk(id, from, to, ms) { const g = $(id); g.style.transition = 'none'; g.style.transform = 'translate(' + from + ')'; g.style.opacity = 1; void g.getBoundingClientRect(); g.style.transition = 'opacity .3s, transform ' + ms + 'ms ease'; g.style.transform = 'translate(' + to + ')'; sim.timers.push(setTimeout(() => { g.style.opacity = 0; }, ms + 1400)); }
  function act(a) {
    audio();
    if (a === 'away' || a === 'home') { sim.mode = a; sim.alarm = false; $('#siren').classList.remove('on'); sirenOff(); ev('info', a === 'away' ? '🔒' : '🏠', a === 'away' ? L().eAway : L().eHome); }
    if (a === 'disarm') { sim.mode = 'off'; sim.alarm = false; sim.alLed = null; $('#siren').classList.remove('on'); sirenOff(); $('#call').classList.remove('on'); ev('ok', '🔓', L().eDis); }
    if (a === 'door') {
      $('#door rect').classList.add('open'); walk('#intruder', '600px,330px', '510px,330px', 1200);
      sim.timers.push(setTimeout(() => $('#door rect').classList.remove('open'), 3500));
      if (sim.mode === 'off') ev('', '🚪', L().eDoorOff); else if (!sim.alarm) alarm('door', '#dsLed');
    }
    if (a === 'move') {
      walk('#intruder', '160px,200px', '260px,140px', 1500);
      if (sim.mode === 'off') ev('', '🚶', L().eMoveOff); else if (sim.mode === 'home') ev('', '🚶', L().eMoveHome); else if (!sim.alarm) sim.timers.push(setTimeout(() => alarm('move', '#pirLed'), 500));
    }
    if (a === 'cat') { walk('#cat', '90px,225px', '300px,225px', 2200); ev('ok', '🐈', L().eCat); }
    if (a === 'net') { sim.net = !sim.net; ev('info', '🌐', sim.net ? L().eNetBack : L().eNet); }
    if (a === 'power') { sim.power = !sim.power; ev('info', '⚡', sim.power ? L().ePowBack : L().ePow); }
    if (a === 'sos') { if (!sim.alarm) alarm('sos'); }
    setState();
  }
  $$('.cb').forEach(b => b.addEventListener('click', () => act(b.dataset.a)));
  $('#call').addEventListener('click', e => { if (e.target.closest('.c-btn span')) $('#call').classList.remove('on'); });

  /* ---------- commande ---------- */
  let qty = 1;
  function fillWilayas() { const s = $('#oWil'), v = s.value; s.innerHTML = '<option value="">' + d('choose') + '</option>' + window.WILAYAS.map(w => '<option>' + esc(w) + '</option>').join(''); s.value = v; }
  $$('.qty button').forEach(b => b.onclick = () => { qty = Math.max(1, Math.min(10, qty + +b.dataset.q)); $('#oQty').textContent = qty; });
  $('#orderForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#oName').value.trim(), phone = $('#oPhone').value.replace(/\D/g, '').replace(/^213/, '0'), wil = $('#oWil').value, com = $('#oCom').value.trim(), adr = $('#oAdr').value.trim();
    const err = !name ? d('eName') : !/^0[567]\d{8}$/.test(phone) ? d('ePhone') : !wil ? d('eWil') : !com ? d('eCom') : '';
    $('#oErr').textContent = err; if (err) return;
    const o = { id: Date.now().toString(36), at: Date.now(), name, phone, wil, com, adr, qty, price: window.SHOP.price, status: 'nouvelle' };
    const list = store.get('orders', []); list.unshift(o); store.set('orders', list);
    $('#orderForm').hidden = true; $('#done').hidden = false;
    $('#dP').textContent = d('ordered').replace('{n}', name.split(' ')[0]).replace('{p}', phone.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4'));
    if (window.SHOP.whatsapp) { const msg = 'Bonjour, je commande le kit alarme Dahua AirShield.\nNom : ' + name + '\nTéléphone : ' + phone + '\nWilaya : ' + wil + '\nCommune : ' + com + (adr ? '\nAdresse : ' + adr : '') + '\nQuantité : ' + qty; const a = $('#dWa'); a.href = 'https://wa.me/' + window.SHOP.whatsapp + '?text=' + encodeURIComponent(msg); a.hidden = false; }
    $('#done').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  /* ---------- bouton collant mobile ---------- */
  const stk = $('#sticky');
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => { es.forEach(x => { if (x.target.id === 'commander') stk.classList.toggle('hide-order', x.isIntersecting); }); upd(); }, { threshold: 0.1 }) : null;
  function upd() { const y = window.scrollY > 600 && !stk.classList.contains('hide-order'); stk.classList.toggle('on', y); }
  if (io) io.observe($('#commander'));
  window.addEventListener('scroll', upd, { passive: true });

  applyLang(); renderSpecs();
  ev('info', '👋', L().hint);
  setState();
})();
