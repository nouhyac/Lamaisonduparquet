/* Samir Drive · site client */
/* ================= Langue ================= */
const AR={sous:'كراء السيارات',n_flotte:'سياراتنا',n_prot:'الحماية',n_cond:'الشروط',n_contact:'اتصل بنا',mares:'حجزي',reserver:'احجز',
h_sur:'كراء السيارات · الجزائر',h_1:'سيارتك في انتظارك',h_2:'في المطار.',h_p:'اختر تواريخك، شاهد السعر الدقيق فوراً واحجز في دقيقتين. نسلمك المفاتيح في مطار الجزائر أو في الوكالة أو أمام بيتك.',at1:'سيارات حديثة',at2:'توصيل إلى المطار',at3:'لا دفع عبر الإنترنت',
r_lieu:'الاستلام',r_retour:'الإرجاع',r_d1:'تاريخ الانطلاق',r_d2:'تاريخ الرجوع',r_h:'الساعة',r_go:'عرض السيارات',
f_sur:'الأسطول',f_t:'اختر سيارتك',f_p:'السعر اليومي يشمل التأمين الشامل و250 كم في اليوم والمساعدة 24/24.',c_tout:'الكل',c_cit:'سيارات المدينة',c_ber:'سيدان',c_suv:'رباعية الدفع',c_prem:'فاخرة',c_auto:'ناقل أوتوماتيكي',tri:'ترتيب',tri1:'السعر تصاعدياً',tri2:'السعر تنازلياً',
e_sur:'بسيط وسريع',e_t:'احجز في دقيقتين',e1:'تواريخك',e1p:'أين ومتى تستلم السيارة. نعرض فقط السيارات المتوفرة مع السعر الإجمالي.',e2:'حمايتك',e2p:'أساسية أو راحة أو طمأنينة: أنت تختار مبلغ التحمل.',e3:'وثائقك',e3p:'صورة الرخصة وبطاقة التعريف من هاتفك: تسليم المفاتيح في 5 دقائق.',e4:'توقيع وتأكيد',e4p:'توقع بإصبعك ونؤكد عبر واتساب في 15 دقيقة. الدفع عند الاستلام.',
pr_sur:'الحماية',pr_t:'سافر براحة بال',pr_p:'التأمين الشامل مشمول دائماً. الحماية تحدد أقصى ما تدفعه عند الضرر.',
s_sur:'خدماتنا',s_t:'نأتي إليك',a_sur:'مطار الجزائر',a_t:'المفاتيح عند خروجك من الطائرة',a_p:'أعطنا رقم رحلتك: نتابع وصولك والسيارة تنتظرك أمام المحطة.',a1:'تسليم المفاتيح في المطار 24/24',a2:'متابعة رحلتك بدون تكاليف عند التأخير',a3:'الإرجاع في المطار قبل سفرك',
l_sur:'مدة طويلة والجالية',l_t:'شهر أو أكثر؟ السعر ينخفض.',l_p:'للأفراد والشركات والجالية في العطلة.',l_n:'التخفيض يطبق تلقائياً عند الحجز.',
cd_sur:'شروط الكراء',cd_t:'واضح منذ البداية',cd_p:'هذا هو الأساس. الشروط الكاملة تقرأ وتقبل قبل كل حجز.',cd_btn:'قراءة الشروط العامة كاملة',
q_sur:'أسئلة شائعة',q_t:'كل ما تحتاج معرفته',q1:'هل يجب الدفع عبر الإنترنت؟',q1r:'لا. تحجز مجاناً وتدفع عند استلام المفاتيح نقداً أو عبر بريدي موب.',q2:'أعيش في الخارج، هل يمكنني الكراء؟',q2r:'نعم، بجواز سفرك ورخصة بلد إقامتك.',q3:'ماذا لو تأخرت رحلتي؟',q3r:'لا شيء: نتابع رحلتك والسيارة تنتظرك بدون تكاليف.',q4:'هل يمكنني الإلغاء أو التعديل؟',q4r:'نعم مجاناً حتى 24 ساعة قبل الانطلاق.',q5:'في حالة عطب أو حادث؟',q5r:'اتصل بنا 24/24. المساعدة مشمولة وسيارة بديلة حسب التوفر.',
ct_sur:'اتصل بنا',ct_t:'سؤال؟ نرد بسرعة.',ct_tel:'الهاتف',ct_ag:'الوكالة',ct_aero:'المطار',ct_aero2:'التسليم في المطار 24/24',ct_wa:'راسلنا على واتساب'};
const FR={};let ar=false;
const t=(k,fr)=>ar&&AR[k]?AR[k]:fr;
function appliquerLangue(){
  document.querySelectorAll('[data-t]').forEach(el=>{const k=el.dataset.t;if(!(k in FR))FR[k]=el.textContent;el.textContent=ar&&AR[k]?AR[k]:FR[k]});
  document.documentElement.lang=ar?'ar':'fr';document.documentElement.dir=ar?'rtl':'ltr';
  document.body.classList.toggle('ar',ar);$('lang').textContent=ar?'Français':'العربية';
  remplirLieux();rendreFlotte();infoDuree();rendreProtos();
}
const jours=n=>n+' '+(n>1?t('x_jours','jours'):t('x_jour','jour'));
const lieuN=k=>ar?LIEUX[k].ar:LIEUX[k].n;

/* ================= Recherche ================= */
const R={lieu:'aeroport',retour:'aeroport',d1:J(1),h1:'10:00',d2:J(4),h2:'10:00'};
const F={cat:'',auto:false,tri:'prix'};
function remplirLieux(){
  for(const id of['r-lieu','r-retour']){const s=$(id),val=id==='r-lieu'?R.lieu:R.retour;
    s.innerHTML=Object.keys(LIEUX).map(k=>`<option value="${k}" ${k===val?'selected':''}>${lieuN(k)}${LIEUX[k].f?' (+'+fmt(LIEUX[k].f)+')':''}</option>`).join('')}
}
const heures=()=>{let h='';for(let i=0;i<24;i++)for(const m of['00','30'])h+=`<option>${pad(i)}:${m}</option>`;return h};
function infoDuree(){
  const j=duree(R.d1,R.h1,R.d2,R.h2),r=REMISES.find(x=>j>=x[0]);
  $('duree-info').innerHTML=`<span>${t('x_duree','Durée')} : <b>${jours(j)}</b></span>`+(r?`<span>${t('x_remise','Remise longue durée')} : <b>-${r[1]*100} %</b></span>`:`<span>${t('x_astuce','Dès 3 jours, le prix baisse.')}</span>`)+`<span>${t('x_tol','59 min de tolérance au retour')}</span>`;
  $('resume-dates').innerHTML=`${t('x_dispo','Disponibilités du')} <b>${dlong(R.d1)} ${R.h1}</b> ${t('x_au','au')} <b>${dlong(R.d2)} ${R.h2}</b> · ${lieuN(R.lieu)}`;
}
function lireRecherche(){
  R.lieu=$('r-lieu').value;R.retour=$('r-retour').value;R.h1=$('r-h1').value;R.h2=$('r-h2').value;
  let d1=$('r-d1').value||J(1),d2=$('r-d2').value||J(4);
  if(d1<iso(AUJ))d1=iso(AUJ);
  if(d2<d1)d2=d1;
  if(d2===d1&&R.h2<=R.h1){const x=parse(d1);x.setDate(x.getDate()+1);d2=iso(x)}
  R.d1=d1;R.d2=d2;$('r-d1').value=d1;$('r-d2').value=d2;$('r-d2').min=d1;
  infoDuree();rendreFlotte();
}

/* ================= Flotte ================= */
const IC={
  boite:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><circle cx="6" cy="6" r="2"/><circle cx="12" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><path d="M6 8v8M12 8v8M6 12h12V8"/></svg>',
  carbu:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><path d="M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M3 21h12M14 9h2a2 2 0 0 1 2 2v5a1.5 1.5 0 0 0 3 0V8l-3-3"/><path d="M7 7h4v4H7z"/></svg>',
  places:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/></svg>',
  coffre:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>'
};
function rendreFlotte(){
  let l=S.flotte.filter(v=>(!F.cat||v.cat===F.cat||v.gamme===F.cat)&&(!F.auto||v.boite==='Automatique'));
  l.sort((a,b)=>F.tri==='prix'?a.prix-b.prix:b.prix-a.prix);
  l.sort((a,b)=>libre(b.id,R.d1,R.d2)-libre(a.id,R.d1,R.d2));
  if(!l.length){$('grille').innerHTML=`<p class="vide">${t('x_aucune','Aucune voiture ne correspond à ces filtres.')}</p>`;return}
  $('grille').innerHTML=l.map(v=>{
    const ok=libre(v.id,R.d1,R.d2),dv=devis({v,...R}),pl=ok?null:prochainLibre(v.id,R.d1);
    return `<article class="auto ${ok?'':'pris'}" aria-labelledby="n-${v.id}">
      <button class="scene" type="button" data-fiche="${v.id}" aria-label="${t('x_voir','Voir la fiche')} ${v.nom}">${auto(v.forme,v.coul)}<span class="badge ${ok?'b-ok':'b-non'}">${ok?t('x_libre','Disponible'):t('x_pris','Déjà réservée')}</span>${v.neuf?`<span class="b-chef">${t('x_neuve','Neuve')} ${v.annee}</span>`:v.chef?`<span class="b-chef">★ ${t('x_top','Coup de cœur')}</span>`:''}</button>
      <div class="corps">
        <div><span class="cat">${v.gamme} · ${v.cat} · ${v.annee}</span><h3 id="n-${v.id}">${v.nom}</h3><span class="coul"><i style="background:${v.coul}"></i>${v.coulN}</span></div>
        <ul class="specs"><li>${IC.boite}${v.boite}</li><li>${IC.carbu}${v.carbu}</li><li>${IC.places}${v.places} places</li><li>${IC.coffre}${v.coffre}</li></ul>
        <div class="prixl"><div><div class="p">${fmt(v.prix)} <small>/ ${t('x_jour','jour')}</small></div>
          ${ok?`<div class="tot">${t('x_total','Total')} ${jours(dv.j)} : <b>${fmt(dv.total)}</b></div>`:`<div class="libre">${pl?t('x_librele','Libre à partir du')+' '+dcourt(pl):t('x_indispo','Indisponible')}</div>`}</div>
          <button class="btn btn-or" type="button" data-resa="${v.id}" ${ok?'':'disabled'} aria-label="${t('reserver','Réserver')} ${v.nom}">${t('reserver','Réserver')}</button></div>
        <button class="lien-fiche" type="button" data-fiche="${v.id}">${t('x_details','Équipements, conditions et calendrier')} →</button>
      </div></article>`}).join('');
}
function rendreProtos(){
  const v=S.flotte[0];
  $('protos').innerHTML=Object.entries(PROTECTIONS).map(([k,p])=>`<div class="proto ${p.pop?'pop':''}">${p.pop?`<span class="pop-b">${t('x_pop','La plus choisie')}</span>`:''}<h3>${ar?p.ar:p.n}</h3><p class="pt">${p.txt}</p>
    <div class="px">${p.taux?'+ '+Math.round(p.taux*100)+' %':t('x_incl','Incluse')}<small>${p.taux?t('x_prixj','du prix par jour'):t('x_dans','dans tous les prix')}</small></div>
    <ul>${p.lignes.map(l=>`<li>${l}</li>`).join('')}</ul>
    <p class="ex">Ex. ${v.nom} : franchise <b>${fmt(Math.round(v.caution*p.fr/1000)*1000)}</b> · caution <b>${fmt(Math.round(v.caution*(p.cau||1)/1000)*1000)}</b></p></div>`).join('');
}

/* ================= Fiche voiture ================= */
function fiche(vid){
  const v=V(vid),ok=libre(v.id,R.d1,R.d2),dv=devis({v,...R});
  let cal='';const deb=parse(J(0));const dec=(deb.getDay()+6)%7;
  for(let i=0;i<dec;i++)cal+='<span></span>';
  for(let i=0;i<35-dec;i++){const d=J(i),occ=!libre(v.id,d,J(i+1)),sel=d>=R.d1&&d<R.d2;cal+=`<span class="${occ?'occ':''} ${sel?'sel':''}" title="${dlong(d)}${occ?' · réservée':''}">${parse(d).getDate()}</span>`}
  $('fiche').innerHTML=`<header><div><span class="sur">${v.gamme} · ${v.cat}</span><h2 id="fi-titre">${v.nom} <small>${v.annee}</small></h2></div><button class="fermer" type="button" data-ferme aria-label="${t('x_fermer','Fermer')}">×</button></header>
  <div class="in" tabindex="0">
    <div class="fi-scene">${auto(v.forme,v.coul)}<span class="coul"><i style="background:${v.coul}"></i>${v.coulN}</span></div>
    <div class="fi-specs">
      <div><small>Moteur</small><b>${v.moteur}</b></div><div><small>Boîte</small><b>${v.boite}</b></div><div><small>Carburant</small><b>${v.carbu}</b></div>
      <div><small>Consommation</small><b>${v.conso}</b></div><div><small>Coffre</small><b>${v.coffre}</b></div><div><small>Places / portes</small><b>${v.places} / ${v.portes}</b></div>
    </div>
    <div class="fi-2">
      <div><h3>Équipements</h3><ul class="coche">${[...v.equip,...(v.equip.some(e=>/climatisation/i.test(e))?[]:['Climatisation'])].map(e=>`<li>${e}</li>`).join('')}</ul></div>
      <div><h3>Conditions pour cette voiture</h3><dl class="fi-dl"><dt>Âge minimum</dt><dd>${v.ageMin} ans · permis 2 ans</dd><dt>Caution</dt><dd>${fmt(v.caution)} <small>(${fmt(v.caution*.5)} avec Sérénité)</small></dd><dt>Franchise</dt><dd>de ${fmt(v.caution)} à 0 DA selon la protection</dd><dt>Kilométrage</dt><dd>${KM_JOUR} km / jour inclus</dd><dt>Carburant</dt><dd>Même niveau au retour</dd></dl></div>
    </div>
    <div><h3>Disponibilités sur 5 semaines</h3><div class="cal" aria-label="Calendrier des disponibilités">${['L','M','M','J','V','S','D'].map(x=>`<b>${x}</b>`).join('')}${cal}</div>
      <p class="leg"><i class="l-libre"></i>Libre <i class="l-occ"></i>Réservée <i class="l-sel"></i>Vos dates</p></div>
  </div>
  <footer><div><span class="t">${fmt(dv.total)}</span><small>${jours(dv.j)} · ${dcourt(R.d1)} → ${dcourt(R.d2)}</small></div><button class="btn btn-or" type="button" data-resa="${v.id}" ${ok?'':'disabled'}>${ok?t('x_cette','Réserver cette voiture'):t('x_pris','Déjà réservée')}</button></footer>`;
  $('fiche').showModal();
}

/* ================= Tunnel de réservation ================= */
const ETAPES=['Trajet','Protection','Options','Conducteur','Signature'];
let T=null;
function ouvrirTunnel(vid){
  if($('fiche').open)$('fiche').close();
  T={v:vid,d1:R.d1,h1:R.h1,d2:R.d2,h2:R.h2,lieu:R.lieu,retour:R.retour,vol:'',adr:'',prot:'confort',opts:[],e:1,
     c:{civ:'M.',prenom:'',nom:'',naiss:'',tel:'',email:'',resid:'Algérie',piece:'CNI',numPiece:'',permis:'',datePermis:'',pays:'Algérie',adresse:''},
     c2:{prenom:'',nom:'',naiss:'',permis:'',datePermis:''},docs:{},sign:null,cgl:false,exact:false};
  $('tunnel').innerHTML=`<div class="tu-tete"><img src="img/logo.jpg" alt=""><h2 id="tu-titre">${t('x_votre','Votre réservation')}</h2><ol class="prog" id="prog"></ol><button class="fermer" type="button" data-ferme aria-label="${t('x_fermer','Fermer')}">×</button></div>
    <div class="tu-corps"><form class="tu-etape" id="tu-form" novalidate></form><aside class="tu-recap" id="tu-recap" aria-label="Récapitulatif"></aside></div>
    <div class="tu-pied" id="tu-pied"></div>`;
  $('tunnel').showModal();etape(1);
}
function prog(){$('prog').innerHTML=ETAPES.map((n,i)=>`<li class="${i+1<T.e?'fait':''} ${i+1===T.e?'cour':''}" ${i+1===T.e?'aria-current="step"':''}><span>${i+1<T.e?'✓':i+1}</span>${n}</li>`).join('')}
function recap(){
  const v=V(T.v),d=devis({...T,v,naiss:T.c.naiss}),P=PROTECTIONS[T.prot];
  $('tu-recap').innerHTML=`<div class="rc-auto">${auto(v.forme,v.coul)}<div><b>${v.nom}</b><small>${v.boite} · ${v.carbu}</small></div></div>
    <div class="rc-trajet"><div><small>${t('r_d1','Départ')}</small><b>${dlong(T.d1)} · ${T.h1}</b><span>${lieuN(T.lieu)}</span></div><div><small>${t('r_d2','Retour')}</small><b>${dlong(T.d2)} · ${T.h2}</b><span>${lieuN(T.retour)}</span></div></div>
    <div class="calc">
      <div><span>${fmt(v.prix)} × ${jours(d.j)}</span><span>${fmt(d.base)}</span></div>
      ${d.remise?`<div class="rem"><span>${t('x_remise','Remise longue durée')} -${d.taux*100} %</span><span>-${fmt(d.remise)}</span></div>`:''}
      <div><span>Protection ${P.n}</span><span>${d.protT?fmt(d.protT):t('x_incl','Incluse')}</span></div>
      ${T.opts.map(o=>`<div><span>${OPTS[o].n}</span><span>${fmt(OPTS[o].jour?OPTS[o].p*d.j:OPTS[o].p)}</span></div>`).join('')}
      ${d.liv?`<div><span>${t('x_liv','Livraison / restitution')}</span><span>${fmt(d.liv)}</span></div>`:''}
      ${d.jeune?`<div><span>${t('x_jeune','Jeune conducteur (21-24 ans)')}</span><span>${fmt(d.jeune)}</span></div>`:''}
      <div class="tt"><span>${t('x_total','Total')}</span><span>${fmt(d.total)}</span></div>
      <div class="cau">${t('x_caution','Caution à la remise des clés')} : <b>${fmt(d.caution)}</b><br>${t('x_franchise','Franchise en cas de dommage')} : <b>${fmt(d.franchise)}</b><br>${d.kmInclus===Infinity?t('x_kmi','Kilométrage illimité'):nb(d.kmInclus)+' km '+t('x_inclus','inclus')}</div>
    </div><p class="rc-pay">${t('x_rien','Rien à payer maintenant · paiement à la remise des clés')}</p>`;
  const ok=libre(T.v,T.d1,T.d2);
  return {d,ok};
}
function pied(){
  const {d,ok}=recap();
  $('tu-pied').innerHTML=`${T.e>1?`<button class="btn btn-ligne" type="button" id="tu-prec">← ${t('x_retour','Retour')}</button>`:'<span></span>'}<div class="tp-tot"><span class="t">${fmt(d.total)}</span><small>${jours(d.j)}</small></div><button class="btn btn-or" type="button" id="tu-suiv" ${ok?'':'disabled'}>${T.e<5?t('x_cont','Continuer')+' →':t('x_conf','Confirmer la réservation')}</button>`;
}
const champ=(id,lab,val,type='text',attr='')=>`<div class="champ"><label for="${id}">${lab}</label><input id="${id}" type="${type}" value="${esc(val)}" ${attr}><span class="aide" id="${id}-e" aria-live="polite"></span></div>`;
function etape(n){
  T.e=n;prog();const f=$('tu-form'),v=V(T.v);
  if(n===1){f.innerHTML=`<h3>${t('x_e1','Où et quand ?')}</h3>
    <div class="grille2">
      <div class="champ"><label for="t-lieu">${t('r_lieu','Prise en charge')}</label><select id="t-lieu">${Object.keys(LIEUX).map(k=>`<option value="${k}" ${k===T.lieu?'selected':''}>${lieuN(k)}${LIEUX[k].f?' (+'+fmt(LIEUX[k].f)+')':''}</option>`).join('')}</select></div>
      <div class="champ"><label for="t-retour">${t('r_retour','Restitution')}</label><select id="t-retour">${Object.keys(LIEUX).map(k=>`<option value="${k}" ${k===T.retour?'selected':''}>${lieuN(k)}${LIEUX[k].f?' (+'+fmt(LIEUX[k].f)+')':''}</option>`).join('')}</select></div>
      <div class="champ"><label for="t-d1">${t('r_d1','Départ')}</label><input type="date" id="t-d1" value="${T.d1}" min="${iso(AUJ)}"></div>
      <div class="champ"><label for="t-h1">${t('r_h','Heure')}</label><select id="t-h1">${heures()}</select></div>
      <div class="champ"><label for="t-d2">${t('r_d2','Retour')}</label><input type="date" id="t-d2" value="${T.d2}" min="${T.d1}"></div>
      <div class="champ"><label for="t-h2">${t('r_h','Heure')}</label><select id="t-h2">${heures()}</select></div>
    </div>
    <div class="champ" id="b-vol" ${T.lieu==='aeroport'?'':'hidden'}><label for="t-vol">${t('x_vol','Numéro de vol (on suit votre arrivée)')}</label><input id="t-vol" value="${esc(T.vol)}" placeholder="ex. AH 1021" autocomplete="off"></div>
    <div class="champ" id="b-adr" ${T.lieu==='domicile'||T.retour==='domicile'?'':'hidden'}><label for="t-adr">${t('x_adr','Adresse de livraison')}</label><input id="t-adr" value="${esc(T.adr)}" placeholder="Cité, bâtiment, rue, commune" autocomplete="street-address"><span class="aide" id="t-adr-e"></span></div>
    <div class="alerte-d" id="t-dispo" role="status"></div>`;
    $('t-h1').value=T.h1;$('t-h2').value=T.h2;
  }
  if(n===2){const d0=devis({...T,v});f.innerHTML=`<h3>${t('x_e2','Choisissez votre protection')}</h3><p class="sous-t">L'assurance tous risques est incluse dans tous les cas. La protection fixe ce que vous payez au maximum en cas de dommage.</p>
    <div class="choix-prot" role="radiogroup" aria-label="Protection">${Object.entries(PROTECTIONS).map(([k,p])=>{const fr=Math.round(v.caution*p.fr/1000)*1000,ca=Math.round(v.caution*(p.cau||1)/1000)*1000,pj=Math.round(v.prix*p.taux/100)*100;
      return `<label class="cp ${p.pop?'pop':''}"><input type="radio" name="prot" value="${k}" ${T.prot===k?'checked':''}>${p.pop?`<span class="pop-b">${t('x_pop','La plus choisie')}</span>`:''}<b class="cp-n">${p.n}</b><span class="cp-p">${pj?'+ '+fmt(pj)+' / '+t('x_jour','jour'):t('x_incl','Incluse')}</span>
      <span class="cp-f"><small>Franchise</small><b>${fmt(fr)}</b></span><span class="cp-f"><small>Caution</small><b>${fmt(ca)}</b></span><ul>${p.lignes.map(l=>`<li>${l}</li>`).join('')}</ul></label>`}).join('')}</div>`}
  if(n===3){const d=devis({...T,v});f.innerHTML=`<h3>${t('x_e3','Options')}</h3><p class="sous-t">Tout est préparé avant votre arrivée.</p><fieldset><legend class="sr">Options</legend>
    ${Object.entries(OPTS).map(([k,o])=>`<label class="opt"><input type="checkbox" value="${k}" ${T.opts.includes(k)?'checked':''}><span>${ar?o.ar:o.n}<small>${o.d}</small></span><b>+${fmt(o.p)}${o.jour?' / '+t('x_jour','jour'):''}</b></label>`).join('')}</fieldset>`}
  if(n===4){const c=T.c,c2=T.c2;f.innerHTML=`<h3>${t('x_e4','Le conducteur principal')}</h3><p class="sous-t">Informations obligatoires pour établir le contrat de location. Elles doivent correspondre à vos papiers.</p>
    <div class="grille3">
      <div class="champ"><label for="c-civ">Civilité</label><select id="c-civ"><option ${c.civ==='M.'?'selected':''}>M.</option><option ${c.civ==='Mme'?'selected':''}>Mme</option></select></div>
      ${champ('c-prenom','Prénom',c.prenom,'text','autocomplete="given-name" required')}${champ('c-nom','Nom',c.nom,'text','autocomplete="family-name" required')}
      ${champ('c-naiss','Date de naissance',c.naiss,'date','required max="'+iso(AUJ)+'"')}${champ('c-tel','Téléphone (WhatsApp)',c.tel,'tel','autocomplete="tel" inputmode="tel" placeholder="05 / 06 / 07 …" required')}${champ('c-email','E-mail (facultatif)',c.email,'email','autocomplete="email"')}
    </div>
    <h4>Pièce d'identité et permis</h4>
    <div class="grille3">
      <div class="champ"><label for="c-resid">Vous résidez</label><select id="c-resid"><option ${c.resid==='Algérie'?'selected':''}>Algérie</option><option ${c.resid==='À l\'étranger'?'selected':''}>À l'étranger</option></select></div>
      <div class="champ"><label for="c-piece">Pièce d'identité</label><select id="c-piece"><option value="CNI" ${c.piece==='CNI'?'selected':''}>Carte d'identité nationale</option><option ${c.piece==='Passeport'?'selected':''}>Passeport</option></select></div>
      ${champ('c-numPiece','Numéro de la pièce',c.numPiece,'text','required autocomplete="off"')}
      ${champ('c-permis','Numéro du permis',c.permis,'text','required autocomplete="off"')}${champ('c-datePermis','Permis obtenu le',c.datePermis,'date','required max="'+iso(AUJ)+'"')}
      <div class="champ"><label for="c-pays">Permis délivré en</label><select id="c-pays">${['Algérie','France','Belgique','Canada','Espagne','Royaume-Uni','Autre pays'].map(p=>`<option ${c.pays===p?'selected':''}>${p}</option>`).join('')}</select></div>
    </div>
    ${champ('c-adresse','Adresse (commune, wilaya ou ville)',c.adresse,'text','autocomplete="street-address" required')}
    <h4>Vos documents en photo <small>(conseillé : la remise des clés prend 5 minutes au lieu de 20)</small></h4>
    <div class="docs">${[['permisR','Permis · recto'],['permisV','Permis · verso'],['piece','Pièce d\'identité']].map(([k,l])=>`<label class="doc ${T.docs[k]?'ok':''}" id="lb-${k}"><input type="file" accept="image/*" capture="environment" data-doc="${k}" class="sr">${T.docs[k]?`<img src="${T.docs[k]}" alt="">`:'<span class="doc-ic" aria-hidden="true">📷</span>'}<b>${l}</b><small>${T.docs[k]?'Reçu ✓ · toucher pour changer':'Prendre ou choisir une photo'}</small></label>`).join('')}</div>
    ${T.opts.includes('cond')?`<h4>Conducteur additionnel</h4><div class="grille3">${champ('c2-prenom','Prénom',c2.prenom,'text','required')}${champ('c2-nom','Nom',c2.nom,'text','required')}${champ('c2-naiss','Date de naissance',c2.naiss,'date','required')}${champ('c2-permis','Numéro du permis',c2.permis,'text','required')}${champ('c2-datePermis','Permis obtenu le',c2.datePermis,'date','required')}</div>`:''}`}
  if(n===5){const d=devis({...T,v,naiss:T.c.naiss}),c=T.c;f.innerHTML=`<h3>${t('x_e5','Vérifiez et signez')}</h3>
    <div class="verif"><div><small>Conducteur</small><b>${esc(c.civ+' '+c.prenom+' '+c.nom)}</b><span>${age(c.naiss,T.d1)} ans · permis depuis ${age(c.datePermis,T.d1)} ans · ${esc(c.tel)}</span></div>
      <div><small>Voiture</small><b>${v.nom}</b><span>Protection ${PROTECTIONS[T.prot].n} · ${T.opts.length?T.opts.map(o=>OPTS[o].n).join(', '):'sans option'}</span></div>
      <div><small>Documents</small><b>${Object.keys(T.docs).length}/3 photos envoyées</b><span>Originaux à présenter à la remise des clés</span></div></div>
    <div class="essentiel"><h4>À retenir</h4><ul>
      <li>Caution de <b>${fmt(d.caution)}</b> à la remise des clés (espèces ou chèque certifié), rendue au retour.</li>
      <li>Franchise maximale en cas de dommage : <b>${fmt(d.franchise)}</b>.</li>
      <li>${d.kmInclus===Infinity?'Kilométrage illimité.':nb(d.kmInclus)+' km inclus, puis '+PRIX_KM+' DA/km.'} Carburant rendu au même niveau.</li>
      <li>Retour le <b>${dlong(T.d2)} à ${T.h2}</b> (tolérance 59 min). Annulation gratuite jusqu'à 24 h avant.</li></ul></div>
    <label class="opt"><input type="checkbox" id="t-cgl" ${T.cgl?'checked':''}><span>J'ai lu et j'accepte les <button type="button" class="lien" data-cgl>conditions générales de location</button>.</span></label>
    <label class="opt"><input type="checkbox" id="t-exact" ${T.exact?'checked':''}><span>Je certifie que les informations et documents fournis sont exacts.</span></label>
    <div class="champ"><span class="lab" id="sig-l">Votre signature</span><div class="sig"><canvas id="sig" width="600" height="180" aria-labelledby="sig-l" role="img"></canvas><button type="button" class="lien" id="sig-x">Effacer</button><span class="sig-ph" id="sig-ph">Signez ici avec le doigt ou la souris</span></div></div>
    <div class="err" id="t-err" role="alert"></div>`;
    signature();
  }
  pied();$('tu-form').scrollTop=0;const h=f.querySelector('h3');h&&(h.tabIndex=-1,h.focus({preventScroll:true}));
}
function lireEtape(){
  const n=T.e,v=V(T.v);
  if(n===1){T.lieu=$('t-lieu').value;T.retour=$('t-retour').value;T.h1=$('t-h1').value;T.h2=$('t-h2').value;
    let d1=$('t-d1').value||T.d1,d2=$('t-d2').value||T.d2;if(d1<iso(AUJ))d1=iso(AUJ);if(d2<d1)d2=d1;if(d2===d1&&T.h2<=T.h1){const x=parse(d1);x.setDate(x.getDate()+1);d2=iso(x)}
    T.d1=d1;T.d2=d2;$('t-d1').value=d1;$('t-d2').value=d2;$('t-d2').min=d1;T.vol=$('t-vol').value.trim();T.adr=$('t-adr').value.trim();
    $('b-vol').hidden=T.lieu!=='aeroport';$('b-adr').hidden=!(T.lieu==='domicile'||T.retour==='domicile');
    const ok=libre(T.v,T.d1,T.d2),pl=prochainLibre(T.v,T.d1);
    $('t-dispo').innerHTML=ok?`<span class="ok">✓ ${v.nom} est libre à ces dates.</span>`:`<span class="ko">Cette voiture est déjà réservée sur une partie de ces dates${pl?' (libre à partir du '+dcourt(pl)+')':''}. Changez les dates ou choisissez une autre voiture.</span>`}
  if(n===2){T.prot=($('tu-form').querySelector('[name=prot]:checked')||{}).value||'essentielle'}
  if(n===3){T.opts=[...$('tu-form').querySelectorAll('.opt input:checked')].map(i=>i.value)}
  if(n===4){for(const k of Object.keys(T.c)){const el=$('c-'+k);if(el)T.c[k]=el.value.trim()}
    if(T.opts.includes('cond'))for(const k of Object.keys(T.c2)){const el=$('c2-'+k);if(el)T.c2[k]=el.value.trim()}}
  if(n===5){T.cgl=$('t-cgl').checked;T.exact=$('t-exact').checked}
}
function erreur(id,msg){const el=$(id),e=$(id+'-e');if(el){el.setAttribute('aria-invalid',msg?'true':'false');if(msg)el.setAttribute('aria-describedby',id+'-e');else el.removeAttribute('aria-describedby')}if(e)e.textContent=msg||'';return !msg}
function valider(){
  lireEtape();const n=T.e,v=V(T.v);
  if(n===1){if(!libre(T.v,T.d1,T.d2))return false;if(!$('b-adr').hidden&&T.adr.length<6){erreur('t-adr','Indiquez l\'adresse de livraison.');$('t-adr').focus();return false}return true}
  if(n===4){const c=T.c;let ok=true,premier=null;const k=(id,msg)=>{const r=erreur(id,msg);if(!r){ok=false;premier=premier||id}};
    k('c-prenom',c.prenom.length<2?'Indiquez votre prénom.':'');k('c-nom',c.nom.length<2?'Indiquez votre nom.':'');
    const a=age(c.naiss,T.d1);k('c-naiss',!c.naiss?'Indiquez votre date de naissance.':a<AGE_MIN?`Âge minimum : ${AGE_MIN} ans.`:a<v.ageMin?`Cette voiture demande ${v.ageMin} ans minimum. Choisissez une autre gamme.`:'');
    const tel=chiffres(c.tel),intl=/^\s*(\+|00)/.test(c.tel);k('c-tel',intl?(tel.length<10?'Numéro international incomplet.':''):(!/^0[567]\d{8}$/.test(tel)?'Numéro mobile algérien à 10 chiffres (05, 06 ou 07).':''));
    k('c-email',c.email&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.email)?'Adresse e-mail incorrecte.':'');
    k('c-numPiece',c.numPiece.length<6?'Numéro de pièce d\'identité incomplet.':'');k('c-permis',c.permis.length<5?'Numéro de permis incomplet.':'');
    const ap=age(c.datePermis,T.d1);k('c-datePermis',!c.datePermis?'Indiquez la date d\'obtention du permis.':ap<PERMIS_MIN?`Le permis doit avoir au moins ${PERMIS_MIN} ans le jour du départ.`:'');
    k('c-adresse',c.adresse.length<3?'Indiquez votre adresse.':'');
    if(T.opts.includes('cond')){const c2=T.c2;k('c2-prenom',c2.prenom.length<2?'Prénom requis.':'');k('c2-nom',c2.nom.length<2?'Nom requis.':'');
      const a2=age(c2.naiss,T.d1);k('c2-naiss',!c2.naiss?'Date requise.':a2<AGE_MIN?`Âge minimum : ${AGE_MIN} ans.`:'');k('c2-permis',c2.permis.length<5?'Numéro requis.':'');
      k('c2-datePermis',!c2.datePermis?'Date requise.':age(c2.datePermis,T.d1)<PERMIS_MIN?'Permis de moins de 2 ans.':'')}
    if(premier)$(premier).focus();return ok}
  if(n===5){const e=$('t-err');if(!T.cgl){e.textContent='Acceptez les conditions générales pour continuer.';$('t-cgl').focus();return false}
    if(!T.exact){e.textContent='Cochez la case de certification.';$('t-exact').focus();return false}
    if(!T.sign){e.textContent='Signez dans le cadre pour valider votre réservation.';return false}return true}
  return true;
}
function signature(){
  const c=$('sig'),x=c.getContext('2d');let des=false,last=null;x.lineWidth=3.2;x.lineCap='round';x.strokeStyle='#F3D894';
  if(T.sign){const im=new Image();im.onload=()=>x.drawImage(im,0,0);im.src=T.sign;$('sig-ph').hidden=true}
  const pt=e=>{const r=c.getBoundingClientRect();return[(e.clientX-r.left)*c.width/r.width,(e.clientY-r.top)*c.height/r.height]};
  c.onpointerdown=e=>{des=true;last=pt(e);c.setPointerCapture(e.pointerId);$('sig-ph').hidden=true};
  c.onpointermove=e=>{if(!des)return;const p=pt(e);x.beginPath();x.moveTo(...last);x.lineTo(...p);x.stroke();last=p};
  c.onpointerup=c.onpointercancel=()=>{if(des){des=false;T.sign=c.toDataURL('image/png');$('t-err').textContent=''}};
  $('sig-x').onclick=()=>{x.clearRect(0,0,c.width,c.height);T.sign=null;$('sig-ph').hidden=false};
}
function photo(input){
  const f=input.files[0],k=input.dataset.doc;if(!f)return;
  const rd=new FileReader();rd.onload=()=>{const im=new Image();im.onload=()=>{const m=900,s=Math.min(1,m/Math.max(im.width,im.height)),cv=document.createElement('canvas');cv.width=im.width*s;cv.height=im.height*s;cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);
    T.docs[k]=cv.toDataURL('image/jpeg',.72);const lb=$('lb-'+k);lb.classList.add('ok');lb.querySelector('.doc-ic,img')?.remove();lb.insertAdjacentHTML('afterbegin',`<img src="${T.docs[k]}" alt="">`);lb.querySelector('small').textContent='Reçu ✓ · toucher pour changer'};im.src=rd.result};rd.readAsDataURL(f);
}
function confirmer(){
  const v=V(T.v),d=devis({...T,v,naiss:T.c.naiss}),noire=S.noire.includes(chiffres(T.c.tel).replace(/^213/,'0'));
  const r={id:'SD-'+(S.seq++),v:v.id,c:{...T.c},c2:T.opts.includes('cond')?{...T.c2}:null,d1:T.d1,h1:T.h1,d2:T.d2,h2:T.h2,lieu:T.lieu,retour:T.retour,vol:T.vol,adr:T.adr,opts:T.opts,prot:T.prot,
    statut:'attente',cree:iso(AUJ),total:d.total,caution:d.caution,franchise:d.franchise,docs:{permis:!!T.docs.permisR,piece:!!T.docs.piece,img:{...T.docs}},docsOk:false,sign:T.sign,source:'site',nouv:true,alerte:noire||undefined};
  S.resas.push(r);sauver();diffuser();
  const msg=`Bonjour Samir Drive 👋\nJe viens de réserver sur votre site.\n\nRéservation ${r.id}\n${v.nom}\nDu ${dlong(r.d1)} ${r.h1} au ${dlong(r.d2)} ${r.h2}\nPrise en charge : ${LIEUX[r.lieu].n}${r.vol?' (vol '+r.vol+')':''}${r.adr?'\nAdresse : '+r.adr:''}\nProtection : ${PROTECTIONS[r.prot].n}\nOptions : ${r.opts.length?r.opts.map(o=>OPTS[o].n).join(', '):'aucune'}\nTotal : ${fmt(r.total)} · caution ${fmt(r.caution)}\n\n${r.c.civ} ${r.c.prenom} ${r.c.nom} · ${r.c.tel}`;
  $('prog').innerHTML='';$('tu-recap').hidden=true;
  $('tu-form').innerHTML=`<div class="bon">
    <div class="bon-tete"><img src="img/logo.jpg" alt=""><div><small>Bon de réservation</small><b class="num">${r.id}</b></div><span class="st-bon">${noire?'À vérifier par l\'agence':'Demande envoyée'}</span></div>
    <p class="bon-msg">${noire?'Nous devons vérifier quelques informations avant de confirmer. L\'agence vous contacte rapidement.':'Merci '+esc(r.c.prenom)+' ! Samir Drive vous confirme sur WhatsApp en 15 minutes. Gardez ce numéro.'}</p>
    <div class="bon-g"><div><small>Voiture</small><b>${v.nom}</b><span>${v.coulN} · ${v.boite}</span></div><div><small>Protection</small><b>${PROTECTIONS[r.prot].n}</b><span>Franchise ${fmt(r.franchise)}</span></div>
      <div><small>Départ</small><b>${dlong(r.d1)} · ${r.h1}</b><span>${LIEUX[r.lieu].n}</span></div><div><small>Retour</small><b>${dlong(r.d2)} · ${r.h2}</b><span>${LIEUX[r.retour].n}</span></div>
      <div><small>Total à payer sur place</small><b class="or">${fmt(r.total)}</b><span>${jours(d.j)}</span></div><div><small>Caution</small><b>${fmt(r.caution)}</b><span>Rendue au retour</span></div></div>
    <div class="essentiel"><h4>À apporter le jour J</h4><ul><li>${r.c.piece==='Passeport'?'Passeport':'Carte d\'identité'} original${r.c.piece==='Passeport'?'':'e'}</li><li>Permis de conduire original</li><li>La caution : ${fmt(r.caution)}</li>${r.c2?'<li>Pièce et permis du conducteur additionnel</li>':''}</ul></div>
    <div class="bon-act"><a class="btn btn-wa" target="_blank" rel="noopener" href="https://wa.me/${WA}?text=${encodeURIComponent(msg)}">Envoyer aussi sur WhatsApp</a><button class="btn btn-ligne" type="button" data-suivi="${r.id}">Suivre ma réservation</button></div>
    <p class="petit">WhatsApp de l'agence : <b style="user-select:all">${WA_AFF}</b></p></div>`;
  $('tu-pied').innerHTML=`<span></span><button class="btn btn-ligne" type="button" data-ferme>${t('x_fermer','Fermer')}</button>`;
  try{localStorage.setItem('sd-mes',JSON.stringify([...(JSON.parse(localStorage.getItem('sd-mes')||'[]')),{id:r.id,tel:r.c.tel}]))}catch(e){}
  rendreFlotte();
}

/* ================= CGL & Ma réservation ================= */
function ouvrirCGL(){
  $('cgl').innerHTML=`<header><div><span class="sur">Samir Drive</span><h2 id="cgl-titre">Conditions générales de location</h2></div><button class="fermer" type="button" data-ferme aria-label="Fermer">×</button></header>
  <div class="in cgl" tabindex="0">${CGL.map(([h,p],i)=>`<section><h3><span>${pad(i+1)}</span>${h}</h3><p>${p}</p></section>`).join('')}<p class="petit">Version de démonstration, à valider avec Samir Drive avant mise en ligne.</p></div>
  <footer><span></span><button class="btn btn-or" type="button" data-ferme>J'ai compris</button></footer>`;
  $('cgl').showModal();
}
const ETATS=[['attente','Demande reçue'],['confirmee','Confirmée'],['encours','Clés remises'],['terminee','Terminée']];
function ouvrirMaResa(id='',tel=''){
  $('mares').innerHTML=`<header><div><span class="sur">Samir Drive</span><h2 id="mr-titre">Ma réservation</h2></div><button class="fermer" type="button" data-ferme aria-label="Fermer">×</button></header>
  <div class="in"><form id="mr-f" class="grille2 mr-f"><div class="champ"><label for="mr-id">Numéro de réservation</label><input id="mr-id" value="${esc(id)}" placeholder="SD-1052" autocomplete="off"></div><div class="champ"><label for="mr-tel">Téléphone utilisé</label><input id="mr-tel" type="tel" value="${esc(tel)}" placeholder="05 / 06 / 07 …"></div><button class="btn btn-or" type="submit">Retrouver ma réservation</button></form><div id="mr-res" aria-live="polite"></div></div>`;
  $('mares').showModal();
  $('mr-f').onsubmit=e=>{e.preventDefault();chercherResa()};if(id&&tel)chercherResa();
}
function chercherResa(){
  const id=$('mr-id').value.trim().toUpperCase(),tel=chiffres($('mr-tel').value).slice(-8),r=S.resas.find(x=>x.id===id&&chiffres(x.c.tel).slice(-8)===tel);
  if(!r){$('mr-res').innerHTML='<p class="err">Aucune réservation trouvée avec ce numéro et ce téléphone.</p>';return}
  const v=V(r.v),idx=ETATS.findIndex(e=>e[0]===r.statut),h=(parse(r.d1)-AUJ)/36e5+ +r.h1.slice(0,2);
  $('mr-res').innerHTML=`<div class="mr">${r.statut==='annulee'?'<p class="ko">Réservation annulée.</p>':`<ol class="suivi">${ETATS.map((e,i)=>`<li class="${i<=idx?'fait':''}">${e[1]}</li>`).join('')}</ol>`}
    <div class="bon-g"><div><small>Voiture</small><b>${v.nom}</b></div><div><small>Total</small><b>${fmt(r.total)}</b></div><div><small>Départ</small><b>${dlong(r.d1)} · ${r.h1}</b><span>${LIEUX[r.lieu].n}</span></div><div><small>Retour</small><b>${dlong(r.d2)} · ${r.h2}</b><span>${LIEUX[r.retour].n}</span></div></div>
    <div class="bon-act">${['attente','confirmee'].includes(r.statut)?(h>24?`<button class="btn btn-ligne" type="button" data-annuler="${r.id}">Annuler gratuitement</button>`:'<p class="petit">Moins de 24 h avant le départ : contactez l\'agence pour modifier.</p>'):''}<a class="btn btn-wa" target="_blank" rel="noopener" href="https://wa.me/${WA}?text=${encodeURIComponent('Bonjour, au sujet de ma réservation '+r.id)}">Contacter l'agence</a></div></div>`;
}

/* ================= Étincelles ================= */
function etincelles(){
  const c=$('etincelles'),x=c.getContext('2d');if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  let W,H,p=[];const tail=()=>{W=c.width=c.offsetWidth*devicePixelRatio;H=c.height=c.offsetHeight*devicePixelRatio};tail();addEventListener('resize',tail);
  for(let i=0;i<46;i++)p.push({x:Math.random(),y:Math.random(),v:.0004+Math.random()*.0012,r:.6+Math.random()*1.8,a:Math.random()});
  (function f(){if(document.hidden||document.body.classList.contains('loueur')){setTimeout(()=>requestAnimationFrame(f),600);return}
    x.clearRect(0,0,W,H);for(const q of p){q.y-=q.v;q.x+=Math.sin(q.y*12+q.a*9)*.0004;if(q.y<-.02){q.y=1.02;q.x=Math.random()}
    x.beginPath();x.arc(q.x*W,q.y*H,q.r*devicePixelRatio,0,7);x.fillStyle=`rgba(243,216,148,${.15+.5*Math.abs(Math.sin(q.a+=.01))})`;x.fill()}
    requestAnimationFrame(f)})();
}

/* ================= Événements ================= */
document.addEventListener('click',e=>{
  const b=e.target.closest('button,a');if(!b)return;
  if(b.dataset.ferme!==undefined){b.closest('dialog').close();return}
  if(b.dataset.fiche){fiche(b.dataset.fiche);return}
  if(b.dataset.resa){ouvrirTunnel(b.dataset.resa);return}
  if(b.dataset.cgl!==undefined){ouvrirCGL();return}
  if(b.dataset.suivi){const r=S.resas.find(x=>x.id===b.dataset.suivi);$('tunnel').close();ouvrirMaResa(r.id,r.c.tel);return}
  if(b.dataset.annuler){const r=S.resas.find(x=>x.id===b.dataset.annuler);r.statut='annulee';r.annulePar='client';sauver();diffuser();chercherResa();rendreFlotte();return}
  if(b.dataset.cat!==undefined){F.cat=b.dataset.cat;document.querySelectorAll('[data-cat]').forEach(x=>x.setAttribute('aria-pressed',x===b));rendreFlotte();return}
  if(b.id==='f-auto'){F.auto=!F.auto;b.setAttribute('aria-pressed',F.auto);rendreFlotte();return}
  if(b.id==='ouvrirMaResa'){let m=[];try{m=JSON.parse(localStorage.getItem('sd-mes')||'[]')}catch(_){}const l=m[m.length-1]||{};ouvrirMaResa(l.id||'',l.tel||'');return}
  if(b.id==='tu-suiv'){if(!valider())return;if(T.e<5)etape(T.e+1);else confirmer();return}
  if(b.id==='tu-prec'){lireEtape();etape(T.e-1);return}
});
$('tunnel').addEventListener('change',e=>{
  if(e.target.dataset.doc){photo(e.target);return}
  if(!T||!$('tu-form').contains(e.target))return;lireEtape();
  if(e.target.id&&e.target.id.startsWith('c'))erreur(e.target.id,'');
  if(T.e===3&&e.target.value==='cond'&&!e.target.checked)T.c2={prenom:'',nom:'',naiss:'',permis:'',datePermis:''};
  pied();
});
$('tunnel').addEventListener('input',e=>{if(e.target.getAttribute('aria-invalid')==='true')erreur(e.target.id,'');if(e.target.id==='t-cgl'||e.target.id==='t-exact')$('t-err').textContent=''});
$('recherche').addEventListener('submit',e=>{e.preventDefault();lireRecherche();$('flotte').scrollIntoView()});
$('recherche').addEventListener('change',lireRecherche);
$('tri').addEventListener('change',e=>{F.tri=e.target.value;rendreFlotte()});
$('lang').addEventListener('click',()=>{ar=!ar;appliquerLangue()});
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d&&!['tunnel','modale'].includes(d.id))d.close()}));

/* ================= Démarrage ================= */
charger();
$('r-h1').innerHTML=$('r-h2').innerHTML=heures();$('r-h1').value=R.h1;$('r-h2').value=R.h2;
$('r-d1').min=iso(AUJ);$('r-d1').value=R.d1;$('r-d2').value=R.d2;
$('wa-contact').href=`https://wa.me/${WA}?text=${encodeURIComponent('Bonjour Samir Drive, je voudrais louer une voiture.')}`;
$('tarifs').innerHTML=REMISES.slice().reverse().map(r=>`<div class="tarif"><b>-${r[1]*100} %</b><span>${r[2]}</span></div>`).join('');
const MOTS=['Livraison aéroport 24 h/24','Assurance tous risques incluse','Voitures récentes et entretenues','Annulation gratuite 24 h avant','Réponse en 15 minutes','Paiement à la remise des clés'];
$('defile').innerHTML=[...MOTS,...MOTS].map(m=>`<span>${m}</span>`).join('');
remplirLieux();infoDuree();rendreFlotte();rendreProtos();etincelles();
