/* =====================================================================
   BREW — Coffee & Brunch · données de la carte
   ---------------------------------------------------------------------
   Source unique : CARTE.md envoyée par le client (62 références).
   Les noms de produits restent tels que le client les a écrits.
   Les prix sont des prix proposés (le client ne les a pas encore fixés) :
   le gérant les remplace depuis l'espace gérant.
   ===================================================================== */
(function () {
  'use strict';

  /* ---------- Catégories (ordre = ordre d'affichage) ----------
     station : poste qui prépare (bar = boissons + vitrine, kitchen = cuisine brunch)
     tint    : couleur d'accent douce de la catégorie
     art     : illustration par défaut de la catégorie */
  const categories = [
    { id: 'signature', fr: 'BREW Signature Drinks', ar: 'مشروبات BREW المميّزة', station: 'bar', tint: 'passion', art: 'sparkle' },
    { id: 'hot',       fr: 'Cafés chauds',          ar: 'قهوة ساخنة',             station: 'bar', tint: 'caramel', art: 'cup' },
    { id: 'iced',      fr: 'Cafés glacés',          ar: 'قهوة مثلّجة',            station: 'bar', tint: 'sky',     art: 'iced' },
    { id: 'lattes',    fr: 'Signature Lattes',      ar: 'لاتيه مميّز',            station: 'bar', tint: 'pistache', art: 'latte' },
    { id: 'matcha',    fr: 'Matcha Bar',            ar: 'ركن الماتشا',            station: 'bar', tint: 'matcha',  art: 'matcha' },
    { id: 'choco',     fr: 'Chocolat',              ar: 'شوكولاتة',               station: 'bar', tint: 'cocoa',   art: 'choco' },
    { id: 'fresh',     fr: 'Refreshers & Lemonades', ar: 'عصائر وليموناضة',       station: 'bar', tint: 'citrus',  art: 'juice' },
    { id: 'shakes',    fr: 'Milkshakes',            ar: 'ميلك شيك',               station: 'bar', tint: 'fraise',  art: 'shake' },
    { id: 'frappes',   fr: 'Frappés',               ar: 'فرابيه',                 station: 'bar', tint: 'caramel', art: 'frappe' },
    { id: 'tea',       fr: 'Tea & Hot Drinks',      ar: 'شاي ومشروبات ساخنة',     station: 'bar', tint: 'matcha',  art: 'teapot' },
    { id: 'savory',    fr: 'Brunch salé',           ar: 'برانش مالح',             station: 'kitchen', tint: 'caramel', art: 'toast' },
    { id: 'sweet',     fr: 'Brunch sucré',          ar: 'برانش حلو',              station: 'kitchen', tint: 'fraise',  art: 'brownie' },
    { id: 'healthy',   fr: 'Healthy Corner',        ar: 'الركن الصحّي',            station: 'kitchen', tint: 'matcha',  art: 'granola' },
    { id: 'vitrine',   fr: 'Sweets — Vitrine',      ar: 'حلويات الواجهة',          station: 'bar', tint: 'cocoa',   art: 'cookie' }
  ];

  /* ---------- Suppléments (selon les recettes) ---------- */
  const extras = {
    egg:    { fr: 'Œuf supplémentaire', ar: 'بيضة إضافية',       price: 150 },
    avocado:{ fr: 'Avocat',             ar: 'أفوكادو',            price: 300 },
    salmon: { fr: 'Saumon fumé',        ar: 'سلمون مدخّن',        price: 600 },
    chicken:{ fr: 'Poulet fumé',        ar: 'دجاج مدخّن',         price: 350 },
    veggie: { fr: 'Lait végétal',       ar: 'حليب نباتي',         price: 150 }
  };

  /* ---------- Produits ----------
     f = filtres : hot (chaud), iced (glacé), sweet (sucré), salty (salé), healthy
     x = suppléments proposés sur ce produit
     choice = choix obligatoire (ex. Iced Latte : Caramel ou Vanille)
     classic = boisson chaude proposée dans la Formule Brunch */
  const P = (id, cat, name, price, o) => Object.assign({ id, cat, name, price, f: [], x: [], dfr: '', dar: '' }, o || {});
  const MILK = ['veggie'];

  const products = [
    // 01 · Signature Drinks
    P('brew-passion', 'signature', 'Brew Passion', 550, { f: ['iced'], art: 'sparkle', tint: 'passion', sig: true,
      dfr: 'Fruit de la passion, orange, citron et eau pétillante.', dar: 'فاكهة الباشن، برتقال، ليمون وماء فوّار.' }),
    P('brew-strawberry', 'signature', 'Brew Strawberry', 550, { f: ['iced'], art: 'sparkle', tint: 'fraise', sig: true,
      dfr: 'Fraise, citron et eau pétillante.', dar: 'فراولة، ليمون وماء فوّار.' }),
    P('brew-red', 'signature', 'Brew Red', 550, { f: ['iced'], art: 'sparkle', tint: 'hibiscus', sig: true,
      dfr: 'Hibiscus, fruits rouges, citron et eau pétillante.', dar: 'كركديه، فواكه حمراء، ليمون وماء فوّار.' }),

    // 02 · Cafés chauds
    P('espresso', 'hot', 'Espresso', 200, { f: ['hot'], art: 'espresso', classic: true }),
    P('double-espresso', 'hot', 'Double Espresso', 300, { f: ['hot'], art: 'espresso', classic: true }),
    P('ristretto', 'hot', 'Ristretto', 200, { f: ['hot'], art: 'espresso', classic: true }),
    P('americano', 'hot', 'Americano', 250, { f: ['hot'], art: 'cup', classic: true }),
    P('cappuccino', 'hot', 'Cappuccino', 350, { f: ['hot'], art: 'latte', x: MILK, classic: true }),
    P('cafe-latte', 'hot', 'Café Latte', 350, { f: ['hot'], art: 'latte', x: MILK, classic: true }),
    P('flat-white', 'hot', 'Flat White', 400, { f: ['hot'], art: 'latte', x: MILK, classic: true }),
    P('mocha', 'hot', 'Mocha', 450, { f: ['hot', 'sweet'], art: 'choco', x: MILK }),
    P('spanish-latte', 'hot', 'Spanish Latte', 450, { f: ['hot', 'sweet'], art: 'latte', x: MILK }),

    // 03 · Cafés glacés
    P('iced-americano', 'iced', 'Iced Americano', 300, { f: ['iced'], art: 'iced' }),
    P('iced-latte', 'iced', 'Iced Latte', 450, { f: ['iced'], art: 'iced', x: MILK,
      choice: { fr: 'Parfum', ar: 'النكهة', opts: [{ id: 'caramel', fr: 'Caramel', ar: 'كراميل' }, { id: 'vanille', fr: 'Vanille', ar: 'فانيليا' }] } }),
    P('iced-spanish-latte', 'iced', 'Iced Spanish Latte', 500, { f: ['iced', 'sweet'], art: 'iced', x: MILK }),
    P('iced-mocha', 'iced', 'Iced Mocha', 500, { f: ['iced', 'sweet'], art: 'iced', x: MILK }),
    P('cold-brew', 'iced', 'Cold Brew', 450, { f: ['iced'], art: 'coldbrew' }),

    // 04 · Signature Lattes
    P('pistachio-latte', 'lattes', 'Pistachio Latte', 550, { f: ['hot', 'sweet'], art: 'latte', tint: 'pistache', x: MILK }),
    P('biscoff-latte', 'lattes', 'Biscoff Latte', 550, { f: ['hot', 'sweet'], art: 'latte', tint: 'caramel', x: MILK }),
    P('hazelnut-latte', 'lattes', 'Hazelnut Latte', 550, { f: ['hot', 'sweet'], art: 'latte', tint: 'cocoa', x: MILK }),

    // 05 · Matcha Bar
    P('hot-matcha-latte', 'matcha', 'Hot Matcha Latte', 550, { f: ['hot', 'healthy'], art: 'matcha', x: MILK }),
    P('iced-matcha-latte', 'matcha', 'Iced Matcha Latte', 600, { f: ['iced', 'healthy'], art: 'icedmatcha', x: MILK }),
    P('strawberry-matcha', 'matcha', 'Strawberry Matcha', 700, { f: ['iced', 'sweet'], art: 'icedmatcha', tint: 'fraise', x: MILK }),

    // 06 · Chocolat
    P('hot-chocolate', 'choco', 'Hot Chocolate', 400, { f: ['hot', 'sweet'], art: 'choco', x: MILK }),
    P('iced-chocolate', 'choco', 'Iced Chocolate', 450, { f: ['iced', 'sweet'], art: 'iced', tint: 'cocoa', x: MILK }),

    // 07 · Refreshers & Lemonades
    P('fresh-orange-juice', 'fresh', 'Fresh Orange Juice', 400, { f: ['iced', 'healthy'], art: 'juice' }),
    P('fresh-lemonade', 'fresh', 'Fresh Lemonade', 350, { f: ['iced'], art: 'lemonade', tint: 'lemon' }),

    // 08 · Milkshakes
    P('vanilla-milkshake', 'shakes', 'Vanilla Milkshake', 550, { f: ['iced', 'sweet'], art: 'shake', tint: 'vanilla' }),
    P('chocolate-milkshake', 'shakes', 'Chocolate Milkshake', 550, { f: ['iced', 'sweet'], art: 'shake', tint: 'cocoa' }),
    P('oreo-milkshake', 'shakes', 'Oreo Milkshake', 650, { f: ['iced', 'sweet'], art: 'shake', tint: 'sky' }),
    P('biscoff-milkshake', 'shakes', 'Biscoff Milkshake', 700, { f: ['iced', 'sweet'], art: 'shake', tint: 'caramel' }),
    P('pistachio-milkshake', 'shakes', 'Pistachio Milkshake', 750, { f: ['iced', 'sweet'], art: 'shake', tint: 'pistache' }),

    // 09 · Frappés
    P('coffee-frappe', 'frappes', 'Coffee Frappé', 550, { f: ['iced', 'sweet'], art: 'frappe' }),
    P('caramel-frappe', 'frappes', 'Caramel Frappé', 600, { f: ['iced', 'sweet'], art: 'frappe' }),
    P('biscoff-frappe', 'frappes', 'Biscoff Frappé', 650, { f: ['iced', 'sweet'], art: 'frappe' }),

    // 10 · Tea & Hot Drinks
    P('classic-tea', 'tea', 'Classic Tea', 150, { f: ['hot'], art: 'teapot', classic: true }),
    P('mint-tea', 'tea', 'Mint Tea', 200, { f: ['hot', 'healthy'], art: 'teapot', classic: true }),
    P('lemon-honey', 'tea', 'Lemon & Honey', 250, { f: ['hot', 'healthy'], art: 'teacup', tint: 'lemon', classic: true }),

    // 11 · Brunch salé
    P('brew-scrambled-toast', 'savory', 'Brew Scrambled Toast', 850, { f: ['salty'], art: 'eggtoast', x: ['egg', 'avocado', 'salmon'],
      dfr: 'Pain de campagne toasté, œufs brouillés crémeux, cream cheese, parmesan et ciboulette fraîche.',
      dar: 'خبز ريفي محمّص، بيض مخفوق كريمي، كريم تشيز، بارميزان وثوم معمّر طازج.' }),
    P('avocado-sunrise', 'savory', 'Avocado Sunrise', 1100, { f: ['salty', 'healthy'], art: 'avotoast', tint: 'matcha', x: ['salmon', 'egg', 'avocado'],
      dfr: 'Toast à l\'avocat, œuf poché, tomates cerises, graines et citron.',
      dar: 'توست بالأفوكادو، بيض بوشيه، طماطم كرزية، بذور وليمون.' }),
    P('crispy-chicken-brioche', 'savory', 'Crispy Chicken Brioche', 1000, { f: ['salty'], art: 'brioche', x: ['egg'],
      dfr: 'Brioche moelleuse, poulet croustillant, cheddar, laitue et sauce BREW.',
      dar: 'بريوش طريّ، دجاج مقرمش، شيدر، خسّ وصلصة BREW.' }),
    P('tuna-melt-toast', 'savory', 'Tuna Melt Toast', 850, { f: ['salty'], art: 'toast', x: ['egg'],
      dfr: 'Pain toasté, thon, fromage fondant, tomate, oignon rouge et sauce légère au citron.',
      dar: 'خبز محمّص، تونة، جبن ذائب، طماطم، بصل أحمر وصلصة خفيفة بالليمون.' }),
    P('brew-breakfast-plate', 'savory', 'Brew Breakfast Plate', 1200, { f: ['salty'], art: 'plate', x: ['egg', 'avocado'],
      dfr: 'Œufs, saucisses grillées, pommes de terre dorées, salade fraîche et toast.',
      dar: 'بيض، نقانق مشوية، بطاطا ذهبية، سلطة طازجة وتوست.' }),
    P('burrata-garden', 'savory', 'Burrata Garden', 1400, { f: ['salty', 'healthy'], art: 'burrata', tint: 'matcha', x: ['avocado'],
      dfr: 'Burrata crémeuse, tomates cerises, roquette, pesto et pain toasté.',
      dar: 'بوراتا كريمية، طماطم كرزية، جرجير، بيستو وخبز محمّص.' }),
    P('chicken-caesar-bowl', 'savory', 'Chicken Caesar Bowl', 1100, { f: ['salty', 'healthy'], art: 'bowl', tint: 'matcha', x: ['egg', 'avocado'],
      dfr: 'Poulet grillé, salade croquante, parmesan, croûtons et sauce César.',
      dar: 'دجاج مشوي، سلطة مقرمشة، بارميزان، خبز محمّص مكعّب وصلصة سيزر.' }),
    P('triple-layer-chicken', 'savory', 'Triple Layer Chicken', 1000, { f: ['salty'], art: 'club', x: ['egg', 'avocado'],
      dfr: 'Pain de mie toasté en trois couches, poulet, cheddar, laitue, tomate et sauce maison.',
      dar: 'خبز توست بثلاث طبقات، دجاج، شيدر، خسّ، طماطم وصلصة البيت.' }),
    P('cheese-croissant-gratine', 'savory', 'Cheese Croissant Gratiné', 700, { f: ['salty'], art: 'croissant', tint: 'cheese', x: ['chicken'],
      dfr: 'Croissant pur beurre, sauce fromagère et fromage gratiné.',
      dar: 'كرواسون بالزبدة الصافية، صلصة الجبن وجبن مُحمّر.' }),
    P('oeufs-turcs', 'savory', 'Œufs Turcs', 900, { f: ['salty'], art: 'turkish', x: ['egg', 'avocado'],
      dfr: 'Œufs pochés, yaourt à l\'ail assaisonné, beurre épicé au paprika et pain toasté.',
      dar: 'بيض بوشيه، زبادي بالثوم المتبّل، زبدة حارّة بالبابريكا وخبز محمّص.' }),

    // 12 · Brunch sucré
    P('brioche-perdue', 'sweet', 'Brioche Perdue Fruits Rouges & Nutella', 900, { f: ['sweet'], art: 'frenchtoast', tint: 'fraise',
      dfr: 'Brioche dorée, Nutella et fruits rouges.', dar: 'بريوش ذهبي، نوتيلا وفواكه حمراء.' }),
    P('brownie-a-la-mode', 'sweet', 'Brownie à la Mode', 750, { f: ['sweet'], art: 'brownieice', tint: 'cocoa',
      dfr: 'Brownie fondant, glace vanille, sauce chocolat et éclats de noisettes.',
      dar: 'براوني ذائب، آيس كريم بالفانيليا، صلصة شوكولاتة وقطع بندق.' }),
    P('brownie-fraise-banane', 'sweet', 'Brownie Fraise & Banane', 700, { f: ['sweet'], art: 'brownie', tint: 'fraise',
      dfr: 'Brownie, fraises fraîches, banane et filet de chocolat.', dar: 'براوني، فراولة طازجة، موز ولمسة شوكولاتة.' }),
    P('brownie-biscoff-crunch', 'sweet', 'Brownie Biscoff Crunch', 800, { f: ['sweet'], art: 'brownieice', tint: 'caramel',
      dfr: 'Brownie, crème Biscoff, éclats de spéculoos et glace vanille.',
      dar: 'براوني، كريمة بيسكوف، قطع سبيكولوس وآيس كريم بالفانيليا.' }),
    P('croissant-biscoff-banana', 'sweet', 'Croissant Biscoff Banana', 650, { f: ['sweet'], art: 'croissant', tint: 'caramel',
      dfr: 'Croissant, crème Biscoff, banane, spéculoos et filet de caramel.',
      dar: 'كرواسون، كريمة بيسكوف، موز، سبيكولوس ولمسة كراميل.' }),
    P('croissant-pistache-fraise', 'sweet', 'Croissant Pistache & Fraise', 750, { f: ['sweet'], art: 'croissant', tint: 'pistache',
      dfr: 'Croissant, crème de pistache, fraises fraîches et éclats de pistache.',
      dar: 'كرواسون، كريمة الفستق، فراولة طازجة وقطع فستق.' }),
    P('pb-banana-toast', 'sweet', 'Peanut Butter & Banana Toast', 600, { f: ['sweet'], art: 'pbtoast', tint: 'caramel',
      dfr: 'Pain toasté, beurre de cacahuète et banane.', dar: 'خبز محمّص، زبدة الفول السوداني وموز.' }),

    // 13 · Healthy Corner
    P('banana-peanut-granola', 'healthy', 'Banana Peanut Granola', 750, { f: ['healthy', 'sweet'], art: 'granola', tint: 'caramel',
      dfr: 'Yaourt grec, granola croustillant, banane, beurre de cacahuète et cacahuètes.',
      dar: 'زبادي يوناني، غرانولا مقرمشة، موز، زبدة الفول السوداني وفول سوداني.' }),
    P('red-berry-granola', 'healthy', 'Red Berry Granola', 750, { f: ['healthy', 'sweet'], art: 'granola', tint: 'fraise',
      dfr: 'Yaourt grec, granola, fruits rouges et fruits de saison.',
      dar: 'زبادي يوناني، غرانولا، فواكه حمراء وفواكه الموسم.' }),
    P('tropical-granola', 'healthy', 'Tropical Granola', 850, { f: ['healthy', 'sweet'], art: 'granola', tint: 'passion',
      dfr: 'Yaourt grec, granola, mangue, noix de coco et fruit de la passion. Selon disponibilité des fruits.',
      dar: 'زبادي يوناني، غرانولا، مانجو، جوز الهند وفاكهة الباشن. حسب توفّر الفواكه.' }),

    // 14 · Sweets — Vitrine (selon disponibilité)
    P('cookie', 'vitrine', 'Cookie', 250, { f: ['sweet'], art: 'cookie', vitrine: true }),
    P('brownie', 'vitrine', 'Brownie', 350, { f: ['sweet'], art: 'brownie', vitrine: true }),
    P('croissant', 'vitrine', 'Croissant', 200, { f: ['sweet'], art: 'croissant', vitrine: true }),
    P('cheesecake', 'vitrine', 'Cheesecake', 550, { f: ['sweet'], art: 'cheesecake', tint: 'fraise', vitrine: true }),
    P('tiramisu', 'vitrine', 'Tiramisu', 500, { f: ['sweet'], art: 'tiramisu', vitrine: true }),
    P('cinnamon-roll', 'vitrine', 'Cinnamon Roll', 350, { f: ['sweet'], art: 'cinnamon', vitrine: true })
  ];

  /* Formule Brunch : plat (salé, sucré ou healthy) + boisson chaude classique + jus d'orange */
  const formule = {
    id: 'formule-brunch',
    fr: 'Formule Brunch', ar: 'عرض البرانش',
    dishCats: ['savory', 'sweet', 'healthy'],
    juice: 'fresh-orange-juice',
    discount: 10 // % de remise sur la somme, réglable par le gérant
  };

  window.BREW_DATA = { categories, products, extras, formule };
})();
