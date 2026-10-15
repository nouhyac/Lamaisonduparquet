/* Samir Drive · données, règles de prix et outils communs (site client + espace loueur) */
const PIN='0328';
/* Infos de l'agence et règles : modifiables par le gérant (Réglages) */
const AG={nom:'Samir Drive',tel:'0555 05 24 70',wa:'0550 35 45 30',adresse:'Bordj El Kiffan, Alger',horaires:'7j/7 de 8 h à 22 h · aéroport 24 h/24',annonce:''};
const RG={km:250,prixKm:20,prix8e:1200,jeune:700,ageMin:21,permis:2};
Object.defineProperties(window,{TEL:{get:()=>AG.tel},WA_AFF:{get:()=>AG.wa},WA:{get:()=>telInt(AG.wa)},KM_JOUR:{get:()=>RG.km},PRIX_KM:{get:()=>RG.prixKm},PRIX_8E:{get:()=>RG.prix8e},JEUNE:{get:()=>RG.jeune},AGE_MIN:{get:()=>RG.ageMin},PERMIS_MIN:{get:()=>RG.permis}});
const $=id=>document.getElementById(id);
const pad=n=>String(n).padStart(2,'0');
const iso=x=>x.getFullYear()+'-'+pad(x.getMonth()+1)+'-'+pad(x.getDate());
const parse=s=>{const[a,b,c]=s.split('-').map(Number);return new Date(a,b-1,c)};
const AUJ=(()=>{const x=new Date();x.setHours(0,0,0,0);return x})();
const J=n=>{const x=new Date(AUJ);x.setDate(x.getDate()+n);return iso(x)};
const ecart=(a,b)=>Math.round((parse(b)-parse(a))/864e5);
const fmt=n=>Math.round(n).toLocaleString('fr-FR').replace(/ | /g,' ')+' DA';
const nb=n=>Math.round(n).toLocaleString('fr-FR').replace(/ | /g,' ');
const MOIS=['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
const JOURS=['dim.','lun.','mar.','mer.','jeu.','ven.','sam.'];
const dcourt=s=>{const x=parse(s);return x.getDate()+' '+MOIS[x.getMonth()]};
const dlong=s=>{const x=parse(s);return JOURS[x.getDay()]+' '+x.getDate()+' '+MOIS[x.getMonth()]};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const chiffres=t=>String(t||'').replace(/\D/g,'');
const ss={get:k=>{try{return sessionStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{sessionStorage.setItem(k,v)}catch(e){}}};
function age(naiss,ref=iso(AUJ)){if(!naiss)return 0;const a=parse(naiss),r=parse(ref);let n=r.getFullYear()-a.getFullYear();if(r.getMonth()<a.getMonth()||(r.getMonth()===a.getMonth()&&r.getDate()<a.getDate()))n--;return n}
/* Durée : par tranches de 24 h, avec 59 min de tolérance au retour (règle des grands loueurs) */
function duree(d1,h1,d2,h2){
  const t1=parse(d1).getTime()+(+h1.slice(0,2)*60+ +h1.slice(3))*6e4, t2=parse(d2).getTime()+(+h2.slice(0,2)*60+ +h2.slice(3))*6e4;
  return Math.max(1,Math.ceil((t2-t1-59*6e4)/864e5));
}

/* ---------- Lieux, protections, options ---------- */
const LIEUX={
  agence:{n:'Agence Bordj El Kiffan',c:'Agence',ar:'الوكالة، برج الكيفان',f:0},
  aeroport:{n:"Aéroport d'Alger · Terminal 1",c:'Aéroport',ar:'مطار الجزائر',f:2000},
  domicile:{n:'Livraison à domicile (Alger)',c:'Domicile',ar:'توصيل إلى المنزل',f:2500}
};
const PROTECTIONS={
  essentielle:{n:'Essentielle',ar:'أساسية',taux:0,txt:'Assurance tous risques incluse',fr:1,lignes:['Assurance tous risques','Assistance 24 h/24','Franchise = montant de la caution']},
  confort:{n:'Confort',ar:'راحة',taux:.15,txt:'Franchise divisée par 2',fr:.5,lignes:['Tout Essentielle','Franchise réduite de 50 %','Caution réduite de 30 %'],cau:.7,pop:true},
  serenite:{n:'Sérénité',ar:'طمأنينة',taux:.28,txt:'Zéro franchise, zéro souci',fr:0,lignes:['Tout Confort','Franchise 0 DA','Bris de glace, pneus et jantes couverts','Caution réduite de 50 %'],cau:.5}
};
const OPTS={
  siege:{n:'Siège bébé (0-4 ans)',ar:'كرسي رضيع',d:'Installé et fixé avant la remise des clés',p:500,jour:true},
  rehau:{n:'Rehausseur (4-10 ans)',ar:'مقعد معزز',d:'Pour les enfants de 15 à 36 kg',p:300,jour:true},
  cond:{n:'Conducteur additionnel',ar:'سائق إضافي',d:'Un deuxième conducteur assuré (permis 2 ans)',p:1500,jour:false},
  kmi:{n:'Kilométrage illimité',ar:'كيلومترات غير محدودة',d:'Au lieu de 250 km par jour',p:1000,jour:true},
  plein:{n:"Plein d'essence prépayé",ar:'خزان ممتلئ مسبق الدفع',d:'Rendez la voiture sans faire le plein',p:6500,jour:false}
};
const REMISES=[[30,.25,'30 jours et +'],[15,.15,'15 à 29 jours'],[7,.10,'7 à 14 jours'],[3,.05,'3 à 6 jours']];


/* ---------- Flotte réelle (photos et vidéos envoyées par Samir, modèles à confirmer) ---------- */
const GX3={mod:'x3pro',nom:'Livan X3 Pro',cat:'SUV',gamme:'Éco',forme:'suv',boite:'Manuelle',carbu:'Essence',moteur:'1.5 L 102 ch',conso:'6,5 L/100',coffre:'330 L',places:5,portes:5,prix:7000,caution:60000,ageMin:21,annee:2026,equip:['Écran tactile','Caméra de recul','Bluetooth','Climatisation'],neuf:true};
const FLOTTE0=[
  {id:'v1',mod:'arkana',nom:'Renault Arkana E-Tech',version:'Esprit Alpine',cat:'SUV',gamme:'Premium',forme:'suv',coul:'#121214',coulN:'Noir étoilé',boite:'Automatique',carbu:'Hybride essence',moteur:'1.6 E-Tech 145 ch',conso:'4,8 L/100',coffre:'438 L',places:5,portes:5,prix:15000,caution:120000,ageMin:25,annee:2024,plaque:'505392 124 16',km:21400,vid:30000,assur:J(140),ct:J(560),img:'arkana-studio',photos:['arkana-studio','arkana-1','arkana-pano','arkana-garage','arkana-3','arkana-rue','arkana-int2','arkana-2'],equip:['Finition Esprit Alpine','Toit panoramique en verre','Sellerie Alpine surpiqûres bleues','Écran 9,3" et GPS','Caméra de recul','Jantes 19"','Apple CarPlay / Android Auto'],chef:true},
  {id:'v2',mod:'jetour',nom:'Jetour X50',cat:'SUV',gamme:'Confort',forme:'suv',coul:'#A9C9D8',coulN:'Bleu glacier',boite:'Automatique',carbu:'Essence',moteur:'1.5 T 156 ch',conso:'6,9 L/100',coffre:'430 L',places:5,portes:5,prix:9500,caution:80000,ageMin:23,annee:2025,plaque:'06494 3125 16',km:14200,vid:15000,assur:J(22),ct:J(700),img:'jetour-studio',photos:['jetour-studio','jetour-2','jetour-1'],equip:['Écran tactile 12,3"','Signature lumineuse LED','Caméra de recul','Démarrage sans clé']},
  {id:'v3',mod:'tharu',nom:'Volkswagen Tharu XR',cat:'SUV',gamme:'Confort',forme:'suv',coul:'#B9B2A2',coulN:'Gris sable',boite:'Automatique',carbu:'Essence',moteur:'1.5 TSI 160 ch',conso:'6,3 L/100',coffre:'445 L',places:5,portes:5,prix:11000,caution:90000,ageMin:23,annee:2025,plaque:'511567 125 16',km:8700,vid:15000,assur:J(300),ct:J(690),img:'tharu-studio',photos:['tharu-studio','tharu-av','tharu-ar'],equip:['Bandeau lumineux LED avant et arrière','Logo avant éclairé','Barres de toit','Écran tactile','Apple CarPlay / Android Auto']},
  {id:'v4',mod:'tcross',nom:'Volkswagen T-Cross',cat:'SUV',gamme:'Confort',forme:'suv',coul:'#EDEDEA',coulN:'Blanc pur',boite:'Automatique',carbu:'Essence',moteur:'1.0 TSI 110 ch',conso:'5,8 L/100',coffre:'455 L',places:5,portes:5,prix:10000,caution:80000,ageMin:23,annee:2023,plaque:'502855 123 31',km:36400,vid:40000,assur:J(95),ct:J(160),img:'tcross-studio',photos:['tcross-studio','tcross'],equip:['Radar de recul','Climatisation automatique','Apple CarPlay / Android Auto']},
  {...GX3,id:'v5',coul:'#2B3A4E',coulN:'Bleu nuit',plaque:'529585 126 16',km:4100,vid:10000,assur:J(350),ct:J(1090),img:'livan-studio',photos:['livan-studio','livan-bleu']},
  {...GX3,id:'v6',coul:'#EEEEEA',coulN:'Blanc',plaque:'532697 126 16',km:3200,vid:10000,assur:J(352),ct:J(1092),img:'livan-blanc',photos:['livan-blanc']},
  {...GX3,id:'v7',coul:'#4B5257',coulN:'Gris anthracite',plaque:'525699 126 16',km:9600,vid:10000,assur:J(340),ct:J(1080),img:'livan-gris',photos:['livan-gris']},
  {...GX3,id:'v8',coul:'#A2A7AC',coulN:'Argent',plaque:'531424 126 16',km:5800,vid:10000,assur:J(346),ct:J(1086),img:'livan-argent',photos:['livan-argent','livan-argent-ar']},
  {id:'v10',mod:'coolray',nom:'Geely Coolray',cat:'SUV',gamme:'Confort',forme:'suv',coul:'#9DA3AA',coulN:'Gris titane',boite:'Automatique',carbu:'Essence',moteur:'1.5 T 177 ch',conso:'6,4 L/100',coffre:'330 L',places:5,portes:5,prix:10500,caution:90000,ageMin:23,annee:2025,plaque:'500466 125 16',km:11800,vid:15000,assur:J(260),ct:J(680),img:'coolray-studio',photos:['coolray-studio','coolray','coolray-ar','coolray-int'],equip:['Écran tactile 10,25"','Caméra de recul','Démarrage sans clé','Apple CarPlay / Android Auto']},
  {id:'v11',mod:'tcross',nom:'Volkswagen T-Cross',cat:'SUV',gamme:'Confort',forme:'suv',coul:'#DCD8CE',coulN:'Gris perle',boite:'Automatique',carbu:'Essence',moteur:'1.0 TSI 110 ch',conso:'5,8 L/100',coffre:'455 L',places:5,portes:5,prix:10000,caution:80000,ageMin:23,annee:2021,plaque:'036205 121 16',km:58200,vid:60000,assur:J(48),ct:J(130),img:'tcross-2',photos:['tcross-2'],equip:['Radar de recul','Climatisation automatique','Apple CarPlay / Android Auto']},
  {id:'v12',mod:'polo',nom:'Volkswagen Polo',cat:'Citadine',gamme:'Éco',forme:'citadine',coul:'#EDEDEA',coulN:'Blanche',boite:'Manuelle',carbu:'Essence',moteur:'1.0 TSI 95 ch',conso:'5,5 L/100',coffre:'351 L',places:5,portes:5,prix:6500,caution:50000,ageMin:21,annee:2021,plaque:'à confirmer',km:64300,vid:70000,assur:J(110),ct:J(200),img:'polo-studio',photos:['polo-studio','polo-34','polo-cote','polo-int'],equip:['Toit ouvrant panoramique','Compteurs numériques','Écran tactile','Volant cuir multifonction','Bluetooth','Climatisation']},
  {id:'v9',mod:'ibiza',nom:'Seat Ibiza',version:'FR',cat:'Citadine',gamme:'Éco',forme:'citadine',coul:'#F2F2EF',coulN:'Blanche',boite:'Manuelle',carbu:'Essence',moteur:'1.0 TSI 95 ch',conso:'5,4 L/100',coffre:'355 L',places:5,portes:5,prix:6500,caution:50000,ageMin:21,annee:2023,plaque:'053475 123 16',km:42900,vid:43500,assur:J(70),ct:J(12),img:'ibiza-studio',photos:['ibiza-studio','ibiza-av','ibiza-34','ibiza-feux','ibiza-ar','ibiza-av2','ibiza'],equip:['Finition FR sportive','Double sortie d\'échappement','Feux full LED','Apple CarPlay / Android Auto','Bluetooth','Climatisation']}
];
const photo=x=>String(x).startsWith('data:')?x:'img/flotte/'+x+'.jpg';
/* Visuel d'une voiture : sa vraie photo, sinon une silhouette */
function vis(v,cls=''){return v.img?`<img class="vis ${cls}" src="${photo(v.img)}" alt="" loading="lazy">`:auto(v.forme,v.coul,cls)}
/* Modèles = voitures regroupées (ex. 4 Livan X3 Pro) */
function modeles(tout){const m={};for(const v of S.flotte){if(!tout&&v.cache)continue;(m[v.mod]=m[v.mod]||{mod:v.mod,u:[]}).u.push(v)}return Object.values(m).map(x=>({...x,v:x.u[0]}))}

/* ---------- Conditions générales de location ---------- */
const CGL=[
 ['Le conducteur',"Avoir au moins <b>{age} ans</b> (23 ans pour la gamme Confort, 25 ans pour la gamme Premium) et un <b>permis B depuis au moins {permis} ans</b>, en cours de validité. Entre {age} et 24 ans, un supplément jeune conducteur de {jeune} par jour s'applique. Seuls les conducteurs inscrits au contrat peuvent conduire."],
 ['Documents à présenter',"Les <b>originaux</b> : carte d'identité nationale ou passeport, et permis de conduire. Pour la diaspora : passeport et permis du pays de résidence (permis international conseillé). Les copies envoyées en ligne accélèrent la remise des clés mais ne remplacent pas les originaux."],
 ['La caution',"Demandée à la remise des clés, en espèces ou par chèque certifié. Son montant dépend de la voiture et de la protection choisie. Elle est rendue au retour après l'état des lieux, ou sous 7 jours au plus tard si une infraction doit être vérifiée."],
 ['Assurance et franchise',"Assurance tous risques incluse. En cas de dommage, le locataire paie au maximum la <b>franchise</b> de sa protection (Essentielle : montant de la caution · Confort : moitié · Sérénité : 0 DA). Non couverts : conduite sous l'effet de l'alcool ou de stupéfiants, conducteur non déclaré, usage hors route, clés laissées dans la voiture, négligence grave. Pneus, jantes et vitres : couverts seulement avec Sérénité."],
 ['Kilométrage',"{km} km par jour de location sont inclus. Au-delà : {prixKm} par kilomètre. Avec l'option kilométrage illimité, vous roulez sans compter."],
 ['Carburant',"La voiture est remise avec un niveau de carburant noté à l'état des lieux et doit être rendue au même niveau. Chaque huitième manquant est facturé {prix8e}, sauf option plein prépayé."],
 ['Horaires et retards',"La location se compte par tranches de 24 heures, avec <b>59 minutes de tolérance</b> au retour. Au-delà, une journée supplémentaire est facturée. Pour prolonger, prévenez-nous sur WhatsApp avant la fin de la location, selon disponibilité."],
 ['Utilisation interdite',"Sortir du territoire algérien, sous-louer ou prêter la voiture, transporter des passagers contre rémunération, tracter, participer à des courses, conduire sur piste ou plage. Interdit de fumer à bord (nettoyage facturé 3 000 DA). Animaux uniquement en cage de transport."],
 ['Accident, panne ou vol',"Prévenez-nous immédiatement au {tel}, remplissez un constat amiable et déposez plainte en cas de vol ou d'agression. Assistance 24 h/24. Une voiture de remplacement est proposée selon disponibilité. Ne faites réparer la voiture nulle part sans notre accord."],
 ['Amendes et infractions',"Les amendes, retraits de points et frais de fourrière pendant la location sont à la charge du locataire."],
 ['Annulation et modification',"Gratuites jusqu'à 24 h avant le départ, par WhatsApp ou depuis « Ma réservation ». Aucun paiement n'est demandé en ligne : vous réglez à la remise des clés, en espèces ou par BaridiMob."],
 ['Restitution',"Au lieu et à l'heure prévus au contrat, en présence d'un agent. Un état des lieux contradictoire avec photos est fait au départ et au retour. Les dommages nouveaux sont retenus sur la caution, dans la limite de la franchise."],
 ['Données personnelles',"Vos informations servent uniquement à établir le contrat de location et sont protégées conformément à la loi 18-07 relative à la protection des données personnelles. Elles ne sont jamais revendues."]
];
/* Conditions avec les valeurs du moment ({km}, {jeune}… remplacés automatiquement) */
function cgl(){const T={age:RG.ageMin,permis:RG.permis,jeune:fmt(RG.jeune),km:nb(RG.km),prixKm:fmt(RG.prixKm),prix8e:fmt(RG.prix8e),tel:AG.tel};return CGL.map(([h,p])=>[h,p.replace(/\{(\w+)\}/g,(m,k)=>k in T?T[k]:m)])}

/* ---------- Prix ---------- */
function devis({v,d1,h1='10:00',d2,h2='10:00',lieu='agence',retour='agence',opts=[],prot='essentielle',naiss=''}){
  const j=duree(d1,h1,d2,h2), r=REMISES.find(x=>j>=x[0]), taux=r?r[1]:0;
  const base=v.prix*j, remise=Math.round(base*taux/100)*100;
  const P=PROTECTIONS[prot], protJ=Math.round(v.prix*P.taux/100)*100, protT=protJ*j;
  const optT=opts.reduce((s,o)=>s+(OPTS[o].jour?OPTS[o].p*j:OPTS[o].p),0);
  const liv=LIEUX[lieu].f+LIEUX[retour].f;
  const a=naiss?age(naiss,d1):99, jeune=a>=AGE_MIN&&a<25?JEUNE*j:0;
  const caution=Math.round(v.caution*(P.cau||1)/1000)*1000, franchise=Math.round(v.caution*P.fr/1000)*1000;
  return {j,base,taux,remise,protJ,protT,optT,liv,jeune,total:base-remise+protT+optT+liv+jeune,caution,franchise,kmInclus:opts.includes('kmi')?Infinity:KM_JOUR*j};
}

/* ---------- État partagé (localStorage) ---------- */
const CLE='sd-v8';
let S;
function conducteur(nom,prenom,tel,naiss,datePermis,extra={}){return{nom,prenom,tel,naiss,datePermis,piece:'CNI',numPiece:'1'+chiffres(tel).slice(-8)+'7',permis:'P'+chiffres(tel).slice(-7),pays:'Algérie',adresse:'Alger',email:'',...extra}}
function resa0(){
  const mk=(id,v,c,d1,d2,lieu,retour,opts,prot,statut,extra={})=>{
    const voit=FLOTTE0.find(x=>x.id===v),dv=devis({v:voit,d1,d2,lieu,retour,opts,prot,naiss:c.naiss});
    return {id,v,c,d1,h1:'10:00',d2,h2:'10:00',lieu,retour,opts,prot,statut,cree:J(Math.min(ecart(iso(AUJ),d1),0)-2),total:dv.total,caution:dv.caution,franchise:dv.franchise,docs:{permis:true,piece:true},docsOk:statut!=='attente',sign:true,source:'site',...extra};
  };
  return [
    mk('SD-1041','v1',conducteur('Benali','Karim','0550 12 34 56','1986-04-12','2006-09-01'),J(-3),J(0),'aeroport','aeroport',['siege'],'serenite','encours',{vol:'AH 1021',edlD:{km:21100,carbu:8,photos:4,dom:[{x:46,y:300,t:'Rayure'}]},paye:true}),
    mk('SD-1042','v2',conducteur('Hamidi','Nadia','0661 45 78 12','1991-11-03','2012-05-20'),J(-1),J(2),'agence','agence',[],'confort','encours',{edlD:{km:13950,carbu:8,photos:4,dom:[]},paye:true}),
    mk('SD-1043','v9',conducteur('Merad','Yacine','0770 98 11 02','2002-02-18','2021-03-10'),J(0),J(5),'aeroport','agence',['kmi'],'essentielle','confirmee',{vol:'TU 702'}),
    mk('SD-1044','v4',conducteur('Kaci','Amel','0555 32 19 87','1988-07-25','2009-01-15'),J(6),J(12),'domicile','domicile',['siege','cond'],'confort','confirmee',{adr:'Cité 200 logements, bât. 12, Bab Ezzouar'}),
    mk('SD-1045','v5',conducteur('Lounis','Sofiane','0699 21 43 65','1999-05-30','2019-08-08'),J(9),J(11),'agence','agence',[],'essentielle','attente',{docs:{permis:true,piece:false}}),
    mk('SD-1046','v6',conducteur('Ait Ouali','Mourad','+33 6 12 45 78 90','1979-03-14','1998-06-02',{piece:'Passeport',pays:'France',adresse:'Lyon, France',email:'m.aitouali@exemple.fr'}),J(10),J(40),'aeroport','aeroport',['siege','kmi'],'serenite','attente',{vol:'AF 1854',note:'Diaspora, vacances d\'un mois en famille'}),
    mk('SD-1047','v8',conducteur('Bouzid','Riad','0551 76 54 32','1984-10-09','2004-12-12'),J(-8),J(-2),'agence','agence',[],'essentielle','terminee',{edlD:{km:5200,carbu:8,photos:4,dom:[]},edlR:{km:5800,carbu:6,photos:4,dom:[]},sup:2400,paye:true}),
    mk('SD-1048','v3',conducteur('Cherif','Lina','0662 88 44 10','1993-01-21','2014-04-04'),J(5),J(8),'aeroport','aeroport',['plein'],'confort','confirmee',{vol:'AH 2002'}),
    mk('SD-1049','v7',conducteur('Entreprise BTP Nour','Hichem (gérant)','023 55 66 77','1975-06-06','1996-02-02',{piece:'Registre de commerce'}),J(-12),J(18),'agence','agence',['kmi'],'confort','encours',{edlD:{km:4300,carbu:8,photos:4,dom:[]},paye:true,note:'Location longue durée, facture entreprise'}),
    mk('SD-1050','v1',conducteur('Saadi','Mehdi','0560 13 57 91','1997-09-17','2018-11-30'),J(4),J(7),'domicile','agence',[],'essentielle','attente',{adr:'Rue des Frères Bouadou, Bir Mourad Raïs'}),
    mk('SD-1051','v1',conducteur('Zerrouki','Imane','0540 77 31 09','1990-12-02','2011-07-19'),J(12),J(14),'agence','agence',[],'serenite','confirmee'),
  ];
}
const CONF0=JSON.parse(JSON.stringify({AG,RG,LIEUX,OPTS,PROTECTIONS,REMISES,CGL}));
function conf(){return JSON.parse(JSON.stringify({AG,RG,LIEUX,OPTS,PROTECTIONS,REMISES,CGL}))}
function appliquerConf(c){Object.assign(AG,c.AG);Object.assign(RG,c.RG);for(const k in c.LIEUX)Object.assign(LIEUX[k],c.LIEUX[k]);for(const k in c.OPTS)Object.assign(OPTS[k],c.OPTS[k]);for(const k in c.PROTECTIONS)Object.assign(PROTECTIONS[k],c.PROTECTIONS[k]);REMISES.splice(0,REMISES.length,...c.REMISES);CGL.splice(0,CGL.length,...c.CGL)}
function charger(){try{S=JSON.parse(localStorage.getItem(CLE))}catch(e){S=null}
  if(!S||!S.flotte)S={flotte:JSON.parse(JSON.stringify(FLOTTE0)),resas:resa0(),seq:1052,noire:['0699876543'],notes:{}};appliquerConf(S.conf||CONF0)}
function sauver(){try{localStorage.setItem(CLE,JSON.stringify(S))}catch(e){try{S.resas.forEach(r=>{if(r.docs){delete r.docs.img}});localStorage.setItem(CLE,JSON.stringify(S))}catch(_){}}}
function diffuser(){try{new BroadcastChannel('sd').postMessage('maj')}catch(e){}}
const V=id=>S.flotte.find(v=>v.id===id);
const actif=r=>!['annulee','terminee'].includes(r.statut);
function libre(vid,d1,d2,sauf){
  const v=V(vid);if(!v||v.entretien)return false;
  return !S.resas.some(r=>r.v===vid&&r.id!==sauf&&actif(r)&&r.d1<d2&&d1<r.d2);
}
function prochainLibre(vid,d1){
  const occ=S.resas.filter(r=>r.v===vid&&actif(r)&&r.d2>d1).sort((a,b)=>a.d2<b.d2?1:-1);
  return occ.length?occ[0].d2:null;
}
const nomC=c=>(c.prenom?c.prenom+' ':'')+c.nom;
function telInt(t){let d=chiffres(t);if(d.startsWith('00'))return d.slice(2);if(d.startsWith('0'))return '213'+d.slice(1);return d}

/* ---------- Silhouettes ---------- */
const FORMES={
  berline:{c:'M16 86 C16 76 20 70 30 68 L66 64 C84 50 104 40 132 36 C160 32 196 33 218 40 C234 45 248 54 258 62 L292 67 C302 69 306 75 306 84 L306 90 C306 93 304 95 300 95 L276 95 A28 28 0 0 0 220 95 L106 95 A28 28 0 0 0 50 95 L22 95 C18 95 16 92 16 86Z',
    w:'M76 63 C92 51 110 42 132 40 L166 39 L166 63Z M172 39 L212 41 C226 45 238 53 246 62 L172 63Z',r:[[78,94,25],[248,94,25]],hl:[290,70],tl:[16,72,7],b:74},
  citadine:{c:'M22 88 C22 74 23 62 30 54 C40 44 58 37 86 34 L160 33 C182 33 198 40 214 52 L262 62 C280 65 290 71 290 80 L290 90 C290 93 288 95 284 95 L260 95 A28 28 0 0 0 204 95 L100 95 A28 28 0 0 0 44 95 L28 95 C24 95 22 92 22 88Z',
    w:'M38 56 C46 46 62 39 86 37 L118 37 L118 58Z M124 37 L158 37 C176 38 190 45 202 56 L124 58Z',r:[[72,94,25],[232,94,25]],hl:[276,68],tl:[22,62,10],b:70},
  suv:{c:'M14 86 L14 58 C14 46 20 38 32 34 L58 27 C66 25 74 24 84 24 L190 24 C208 24 222 31 236 43 L256 56 L290 60 C301 62 306 68 306 78 L306 90 C306 93 304 95 300 95 L278 95 A30 30 0 0 0 218 95 L108 95 A30 30 0 0 0 48 95 L20 95 C16 95 14 92 14 86Z',
    w:'M28 52 L33 38 C37 33 45 30 56 29 L116 28 L116 52Z M122 28 L188 28 C202 29 214 36 226 50 L122 52Z',r:[[78,94,27],[248,94,27]],hl:[290,64],tl:[14,58,12],b:66}
};
let _gid=0;
function auto(forme,coul,cls=''){
  const P=FORMES[forme], sombre=['#18181B','#1F2226','#5E6166'].includes(coul), ligne=sombre?'#D4AF61':'rgba(255,255,255,.6)';
  const roues=P.r.map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#0B0B0C"/><circle cx="${x}" cy="${y}" r="${r*.64}" fill="#2B2B2F" stroke="#9A9AA0" stroke-width="1.5"/>${[0,72,144,216,288].map(a=>`<path d="M${x} ${y}L${(x+Math.cos(a*Math.PI/180)*r*.6).toFixed(1)} ${(y+Math.sin(a*Math.PI/180)*r*.6).toFixed(1)}" stroke="#77777D" stroke-width="2.4"/>`).join('')}<circle cx="${x}" cy="${y}" r="${r*.2}" fill="#D4AF61"/>`).join('');
  const g='g'+(++_gid);
  return `<svg class="${cls}" viewBox="0 0 320 124" aria-hidden="true" focusable="false"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></linearGradient><clipPath id="c${g}"><path d="${P.c}"/></clipPath></defs><path d="${P.c}" fill="${coul}"/><path d="${P.c}" fill="url(#${g})"/><path d="${P.w}" fill="#0E1116" opacity=".93"/><g clip-path="url(#c${g})"><path d="M0 ${P.b} L320 ${P.b-2}" stroke="${ligne}" stroke-width="1.6" opacity=".85"/><rect x="0" y="88" width="320" height="10" fill="#000" opacity=".25"/></g><rect x="${P.hl[0]}" y="${P.hl[1]}" width="15" height="5" rx="2.5" fill="#FFE7B0"/><rect x="${P.tl[0]}" y="${P.tl[1]}" width="6" height="${P.tl[2]}" rx="2" fill="#C3332C"/>${roues}</svg>`;
}
/* Vue de dessus pour l'état des lieux (clic = dommage) */
function dessus(dom=[],anciens=[]){
  const m=(d,c)=>`<g><circle cx="${d.x}" cy="${d.y}" r="9" fill="${c}" stroke="#fff" stroke-width="2"/><text x="${d.x}" y="${d.y+4}" text-anchor="middle" font-size="10" font-weight="800" fill="#fff">${d.t[0]}</text></g>`;
  return `<svg viewBox="0 0 200 400" class="dessus" role="img" aria-label="Schéma de la voiture vue de dessus. Touchez pour signaler un dommage.">
   <rect x="34" y="14" width="132" height="372" rx="54" fill="#F4F2EE" stroke="#17171A" stroke-width="3"/>
   <path d="M52 112 Q100 88 148 112 L140 160 Q100 150 60 160Z" fill="#CFD8E3" stroke="#17171A" stroke-width="2"/>
   <path d="M60 290 Q100 300 140 290 L146 322 Q100 338 54 322Z" fill="#CFD8E3" stroke="#17171A" stroke-width="2"/>
   <rect x="62" y="166" width="76" height="118" rx="10" fill="#E6E1D7" stroke="#17171A" stroke-width="2"/>
   <path d="M34 190 H26 M34 250 H26 M166 190 H174 M166 250 H174" stroke="#17171A" stroke-width="4" stroke-linecap="round"/>
   <rect x="22" y="70" width="14" height="44" rx="5" fill="#17171A"/><rect x="164" y="70" width="14" height="44" rx="5" fill="#17171A"/>
   <rect x="22" y="290" width="14" height="44" rx="5" fill="#17171A"/><rect x="164" y="290" width="14" height="44" rx="5" fill="#17171A"/>
   <text x="100" y="40" text-anchor="middle" font-size="11" font-weight="700" fill="#64615A">AVANT</text>
   <text x="100" y="372" text-anchor="middle" font-size="11" font-weight="700" fill="#64615A">ARRIÈRE</text>
   ${anciens.map(d=>m(d,'#9A968E')).join('')}${dom.map(d=>m(d,'#C2453C')).join('')}</svg>`;
}
