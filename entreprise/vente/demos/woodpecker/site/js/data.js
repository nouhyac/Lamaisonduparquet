/* =====================================================================
   Wood Pecker Draria · données par défaut
   ---------------------------------------------------------------------
   Carte RÉELLE recopiée de leur menu imprimé (voir ../CARTE.md).
   Règle : aucun plat, prix ou produit ajouté hors de cette carte.
   Chaque plat : id, cat, fr (nom exact), ar (traduction), prix,
   et selon le cas : desc, tailles (pizzas), choix (choix imposé),
   sauce ('option' | 'incluse'), pre (préfixe d'affichage), icone.
   ===================================================================== */
(function () {
  'use strict';

  /* ---------- Catégories (ordre des onglets) ---------- */
  const CATEGORIES = [
    { id: 'froides',  fr: 'Entrées froides',    ar: 'مقبلات باردة',      icone: 'salade' },
    { id: 'chaudes',  fr: 'Entrées chaudes',    ar: 'مقبلات ساخنة',      icone: 'soupe' },
    { id: 'pasta',    fr: 'Nos pasta',          ar: 'الباستا',           icone: 'pasta' },
    { id: 'viandes',  fr: 'Nos viandes',        ar: 'اللحوم',            icone: 'viande' },
    { id: 'volailles',fr: 'Nos volailles',      ar: 'الدواجن',           icone: 'volaille' },
    { id: 'pizzas',   fr: 'Pizzas',             ar: 'البيتزا',           icone: 'pizza' },
    { id: 'menus',    fr: 'Soufflés & menus',   ar: 'سوفليه ووجبات',     icone: 'burger' },
    { id: 'enfant',   fr: 'Menu enfant',        ar: 'قائمة الأطفال',      icone: 'cadeau' },
    { id: 'desserts', fr: 'Desserts',           ar: 'الحلويات',          icone: 'gateau' },
    { id: 'cocktails',fr: 'Cocktails & jus',    ar: 'كوكتيلات وعصائر',   icone: 'cocktail' },
    { id: 'shakes',   fr: 'Milk-shakes',        ar: 'ميلك شيك',          icone: 'shake' },
    { id: 'boissons', fr: 'Boissons',           ar: 'المشروبات',         icone: 'bouteille' },
    { id: 'chaudesb', fr: 'Boissons chaudes',   ar: 'مشروبات ساخنة',     icone: 'tasse' }
  ];

  /* ---------- Choix imposés réutilisés ---------- */
  const C = {
    pureeFrites: { fr: 'Accompagnement', ar: 'المرافق', opts: [['Purée', 'بوريه'], ['Frites', 'بطاطا مقلية']] }
  };

  /* Raccourci de déclaration : p(id, cat, fr, ar, prix, extra) */
  const p = (id, cat, fr, ar, prix, extra) => Object.assign({ id, cat, fr, ar, prix, dispo: true, photo: '' }, extra || {});

  const PLATS = [
    /* ===== Entrées froides ===== */
    p('of1', 'froides', 'Œuf dur à la mayonnaise', 'بيض مسلوق بالمايونيز', 500),
    p('of2', 'froides', 'Salade Niçoise', 'سلطة نيسواز', 650),
    p('of3', 'froides', 'Salade César', 'سلطة سيزر', 900),
    p('of4', 'froides', 'Tomate mozzarella', 'طماطم وموزاريلا', 1000),
    p('of5', 'froides', 'Thon à la Catalane', 'تونة على الطريقة الكتالونية', 800),
    p('of6', 'froides', 'Croquette Camembert', 'كروكيت كامومبير', 1000),
    p('of7', 'froides', 'Salade WoodPecker', 'سلطة وود بيكر', 1200),
    p('of8', 'froides', 'Salade Mechwia', 'سلطة مشوية', 300),

    /* ===== Entrées chaudes ===== */
    p('oc1', 'chaudes', 'Gratin aux crevettes', 'غراتان بالجمبري', 1000, { desc: { fr: 'Crevettes fraîches', ar: 'جمبري طازج' } }),
    p('oc2', 'chaudes', 'Gratins au choix', 'غراتان حسب الاختيار', 700, { choix: { fr: 'Garniture', ar: 'الحشوة', opts: [['Poulet mariné', 'دجاج متبل'], ['Viande', 'لحم']] } }),
    p('oc3', 'chaudes', 'Soupe de légumes', 'شوربة خضر', 600),
    p('oc4', 'chaudes', 'Soupe de poisson', 'شوربة سمك', 700),
    p('oc5', 'chaudes', 'Boureks au choix', 'بوراك حسب الاختيار', 450, { choix: { fr: 'Farce', ar: 'الحشوة', opts: [['Poulet', 'دجاج'], ['Viande hachée', 'لحم مفروم']] } }),
    p('oc6', 'chaudes', 'Brick tunisienne', 'بريك تونسي', 500),
    p('oc7', 'chaudes', 'Assiette de frites', 'صحن بطاطا مقلية', 300),

    /* ===== Pasta ===== */
    p('pa1', 'pasta', 'Lasagne El Forno', 'لازانيا الفورنو', 850),
    p('pa2', 'pasta', 'Spaghetti à la bolognaise', 'سباغيتي بولونيز', 1200),
    p('pa3', 'pasta', 'Pasta aux 4 fromages', 'باستا بأربعة أجبان', 1600, { choix: { fr: 'Pâtes', ar: 'نوع العجين', opts: [['Tagliatelle', 'تالياتيلي'], ['Spaghetti', 'سباغيتي']] } }),
    p('pa4', 'pasta', 'Tagliatelle au saumon fumé', 'تالياتيلي بالسلمون المدخن', 2500),
    p('pa5', 'pasta', 'Tagliatelles à la crème poulet & champignons', 'تالياتيلي بالكريمة والدجاج والفطر', 2200),

    /* ===== Viandes ===== (sauce en option +300 DA, incluse pour l'entrecôte sauce au choix) */
    p('vi1', 'viandes', 'Brochette royale viande', 'بروشات رويال لحم', 300),
    p('vi2', 'viandes', 'Steak haché grillé', 'ستيك مفروم مشوي', 1400, { sauce: 'option' }),
    p('vi3', 'viandes', 'Entrecôte grillée', 'أنتريكوت مشوي', 2000, { sauce: 'option' }),
    p('vi4', 'viandes', 'Entrecôte sauce au choix', 'أنتريكوت بالصلصة حسب الاختيار', 2200, { sauce: 'incluse' }),
    p('vi5', 'viandes', 'Filet grillé', 'فيليه مشوي', 3000, { sauce: 'option' }),
    p('vi6', 'viandes', 'Entrecôte gratinée', 'أنتريكوت مغراتن', 2500, { sauce: 'option' }),

    /* ===== Volailles ===== */
    p('vo1', 'volailles', 'Brochette royale poulet', 'بروشات رويال دجاج', 200),
    p('vo2', 'volailles', 'Cordon bleu sauce fromagère', 'كوردون بلو بصلصة الجبن', 2000),
    p('vo3', 'volailles', 'Escalope grillée', 'إسكالوب مشوي', 1200, { sauce: 'option' }),
    p('vo4', 'volailles', 'Cuisse de poulet marinée', 'فخذ دجاج متبل', 1300, { sauce: 'option' }),
    p('vo5', 'volailles', 'Escalope aux 3 fromages gratinée au four', 'إسكالوب بثلاثة أجبان مغراتن في الفرن', 1800),
    p('vo6', 'volailles', 'Poulet crispy', 'دجاج كريسبي', 2300),

    /* ===== Pizzas : Mini / Simple / Semi / Méga ===== */
    ...[
      ['pz01', 'Margarita', 'مارغريتا', 'Tomate, fromage', 'طماطم، جبن', [400, 500, 1200, 1700]],
      ['pz02', 'Napolitana', 'نابوليتانا', 'Tomate, fromage, anchois, câpres', 'طماطم، جبن، أنشوفة، قبار', [500, 650, 1400, 1900]],
      ['pz03', 'Végétarienne', 'نباتية', 'Tomate, fromage, aubergine, poivron, câpres, champignons, tomate fraîche', 'طماطم، جبن، باذنجان، فلفل، قبار، فطر، طماطم طازجة', [550, 650, 1500, 2000]],
      ['pz04', 'Spinacci', 'سبيناتشي', 'Tomate, fromage, épinard, oignon', 'طماطم، جبن، سبانخ، بصل', [550, 700, 1500, 2000]],
      ['pz05', 'Althon', 'التون', 'Tomate, fromage, thon', 'طماطم، جبن، تونة', [650, 800, 1900, 2500]],
      ['pz06', 'Bolognaise', 'بولونيز', 'Sauce bolognaise, fromage', 'صلصة بولونيز، جبن', [650, 800, 1900, 2500]],
      ['pz07', 'Carne Tagliato', 'كارني تالياتو', 'Tomate, fromage, viande hachée, champignons', 'طماطم، جبن، لحم مفروم، فطر', [650, 800, 1900, 2500]],
      ['pz08', 'Gallina', 'غالينا', 'Tomate, fromage, poulet, champignons', 'طماطم، جبن، دجاج، فطر', [750, 850, 2000, 2600]],
      ['pz09', 'Pepperoni', 'بيبروني', 'Tomate, fromage, pepperoni', 'طماطم، جبن، بيبروني', [700, 850, 2000, 2600]],
      ['pz10', 'Fumato Poulet', 'فوماتو دجاج', 'Tomate, fromage, poulet fumé', 'طماطم، جبن، دجاج مدخن', [700, 850, 2000, 2600]],
      ['pz11', 'Trois Fromages', 'ثلاثة أجبان', 'Sauce rouge ou blanche, 3 fromages', 'صلصة حمراء أو بيضاء، 3 أجبان', [750, 950, 2200, 3000]],
      ['pz12', 'Crème Fraîche', 'كريمة طازجة', 'Crème fraîche, tomate fraîche, fromage, poulet, champignons', 'كريمة طازجة، طماطم طازجة، جبن، دجاج، فطر', [750, 850, 2000, 2700]],
      ['pz13', 'Exotique', 'إكزوتيك', 'Tomate, fromage, poulet, champignons, ananas, maïs', 'طماطم، جبن، دجاج، فطر، أناناس، ذرة', [700, 1000, 2100, 2900]],
      ['pz14', 'Fruits de Mer', 'فواكه البحر', '', '', [1000, 1250, 2800, 3600]],
      ['pz15', 'Pizza au Roquefort', 'بيتزا بالروكفور', 'Tomate, fromage, champignons, roquefort, poivron, poulet', 'طماطم، جبن، فطر، روكفور، فلفل، دجاج', [950, 1150, 2700, 3600]],
      ['pz16', 'Pizza au Saumon', 'بيتزا بالسلمون', 'Tomate, fromage, saumon', 'طماطم، جبن، سلمون', [1050, 1350, 2900, 3700]],
      ['pz17', 'Italienne', 'إيطالية', 'Tomate, bufala (mozzarella), pesto, tomate cherry', 'طماطم، بوفالا (موزاريلا)، بيستو، طماطم كرزية', [750, 900, 2100, 2700]],
      ['pz18', 'Barbecue', 'باربيكيو', 'Tomate, fromage, sauce bolognaise, oignon, pâté de volaille, sauce barbecue', 'طماطم، جبن، صلصة بولونيز، بصل، باتي دجاج، صلصة باربيكيو', [700, 850, 2000, 2600]],
      ['pz19', 'WoodPecker', 'وود بيكر', 'Tomate, fromage, viande hachée, poulet, champignons, pepperoni', 'طماطم، جبن، لحم مفروم، دجاج، فطر، بيبروني', [950, 1250, 2800, 3300]],
      ['pz20', 'Surprise Wood', 'سوربريز وود', 'Ingrédient surprise', 'مكوّن مفاجأة', [1250, 1650, 3400, 4000]]
    ].map(([id, fr, ar, dfr, dar, t]) => p(id, 'pizzas', fr, ar, t[1], {
      desc: dfr ? { fr: dfr, ar: dar } : null,
      tailles: { mini: t[0], simple: t[1], semi: t[2], mega: t[3] },
      // Seule « Trois Fromages » impose un choix de sauce (rouge ou blanche)
      choix: id === 'pz11' ? { fr: 'Sauce', ar: 'الصلصة', opts: [['Sauce rouge', 'صلصة حمراء'], ['Sauce blanche', 'صلصة بيضاء']] } : null
    })),

    /* ===== Soufflés & menus ===== */
    p('me1', 'menus', 'Soufflé au choix', 'سوفليه حسب الاختيار', 700, { choix: { fr: 'Garniture', ar: 'الحشوة', opts: [['Viande', 'لحم'], ['Thon', 'تونة'], ['Poulet', 'دجاج']] } }),
    p('me2', 'menus', 'Menu burger', 'وجبة برغر', 800, { desc: { fr: 'Burger (viande hachée) + frites + canette + sauce du chef', ar: 'برغر (لحم مفروم) + بطاطا مقلية + علبة مشروب + صلصة الشاف' } }),
    p('me3', 'menus', 'Tacos au choix', 'تاكوس حسب الاختيار', 800, { desc: { fr: 'Menu tacos + canette', ar: 'وجبة تاكوس + علبة مشروب' }, choix: { fr: 'Garniture', ar: 'الحشوة', opts: [['Viande hachée', 'لحم مفروم'], ['Poulet', 'دجاج']] } }),
    p('me4', 'menus', 'Tacos WoodPecker mixte', 'تاكوس وود بيكر مختلط', 1000, { desc: { fr: 'Menu tacos + canette', ar: 'وجبة تاكوس + علبة مشروب' } }),

    /* ===== Menu enfant (servi avec un cadeau surprise + boisson) ===== */
    p('en1', 'enfant', 'Mini steak haché', 'ميني ستيك مفروم', 1000, { choix: C.pureeFrites }),
    p('en2', 'enfant', 'Mini escalope', 'ميني إسكالوب', 1000, { choix: C.pureeFrites }),
    p('en3', 'enfant', 'Mini pizza au choix', 'ميني بيتزا حسب الاختيار', 1000, { choix: { fr: 'Garniture', ar: 'الحشوة', opts: [['Poulet', 'دجاج'], ['Viande', 'لحم'], ['Fromage', 'جبن'], ['Thon', 'تونة']] } }),
    p('en4', 'enfant', 'Menu burger frites', 'وجبة برغر وبطاطا', 800),

    /* ===== Desserts ===== */
    p('de01', 'desserts', 'Gâteau au choix', 'كعكة حسب الاختيار', 400),
    p('de02', 'desserts', 'Moelleux au chocolat avec une boule de glace', 'موالو بالشوكولاتة مع كرة مثلجات', 500),
    p('de03', 'desserts', 'Tiramisu au café éclat de spéculoos', 'تيراميسو بالقهوة وقطع السبيكولوس', 400),
    p('de04', 'desserts', 'Mousse onctueuse au chocolat', 'موس الشوكولاتة الكريمي', 300),
    p('de05', 'desserts', 'Crème renversée', 'كريم كراميل', 400, { desc: { fr: 'Caramel', ar: 'كراميل' } }),
    p('de06', 'desserts', 'Crème brûlée', 'كريم بروليه', 400),
    p('de07', 'desserts', 'Tarte au choix', 'تارت حسب الاختيار', 400),
    p('de08', 'desserts', 'Salade de fruits', 'سلطة فواكه', 500),
    p('de09', 'desserts', 'Gâteau au chocolat noix', 'كعكة الشوكولاتة بالجوز', 400),
    p('de10', 'desserts', 'Cheesecake', 'تشيز كيك', 400),

    /* ===== Cocktails & jus frais ===== */
    p('co1', 'cocktails', 'Lemon Mint', 'ليمون بالنعناع', 400, { desc: { fr: 'Citron, menthe fraîche', ar: 'ليمون، نعناع طازج' } }),
    p('co2', 'cocktails', 'Cocktail WoodPecker', 'كوكتيل وود بيكر', 600),
    p('co3', 'cocktails', 'Cocktail aux fruits naturel 1 L', 'كوكتيل فواكه طبيعي 1 لتر', 1500),
    p('co4', 'cocktails', 'Cocktail agrumes', 'كوكتيل الحمضيات', 1200, { desc: { fr: 'Citron, orange, pamplemousse, clémentines', ar: 'ليمون، برتقال، جريب فروت، يوسفي' } }),
    p('ju1', 'cocktails', "Jus d'orange", 'عصير برتقال', 400, { jus: true }),
    p('ju2', 'cocktails', 'Jus de citron', 'عصير ليمون', 400, { jus: true }),
    p('ju3', 'cocktails', 'Jus de pomme', 'عصير تفاح', 400, { jus: true }),
    p('ju4', 'cocktails', 'Jus de fraise', 'عصير فراولة', 400, { jus: true }),
    p('ju5', 'cocktails', 'Jus de mangue', 'عصير مانجو', 600, { jus: true }),
    p('ju6', 'cocktails', 'Jus de kiwi', 'عصير كيوي', 600, { jus: true }),
    p('ju7', 'cocktails', "Jus d'ananas", 'عصير أناناس', 600, { jus: true }),
    p('ju8', 'cocktails', 'Jus de raisin', 'عصير عنب', 500, { jus: true }),
    p('ju9', 'cocktails', 'Jus de pêche', 'عصير خوخ', 500, { jus: true }),

    /* ===== Milk-shakes ===== */
    p('ms1', 'shakes', 'Chocolat', 'شوكولاتة', 400, { pre: 'Milk-shake' }),
    p('ms2', 'shakes', 'Caramel', 'كراميل', 400, { pre: 'Milk-shake' }),
    p('ms3', 'shakes', 'Cassis', 'كاسيس', 400, { pre: 'Milk-shake' }),
    p('ms4', 'shakes', 'Vanille', 'فانيليا', 400, { pre: 'Milk-shake' }),
    p('ms5', 'shakes', 'Banane-fraise', 'موز وفراولة', 450, { pre: 'Milk-shake' }),
    p('ms6', 'shakes', 'Datte et amandes', 'تمر ولوز', 500, { pre: 'Milk-shake' }),

    /* ===== Boissons ===== */
    p('bo1', 'boissons', 'Boisson gazeuse 1 L', 'مشروب غازي 1 لتر', 200),
    p('bo2', 'boissons', 'Jus 1 L', 'عصير 1 لتر', 200),
    p('bo3', 'boissons', 'Canette', 'علبة مشروب', 150),
    p('bo4', 'boissons', 'Eau minérale petite bouteille', 'ماء معدني قارورة صغيرة', 50),
    p('bo5', 'boissons', 'Eau minérale grande bouteille', 'ماء معدني قارورة كبيرة', 100),
    p('bo6', 'boissons', 'Eau gazeuse 1 L', 'ماء غازي 1 لتر', 150),

    /* ===== Boissons chaudes ===== */
    p('bc1', 'chaudesb', 'Café Lavazza', 'قهوة لافاتزا', 200),
    p('bc2', 'chaudesb', 'Café Nespresso', 'قهوة نسبريسو', 250),
    p('bc3', 'chaudesb', 'Thé infusion', 'شاي أعشاب', 100),
    p('bc4', 'chaudesb', 'Café au lait', 'قهوة بالحليب', 200),
    p('bc5', 'chaudesb', 'Thé maison', 'شاي البيت', 100),
    p('bc6', 'chaudesb', 'Lait chaud', 'حليب ساخن', 100)
  ];

  /* ---------- Suppléments pizza (prix Simple / Méga) ---------- */
  const SUPPLEMENTS = [
    ['su01', 'Viande hachée', 'لحم مفروم', 300, 800],
    ['su02', 'Fromage', 'جبن', 500, 1000],
    ['su03', 'Champignons', 'فطر', 300, 800],
    ['su04', 'Poulet/Thon', 'دجاج/تونة', 300, 800],
    ['su05', 'Tomate fraîche', 'طماطم طازجة', 100, 250],
    ['su06', 'Câpres', 'قبار', 200, 500],
    ['su07', 'Calamar', 'كالامار', 400, 1500],
    ['su08', 'Crevettes', 'جمبري', 600, 2000],
    ['su09', 'Bordure fromage', 'حافة بالجبن', 250, 400],
    ['su10', 'Saumon', 'سلمون', 900, 2000],
    ['su11', 'Gruyère', 'غرويير', 500, 1400],
    ['su12', 'Roquefort', 'روكفور', 400, 800],
    ['su13', 'Poulet fumé', 'دجاج مدخن', 400, 900],
    ['su14', 'Viande fumée', 'لحم مدخن', 400, 900],
    ['su15', 'Maïs', 'ذرة', 100, 400],
    ['su16', 'Ananas', 'أناناس', 200, 600],
    ['su17', 'Anchois', 'أنشوفة', 300, 600],
    ['su18', 'Poivron', 'فلفل', 100, 250]
  ].map(([id, fr, ar, simple, mega]) => ({ id, fr, ar, simple, mega }));

  /* ---------- Sauces (viandes / volailles) ---------- */
  const SAUCES = [
    ['Roquefort', 'روكفور'], ['Poivre', 'الفلفل'], ['Moutarde', 'الخردل'],
    ['Chasseur', 'شاسور'], ['Forestière', 'فوريستيير'], ['Curry', 'الكاري']
  ].map(([fr, ar]) => ({ fr, ar }));

  /* ---------- Tailles de pizza ---------- */
  const TAILLES = [
    { id: 'mini', fr: 'Mini', ar: 'ميني' },
    { id: 'simple', fr: 'Simple', ar: 'عادي' },
    { id: 'semi', fr: 'Semi', ar: 'سومي' },
    { id: 'mega', fr: 'Méga', ar: 'ميغا' }
  ];

  /* ---------- Réglages de l'établissement (modifiables par le gérant) ---------- */
  // Jours : 0 = dimanche … 6 = samedi. Fermeture après minuit gérée (01:00 = lendemain).
  const horaires = [0, 1, 2, 3, 4, 5, 6].map(j => ({ j, ouvert: true, de: j === 5 ? '16:00' : '11:00', a: '01:00' }));

  const REGLAGES = {
    nom: 'Wood Pecker Draria',
    tel1: '0770 17 25 79',
    tel2: '0550 64 77 46',
    whatsapp: '213770172579',
    instagram: 'woodpecker.draria',
    facebook: 'WoodPecker Draria',
    maps: 'https://maps.app.goo.gl/wPDHLPoe8TCSVfmo9',
    ville: 'Draria, Alger',
    horaires,
    prixSauce: 300,
    tables: 12,            // nombre de tables du plan de salle (réglable)
    capacite: 60,          // couverts par créneau de réservation (réglable)
    livreurs: ['Livreur 1', 'Livreur 2'],
    fidelite: { actif: false, pointsPar100: 1, seuil: 100, remise: 500 },
    // Zones de livraison autour de Draria : frais, minimum de commande, délai (min)
    zones: [
      ['Draria', 150, 1000, 30], ['Baba Hassen', 200, 1200, 35], ['Saoula', 200, 1200, 35],
      ['Douera', 300, 1500, 45], ['Khraicia', 300, 1500, 45], ['El Achour', 250, 1500, 40],
      ['Ouled Fayet', 300, 1500, 45], ['Dely Ibrahim', 300, 1500, 45], ['Chéraga', 350, 2000, 50],
      ['Ben Aknoun', 300, 1500, 45], ['Birkhadem', 300, 1500, 45], ['Hydra', 400, 2000, 55]
    ].map(([nom, frais, min, delai]) => ({ nom, frais, min, delai, actif: true }))
  };

  /* ---------- Plat du jour & poisson du jour ---------- */
  const JOUR = {
    plats: [
      { id: 'pj1', fr: 'Nuggets avec frites', ar: 'ناغتس مع بطاطا مقلية', prix: 1200, actif: true },
      { id: 'pj2', fr: 'Tajine de poulet à la marocaine', ar: 'طاجين دجاج على الطريقة المغربية', prix: 2000, actif: true }
    ],
    poisson: {
      actif: true,
      especes: { fr: 'Dorades, loups, crevettes, calamars', ar: 'دوراد، قاروص، جمبري، كالامار' },
      prixKg: 0  // 0 = « Prix selon arrivage »
    }
  };

  window.WPK_DATA = { CATEGORIES, PLATS, SUPPLEMENTS, SAUCES, TAILLES, REGLAGES, JOUR };
})();
