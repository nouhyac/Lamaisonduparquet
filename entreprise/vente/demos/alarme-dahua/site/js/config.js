/* =====================================================================
   RÉGLAGES DU MAGASIN — le seul fichier à modifier
   ---------------------------------------------------------------------
   - name     : nom du magasin (laissé vide = la page met en avant le kit)
   - whatsapp : numéro WhatsApp au format international, ex. '213555123456'
   - phone    : numéro affiché, ex. '0555 12 34 56'
   - price    : prix de vente en DA (null = « prix sur demande »)
   - oldPrice : ancien prix barré en DA (null = rien d'affiché)
   - pin      : code de l'espace commandes
   ===================================================================== */
window.SHOP = {
  name: 'General Electric dz',
  whatsapp: '213666235330',
  whatsappShow: '0666 23 53 30',
  phone: '0792 54 50 57',
  city: 'El Hamiz',
  maps: 'https://maps.google.com/?q=36.717319,3.228126',
  followers: '65 K',
  price: null,
  oldPrice: null,
  pin: '0328'
};

/* Fiche technique officielle Dahua : DHI-ART-ARC3000H-03-GW2(868) */
window.KIT = {
  ref: 'DHI-ART-ARC3000H-03-GW2(868)',
  items: [
    { id: 'hub', ref: 'ARC3000H-GW2(868)', img: 'centrale', name: { fr: 'La centrale', ar: 'الجهاز المركزي' },
      role: { fr: 'Le cerveau du système. Elle reçoit les alertes et vous prévient sur l\'application, par SMS et par appel.', ar: 'عقل النظام. يستقبل الإنذارات ويُعلمك عبر التطبيق والرسائل والمكالمات.' },
      specs: { fr: ['Wi-Fi, câble Ethernet ou carte SIM (2G)', 'Portée radio jusqu\'à 2 000 m en champ libre', 'Batterie de secours : 12 h', 'Sirène (buzzer) intégrée', 'SMS et appels vers 5 numéros'], ar: ['واي فاي أو كابل إيثرنت أو شريحة SIM (2G)', 'مدى لاسلكي حتى 2000 م في مكان مفتوح', 'بطارية احتياطية: 12 ساعة', 'صفارة مدمجة', 'رسائل ومكالمات إلى 5 أرقام'] } },
    { id: 'door', ref: 'ARD323-W2(868)', img: 'detecteur-ouverture', name: { fr: 'Le détecteur d\'ouverture', ar: 'كاشف فتح الأبواب' },
      role: { fr: 'Sur une porte ou une fenêtre : dès qu\'elle s\'ouvre, la centrale le sait.', ar: 'على باب أو نافذة: بمجرد فتحها يعلم الجهاز المركزي.' },
      specs: { fr: ['Déclenche dès 4 cm d\'ouverture', 'Portée jusqu\'à 1 200 m en champ libre', 'Pile CR123A : jusqu\'à 5 ans', 'Mesure aussi la température'], ar: ['ينطلق ابتداءً من 4 سم من الفتح', 'مدى حتى 1200 م في مكان مفتوح', 'بطارية CR123A: حتى 5 سنوات', 'يقيس درجة الحرارة أيضاً'] } },
    { id: 'pir', ref: 'ARD1233-W2(868)', img: 'detecteur-mouvement', name: { fr: 'Le détecteur de mouvement', ar: 'كاشف الحركة' },
      role: { fr: 'Il surveille une pièce entière et ignore les animaux jusqu\'à 18 kg.', ar: 'يراقب غرفة كاملة ويتجاهل الحيوانات حتى 18 كغ.' },
      specs: { fr: ['Détection jusqu\'à 12 m, angle de 90°', 'Immunité animaux ≤ 18 kg', 'Portée jusqu\'à 1 600 m en champ libre', 'Pile CR123A : jusqu\'à 4 ans', '3 niveaux de sensibilité'], ar: ['كشف حتى 12 م بزاوية 90°', 'لا يتأثر بالحيوانات حتى 18 كغ', 'مدى حتى 1600 م في مكان مفتوح', 'بطارية CR123A: حتى 4 سنوات', '3 مستويات حساسية'] } },
    { id: 'fob', ref: 'ARA24-W2(868)', img: 'telecommande', name: { fr: 'La télécommande', ar: 'جهاز التحكم' },
      role: { fr: '4 boutons : Absent, Maison, Désarmer et SOS. Le système s\'active en une seconde.', ar: '4 أزرار: خارج المنزل، في المنزل، إيقاف و SOS.' },
      specs: { fr: ['Boutons Absent · Maison · Désarmer · SOS', 'Portée jusqu\'à 900 m en champ libre', 'Pile CR2032 : jusqu\'à 5 ans'], ar: ['أزرار خارج · منزل · إيقاف · SOS', 'مدى حتى 900 م في مكان مفتوح', 'بطارية CR2032: حتى 5 سنوات'] } }
  ]
};

window.WILAYAS = ['01 Adrar', '02 Chlef', '03 Laghouat', '04 Oum El Bouaghi', '05 Batna', '06 Béjaïa', '07 Biskra', '08 Béchar', '09 Blida', '10 Bouira', '11 Tamanrasset', '12 Tébessa', '13 Tlemcen', '14 Tiaret', '15 Tizi Ouzou', '16 Alger', '17 Djelfa', '18 Jijel', '19 Sétif', '20 Saïda', '21 Skikda', '22 Sidi Bel Abbès', '23 Annaba', '24 Guelma', '25 Constantine', '26 Médéa', '27 Mostaganem', '28 M\'Sila', '29 Mascara', '30 Ouargla', '31 Oran', '32 El Bayadh', '33 Illizi', '34 Bordj Bou Arréridj', '35 Boumerdès', '36 El Tarf', '37 Tindouf', '38 Tissemsilt', '39 El Oued', '40 Khenchela', '41 Souk Ahras', '42 Tipaza', '43 Mila', '44 Aïn Defla', '45 Naâma', '46 Aïn Témouchent', '47 Ghardaïa', '48 Relizane', '49 Timimoun', '50 Bordj Badji Mokhtar', '51 Ouled Djellal', '52 Béni Abbès', '53 In Salah', '54 In Guezzam', '55 Touggourt', '56 Djanet', '57 El M\'Ghair', '58 El Meniaa'];
