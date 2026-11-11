/* =========================================================================
   Banet el Baraka — données de départ (démo Dzign Studio)
   -------------------------------------------------------------------------
   Tout ce fichier ne sert qu'à REMPLIR la démo la première fois.
   Ensuite, les données vivent dans le navigateur (localStorage, préfixe
   « bnb- ») et sont modifiables depuis l'espace gérant.

   Règle d'or : uniquement les plats de LEUR carte (fiche Yassir).
   - prix connus : ceux de la fiche Yassir ;
   - estime:true : plat « épuisé » chez Yassir, prix estimé pour Oran
     (à confirmer avec le restaurant, liste dans PROSPECT.md).
   ========================================================================= */
(function () {
  'use strict';

  /* ---------- Catégories (ordre d'affichage) ---------- */
  const categories = [
    { id: 'maison',   fr: 'Plats maison',      ar: 'أطباق البيت' },
    { id: 'entrees',  fr: 'Entrées & soupes',  ar: 'مقبلات وشوربات' },
    { id: 'salades',  fr: 'Salades',           ar: 'سلطات' },
    { id: 'pizzas',   fr: 'Pizzas',            ar: 'بيتزا' },
    { id: 'tacos',    fr: 'Tacos',             ar: 'تاكوس' },
    { id: 'burgers',  fr: 'Burgers',           ar: 'برغر' },
    { id: 'sandwichs',fr: 'Sandwichs',         ar: 'سندويتشات' },
    { id: 'box',      fr: 'Box',               ar: 'بوكس' },
    { id: 'desserts', fr: 'Desserts',          ar: 'حلويات' },
    { id: 'boissons', fr: 'Boissons',          ar: 'مشروبات' }
  ];

  /* ---------- Plats ----------
     p(id, cat, fr, ar, prix, options)
     options : estime, photo (false = pas de photo), tags ['maison','epice','vege'],
               self (plat maison préparé aujourd'hui), dispo, dfr/dar (description) */
  const plats = [];
  function p(id, cat, fr, ar, prix, o) {
    o = o || {};
    plats.push({
      id, cat, fr, ar, prix,
      dfr: o.dfr || '', dar: o.dar || '',
      photo: o.photo === false ? '' : 'img/carte/' + id + '.jpg',
      tags: o.tags || [],
      estime: !!o.estime,
      dispo: o.dispo !== false,
      // « self » n'a de sens que pour le fait maison : préparé aujourd'hui ou non
      self: o.tags && o.tags.includes('maison') ? o.self !== false : undefined
    });
  }
  const M = ['maison'], MV = ['maison', 'vege'], ME = ['maison', 'epice'];

  // Plats maison (le self traditionnel)
  p('couscous', 'maison', 'Couscous', 'كسكس', 600, { tags: M, dfr: 'Couscous maison servi avec ses légumes et sa sauce.', dar: 'كسكس البيت بالخضر والمرق.' });
  p('mtouem', 'maison', 'Mtouem', 'المثوّم', 700, { tags: M, dfr: 'Boulettes de viande hachée à l’ail, en sauce.', dar: 'كويرات اللحم المفروم بالثوم في المرق.' });
  p('rechta', 'maison', 'Rechta', 'الرشتة', 600, { tags: M, estime: true, dfr: 'Rechta maison en sauce.', dar: 'رشتة البيت بالمرق.' });
  p('berkoukes', 'maison', 'Berkoukes', 'البركوكس', 600, { tags: M, estime: true, self: false, dfr: 'Berkoukes maison mijoté en sauce.', dar: 'بركوكس البيت مطهو في المرق.' });
  p('djolbana', 'maison', 'Djelbana', 'الجلبانة', 600, { tags: M, estime: true, dfr: 'Petits pois mijotés en sauce.', dar: 'جلبانة مطهوة في المرق.' });
  p('dolma', 'maison', 'Légumes farcis (Dolma)', 'الدولمة', 700, { tags: M, estime: true, dfr: 'Légumes farcis, recette maison.', dar: 'خضر محشية على طريقة البيت.' });
  p('tajine-olives', 'maison', 'Tajine de poulet aux olives', 'طاجين الزيتون بالدجاج', 700, { tags: M, estime: true, photo: false, self: false, dfr: 'Poulet et olives en sauce.', dar: 'دجاج وزيتون في المرق.' });
  p('muhammar', 'maison', 'Muhammar', 'المحمّر', 700, { tags: M, estime: true, photo: false, self: false, dfr: 'Muhammar, recette maison.', dar: 'المحمّر على طريقة البيت.' });
  p('chou-farci', 'maison', 'Chou farci', 'الكرنب المحشي', 700, { tags: M, estime: true, photo: false, self: false, dispo: false, dfr: 'Chou farci, recette maison.', dar: 'كرنب محشي على طريقة البيت.' });
  p('seffa', 'maison', 'Seffa Couscous sucré', 'السفّة', 600, { tags: MV, estime: true, self: false, dfr: 'Couscous sucré.', dar: 'كسكس حلو.' });
  p('cuisse-poulet', 'maison', 'Cuisse de poulet', 'فخذ دجاج', 600, { tags: M, dfr: 'Cuisse de poulet.', dar: 'فخذ دجاج.' });
  p('cuisse-poulet-farcie', 'maison', 'Cuisse de poulet farcie', 'فخذ دجاج محشي', 700, { tags: M, estime: true, self: false, dfr: 'Cuisse de poulet farcie.', dar: 'فخذ دجاج محشي.' });
  p('escalope-panee', 'maison', 'Escalope panée', 'إسكالوب بانيه', 700, { tags: M, dfr: 'Escalope de poulet panée.', dar: 'إسكالوب دجاج بانيه.' });
  p('escalope-creme', 'maison', 'Escalope à la crème', 'إسكالوب بالكريمة', 750, { tags: M, estime: true, dfr: 'Escalope de poulet, sauce à la crème.', dar: 'إسكالوب دجاج بصلصة الكريمة.' });
  p('foie-poulet', 'maison', 'Foie de poulet', 'كبدة الدجاج', 600, { tags: M, self: false, dfr: 'Foie de poulet.', dar: 'كبدة الدجاج.' });
  p('gratin-poulet', 'maison', 'Gratin de poulet', 'غراتان الدجاج', 600, { tags: M, dfr: 'Gratin de poulet.', dar: 'غراتان بالدجاج.' });
  p('gratin-pommes-de-terre', 'maison', 'Gratin de pommes de terre', 'غراتان البطاطا', 500, { tags: MV, estime: true, dfr: 'Gratin de pommes de terre.', dar: 'غراتان بالبطاطا.' });
  p('gratin-chou-fleur', 'maison', 'Gratin de chou-fleur', 'غراتان القرنبيط', 500, { tags: MV, estime: true, self: false, dfr: 'Gratin de chou-fleur.', dar: 'غراتان بالقرنبيط.' });
  p('gratin-fromage', 'maison', 'Gratin au fromage', 'غراتان بالجبن', 550, { tags: MV, estime: true, self: false, dfr: 'Gratin au fromage.', dar: 'غراتان بالجبن.' });
  p('pommes-de-terre-four', 'maison', 'Pommes de terre au four', 'بطاطا في الفرن', 400, { tags: MV, estime: true, dfr: 'Pommes de terre cuites au four.', dar: 'بطاطا مطهوة في الفرن.' });
  p('chou-fleur', 'maison', 'Chou-fleur', 'القرنبيط', 500, { tags: MV, estime: true, self: false, dfr: 'Chou-fleur, préparation maison.', dar: 'قرنبيط على طريقة البيت.' });
  p('merguez', 'maison', 'Merguez', 'مرقاز', 600, { tags: ME, estime: true, self: false, dfr: 'Merguez.', dar: 'مرقاز.' });
  p('spaghetti', 'maison', 'Spaghetti', 'سباغيتي', 500, { tags: M, estime: true, self: false, dfr: 'Spaghetti en sauce.', dar: 'سباغيتي بالصلصة.' });

  // Entrées & soupes
  p('hrira', 'entrees', 'Hrira', 'الحريرة', 200, { tags: M, dfr: 'Hrira maison.', dar: 'حريرة البيت.' });
  p('chorba', 'entrees', 'Chorba', 'الشوربة', 200, { tags: ME, estime: true, dfr: 'Chorba maison.', dar: 'شوربة البيت.' });
  p('soupe-lentilles', 'entrees', 'Soupe de lentilles', 'شوربة العدس', 200, { tags: MV, dfr: 'Soupe de lentilles.', dar: 'شوربة العدس.' });
  p('soupe-legumes', 'entrees', 'Soupe de légumes', 'شوربة الخضر', 200, { tags: MV, estime: true, dfr: 'Soupe de légumes.', dar: 'شوربة الخضر.' });
  p('soupe-champignons', 'entrees', 'Soupe de champignons', 'شوربة الفطر', 250, { tags: MV, estime: true, self: false, dfr: 'Soupe de champignons.', dar: 'شوربة الفطر.' });
  p('bourak-viande', 'entrees', 'Bourak à la viande hachée', 'بوراك باللحم المفروم', 150, { tags: M, estime: true, dfr: 'Bourak farci à la viande hachée.', dar: 'بوراك محشي باللحم المفروم.' });
  p('bourak-poulet', 'entrees', 'Bourak au poulet', 'بوراك بالدجاج', 150, { tags: M, dfr: 'Bourak farci au poulet.', dar: 'بوراك محشي بالدجاج.' });
  p('mhadjeb', 'entrees', 'Mhadjeb', 'المحاجب', 150, { tags: MV, dfr: 'Mhadjeb maison.', dar: 'محاجب البيت.' });
  p('batbout', 'entrees', 'Batbout', 'البطبوط', 150, { tags: M, dfr: 'Batbout maison.', dar: 'بطبوط البيت.' });
  p('maaqouda', 'entrees', 'Maâqouda', 'المعقودة', 50, { tags: MV, dfr: 'Maâqouda de pommes de terre.', dar: 'معقودة البطاطا.' });
  p('souffle', 'entrees', 'Soufflé', 'سوفليه', 150, { dfr: 'Soufflé.', dar: 'سوفليه.' });
  p('crispy', 'entrees', 'Crispy', 'كريسبي', 150, { dfr: 'Poulet croustillant.', dar: 'دجاج مقرمش.' });
  p('chausson-thon', 'entrees', 'Chausson au thon', 'شوصون بالتونة', 150, { estime: true, dfr: 'Chausson garni au thon.', dar: 'شوصون محشي بالتونة.' });
  p('chausson-fromage', 'entrees', 'Chausson au fromage', 'شوصون بالجبن', 150, { tags: ['vege'], estime: true, dfr: 'Chausson garni au fromage.', dar: 'شوصون محشي بالجبن.' });
  p('quiche', 'entrees', 'Quiche', 'كيش', 150, { estime: true, dfr: 'Part de quiche.', dar: 'قطعة كيش.' });
  p('pastilla', 'entrees', 'Pastilla', 'البسطيلة', 250, { tags: M, estime: true, dispo: false, dfr: 'Pastilla maison.', dar: 'بسطيلة البيت.' });
  p('mini-pizza', 'entrees', 'Mini Pizza', 'ميني بيتزا', 150, { dfr: 'Mini pizza.', dar: 'ميني بيتزا.' });
  p('tortilla', 'entrees', 'Tortilla', 'تورتيلا', 150, { estime: true, dfr: 'Part de tortilla.', dar: 'قطعة تورتيلا.' });

  // Salades
  p('salade-pommes-de-terre', 'salades', 'Salade de pommes de terre', 'سلطة البطاطا', 500, { tags: ['vege'], dfr: 'Salade de pommes de terre.', dar: 'سلطة البطاطا.' });
  p('salade-betteraves', 'salades', 'Salade de betteraves', 'سلطة الشمندر', 500, { tags: ['vege'], dfr: 'Salade de betteraves.', dar: 'سلطة الشمندر.' });
  p('salade-pates', 'salades', 'Salade de pâtes', 'سلطة المعكرونة', 500, { tags: ['vege'], estime: true, dfr: 'Salade de pâtes.', dar: 'سلطة المعكرونة.' });
  p('salade-poivrons', 'salades', 'Salade de poivrons', 'سلطة الفلفل', 500, { tags: ['vege'], estime: true, dfr: 'Salade de poivrons.', dar: 'سلطة الفلفل.' });
  p('salade-carottes', 'salades', 'Salade de carottes', 'سلطة الجزر', 450, { tags: ['vege'], estime: true, dfr: 'Salade de carottes.', dar: 'سلطة الجزر.' });
  p('salade-riz', 'salades', 'Salade de riz', 'سلطة الأرز', 500, { tags: ['vege'], estime: true, dfr: 'Salade de riz.', dar: 'سلطة الأرز.' });

  // Pizzas
  p('pizza-margherita', 'pizzas', 'Pizza Margherita', 'بيتزا مارغريتا', 300, { tags: ['vege'], dfr: 'Sauce tomate et fromage.', dar: 'صلصة الطماطم والجبن.' });
  p('pizza-vegetarienne', 'pizzas', 'Pizza Végétarienne', 'بيتزا نباتية', 400, { tags: ['vege'], dfr: 'Pizza aux légumes.', dar: 'بيتزا بالخضر.' });
  p('pizza-poulet-hache', 'pizzas', 'Pizza Poulet Haché', 'بيتزا بالدجاج المفروم', 500, { dfr: 'Pizza au poulet haché.', dar: 'بيتزا بالدجاج المفروم.' });
  p('pizza-viande-hachee', 'pizzas', 'Pizza Viande Hachée', 'بيتزا باللحم المفروم', 550, { dfr: 'Pizza à la viande hachée.', dar: 'بيتزا باللحم المفروم.' });
  p('pizza-thon', 'pizzas', 'Pizza Thon', 'بيتزا بالتونة', 600, { dfr: 'Pizza au thon.', dar: 'بيتزا بالتونة.' });
  p('pizza-chicken', 'pizzas', 'Pizza Chicken', 'بيتزا تشيكن', 600, { dfr: 'Pizza au poulet.', dar: 'بيتزا بالدجاج.' });
  p('pizza-3-fromages', 'pizzas', 'Pizza 3 Fromages', 'بيتزا 3 أجبان', 650, { tags: ['vege'], dfr: 'Pizza aux trois fromages.', dar: 'بيتزا بثلاثة أنواع من الجبن.' });
  p('pizza-baraka', 'pizzas', 'Pizza Baraka', 'بيتزا البركة', 800, { photo: false, dfr: 'La pizza qui porte le nom de la maison.', dar: 'البيتزا التي تحمل اسم المطعم.' });
  p('pizza-mega', 'pizzas', 'Pizza Méga', 'بيتزا ميغا', 2000, { photo: false, dfr: 'Grand format, à partager.', dar: 'حجم كبير للمشاركة.' });

  // Tacos
  p('tacos-poulet', 'tacos', 'Tacos Poulet Haché', 'تاكوس بالدجاج المفروم', 450, { dfr: 'Tacos au poulet haché.', dar: 'تاكوس بالدجاج المفروم.' });
  p('tacos-mixte', 'tacos', 'Tacos Mixte', 'تاكوس مختلط', 650, { dfr: 'Tacos mixte.', dar: 'تاكوس مختلط.' });
  p('tacos-crispy', 'tacos', 'Tacos Crispy', 'تاكوس كريسبي', 600, { dfr: 'Tacos au poulet croustillant.', dar: 'تاكوس بالدجاج المقرمش.' });
  p('tacos-viande', 'tacos', 'Tacos Viande Hachée', 'تاكوس باللحم المفروم', 550, { dfr: 'Tacos à la viande hachée.', dar: 'تاكوس باللحم المفروم.' });

  // Burgers
  p('burger-viande', 'burgers', 'Burger Viande Hachée', 'برغر باللحم المفروم', 350, { dfr: 'Burger à la viande hachée.', dar: 'برغر باللحم المفروم.' });
  p('burger-poulet', 'burgers', 'Burger Poulet Haché', 'برغر بالدجاج المفروم', 250, { dfr: 'Burger au poulet haché.', dar: 'برغر بالدجاج المفروم.' });
  p('burger-crispy', 'burgers', 'Burger Crispy', 'برغر كريسبي', 300, { dfr: 'Burger au poulet croustillant.', dar: 'برغر بالدجاج المقرمش.' });

  // Sandwichs (faute « Sandiwch » corrigée)
  p('sandwich-viande', 'sandwichs', 'Sandwich Viande Hachée', 'سندويتش باللحم المفروم', 300, { dfr: 'Sandwich à la viande hachée.', dar: 'سندويتش باللحم المفروم.' });
  p('sandwich-poulet', 'sandwichs', 'Sandwich Poulet Haché', 'سندويتش بالدجاج المفروم', 200, { dfr: 'Sandwich au poulet haché.', dar: 'سندويتش بالدجاج المفروم.' });
  p('sandwich-mixte', 'sandwichs', 'Sandwich Mixte (Escalope, viande hachée)', 'سندويتش مختلط (إسكالوب ولحم مفروم)', 450, { dfr: 'Escalope et viande hachée.', dar: 'إسكالوب ولحم مفروم.' });
  p('sandwich-escalope-creme', 'sandwichs', 'Sandwich Escalope à la Crème', 'سندويتش إسكالوب بالكريمة', 400, { dfr: 'Escalope, sauce à la crème.', dar: 'إسكالوب بصلصة الكريمة.' });
  p('sandwich-kebda', 'sandwichs', 'Sandwich Kebda', 'سندويتش كبدة', 350, { tags: ['epice'], dfr: 'Sandwich au foie (kebda).', dar: 'سندويتش بالكبدة.' });
  p('sandwich-escalope-marinee', 'sandwichs', 'Sandwich Escalope Mariné', 'سندويتش إسكالوب متبّل', 350, { tags: ['epice'], dfr: 'Escalope marinée.', dar: 'إسكالوب متبّل.' });
  p('sandwich-crispy', 'sandwichs', 'Sandwich Crispy', 'سندويتش كريسبي', 400, { dfr: 'Sandwich au poulet croustillant.', dar: 'سندويتش بالدجاج المقرمش.' });

  // Box
  p('box-poulet-frites', 'box', 'Box Poulet Haché Frite', 'بوكس دجاج مفروم وبطاطا مقلية', 450, { dfr: 'Poulet haché et frites.', dar: 'دجاج مفروم وبطاطا مقلية.' });
  p('box-mixte-riz', 'box', 'Box Mixte Riz', 'بوكس مختلط بالأرز', 600, { dfr: 'Box mixte servie avec du riz.', dar: 'بوكس مختلط مع الأرز.' });
  p('box-crispy-riz', 'box', 'Box Crispy Riz', 'بوكس كريسبي بالأرز', 600, { dfr: 'Poulet croustillant et riz.', dar: 'دجاج مقرمش وأرز.' });
  p('box-viande-frites', 'box', 'Box Viande Hachée Frite', 'بوكس لحم مفروم وبطاطا مقلية', 500, { dfr: 'Viande hachée et frites.', dar: 'لحم مفروم وبطاطا مقلية.' });

  // Desserts
  p('cheesecake', 'desserts', 'Cheesecake', 'تشيز كيك', 300, { tags: ['vege'], estime: true, dfr: 'Part de cheesecake.', dar: 'قطعة تشيز كيك.' });
  p('mhalbi', 'desserts', 'Mhalbi', 'المهلبي', 150, { tags: ['maison', 'vege'], estime: true, dfr: 'Crème de riz (mhalbi).', dar: 'مهلبي.' });
  p('mousse-chocolat', 'desserts', 'Mousse au chocolat', 'موس الشوكولاتة', 200, { tags: ['vege'], estime: true, dfr: 'Mousse au chocolat.', dar: 'موس الشوكولاتة.' });
  p('tiramisu', 'desserts', 'Tiramisu', 'تيراميسو', 300, { tags: ['vege'], estime: true, dispo: false, dfr: 'Part de tiramisu.', dar: 'قطعة تيراميسو.' });
  p('salade-fruits', 'desserts', 'Salade de fruits', 'سلطة الفواكه', 250, { tags: ['vege'], estime: true, dfr: 'Salade de fruits.', dar: 'سلطة الفواكه.' });
  p('cake-baba', 'desserts', 'Cake Baba', 'كيك بابا', 200, { tags: ['vege'], estime: true, dfr: 'Part de cake baba.', dar: 'قطعة كيك بابا.' });
  p('flan-caramel', 'desserts', 'Flan au caramel', 'فلان بالكراميل', 150, { tags: ['vege'], estime: true, dfr: 'Flan au caramel.', dar: 'فلان بالكراميل.' });

  // Boissons
  p('eau-pm', 'boissons', 'Eau Minérale PM', 'ماء معدني (صغير)', 30, { tags: ['vege'], dfr: 'Petite bouteille.', dar: 'قارورة صغيرة.' });
  p('eau-gm', 'boissons', 'Eau Minérale GM', 'ماء معدني (كبير)', 50, { tags: ['vege'], estime: true, dfr: 'Grande bouteille.', dar: 'قارورة كبيرة.' });

  /* ---------- Suppléments (à confirmer avec le restaurant) ---------- */
  const supplements = {
    groupes: [
      { id: 'extra', fr: 'Suppléments', ar: 'إضافات', type: 'multi', choix: [
        { id: 'fromage', fr: 'Supplément fromage', ar: 'جبن إضافي', prix: 100 },
        { id: 'frites', fr: 'Portion de frites', ar: 'حصة بطاطا مقلية', prix: 150 }
      ] },
      { id: 'sauce', fr: 'Sauce', ar: 'الصلصة', type: 'unique', choix: [
        { id: 'aucune', fr: 'Sans sauce', ar: 'بدون صلصة', prix: 0 },
        { id: 'mayo', fr: 'Mayonnaise', ar: 'مايونيز', prix: 0 },
        { id: 'ketchup', fr: 'Ketchup', ar: 'كاتشب', prix: 0 },
        { id: 'harissa', fr: 'Harissa', ar: 'هريسة', prix: 0 }
      ] }
    ],
    // quelles catégories reçoivent quels groupes
    parCategorie: { pizzas: ['extra'], tacos: ['extra', 'sauce'], burgers: ['extra', 'sauce'], sandwichs: ['extra', 'sauce'], box: ['extra', 'sauce'] }
  };
  // Pas de frites en supplément sur une pizza : on filtre à l'affichage
  supplements.exclusions = { pizzas: ['frites'] };

  /* ---------- Zones de livraison (depuis 35.6976, -0.5778) ---------- */
  const zones = [
    { id: 'centre',    fr: 'Oran centre',          ar: 'وهران وسط',          frais: 150, min: 500,  temps: '20-30' },
    { id: 'usto',      fr: 'Hai Sabah / USTO',     ar: 'حي الصباح / USTO',    frais: 250, min: 800,  temps: '30-40' },
    { id: 'canastel',  fr: 'Canastel',             ar: 'كناستال',            frais: 250, min: 800,  temps: '30-40' },
    { id: 'birdjir',   fr: 'Bir El Djir',          ar: 'بئر الجير',          frais: 300, min: 1000, temps: '35-45' },
    { id: 'essenia',   fr: 'Es Senia',             ar: 'السانية',            frais: 300, min: 1000, temps: '35-45' },
    { id: 'sidichami', fr: 'Sidi Chami',           ar: 'سيدي الشحمي',        frais: 400, min: 1500, temps: '40-50' },
    { id: 'hassi',     fr: 'Hassi Bounif',         ar: 'حاسي بونيف',         frais: 450, min: 1500, temps: '45-55' },
    { id: 'misserghin',fr: 'Misserghin',           ar: 'مسرغين',             frais: 500, min: 2000, temps: '45-60' },
    { id: 'aintureck', fr: 'Aïn El Turck',         ar: 'عين الترك',          frais: 600, min: 2500, temps: '50-65' },
    { id: 'gdyel',     fr: 'Gdyel',                ar: 'قديل',               frais: 700, min: 3000, temps: '55-70' }
  ];

  /* ---------- Traiteur : formules EXEMPLES (modifiables par le gérant) ---------- */
  const traiteur = {
    formules: [
      { id: 'tradition', fr: 'Tradition', ar: 'التقليدية', prix: 1500,
        photos: ['hrira', 'couscous', 'salade-fruits'],
        contenu: [
          { fr: 'Hrira ou Chorba', ar: 'حريرة أو شوربة' },
          { fr: 'Bourak au poulet ou à la viande hachée', ar: 'بوراك بالدجاج أو باللحم المفروم' },
          { fr: 'Couscous', ar: 'كسكس' },
          { fr: 'Salade de fruits', ar: 'سلطة الفواكه' },
          { fr: 'Eau minérale', ar: 'ماء معدني' }
        ] },
      { id: 'prestige', fr: 'Prestige', ar: 'البريستيج', prix: 2400,
        photos: ['mhadjeb', 'rechta', 'flan-caramel'],
        contenu: [
          { fr: 'Chorba ou Hrira', ar: 'شوربة أو حريرة' },
          { fr: 'Bourak, Mhadjeb et Batbout', ar: 'بوراك، محاجب وبطبوط' },
          { fr: 'Salade de pommes de terre et de betteraves', ar: 'سلطة البطاطا وسلطة الشمندر' },
          { fr: 'Couscous ou Rechta', ar: 'كسكس أو رشتة' },
          { fr: 'Cuisse de poulet ou Escalope panée', ar: 'فخذ دجاج أو إسكالوب بانيه' },
          { fr: 'Flan au caramel ou Mhalbi', ar: 'فلان بالكراميل أو مهلبي' },
          { fr: 'Eau minérale', ar: 'ماء معدني' }
        ] },
      { id: 'baraka', fr: 'Baraka', ar: 'البركة', prix: 3600,
        photos: ['pastilla', 'mtouem', 'cheesecake'],
        contenu: [
          { fr: 'Chorba ou Hrira', ar: 'شوربة أو حريرة' },
          { fr: 'Pastilla, Bourak, Quiche, Mini Pizza et Maâqouda', ar: 'بسطيلة، بوراك، كيش، ميني بيتزا ومعقودة' },
          { fr: 'Deux salades au choix', ar: 'سلطتان حسب الاختيار' },
          { fr: 'Couscous, Rechta ou Berkoukes', ar: 'كسكس أو رشتة أو بركوكس' },
          { fr: 'Mtouem ou Tajine de poulet aux olives', ar: 'مثوّم أو طاجين الزيتون بالدجاج' },
          { fr: 'Gratin de poulet', ar: 'غراتان الدجاج' },
          { fr: 'Cheesecake, Tiramisu et Salade de fruits', ar: 'تشيز كيك، تيراميسو وسلطة الفواكه' },
          { fr: 'Eau minérale', ar: 'ماء معدني' }
        ] }
    ],
    // Plateaux à la pièce et gros volumes : uniquement des plats de la carte
    pieces: ['bourak-viande', 'bourak-poulet', 'mhadjeb', 'batbout', 'maaqouda', 'mini-pizza', 'quiche', 'chausson-thon', 'chausson-fromage', 'souffle', 'crispy', 'pastilla'],
    volumes: ['couscous', 'rechta', 'berkoukes', 'mtouem', 'djolbana', 'dolma', 'gratin-poulet', 'gratin-pommes-de-terre', 'salade-pommes-de-terre', 'salade-fruits'],
    // Uniquement des SERVICES (aucun produit inventé) — à confirmer avec le restaurant
    options: [
      { id: 'serveurs',   fr: 'Serveurs',                     ar: 'نادلون',                mode: 'serveur', prix: 3000, ratio: 40 },
      { id: 'vaisselle',  fr: 'Vaisselle et nappage',          ar: 'الأواني والمفارش',       mode: 'pers',    prix: 150 },
      { id: 'livraison',  fr: 'Livraison et installation',     ar: 'التوصيل والتركيب',       mode: 'forfait', prix: 3000 },
      { id: 'barquettes', fr: 'Barquettes individuelles',      ar: 'علب فردية',              mode: 'pers',    prix: 60 }
    ],
    evenements: [
      { id: 'mariage',     fr: 'Mariage',                ar: 'عرس' },
      { id: 'khotba',      fr: 'Fiançailles (khotba)',   ar: 'خطوبة' },
      { id: 'sboua',       fr: 'Baptême (sbouâ)',        ar: 'سبوع' },
      { id: 'tahara',      fr: 'Circoncision (tahara)',  ar: 'طهارة' },
      { id: 'iftar',       fr: 'Iftar / Ramadan',        ar: 'إفطار / رمضان' },
      { id: 'entreprise',  fr: 'Repas d’entreprise',     ar: 'وجبة مؤسسة' },
      { id: 'autre',       fr: 'Autre événement',        ar: 'مناسبة أخرى' }
    ],
    acompte: 30,
    remises: [{ des: 150, pct: 5 }, { des: 300, pct: 8 }],
    capacite: 600,
    delaiMin: 3,
    datesBloquees: []
  };

  /* ---------- Réglages de l'établissement ---------- */
  const reglages = {
    nom: 'Banet el Baraka',
    nomAr: 'بنة البركة',
    accrocheFr: 'Plats traditionnels en self & fast-food · Oran',
    accrocheAr: 'أطباق تقليدية في الخدمة الذاتية وأكل سريع · وهران',
    tel: '0550 00 00 00',
    whatsapp: '213550000000',
    instagram: 'banetelbaraka',
    adresseFr: 'Oran (adresse exacte à confirmer)',
    adresseAr: 'وهران (العنوان الدقيق يُؤكَّد لاحقًا)',
    lat: 35.6975625, lng: -0.5778125,
    ouverture: '11:00', fermeture: '23:00',
    delaiLivraison: '20-30',
    platDuJour: 'couscous',
    livreurs: ['Hichem', 'Bilal'],
    pins: { gerant: '0328', cuisine: '1111', caisse: '2222', livreur: '3333' },
    fidelite: { seuil: 10, fr: '1 box offerte', ar: 'بوكس مجاني' },
    modeDemo: true
  };

  /* =========================================================================
     Données d'exemple de la journée (commandes, demandes traiteur, clients)
     ========================================================================= */
  // Générateur pseudo-aléatoire reproductible
  function alea(graine) { let s = graine; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

  function exemples(maintenant) {
    const r = alea(20261030);
    const choisir = (t) => t[Math.floor(r() * t.length)];
    const plat = (id) => plats.find((x) => x.id === id);
    const clients = [
      ['Houari', '0661 23 45 18'], ['Yasmine', '0770 81 02 44'], ['Sofiane', '0555 30 72 19'], ['Imene', '0698 14 25 63'],
      ['Walid', '0541 67 80 32'], ['Nesrine', '0779 05 38 21'], ['Abdelkader', '0662 90 11 07'], ['Fatima Zohra', '0550 48 26 91'],
      ['Mohamed', '0697 33 12 50'], ['Lamia', '0773 64 09 85'], ['Ryad', '0560 21 87 43'], ['Kheira', '0665 52 70 36'],
      ['Mourad', '0791 18 46 02'], ['Asma', '0542 76 93 15'], ['Nadir', '0668 09 54 27'], ['Meriem', '0776 41 63 08'],
      ['Zakaria', '0558 87 20 64'], ['Rania', '0695 26 08 71'], ['Djamel', '0549 63 17 92'], ['Samira', '0664 15 89 30'],
      ['Amine', '0771 92 46 13'], ['Hanane', '0553 04 71 86']
    ];
    // paniers typiques : fast-food + self traditionnel
    const paniers = [
      [['tacos-mixte', 1], ['eau-pm', 1]], [['couscous', 2], ['hrira', 2]], [['pizza-thon', 1], ['pizza-margherita', 1]],
      [['box-crispy-riz', 2], ['eau-gm', 1]], [['sandwich-kebda', 2]], [['mtouem', 1], ['bourak-poulet', 3]],
      [['burger-crispy', 2], ['tacos-poulet', 1]], [['rechta', 1], ['salade-pommes-de-terre', 1]],
      [['pizza-3-fromages', 1], ['mini-pizza', 2]], [['box-mixte-riz', 1], ['flan-caramel', 1]],
      [['sandwich-mixte', 1], ['eau-pm', 2]], [['cuisse-poulet', 1], ['soupe-lentilles', 1]],
      [['tacos-viande', 2]], [['escalope-panee', 1], ['mhadjeb', 2]], [['pizza-chicken', 1], ['burger-viande', 1]],
      [['dolma', 1], ['batbout', 2]], [['box-viande-frites', 1]], [['gratin-poulet', 1], ['maaqouda', 4]],
      [['sandwich-escalope-creme', 1], ['sandwich-poulet', 1]], [['djolbana', 1], ['hrira', 1]],
      [['tacos-crispy', 1], ['mousse-chocolat', 1]], [['pizza-viande-hachee', 1], ['eau-gm', 1]]
    ];
    const modes = ['livraison', 'livraison', 'emporter', 'livraison', 'surplace', 'livraison', 'emporter'];
    const zonesPoids = ['centre', 'centre', 'usto', 'birdjir', 'essenia', 'canastel', 'centre'];
    const reperes = ['À côté de la pharmacie', 'En face de l’école', 'Près de la mosquée', 'Immeuble avec portail vert', 'Au-dessus de la supérette'];

    // la journée commence à 11h ; si on est trop tôt, on étale sur les dernières heures
    const debut = new Date(maintenant); debut.setHours(11, 0, 0, 0);
    let t0 = debut.getTime();
    if (maintenant - t0 < 3 * 3600e3) t0 = maintenant - 9 * 3600e3;
    const n = paniers.length;
    const commandes = [];
    for (let i = 0; i < n; i++) {
      let cree = Math.round(t0 + ((maintenant - 50 * 60e3 - t0) * Math.pow(i / (n - 1), 0.9)));
      // les 6 dernières commandes sont récentes (cuisine et livraison en cours)
      if (n - i <= 6) cree = maintenant - ((n - i) * 7 - 4) * 60e3;
      const [nom, tel] = clients[i];
      const mode = modes[i % modes.length];
      const zone = mode === 'livraison' ? zonesPoids[i % zonesPoids.length] : '';
      const lignes = paniers[i].map(([id, q]) => {
        const pl = plat(id);
        const opts = [];
        if (['tacos', 'burgers', 'sandwichs'].includes(pl.cat) && r() > 0.6) opts.push({ fr: 'Supplément fromage', ar: 'جبن إضافي', prix: 100 });
        return { id, fr: pl.fr, ar: pl.ar, prix: pl.prix, qte: q, opts, note: '' };
      });
      const sousTotal = lignes.reduce((s, l) => s + l.qte * (l.prix + l.opts.reduce((a, o) => a + o.prix, 0)), 0);
      const z = zones.find((x) => x.id === zone);
      const frais = z ? z.frais : 0;
      // statuts : les plus anciennes sont terminées, les dernières en cours
      const reste = n - i;
      let statut = 'livree';
      if (reste === 1 || reste === 2) statut = 'recue';
      else if (reste === 3 || reste === 4) statut = 'preparation';
      else if (reste === 5) statut = 'prete';
      let livreur = '';
      if (mode === 'livraison' && reste === 6) { statut = 'livraison'; livreur = 'Hichem'; }
      if (mode === 'livraison' && statut === 'livree') livreur = choisir(['Hichem', 'Bilal']);
      if (i === 7) statut = 'refusee';
      const historique = [{ s: 'recue', t: cree }];
      const etapes = ['preparation', mode === 'livraison' ? 'livraison' : 'prete', 'livree'];
      const ordre = ['recue', 'preparation', 'prete', 'livraison', 'livree'];
      let t = cree;
      etapes.forEach((e) => { if (statut !== 'refusee' && ordre.indexOf(e) <= ordre.indexOf(statut)) { t += (6 + r() * 14) * 60e3; historique.push({ s: e, t: Math.min(t, maintenant) }); } });
      if (statut === 'prete') historique.push({ s: 'prete', t: maintenant - 3 * 60e3 });
      if (statut === 'refusee') historique.push({ s: 'refusee', t: cree + 2 * 60e3 });
      commandes.push({
        id: 'BB-' + (1001 + i), cree, mode, canal: i % 5 === 4 ? 'comptoir' : 'site',
        client: { nom, tel }, zone,
        adresse: mode === 'livraison' ? { cite: choisir(['Hai El Badr', 'Cité Djamel', 'Hai Khemisti', 'Hai Es Salam', 'Gambetta']), batiment: 'Bt ' + (1 + Math.floor(r() * 12)), etage: String(Math.floor(r() * 6)), repere: choisir(reperes) } : null,
        heure: 'asap', lignes, sousTotal, frais, total: sousTotal + frais,
        statut, historique, livreur, remarque: i === 3 ? 'Sonnez deux fois svp' : '',
        paye: statut === 'livree', modePaiement: statut === 'livree' ? (mode === 'livraison' ? 'especes' : choisir(['especes', 'especes', 'tpe'])) : '',
        zId: ''
      });
    }

    /* Demandes traiteur d'exemple (dates relatives à aujourd'hui) */
    const jour = (d) => { const x = new Date(maintenant); x.setHours(12, 0, 0, 0); x.setDate(x.getDate() + d); return x.toISOString().slice(0, 10); };
    // Iftar : pendant le prochain Ramadan (env. 8 fév. - 9 mars 2027)
    const iftar = new Date('2027-02-18T12:00:00') > new Date(maintenant) ? '2027-02-18' : jour(120);
    const devis = [
      { id: 'DEV-1031', cree: maintenant - 6 * 864e5, type: 'mariage', date: jour(12), heure: '19:00', invites: 250, mode: 'formule', formule: 'prestige', pieces: {}, options: ['serveurs', 'vaisselle', 'livraison'],
        nom: 'Famille Benali', tel: '0661 74 20 39', lieu: 'Salle des fêtes, Bir El Djir', remarques: 'Deux invités sans gluten.', statut: 'acompte', acompteRecu: 200000, prixFinal: 0, note: 'Acompte reçu en espèces au restaurant.' },
      { id: 'DEV-1032', cree: maintenant - 3 * 864e5, type: 'khotba', date: jour(6), heure: '17:00', invites: 80, mode: 'formule', formule: 'tradition', pieces: {}, options: ['barquettes'],
        nom: 'Sarah Mekki', tel: '0770 52 18 64', lieu: 'Domicile, Hai Sabah', remarques: '', statut: 'devis', acompteRecu: 0, prixFinal: 0, note: 'Devis envoyé sur WhatsApp, rappeler jeudi.' },
      { id: 'DEV-1033', cree: maintenant - 2 * 864e5, type: 'iftar', date: iftar, heure: '18:30', invites: 120, mode: 'formule', formule: 'prestige', pieces: {}, options: ['livraison', 'barquettes'],
        nom: 'Entreprise (contact : M. Kaddour)', tel: '0550 63 81 27', lieu: 'Locaux de l’entreprise, Es Senia', remarques: 'Iftar d’entreprise pour le personnel.', statut: 'nouvelle', acompteRecu: 0, prixFinal: 0, note: '' },
      { id: 'DEV-1034', cree: maintenant - 864e5, type: 'sboua', date: jour(4), heure: '13:00', invites: 60, mode: 'formule', formule: 'tradition', pieces: {}, options: [],
        nom: 'Amel Ziani', tel: '0698 27 43 15', lieu: 'Domicile, Oran centre', remarques: '', statut: 'confirmee', acompteRecu: 30000, prixFinal: 88000, note: 'Prix arrondi accordé.' },
      { id: 'DEV-1035', cree: maintenant - 5 * 3600e3, type: 'tahara', date: jour(9), heure: '16:00', invites: 100, mode: 'plateaux', formule: '', options: ['livraison'],
        pieces: { 'bourak-poulet': 100, 'mhadjeb': 80, 'mini-pizza': 60, 'quiche': 60 },
        nom: 'Rachid Hamou', tel: '0541 90 36 72', lieu: 'Domicile, Canastel', remarques: 'Plateaux de 300 pièces.', statut: 'nouvelle', acompteRecu: 0, prixFinal: 0, note: '' },
      { id: 'DEV-1030', cree: maintenant - 15 * 864e5, type: 'entreprise', date: jour(-5), heure: '12:30', invites: 40, mode: 'formule', formule: 'tradition', pieces: {}, options: ['livraison'],
        nom: 'Cabinet (contact : Mme Saidi)', tel: '0560 47 12 98', lieu: 'Oran centre', remarques: '', statut: 'realisee', acompteRecu: 18000, prixFinal: 0, note: 'Client satisfait, à relancer.' }
    ];

    /* Fichier clients (historique avant aujourd'hui) */
    const fichier = {};
    clients.forEach(([nom, tel], i) => {
      const nb = [9, 4, 6, 2, 12, 1, 3, 5, 0, 7, 2, 8, 1, 3, 0, 4, 2, 6, 1, 3, 0, 2][i] || 0;
      fichier[tel.replace(/\D/g, '')] = { nom, tel, nb, total: nb * 820, derniere: maintenant - (2 + i) * 864e5, offertes: Math.floor(nb / 10) };
    });
    // ajoute les commandes du jour au fichier
    commandes.forEach((c) => {
      if (c.statut === 'refusee') return;
      const f = fichier[c.client.tel.replace(/\D/g, '')];
      f.nb += 1; f.total += c.total; f.derniere = c.cree;
    });

    return { commandes, devis, clients: fichier };
  }

  window.BNB_DONNEES = { categories, plats, supplements, zones, traiteur, reglages, exemples };
})();
