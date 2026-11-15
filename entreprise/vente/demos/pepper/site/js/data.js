/* =====================================================================
   PEPPER · Les artisans du burger — données de la carte
   Source : fiche Yassir « Pepper Hydra » (relevée le 15/11/2026).
   Uniquement leurs vrais produits, descriptions et prix.
   price: null = produit épuisé sur Yassir, prix non publié.
   ===================================================================== */
window.PEPPER_DATA = {
  brand: {
    name: 'Pepper',
    tagline: 'Les artisans du burger',
    slogan: 'Le vrai goût gourmand',
    instagram: 'https://www.instagram.com/pepperlesartisansduburger/',
    instagramBranch: 'https://www.instagram.com/pepper_ainallah_gardencity/',
    facebook: 'https://www.facebook.com/PepperSandwicherie',
    yassir: 'https://delivery.yassir.com/restaurant/alger-centre/6a103e99a68690eaf1dbd90f/Pepper-Hydra',
    rating: 4.3, ratings: 102
  },

  branches: [
    { id: 'gc', name: 'Garden City', place: '3e étage · espace restauration', placeAr: 'الطابق الثالث · فضاء المطاعم',
      area: 'Chéraga · Dely Brahim', maps: 'https://g.page/gardencityalgeria?share', mall: true,
      hours: { def: ['10:00', '22:00'], fri: ['10:00', '23:00'], sat: ['10:00', '23:00'] } },
    { id: 'hy', name: 'Hydra', place: 'Rue Mohamed Saïd Hamdine', placeAr: 'شارع محمد سعيد حمدين',
      area: 'Hydra', maps: 'https://goo.gl/maps/5mXCDra6fcKE7TKPA',
      hours: { def: ['12:00', '23:30'] } },
    { id: 'sy', name: 'Sidi Yahia', place: 'Chemin Sidi Yahia', placeAr: 'طريق سيدي يحيى',
      area: 'Bir Mourad Raïs', maps: 'https://goo.gl/maps/UZgjCsCtjiqie3C98',
      hours: { def: ['12:00', '23:30'] } },
    { id: 'aa', name: 'Aïn Allah', place: 'Aïn Allah', placeAr: 'عين الله',
      area: 'Dely Brahim', maps: 'https://goo.gl/maps/6eBAQCxMHhuXmHT17',
      hours: { def: ['12:00', '23:30'] } }
  ],

  categories: [
    { id: 'beef', fr: 'Burgers bœuf', ar: 'برغر لحم', icon: '🍔' },
    { id: 'chicken', fr: 'Chicken burgers', ar: 'برغر دجاج', icon: '🐔' },
    { id: 'sandwich', fr: 'Sandwichs', ar: 'سندويشات', icon: '🥖' },
    { id: 'side', fr: 'À côté', ar: 'مقبلات', icon: '🍟' },
    { id: 'dessert', fr: 'Desserts', ar: 'حلويات', icon: '🍮' },
    { id: 'drink', fr: 'Boissons', ar: 'مشروبات', icon: '🥤' }
  ],

  // sizes: [Simple, XL, XXL]
  products: [
    { id: 'pepper', cat: 'beef', name: 'Pepper Burger', desc: 'Steak haché, sauce au poivre', price: 450, sizes: [450, 600, 750], img: 'pepper-burger', star: true },
    { id: 'cheese', cat: 'beef', name: 'Cheese Burger', desc: 'Steak haché, salade, tomate, fromage, mayo, ketchup', price: 600, sizes: [600, 750, 900], img: 'cheese-burger' },
    { id: 'bbq', cat: 'beef', name: 'BBQ Burger', desc: 'Steak haché, salade, tomate, fromage, sauce barbecue', price: 650, sizes: [650, 800, 950], img: 'bbq-burger' },
    { id: 'algerian', cat: 'beef', name: 'Algerian Burger', desc: 'Steak haché, salade, tomate, fromage, sauce aïoli', price: 650, sizes: [650, 800, 950], img: 'algerian-burger' },
    { id: 'xtrem', cat: 'beef', name: 'Xtrem Burger', desc: 'Steak haché, salade, tomate, fromage, sauce tartare', price: 650, sizes: [650, 800, 950], img: 'xtrem-burger' },
    { id: 'tatziki', cat: 'beef', name: 'Tatziki Burger', desc: 'Steak haché, yaourt, concombre, menthe, fromage', price: 650, sizes: [650, 800, 950], img: 'tatziki-burger' },
    { id: 'pickle', cat: 'beef', name: 'Pickle Burger', desc: 'Steak haché, salade, tomate, oignons, pickles, fromage, house sauce', price: 700, sizes: [700, 850, 1000], img: 'pickle-burger' },
    { id: 'egg', cat: 'beef', name: 'Egg Burger', desc: 'Steak haché, œuf, salade, tomate, oignons, fromage, mayo, ketchup', price: 750, sizes: [750, 900, 1050], img: 'egg-burger' },
    { id: 'bleu', cat: 'beef', name: 'Bleu Burger', desc: 'Steak haché, sauce roquefort, fromage', price: 800, sizes: [800, 950, 1100], img: 'bleu-burger' },
    { id: 'chili', cat: 'beef', name: 'Chili Burger', desc: 'Steak haché, salade, tomate, oignons, piment, fromage, chili hot sauce', price: 900, sizes: [900, 1050, 1200], img: 'chili-burger', hot: true },
    { id: 'rossini', cat: 'beef', name: 'Rossini Burger', desc: 'Steak haché, tranche de foie grillée, sauce poivre ou aïoli', price: 900, img: 'rossini-burger', star: true, sauce: ['Poivre', 'Aïoli'] },
    { id: 'forest', cat: 'beef', name: 'Forest Burger', desc: 'Steak haché, champignons et oignons caramélisés, fromage', price: null, img: 'forest-burger', soldout: true },

    { id: 'chk', cat: 'chicken', name: 'Chicken Burger', desc: 'Poulet grillé, salade, tomate, fromage, sauce barbecue', price: 500, img: 'chicken-burger' },
    { id: 'chkcrispy', cat: 'chicken', name: 'Chicken Crispy Burger', desc: 'Poulet pané, salade, tomate, fromage, sauce barbecue', price: 600, img: 'chicken-crispy-burger' },
    { id: 'chkoriental', cat: 'chicken', name: 'Chicken Oriental Burger', desc: 'Poulet, merguez, salade, tomate, fromage, sauce piquante', price: 700, img: 'chicken-oriental-burger', hot: true },
    { id: 'chkmozza', cat: 'chicken', name: 'Chicken Mozza Burger', desc: 'Poulet, roquette, mozza, sauce pesto', price: 800, img: 'chicken-mozza-burger' },

    { id: 'nicois', cat: 'sandwich', name: 'Sandwich Niçois', desc: 'Poulet aux fines herbes grillé, salade, tomate, fromage, sauce aïoli', price: 600, img: 'sandwich-nicois' },
    { id: 'pondichery', cat: 'sandwich', name: 'Sandwich Pondichéry', desc: 'Poulet au curry grillé, salade, tomate, fromage, mayo', price: 600, img: 'sandwich-pondichery' },
    { id: 'keftaji', cat: 'sandwich', name: 'Sandwich Keftaji', desc: 'Kefta, salade, tomate, fromage, sauce harissa', price: 650, img: 'sandwich-keftaji', hot: true },
    { id: 'thon', cat: 'sandwich', name: 'Sandwich Crudités au thon', desc: 'Thon, salade, tomate, oignons, fromage', price: 500, img: 'sandwich-crudites-au-thon' },
    { id: 'beurre3f', cat: 'sandwich', name: 'Sandwich Beurre 3 fromages', desc: 'Beurre, mozza, camembert, salade, tomate, fromage', price: 450, img: 'sandwich-beurre-3-fromage' },

    { id: 'frites', cat: 'side', name: 'Frites', desc: '', price: 200, img: 'frites' },
    { id: 'nuggets', cat: 'side', name: 'Nuggets', desc: '', price: 450, img: 'nuggets' },
    { id: 'quiches', cat: 'side', name: 'Quiches', desc: '', price: null, img: 'quiches', soldout: true },
    { id: 'cesar', cat: 'side', name: 'Salade César', desc: '', price: null, img: 'salade-cesar', soldout: true },

    { id: 'dessertjour', cat: 'dessert', name: 'Dessert du jour', desc: '', price: 400, img: 'dessert-du-jour' },
    { id: 'flan', cat: 'dessert', name: 'Flan', desc: '', price: 350, img: 'flan' },
    { id: 'tartecitron', cat: 'dessert', name: 'Tarte aux citrons', desc: '', price: 350, img: 'tarte-aux-citrons' },

    { id: 'soda', cat: 'drink', name: 'Soda', desc: '', price: 150, img: 'soda' },
    { id: 'jus', cat: 'drink', name: 'Jus frais', desc: '', price: 250, img: 'jus-frais' },
    { id: 'eau', cat: 'drink', name: 'Eau plate', desc: '', price: 50, img: 'eau-plate' },
    { id: 'eaugaz', cat: 'drink', name: 'Eau gazeuse', desc: '', price: 50, img: 'eau-gazeuse' }
  ],

  sizeNames: ['Simple', 'XL', 'XXL'],
  // suggestions « avec ça ? » : uniquement des produits de la carte
  pairings: ['frites', 'soda', 'nuggets', 'jus']
};
