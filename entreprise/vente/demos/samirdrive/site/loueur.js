/* Samir Drive · espace loueur */
const PAGES=[
  ['accueil','Tableau de bord','<path d="M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z"/>'],
  ['planning','Planning','<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4M7 13h4M7 17h8"/>'],
  ['resas','Réservations','<path d="M9 5h11M9 12h11M9 19h11M4 5h.01M4 12h.01M4 19h.01"/>'],
  ['clients','Clients','<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>'],
  ['flotte','Flotte & entretien','<path d="M5 17h14M5 17a2 2 0 1 0 4 0M15 17a2 2 0 1 0 4 0M3 17v-5l2-5h11l3 5h2v5"/>'],
  ['caisse','Caisse','<rect x="2" y="6" width="20" height="13" rx="2"/><path d="M2 10h20M6 15h4"/>'],
  ['reglages','Réglages','<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>']
];
let page='accueil',filtreResa='tous',rechC='';
const STL={attente:'Nouvelle demande',confirmee:'Confirmée',encours:'En location',terminee:'Terminée',annulee:'Annulée'};
const st=s=>`<span class="st st-${s}">${STL[s]}</span>`;
const M=$('modale');
const montant=r=>r.total+(r.sup||0);
function nav(){
  const n=S.resas.filter(r=>r.statut==='attente').length;
  $('g-nav').innerHTML=PAGES.map(([k,l,ic])=>`<button type="button" data-page="${k}" ${k===page?'aria-current="page"':''}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ic}</svg><span class="lib">${l}</span>${k==='resas'&&n?`<span class="pas" aria-label="${n} nouvelles demandes">${n}</span>`:''}</button>`).join('');
}
function aller(p){page=p;nav();({accueil:pAccueil,planning:pPlanning,resas:pResas,clients:pClients,flotte:pFlotte,caisse:pCaisse,reglages:pReglages})[p]();$('g-main').focus({preventScroll:true});scrollTo(0,0)}
function alertes(){
  const a=[];for(const v of S.flotte){
    const rk=v.vid-v.km;if(rk<1500)a.push({g:rk<500,t:`${v.nom} · vidange ${rk<=0?'dépassée':'dans '+nb(rk)+' km'}`});
    const da=ecart(iso(AUJ),v.assur);if(da<30)a.push({g:da<10,t:`${v.nom} · assurance expire le ${dcourt(v.assur)} (${da} j)`});
    const dc=ecart(iso(AUJ),v.ct);if(dc<30)a.push({g:dc<10,t:`${v.nom} · contrôle technique le ${dcourt(v.ct)} (${dc} j)`});
    if(v.entretien)a.push({g:false,t:`${v.nom} · au garage (retirée du site)`});
  }
  for(const r of S.resas.filter(r=>r.statut==='attente'&&r.alerte))a.push({g:true,t:`${r.id} · ${nomC(r.c)} figure sur la liste noire`});
  return a;
}
const item=(r,extra='')=>{const v=V(r.v);return `<div class="g-item">${vis(v,'mini')}<div class="tx"><b>${esc(nomC(r.c))}${r.alerte?' <span class="st st-annulee">Liste noire</span>':''}</b><small>${v.nom} · ${r.id} · ${LIEUX[r.lieu].c}${r.vol?' · vol '+esc(r.vol):''}</small></div>${extra}</div>`};

/* ---------- Tableau de bord ---------- */
function pAccueil(){
  const a=iso(AUJ),act=S.resas.filter(r=>r.statut!=='annulee');
  const dehors=S.resas.filter(r=>r.statut==='encours').length;
  const deps=act.filter(r=>r.d1===a&&['confirmee','attente'].includes(r.statut));
  const rets=act.filter(r=>r.d2===a&&r.statut==='encours');
  const retard=act.filter(r=>r.d2<a&&r.statut==='encours');
  const prochains=act.filter(r=>r.d1>a&&r.d1<=J(3)&&['confirmee','attente'].includes(r.statut));
  const m=AUJ.getMonth(),ca=act.filter(r=>parse(r.d1).getMonth()===m||r.statut==='encours').reduce((s,r)=>s+montant(r),0);
  const att=S.resas.filter(r=>r.statut==='attente');
  const al=alertes();
  $('g-main').innerHTML=`
    <div class="g-tete"><div><h1>Bonjour Samir 👋</h1><p>${dlong(a)} · voici votre journée</p></div><div class="g-acts"><button class="g-btn clair" type="button" id="g-ajout">+ Réservation par téléphone</button><button class="g-btn or" type="button" data-page="planning">Ouvrir le planning</button></div></div>
    <div class="kpis">
      <div class="kpi"><small>Voitures dehors</small><b>${dehors} / ${S.flotte.length}</b><span>Occupation ${Math.round(dehors/S.flotte.length*100)} %</span></div>
      <div class="kpi"><small>Aujourd'hui</small><b>${deps.length} ↗ ${rets.length} ↘</b><span>Départs et retours</span></div>
      <div class="kpi"><small>Nouvelles demandes</small><b>${att.length}</b><span>À confirmer sur WhatsApp</span></div>
      <div class="kpi"><small>Chiffre du mois</small><b class="kpi-m">${fmt(ca)}</b><span>Locations du mois en cours</span></div>
    </div>
    <div class="g-2">
      <div class="g-carte"><h2>Nouvelles demandes ${att.length?`<button class="g-btn pt clair" type="button" data-page="resas">Tout voir</button>`:''}</h2><div class="g-liste">${att.length?att.map(r=>item(r,`<button class="g-btn pt clair" type="button" data-det="${r.id}">Vérifier</button>`)).join(''):'<p class="g-vide">Aucune demande en attente.</p>'}</div></div>
      <div class="g-carte"><h2>Aujourd'hui</h2><div class="g-liste">
        ${retard.map(r=>item(r,`<button class="g-btn pt rouge" type="button" data-retour="${r.id}">En retard · retour</button>`)).join('')}
        ${deps.map(r=>item(r,`<button class="g-btn pt" type="button" data-remise="${r.id}">Remettre les clés</button>`)).join('')}
        ${rets.map(r=>item(r,`<button class="g-btn pt or" type="button" data-retour="${r.id}">Retour</button>`)).join('')}
        ${!deps.length&&!rets.length&&!retard.length?'<p class="g-vide">Ni départ ni retour prévu aujourd\'hui.</p>':''}
        ${prochains.length?`<p class="g-sous">Dans les 3 prochains jours</p>`+prochains.map(r=>item(r,`<small class="nw">${dlong(r.d1)} · ${r.h1}</small>`)).join(''):''}
      </div></div>
      <div class="g-carte"><h2>Alertes</h2><div class="g-liste">${al.length?al.map(x=>`<div class="alerte ${x.g?'rouge':''}">⚠ ${x.t}</div>`).join(''):'<p class="g-vide">Tout est à jour.</p>'}</div></div>
      <div class="g-carte"><h2>En location en ce moment</h2><div class="g-liste">${S.resas.filter(r=>r.statut==='encours').map(r=>item(r,`<small class="nw">Retour ${dcourt(r.d2)} · ${r.h2}</small>`)).join('')||'<p class="g-vide">Aucune voiture dehors.</p>'}</div></div>
    </div>`;
}
/* ---------- Planning ---------- */
function pPlanning(){
  const N=21,D0=-3,cols=`230px repeat(${N},minmax(44px,1fr))`;
  let h=`<div class="pl" style="grid-template-columns:${cols}"><div class="c h nomv">Voiture</div>`;
  for(let i=0;i<N;i++){const d=J(D0+i),x=parse(d);h+=`<div class="c h ${i===-D0?'auj':''}">${JOURS[x.getDay()].slice(0,3)}<br>${x.getDate()}</div>`}
  for(const v of S.flotte){
    h+=`<div class="c nomv">${vis(v)}<div><b>${v.nom}</b><small>${v.plaque}</small></div></div>`;
    for(let i=0;i<N;i++){
      let bars='';
      if(i===0){const deb=J(D0),fin=J(D0+N);
        for(const r of S.resas.filter(r=>r.v===v.id&&r.statut!=='annulee'&&r.d1<fin&&r.d2>deb)){
          const a=Math.max(0,ecart(deb,r.d1)),b=Math.min(N,Math.max(ecart(deb,r.d2),a+1));
          bars+=`<button type="button" class="barre bar-${r.statut}" data-det="${r.id}" style="inset-inline-start:calc(${a*100}% + 3px);width:calc(${(b-a)*100}% - 6px)" title="${esc(nomC(r.c))} · ${dcourt(r.d1)} → ${dcourt(r.d2)}">${esc(nomC(r.c))}<small>${STL[r.statut]}</small></button>`}
        if(v.entretien)bars+=`<span class="barre bar-entretien" style="inset-inline-start:calc(${-D0*100}% + 3px);width:calc(300% - 6px)">Au garage<small>Entretien</small></span>`}
      h+=`<div class="c ${i===-D0?'col-auj':''}" ${i===0?'style="z-index:1"':''}>${bars}</div>`;
    }
  }
  $('g-main').innerHTML=`<div class="g-tete"><div><h1>Planning de la flotte</h1><p>3 semaines d'un coup d'œil · touchez une location pour l'ouvrir</p></div><button class="g-btn or" type="button" id="g-ajout">+ Réservation par téléphone</button></div>
    <div class="planning">${h}</div>
    <div class="legende"><span><i class="bar-attente"></i>Nouvelle demande</span><span><i class="bar-confirmee"></i>Confirmée</span><span><i class="bar-encours"></i>En location</span><span><i class="bar-terminee"></i>Terminée</span><span><i class="bar-entretien"></i>Au garage</span></div>`;
}
/* ---------- Réservations ---------- */
function pResas(){
  const ord={attente:0,confirmee:1,encours:2,terminee:3,annulee:4};
  const l=S.resas.filter(r=>filtreResa==='tous'||r.statut===filtreResa).sort((a,b)=>ord[a.statut]-ord[b.statut]||(a.d1<b.d1?-1:1));
  const n=s=>S.resas.filter(r=>s==='tous'||r.statut===s).length;
  $('g-main').innerHTML=`<div class="g-tete"><div><h1>Réservations</h1><p>Site, WhatsApp ou téléphone : tout arrive ici.</p></div><button class="g-btn or" type="button" id="g-ajout">+ Réservation par téléphone</button></div>
    <div class="onglets" role="group" aria-label="Filtrer par statut">${['tous','attente','confirmee','encours','terminee','annulee'].map(s=>`<button type="button" data-fr="${s}" aria-pressed="${s===filtreResa}">${s==='tous'?'Toutes':STL[s]} (${n(s)})</button>`).join('')}</div>
    ${l.map(r=>{const v=V(r.v);return `<div class="resa">
      <div><span class="num2">${r.id}</span>${st(r.statut)}</div>
      <div><b>${esc(nomC(r.c))}${r.alerte?' ⚠':''}</b><small>${esc(r.c.tel)}</small><small>${v.nom} · ${PROTECTIONS[r.prot].n}</small></div>
      <div><b>${dcourt(r.d1)} → ${dcourt(r.d2)}</b><small>${duree(r.d1,r.h1,r.d2,r.h2)} jours · ${LIEUX[r.lieu].c}</small>${r.vol?`<small>Vol ${esc(r.vol)}</small>`:''}</div>
      <div><b>${fmt(montant(r))}</b><small>${r.paye?'Payé':'À encaisser'} · caution ${fmt(r.caution)}</small><small>${r.docsOk?'Documents vérifiés ✓':'Documents à vérifier'}</small></div>
      <div class="act">${actions(r)}</div></div>`}).join('')||'<p class="g-vide">Aucune réservation.</p>'}`;
}
function actions(r,det=true){
  const wa=`<a class="g-btn pt wa" target="_blank" rel="noopener" href="https://wa.me/${telInt(r.c.tel)}?text=${encodeURIComponent(msgClient(r))}">WhatsApp</a>`;
  return ({attente:`<button class="g-btn pt vert" type="button" data-conf="${r.id}">Confirmer</button><button class="g-btn pt rouge" type="button" data-ann="${r.id}">Refuser</button>`,
    confirmee:`<button class="g-btn pt" type="button" data-remise="${r.id}">Remettre les clés</button>`,
    encours:`<button class="g-btn pt or" type="button" data-retour="${r.id}">Retour</button>`}[r.statut]||'')+wa+(det?`<button class="g-btn pt clair" type="button" data-det="${r.id}">Dossier</button>`:'');
}
function msgClient(r){const v=V(r.v);
  if(r.statut==='attente'||r.statut==='confirmee')return `Bonjour ${r.c.prenom}, ici Samir Drive. Votre réservation ${r.id} est confirmée ✅\n${v.nom}\nDu ${dlong(r.d1)} à ${r.h1} au ${dlong(r.d2)} à ${r.h2}\nRendez-vous : ${LIEUX[r.lieu].n}${r.vol?' (vol '+r.vol+')':''}\nTotal : ${fmt(r.total)} · caution ${fmt(r.caution)}\nN'oubliez pas vos originaux : pièce d'identité et permis. À bientôt !`;
  if(r.statut==='encours')return `Bonjour ${r.c.prenom}, petit rappel de Samir Drive : retour de la ${v.nom} le ${dlong(r.d2)} à ${r.h2} (${LIEUX[r.retour].n}). Bonne route !`;
  return `Bonjour ${r.c.prenom}, merci d'avoir choisi Samir Drive. À très bientôt !`;
}
/* ---------- Clients ---------- */
function clients(){
  const m={};for(const r of S.resas){const k=chiffres(r.c.tel).slice(-9);(m[k]=m[k]||{k,c:r.c,l:[]}).l.push(r);if(r.cree>=(m[k].maj||''))m[k].c=r.c}
  return Object.values(m).map(x=>({...x,ca:x.l.filter(r=>r.statut!=='annulee').reduce((s,r)=>s+montant(r),0),der:x.l.map(r=>r.d1).sort().pop(),noire:S.noire.includes(chiffres(x.c.tel).replace(/^213/,'0'))||S.noire.some(n=>n.slice(-9)===x.k)}));
}
function pClients(){
  const l=clients().filter(x=>!rechC||(nomC(x.c)+' '+x.c.tel).toLowerCase().includes(rechC.toLowerCase())).sort((a,b)=>b.ca-a.ca);
  $('g-main').innerHTML=`<div class="g-tete"><div><h1>Clients</h1><p>Chaque client avec ses papiers, son historique et ce qu'il vous a rapporté.</p></div></div>
    <div class="g-rech"><label class="sr" for="g-rc">Rechercher un client</label><input id="g-rc" type="search" placeholder="Rechercher un nom ou un téléphone" value="${esc(rechC)}"></div>
    <div class="t-scroll g-carte"><table class="g-t"><thead><tr><th>Client</th><th>Téléphone</th><th>Permis</th><th class="n">Locations</th><th class="n">Chiffre</th><th>Dernière</th><th><span class="sr">Fiche</span></th></tr></thead><tbody>
    ${l.map(x=>`<tr><td><b>${esc(nomC(x.c))}</b>${x.noire?' <span class="st st-annulee">Liste noire</span>':x.l.length>1?' <span class="st st-encours">Fidèle</span>':''}<br><small>${esc(x.c.piece||'')} · ${esc(x.c.pays||'')}</small></td><td>${esc(x.c.tel)}</td><td>${x.c.datePermis?age(x.c.datePermis)+' ans':'–'}</td><td class="n">${x.l.length}</td><td class="n">${fmt(x.ca)}</td><td>${dcourt(x.der)}</td><td><button class="g-btn pt clair" type="button" data-client="${x.k}">Fiche</button></td></tr>`).join('')}
    </tbody></table></div>`;
  $('g-rc').oninput=e=>{rechC=e.target.value;const pos=e.target.selectionStart;pClients();$('g-rc').focus();$('g-rc').setSelectionRange(pos,pos)};
}
function ficheClient(k){
  const x=clients().find(c=>c.k===k),c=x.c;
  modale(`${esc(nomC(c))}`,`<div class="det"><dl>
    <dt>Téléphone</dt><dd>${esc(c.tel)}</dd><dt>Né(e) le</dt><dd>${c.naiss?dcourt(c.naiss)+' '+parse(c.naiss).getFullYear()+' ('+age(c.naiss)+' ans)':'–'}</dd>
    <dt>Pièce</dt><dd>${esc(c.piece)} n° ${esc(c.numPiece)}</dd><dt>Permis</dt><dd>n° ${esc(c.permis)} · ${esc(c.pays)} · depuis ${c.datePermis?parse(c.datePermis).getFullYear():'–'}</dd>
    <dt>Adresse</dt><dd>${esc(c.adresse)}</dd>${c.email?`<dt>E-mail</dt><dd>${esc(c.email)}</dd>`:''}<dt>Chiffre</dt><dd>${fmt(x.ca)} · ${x.l.length} location(s)</dd></dl>
    <h3 class="m-h">Historique</h3>${x.l.map(r=>`<div class="g-item"><div class="tx"><b>${r.id} · ${V(r.v).nom}</b><small>${dcourt(r.d1)} → ${dcourt(r.d2)} · ${fmt(montant(r))}</small></div>${st(r.statut)}</div>`).join('')}
    <div class="champ"><label for="m-note">Note interne</label><textarea id="m-note" rows="2" placeholder="Ex. client sérieux, rend toujours la voiture propre">${esc(S.notes[k]||'')}</textarea></div></div>`,
    `<button class="g-btn ${x.noire?'clair':'rouge'}" type="button" id="m-noire">${x.noire?'Retirer de la liste noire':'Mettre sur liste noire'}</button><button class="g-btn" type="button" id="m-ok">Enregistrer</button>`);
  $('m-ok').onclick=()=>{S.notes[k]=$('m-note').value.trim();sauver();M.close();toast('Fiche client enregistrée')};
  $('m-noire').onclick=()=>{const n=chiffres(c.tel).replace(/^213/,'0');if(x.noire)S.noire=S.noire.filter(z=>z.slice(-9)!==k);else S.noire.push(n);sauver();M.close();toast(x.noire?'Client retiré de la liste noire':'Client sur liste noire : ses prochaines réservations seront signalées');pClients()};
}
/* ---------- Flotte ---------- */
function pFlotte(){
  $('g-main').innerHTML=`<div class="g-tete"><div><h1>Flotte & entretien</h1><p>Ajoutez, modifiez ou retirez vos voitures : le site se met à jour tout de suite.</p></div><button class="g-btn or" type="button" data-edit="">+ Ajouter une voiture</button></div>
  <div class="fl">${S.flotte.map(v=>{const pct=Math.min(100,Math.max(0,100-(v.vid-v.km)/100));const enLoc=S.resas.find(r=>r.v===v.id&&r.statut==='encours');
    const da=ecart(iso(AUJ),v.assur),dc=ecart(iso(AUJ),v.ct),ca=S.resas.filter(r=>r.v===v.id&&r.statut!=='annulee').reduce((s,r)=>s+montant(r),0);
    return `<div class="flv"><div class="haut">${vis(v)}<div><b>${v.nom}</b><br><small class="gris">${v.plaque} · ${v.annee} · ${v.coulN}</small><br>${v.cache?'<span class="st st-annulee">Masquée du site</span> ':''}${v.entretien?'<span class="st st-entretien">Au garage</span>':enLoc?'<span class="st st-encours">En location</span>':'<span class="st st-terminee">Au parking</span>'}</div></div>
    <dl><dt>Kilométrage</dt><dd>${nb(v.km)} km</dd><dt>Prochaine vidange</dt><dd>${nb(v.vid)} km</dd></dl>
    <div class="jauge" role="img" aria-label="Avancement vers la vidange : ${Math.round(pct)} %"><i style="width:${pct}%"></i></div>
    <dl><dt>Assurance</dt><dd class="${da<30?'rouge-t':''}">${dcourt(v.assur)} ${parse(v.assur).getFullYear()}</dd><dt>Contrôle technique</dt><dd class="${dc<30?'rouge-t':''}">${dcourt(v.ct)} ${parse(v.ct).getFullYear()}</dd><dt>Caution</dt><dd>${fmt(v.caution)}</dd><dt>Chiffre généré</dt><dd>${fmt(ca)}</dd></dl>
    <div class="prix-ed"><label for="px-${v.id}">Prix / jour</label><input id="px-${v.id}" type="number" min="1000" step="500" value="${v.prix}"><button class="g-btn pt" type="button" data-px="${v.id}">Enregistrer</button></div>
    <div class="ligne-btn"><button class="g-btn pt" type="button" data-edit="${v.id}">Modifier</button><button class="g-btn pt clair" type="button" data-vid="${v.id}">Vidange faite</button><button class="g-btn pt clair" type="button" data-gar="${v.id}">${v.entretien?'Sortie du garage':'Mettre au garage'}</button></div></div>`}).join('')}</div>`;
}
/* ---------- Caisse ---------- */
function pCaisse(){
  const l=S.resas.filter(r=>r.statut!=='annulee').sort((a,b)=>a.d1<b.d1?1:-1);
  const tot=l.reduce((s,r)=>s+montant(r),0),enc=l.filter(r=>r.paye).reduce((s,r)=>s+montant(r),0);
  const cau=S.resas.filter(r=>r.statut==='encours').reduce((s,r)=>s+r.caution,0);
  const parV=S.flotte.map(v=>({v,ca:l.filter(r=>r.v===v.id).reduce((s,r)=>s+montant(r),0)})).sort((a,b)=>b.ca-a.ca),max=Math.max(...parV.map(x=>x.ca),1);
  $('g-main').innerHTML=`<div class="g-tete"><div><h1>Caisse</h1><p>Encaissé, reste à encaisser, cautions en cours et chiffre par voiture.</p></div></div>
    <div class="kpis"><div class="kpi"><small>Chiffre total</small><b class="kpi-m">${fmt(tot)}</b><span>${l.length} locations</span></div>
      <div class="kpi"><small>Encaissé</small><b class="kpi-m vert-t">${fmt(enc)}</b></div>
      <div class="kpi"><small>Reste à encaisser</small><b class="kpi-m ambre-t">${fmt(tot-enc)}</b></div>
      <div class="kpi"><small>Cautions en cours</small><b class="kpi-m">${fmt(cau)}</b><span>À rendre au retour</span></div></div>
    <div class="g-2"><div class="g-carte"><h2>Chiffre par voiture</h2><div class="barres-ca">${parV.map(x=>`<div><span>${x.v.nom}</span><span class="b"><i style="width:${x.ca/max*100}%"></i></span><span class="v">${fmt(x.ca)}</span></div>`).join('')}</div></div>
    <div class="g-carte"><h2>Locations</h2><div class="t-scroll"><table class="g-t"><thead><tr><th>N°</th><th>Client</th><th>Dates</th><th class="n">Montant</th><th>État</th></tr></thead><tbody>
      ${l.map(r=>`<tr><td>${r.id}</td><td>${esc(nomC(r.c))}</td><td>${dcourt(r.d1)} → ${dcourt(r.d2)}</td><td class="n">${fmt(montant(r))}</td><td>${r.paye?'<span class="st st-encours">Payé</span>':'<span class="st st-attente">À encaisser</span>'}</td></tr>`).join('')}
    </tbody></table></div></div></div>`;
}

/* ---------- Modales ---------- */
function modale(titre,corps,pied,large){M.classList.toggle('large',!!large);M.innerHTML=`<header><h2 id="m-titre">${titre}</h2><button class="fermer" type="button" data-ferme aria-label="Fermer">×</button></header><div class="in">${corps}</div><div class="pied">${pied}</div>`;if(!M.open)M.showModal()}
const carbuH=(id,val)=>`<div class="champ"><span class="lab" id="${id}-l">Carburant</span><div class="carbu" role="group" aria-labelledby="${id}-l" id="${id}">${[1,2,3,4,5,6,7,8].map(i=>`<button type="button" data-cb="${i}" aria-pressed="${i===val}" aria-label="${i} huitièmes">${i===8?'Plein':i+'/8'}</button>`).join('')}</div></div>`;
const cotesH=`<div class="champ"><span class="lab">Photos obligatoires</span><div class="cotes">${['Avant','Arrière','Côté gauche','Côté droit'].map(c=>`<label><input type="checkbox" class="cote"><span aria-hidden="true">📷</span>${c}</label>`).join('')}</div></div>`;
let DOM=[],ANC=[],TYPE='Rayure',onDom=null;
function schema(anciens=[]){ANC=anciens;return `<div class="edl"><div class="edl-s" id="edl-s">${dessus(DOM,anciens)}</div><div class="edl-d"><span class="lab">Touchez la voiture pour noter un dommage</span><div class="types" role="group" aria-label="Type de dommage">${['Rayure','Bosse','Impact'].map(x=>`<button type="button" data-type="${x}" aria-pressed="${x===TYPE}">${x}</button>`).join('')}</div><ul class="dl-dom" id="dl-dom"></ul>${anciens.length?`<p class="petit gris"><i class="pt-g"></i> ${anciens.length} dommage(s) déjà noté(s) au départ</p>`:''}</div></div>`}
function majSchema(){const anciens=ANC;$('edl-s').innerHTML=dessus(DOM,anciens);$('dl-dom').innerHTML=DOM.map((d,i)=>`<li><span class="pt-r">${d.t[0]}</span>${d.t} ${zone(d)}<button type="button" class="lien" data-deldom="${i}" aria-label="Supprimer ce dommage">Retirer</button></li>`).join('')||'<li class="gris">Aucun dommage noté.</li>';
  $('edl-s').querySelector('svg').onclick=e=>{const s=e.currentTarget,p=s.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const q=p.matrixTransform(s.getScreenCTM().inverse());DOM.push({x:Math.round(q.x),y:Math.round(q.y),t:TYPE});majSchema();onDom&&onDom()}}
const zone=d=>`(${d.y<130?'avant':d.y>290?'arrière':'milieu'} ${d.x<80?'gauche':d.x>120?'droit':'centre'})`;
function remise(id){const r=S.resas.find(x=>x.id===id),v=V(r.v);DOM=[];onDom=null;
  modale(`Remise des clés · ${r.id}`,`${item(r)}
    ${!r.docsOk?`<div class="alerte">⚠ Documents pas encore vérifiés : contrôlez les originaux (pièce et permis) avant de remettre les clés.</div>`:''}
    <div class="grille2"><div class="champ"><label for="m-km">Kilométrage au départ</label><input id="m-km" type="number" value="${v.km}"></div><div class="champ"><label for="m-cau">Caution reçue (DA)</label><input id="m-cau" type="number" value="${r.caution}"></div></div>
    ${carbuH('cb',8)}${schema()}${cotesH}
    <label class="opt clair-o"><input type="checkbox" id="m-orig" ${r.docsOk?'checked':''}><span>Originaux contrôlés : pièce d'identité et permis</span></label>
    <label class="opt clair-o"><input type="checkbox" id="m-paye" checked><span>Location payée (${fmt(r.total)})</span></label><p class="err" id="m-err" role="alert"></p>`,
  `<button class="g-btn clair" type="button" data-ferme>Annuler</button><button class="g-btn clair" type="button" data-contrat="${r.id}">Voir le contrat</button><button class="g-btn vert" type="button" id="m-ok">Valider la remise des clés</button>`,true);
  majSchema();
  $('m-ok').onclick=()=>{const cb=+M.querySelector('#cb [aria-pressed="true"]').dataset.cb,nbc=M.querySelectorAll('.cote:checked').length;
    if(!$('m-orig').checked){$('m-err').textContent='Contrôlez les originaux avant de remettre les clés.';return}
    if(nbc<4){$('m-err').textContent='Prenez les 4 photos : elles vous protègent en cas de litige.';return}
    r.edlD={km:+$('m-km').value,carbu:cb,photos:nbc,dom:[...DOM]};r.docsOk=true;r.paye=$('m-paye').checked;r.statut='encours';v.km=+$('m-km').value;sauver();diffuser();M.close();toast('Clés remises · bonne route à '+r.c.prenom);aller(page)}
}
function retour(id){const r=S.resas.find(x=>x.id===id),v=V(r.v),j=duree(r.d1,r.h1,r.d2,r.h2),inclus=r.opts.includes('kmi')?Infinity:KM_JOUR*j,kd=r.edlD?.km||v.km,anc=r.edlD?.dom||[];DOM=[];
  const kmDef=kd+(inclus===Infinity?160*j:Math.min(inclus+120,190*j));
  modale(`Retour de la voiture · ${r.id}`,`${item(r)}
    <div class="grille2"><div class="champ"><label for="m-km">Kilométrage au retour</label><input id="m-km" type="number" value="${kmDef}"></div><div class="champ"><span class="lab">Au départ</span><div class="val">${nb(kd)} km · ${r.edlD?.carbu===8||!r.edlD?'plein':r.edlD.carbu+'/8'}</div></div></div>
    ${carbuH('cb',r.edlD?.carbu||8)}${schema(anc)}${cotesH}
    <div class="champ"><label for="m-ret">Retenue sur caution pour dommages (DA)</label><input id="m-ret" type="number" min="0" step="1000" value="0"><span class="aide">Franchise maximale de ce client (${PROTECTIONS[r.prot].n}) : <b>${fmt(r.franchise)}</b></span></div>
    <div class="ligne-sup" id="m-sup"></div>`,
    `<button class="g-btn clair" type="button" data-ferme>Annuler</button><button class="g-btn or" type="button" id="m-ok">Clôturer la location</button>`,true);
  majSchema();
  const calc=()=>{const km=+$('m-km').value||kd,cb=+M.querySelector('#cb [aria-pressed="true"]').dataset.cb,ret=Math.min(+$('m-ret').value||0,r.franchise);
    const kmSup=Math.max(0,km-kd-inclus),cSup=Math.max(0,(r.edlD?.carbu||8)-cb);const s=kmSup*PRIX_KM+(r.opts.includes('plein')?0:cSup*PRIX_8E);
    $('m-sup').innerHTML=`<div><span>${kmSup?nb(kmSup)+' km au-delà du forfait × '+PRIX_KM+' DA':'Kilométrage dans le forfait'}</span><b>${fmt(kmSup*PRIX_KM)}</b></div>
      <div><span>${cSup&&!r.opts.includes('plein')?cSup+'/8 de carburant manquant':'Carburant OK'}</span><b>${fmt(r.opts.includes('plein')?0:cSup*PRIX_8E)}</b></div>
      <div><span>Retenue dommages${DOM.length?' ('+DOM.length+' nouveau'+(DOM.length>1?'x':'')+')':''}</span><b>${fmt(ret)}</b></div>
      <div class="tot-sup"><span>Caution rendue au client</span><b>${fmt(Math.max(0,r.caution-s-ret))}</b></div>`;return {km,cb,s,ret}};
  onDom=()=>{if(+$('m-ret').value===0&&DOM.length)$('m-ret').value=Math.min(r.franchise,15000*DOM.length);calc()};
  calc();$('m-km').oninput=calc;$('m-ret').oninput=calc;$('cb').addEventListener('click',()=>setTimeout(calc));
  $('m-ok').onclick=()=>{const c=calc();if(M.querySelectorAll('.cote:checked').length<4){toast('Prenez les 4 photos du retour');return}
    r.edlR={km:c.km,carbu:c.cb,photos:4,dom:[...DOM]};r.sup=c.s;r.retenue=c.ret;r.statut='terminee';v.km=c.km;sauver();diffuser();M.close();toast('Location clôturée'+(c.s?' · supplément '+fmt(c.s):'')+(c.ret?' · retenue '+fmt(c.ret):''));aller(page)}
}
function detail(id){const r=S.resas.find(x=>x.id===id),v=V(r.v),d=devis({...r,v,naiss:r.c.naiss}),c=r.c,img=r.docs?.img||{};
  const doc=(k,l)=>`<figure class="dfig">${img[k]?`<img src="${img[k]}" alt="${l}">`:`<div class="dfig-v">${!r.docs?.img&&(k==='piece'?r.docs?.piece:r.docs?.permis)?'Reçu (démo)':'Non envoyé'}</div>`}<figcaption>${l}</figcaption></figure>`;
  modale(`Dossier ${r.id}`,`${item(r)}
    ${r.alerte?'<div class="alerte rouge">⚠ Ce client est sur votre liste noire. Vérifiez avant de confirmer.</div>':''}
    <div class="det"><div class="det-2">
      <div><h3 class="m-h">Location</h3><dl><dt>Statut</dt><dd>${st(r.statut)}</dd><dt>Départ</dt><dd>${dlong(r.d1)} ${r.h1} · ${LIEUX[r.lieu].n}${r.vol?' · vol '+esc(r.vol):''}</dd><dt>Retour</dt><dd>${dlong(r.d2)} ${r.h2} · ${LIEUX[r.retour].n}</dd>${r.adr?`<dt>Adresse</dt><dd>${esc(r.adr)}</dd>`:''}
        <dt>Protection</dt><dd>${PROTECTIONS[r.prot].n} · franchise ${fmt(r.franchise)}</dd><dt>Options</dt><dd>${r.opts.length?r.opts.map(o=>OPTS[o].n).join(', '):'Aucune'}</dd>
        <dt>Total</dt><dd>${fmt(montant(r))}${r.sup?' (dont supplément '+fmt(r.sup)+')':''}</dd><dt>Caution</dt><dd>${fmt(r.caution)}${r.retenue?' · retenue '+fmt(r.retenue):''}</dd>
        ${r.edlD?`<dt>État départ</dt><dd>${nb(r.edlD.km)} km · ${r.edlD.carbu}/8 · ${r.edlD.dom.length} dommage(s)</dd>`:''}${r.edlR?`<dt>État retour</dt><dd>${nb(r.edlR.km)} km · ${r.edlR.carbu}/8 · ${r.edlR.dom.length} nouveau(x)</dd>`:''}${r.note?`<dt>Note</dt><dd>${esc(r.note)}</dd>`:''}</dl></div>
      <div><h3 class="m-h">Conducteur</h3><dl><dt>Nom</dt><dd>${esc((c.civ||'')+' '+nomC(c))}</dd><dt>Âge</dt><dd>${c.naiss?age(c.naiss,r.d1)+' ans':'–'}</dd><dt>Téléphone</dt><dd>${esc(c.tel)}</dd><dt>Pièce</dt><dd>${esc(c.piece)} n° ${esc(c.numPiece)}</dd><dt>Permis</dt><dd>n° ${esc(c.permis)} · ${esc(c.pays)}<br>depuis ${c.datePermis?age(c.datePermis,r.d1)+' ans':'–'}</dd><dt>Adresse</dt><dd>${esc(c.adresse)}</dd>
        ${r.c2?`<dt>2e conducteur</dt><dd>${esc(r.c2.prenom+' '+r.c2.nom)} · permis ${esc(r.c2.permis)}</dd>`:''}</dl></div></div>
    <h3 class="m-h">Documents ${r.docsOk?'<span class="st st-encours">Vérifiés</span>':'<span class="st st-attente">À vérifier</span>'}</h3>
    <div class="dfigs">${doc('permisR','Permis recto')}${doc('permisV','Permis verso')}${doc('piece','Pièce d\'identité')}${r.sign?`<figure class="dfig"><img src="${r.sign}" alt="Signature du client" class="sig-img"><figcaption>Signature</figcaption></figure>`:''}</div></div>`,
    `<button class="g-btn clair" type="button" data-ferme>Fermer</button>${!r.docsOk&&r.statut!=='annulee'?`<button class="g-btn clair" type="button" data-docok="${r.id}">Documents vérifiés ✓</button>`:''}<button class="g-btn clair" type="button" data-contrat="${r.id}">Contrat</button>${actions(r,false)}`,true);
}
function contrat(id){const r=S.resas.find(x=>x.id===id),v=V(r.v),d=devis({...r,v,naiss:r.c.naiss}),c=r.c,C=$('contrat');
  C.innerHTML=`<header><h2 id="ct-titre">Contrat de location ${r.id}</h2><div class="g-acts"><button class="g-btn clair pt" type="button" onclick="print()">Imprimer</button><button class="fermer" type="button" data-ferme aria-label="Fermer">×</button></div></header>
  <article class="doc-c">
    <div class="dc-tete"><img src="img/logo.jpg" alt=""><div><b>SAMIR DRIVE</b><span>Location de voitures · Bordj El Kiffan, Alger</span><span>Tél. ${TEL} · WhatsApp ${WA_AFF}</span></div><div class="dc-n"><small>Contrat n°</small><b>${r.id}</b><small>Établi le ${dcourt(r.cree)} ${parse(r.cree).getFullYear()}</small></div></div>
    <div class="dc-2"><section><h3 class="h4">Locataire</h3><p><b>${esc((c.civ||'')+' '+c.prenom+' '+c.nom)}</b><br>Né(e) le ${c.naiss?dcourt(c.naiss)+' '+parse(c.naiss).getFullYear():'–'}<br>${esc(c.piece)} n° ${esc(c.numPiece)}<br>Permis n° ${esc(c.permis)} (${esc(c.pays)}) du ${c.datePermis?dcourt(c.datePermis)+' '+parse(c.datePermis).getFullYear():'–'}<br>${esc(c.adresse)} · ${esc(c.tel)}</p>${r.c2?`<p><b>Conducteur additionnel :</b> ${esc(r.c2.prenom+' '+r.c2.nom)}, permis n° ${esc(r.c2.permis)}</p>`:''}</section>
    <section><h3 class="h4">Véhicule</h3><p><b>${v.nom}</b> · ${v.coulN} · ${v.annee}<br>Immatriculation : ${v.plaque}<br>${v.moteur} · ${v.boite} · ${v.carbu}<br>Km départ : ${r.edlD?nb(r.edlD.km):'……………'} · Carburant : ${r.edlD?r.edlD.carbu+'/8':'……'}</p></section></div>
    <div class="dc-2"><section><h3 class="h4">Durée</h3><p>Départ : <b>${dlong(r.d1)} ${parse(r.d1).getFullYear()} à ${r.h1}</b> · ${LIEUX[r.lieu].n}<br>Retour : <b>${dlong(r.d2)} ${parse(r.d2).getFullYear()} à ${r.h2}</b> · ${LIEUX[r.retour].n}<br>${d.j} jour(s) · tolérance 59 min · ${d.kmInclus===Infinity?'kilométrage illimité':nb(d.kmInclus)+' km inclus'}</p></section>
    <section><h3 class="h4">Prix</h3><table class="dc-t"><tr><td>Location ${d.j} j × ${fmt(v.prix)}</td><td>${fmt(d.base)}</td></tr>${d.remise?`<tr><td>Remise longue durée</td><td>-${fmt(d.remise)}</td></tr>`:''}<tr><td>Protection ${PROTECTIONS[r.prot].n}</td><td>${fmt(d.protT)}</td></tr>${r.opts.map(o=>`<tr><td>${OPTS[o].n}</td><td>${fmt(OPTS[o].jour?OPTS[o].p*d.j:OPTS[o].p)}</td></tr>`).join('')}${d.liv?`<tr><td>Livraison / restitution</td><td>${fmt(d.liv)}</td></tr>`:''}${d.jeune?`<tr><td>Jeune conducteur</td><td>${fmt(d.jeune)}</td></tr>`:''}<tr class="tt"><td>Total TTC</td><td>${fmt(r.total)}</td></tr></table>
      <p>Caution : <b>${fmt(r.caution)}</b> · Franchise : <b>${fmt(r.franchise)}</b></p></section></div>
    <section><h3 class="h4">État des lieux au départ</h3><div class="dc-edl">${dessus(r.edlD?.dom||[])}<p>${r.edlD?(r.edlD.dom.length?r.edlD.dom.map(x=>x.t+' '+zone(x)).join(' · '):'Aucun dommage constaté au départ.')+' · 4 photos jointes au dossier.':'À remplir à la remise des clés.'}</p></div></section>
    <section class="dc-cgl"><h3 class="h4">Conditions générales (extrait)</h3><ol>${cgl().slice(0,8).map(([h,p])=>`<li><b>${h}.</b> ${p}</li>`).join('')}</ol><p>Le locataire reconnaît avoir lu et accepté l'intégralité des conditions générales de location.</p></section>
    <div class="dc-sig"><div><small>Le locataire (lu et approuvé)</small>${r.sign?`<img src="${r.sign}" alt="Signature du locataire">`:'<span class="trait"></span>'}</div><div><small>Pour Samir Drive</small><span class="tampon">SAMIR DRIVE<br>Bordj El Kiffan</span></div></div>
  </article>`;
  C.showModal();
}
function ajoutTel(){
  const def=(S.flotte.find(x=>libre(x.id,J(1),J(3)))||{}).id;
  modale('Nouvelle réservation par téléphone',`<div class="grille2"><div class="champ"><label for="a-pre">Prénom</label><input id="a-pre"></div><div class="champ"><label for="a-nom">Nom</label><input id="a-nom"></div><div class="champ"><label for="a-tel">Téléphone</label><input id="a-tel" type="tel"></div>
    <div class="champ"><label for="a-v">Voiture</label><select id="a-v">${S.flotte.map(v=>`<option value="${v.id}" ${v.id===def?'selected':''}>${v.nom} · ${fmt(v.prix)}/j</option>`).join('')}</select></div>
    <div class="champ"><label for="a-l">Prise en charge</label><select id="a-l">${Object.entries(LIEUX).map(([k,l])=>`<option value="${k}">${l.n}</option>`).join('')}</select></div>
    <div class="champ"><label for="a-p">Protection</label><select id="a-p">${Object.entries(PROTECTIONS).map(([k,p])=>`<option value="${k}">${p.n}</option>`).join('')}</select></div>
    <div class="champ"><label for="a-d1">Départ</label><input id="a-d1" type="date" value="${J(1)}"></div><div class="champ"><label for="a-d2">Retour</label><input id="a-d2" type="date" value="${J(3)}"></div></div>
    <div class="ligne-sup" id="a-tot"></div><p class="petit gris">Les papiers du client seront saisis et vérifiés à la remise des clés.</p><p class="err" id="a-err" role="alert"></p>`,
    `<button class="g-btn clair" type="button" data-ferme>Annuler</button><button class="g-btn or" type="button" id="a-ok">Enregistrer (confirmée)</button>`);
  const calc=()=>{const v=V($('a-v').value),d1=$('a-d1').value,d2=$('a-d2').value;if(!d1||!d2||d2<=d1){$('a-tot').innerHTML='<span>Dates à vérifier</span><b>–</b>';return null}
    const d=devis({v,d1,d2,lieu:$('a-l').value,retour:$('a-l').value,prot:$('a-p').value}),ok=libre(v.id,d1,d2);$('a-tot').innerHTML=`<span>${d.j} jours${d.remise?' · remise '+d.taux*100+' %':''}${ok?'':' · <b class="rouge-t">déjà réservée</b>'}</span><b>${fmt(d.total)}</b>`;return ok?d:null};
  calc();['a-v','a-l','a-p','a-d1','a-d2'].forEach(i=>$(i).onchange=calc);
  $('a-ok').onclick=()=>{const d=calc(),pre=$('a-pre').value.trim(),nom=$('a-nom').value.trim();if(!nom||!pre){$('a-err').textContent='Prénom et nom du client manquants.';return}if(chiffres($('a-tel').value).length<9){$('a-err').textContent='Téléphone du client manquant.';return}if(!d){$('a-err').textContent='Voiture indisponible à ces dates ou dates incorrectes.';return}
    S.resas.push({id:'SD-'+(S.seq++),v:$('a-v').value,c:{civ:'',prenom:pre,nom,tel:$('a-tel').value,naiss:'',datePermis:'',piece:'CNI',numPiece:'à saisir',permis:'à saisir',pays:'Algérie',adresse:'à saisir'},d1:$('a-d1').value,h1:'10:00',d2:$('a-d2').value,h2:'10:00',lieu:$('a-l').value,retour:$('a-l').value,opts:[],prot:$('a-p').value,statut:'confirmee',cree:iso(AUJ),total:d.total,caution:d.caution,franchise:d.franchise,docs:{},docsOk:false,source:'téléphone'});
    sauver();diffuser();M.close();toast('Réservation ajoutée au planning');aller(page)}
}
/* ---------- Éditeur de voiture ---------- */
const slug=x=>String(x).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
let PH=[];
function editVoiture(id){
  const neuf=!id,v=neuf?{id:'v'+(Math.max(0,...S.flotte.map(x=>+x.id.slice(1)||0))+1),nom:'',version:'',cat:'SUV',gamme:'Éco',forme:'suv',coul:'#EDEDEA',coulN:'Blanche',boite:'Manuelle',carbu:'Essence',moteur:'',conso:'',coffre:'',places:5,portes:5,prix:6000,caution:50000,ageMin:21,annee:new Date().getFullYear(),plaque:'',km:0,vid:10000,assur:J(365),ct:J(730),photos:[],equip:['Climatisation']}:V(id);
  PH=[...(v.photos||[])];
  const f=(k,l,type='text',attr='')=>`<div class="champ"><label for="e-${k}">${l}</label><input id="e-${k}" type="${type}" value="${esc(v[k]??'')}" ${attr}></div>`;
  const sel=(k,l,opts)=>`<div class="champ"><label for="e-${k}">${l}</label><select id="e-${k}">${opts.map(o=>`<option ${o===v[k]?'selected':''}>${o}</option>`).join('')}</select></div>`;
  modale(neuf?'Ajouter une voiture':'Modifier · '+esc(v.nom),`
    <h3 class="m-h">Photos <small class="gris">la 1re est la photo principale</small></h3><div class="e-photos" id="e-photos"></div>
    <label class="g-btn clair pt e-ajph"><input type="file" accept="image/*" multiple class="sr" id="e-file">+ Ajouter des photos</label>
    <h3 class="m-h">La voiture</h3>
    <div class="grille3">${f('nom','Modèle (ex. Renault Clio 5)','text','required')}${f('version','Finition (facultatif)')}${f('annee','Année','number','min="1990" max="2035"')}
      ${sel('cat','Catégorie',['Citadine','Berline','SUV','Monospace','Utilitaire'])}${sel('gamme','Gamme',['Éco','Confort','Premium'])}${sel('forme','Silhouette (si pas de photo)',['citadine','berline','suv'])}
      ${f('coulN','Couleur (nom)')}<div class="champ"><label for="e-coul">Couleur (pastille)</label><input id="e-coul" type="color" value="${esc(v.coul)}"></div>${f('plaque','Immatriculation')}
      ${sel('boite','Boîte',['Manuelle','Automatique'])}${sel('carbu','Carburant',['Essence','Diesel','Hybride essence','GPL','Électrique'])}${f('moteur','Moteur (ex. 1.5 dCi 115 ch)')}
      ${f('conso','Consommation')}${f('coffre','Coffre')}${f('places','Places','number','min="2" max="9"')}</div>
    <div class="champ"><label for="e-equip">Équipements (un par ligne)</label><textarea id="e-equip" rows="4">${esc((v.equip||[]).join('\n'))}</textarea></div>
    <h3 class="m-h">Prix et conditions</h3>
    <div class="grille3">${f('prix','Prix par jour (DA)','number','min="1000" step="500"')}${f('caution','Caution (DA)','number','min="0" step="1000"')}${f('ageMin','Âge minimum','number','min="18" max="30"')}</div>
    <h3 class="m-h">Entretien</h3>
    <div class="grille3">${f('km','Kilométrage actuel','number','min="0"')}${f('vid','Prochaine vidange (km)','number','min="0"')}${f('assur','Fin d\'assurance','date')}${f('ct','Contrôle technique','date')}</div>
    <div class="e-opts"><label class="opt"><input type="checkbox" id="e-chef" ${v.chef?'checked':''}><span>Coup de cœur (mise en avant)</span></label><label class="opt"><input type="checkbox" id="e-neuf" ${v.neuf?'checked':''}><span>Badge « Neuve »</span></label><label class="opt"><input type="checkbox" id="e-cache" ${v.cache?'checked':''}><span>Masquer du site (sans la supprimer)</span></label></div>
    ${neuf?'':`<details class="e-suppr"><summary>Supprimer cette voiture</summary><p>La voiture disparaît du site et du planning. Ses anciennes locations restent dans la caisse.</p><button class="g-btn rouge pt" type="button" id="e-del">Supprimer définitivement</button></details>`}
    <p class="err" id="e-err" role="alert"></p>`,
    `<button class="g-btn clair" type="button" data-ferme>Annuler</button><button class="g-btn or" type="button" id="e-ok">${neuf?'Ajouter la voiture':'Enregistrer'}</button>`,true);
  majPhotos();
  $('e-file').onchange=e=>{[...e.target.files].forEach(fl=>{const rd=new FileReader();rd.onload=()=>{const im=new Image();im.onload=()=>{const m=1100,k=Math.min(1,m/Math.max(im.width,im.height)),cv=document.createElement('canvas');cv.width=im.width*k;cv.height=im.height*k;cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);PH.push(cv.toDataURL('image/jpeg',.78));majPhotos()};im.src=rd.result};rd.readAsDataURL(fl)});e.target.value=''};
  if($('e-del'))$('e-del').onclick=()=>{if(S.resas.some(r=>r.v===v.id&&['attente','confirmee','encours'].includes(r.statut))){$('e-err').textContent='Impossible : cette voiture a des réservations en cours ou à venir. Masquez-la plutôt.';return}
    S.flotte=S.flotte.filter(x=>x.id!==v.id);sauver();diffuser();M.close();toast(v.nom+' supprimée');pFlotte()};
  $('e-ok').onclick=()=>{
    const g=k=>$('e-'+k).value.trim(),n=k=>+$('e-'+k).value||0;
    if(g('nom').length<3){$('e-err').textContent='Indiquez le modèle de la voiture.';$('e-nom').focus();return}
    if(n('prix')<1000){$('e-err').textContent='Le prix par jour doit être d\'au moins 1 000 DA.';$('e-prix').focus();return}
    const o=neuf?v:V(v.id);
    Object.assign(o,{nom:g('nom'),version:g('version'),annee:n('annee'),cat:g('cat'),gamme:g('gamme'),forme:g('forme'),coulN:g('coulN')||'—',coul:$('e-coul').value,plaque:g('plaque'),boite:g('boite'),carbu:g('carbu'),moteur:g('moteur')||'—',conso:g('conso')||'—',coffre:g('coffre')||'—',places:n('places')||5,portes:o.portes||5,
      equip:$('e-equip').value.split('\n').map(x=>x.trim()).filter(Boolean),prix:n('prix'),caution:n('caution'),ageMin:n('ageMin')||21,km:n('km'),vid:n('vid'),assur:g('assur')||o.assur,ct:g('ct')||o.ct,chef:$('e-chef').checked,neuf:$('e-neuf').checked,cache:$('e-cache').checked,photos:[...PH],img:PH[0]||null});
    o.mod=slug(o.nom);
    if(neuf)S.flotte.push(o);
    sauver();diffuser();M.close();toast(neuf?o.nom+' ajoutée au site':'Modifications enregistrées · le site est à jour');pFlotte();
  };
}
function majPhotos(){$('e-photos').innerHTML=PH.length?PH.map((x,i)=>`<figure class="e-ph"><img src="${photo(x)}" alt="Photo ${i+1}">${i===0?'<span>Principale</span>':''}<div><button type="button" data-phg="${i}" aria-label="Avancer la photo ${i+1}" ${i===0?'disabled':''}>←</button><button type="button" data-phd="${i}" aria-label="Retirer la photo ${i+1}">✕</button></div></figure>`).join(''):'<p class="g-vide">Aucune photo : une silhouette s\'affichera sur le site.</p>'}

/* ---------- Réglages ---------- */
function pReglages(){
  const c=(id,l,val,type='text',attr='')=>`<div class="champ"><label for="${id}">${l}</label><input id="${id}" type="${type}" value="${esc(val)}" ${attr}></div>`;
  $('g-main').innerHTML=`<div class="g-tete"><div><h1>Réglages</h1><p>Tout ce que vos clients voient sur le site. Changez, enregistrez : c'est en ligne tout de suite.</p></div><button class="g-btn or" type="button" id="r-ok">Enregistrer les réglages</button></div>
  <div class="r-grille">
    <section class="g-carte"><h2>Votre agence</h2><div class="grille2">${c('r-nom','Nom',AG.nom)}${c('r-tel','Téléphone',AG.tel,'tel')}${c('r-wa','WhatsApp (reçoit les réservations)',AG.wa,'tel')}${c('r-adr','Adresse',AG.adresse)}</div>${c('r-hor','Horaires',AG.horaires)}
      <div class="champ"><label for="r-ann">Bandeau d'annonce en haut du site (vide = caché)</label><input id="r-ann" value="${esc(AG.annonce)}" placeholder="Ex. Promo été : -10 % sur les SUV jusqu'au 31 août"></div></section>
    <section class="g-carte"><h2>Règles de location</h2><div class="grille2">${c('r-km','Kilomètres inclus par jour',RG.km,'number','min="0" step="10"')}${c('r-pkm','Prix du km en plus (DA)',RG.prixKm,'number','min="0"')}${c('r-p8','Carburant manquant, par 1/8 (DA)',RG.prix8e,'number','min="0" step="100"')}${c('r-jeune','Supplément jeune conducteur / jour (DA)',RG.jeune,'number','min="0" step="100"')}${c('r-age','Âge minimum',RG.ageMin,'number','min="18" max="30"')}${c('r-perm','Ancienneté du permis (ans)',RG.permis,'number','min="0" max="10"')}</div></section>
    <section class="g-carte"><h2>Lieux et frais de livraison</h2>${Object.entries(LIEUX).map(([k,l])=>`<div class="r-ligne"><label class="opt"><input type="checkbox" id="r-l-${k}-on" ${l.off?'':'checked'}><span>Proposer</span></label>${c('r-l-'+k+'-n','Nom affiché',l.n)}${c('r-l-'+k+'-f','Frais (DA)',l.f,'number','min="0" step="100"')}</div>`).join('')}</section>
    <section class="g-carte"><h2>Options</h2>${Object.entries(OPTS).map(([k,o])=>`<div class="r-ligne r-opt"><label class="opt"><input type="checkbox" id="r-o-${k}-on" ${o.off?'':'checked'}><span>Proposer</span></label>${c('r-o-'+k+'-n','Nom',o.n)}${c('r-o-'+k+'-p','Prix (DA)',o.p,'number','min="0" step="100"')}<label class="opt"><input type="checkbox" id="r-o-${k}-j" ${o.jour?'checked':''}><span>Par jour</span></label></div>`).join('')}</section>
    <section class="g-carte"><h2>Protections</h2>${Object.entries(PROTECTIONS).map(([k,p])=>`<div class="r-ligne">${c('r-p-'+k+'-n','Nom',p.n)}${c('r-p-'+k+'-t','Prix en % du prix/jour',Math.round(p.taux*100),'number','min="0" max="100"')}${c('r-p-'+k+'-f','Franchise en % de la caution',Math.round(p.fr*100),'number','min="0" max="100"')}${c('r-p-'+k+'-c','Caution demandée en %',Math.round((p.cau||1)*100),'number','min="0" max="100"')}</div>`).join('')}</section>
    <section class="g-carte"><h2>Remises longue durée</h2>${REMISES.slice().sort((a,b)=>a[0]-b[0]).map((r,i)=>`<div class="r-ligne">${c('r-r-'+i+'-j','À partir de (jours)',r[0],'number','min="1"')}${c('r-r-'+i+'-p','Remise (%)',Math.round(r[1]*100),'number','min="0" max="90"')}</div>`).join('')}</section>
    <section class="g-carte r-large"><h2>Conditions générales de location</h2><p class="petit gris">Les mots entre accolades se remplacent tout seuls par vos réglages : {km}, {prixKm}, {prix8e}, {age}, {permis}, {jeune}, {tel}.</p>
      ${CGL.map(([h,p],i)=>`<details class="r-cgl"><summary>${pad(i+1)} · ${esc(h)}</summary>${c('r-c-'+i+'-h','Titre',h)}<div class="champ"><label for="r-c-${i}-p">Texte</label><textarea id="r-c-${i}-p" rows="4">${esc(p)}</textarea></div></details>`).join('')}</section>
  </div>
  <div class="r-pied"><button class="g-btn clair" type="button" id="r-raz">Revenir aux réglages d'origine</button><button class="g-btn or" type="button" id="r-ok2">Enregistrer les réglages</button></div>`;
  const ok=()=>{const v=id=>$(id).value.trim(),n=id=>+$(id).value||0;
    if(chiffres(v('r-wa')).length<9){toast('Numéro WhatsApp incomplet');$('r-wa').focus();return}
    Object.assign(AG,{nom:v('r-nom')||'Samir Drive',tel:v('r-tel'),wa:v('r-wa'),adresse:v('r-adr'),horaires:v('r-hor'),annonce:v('r-ann')});
    Object.assign(RG,{km:n('r-km'),prixKm:n('r-pkm'),prix8e:n('r-p8'),jeune:n('r-jeune'),ageMin:n('r-age')||18,permis:n('r-perm')});
    for(const k in LIEUX)Object.assign(LIEUX[k],{off:!$('r-l-'+k+'-on').checked,n:v('r-l-'+k+'-n')||LIEUX[k].n,f:n('r-l-'+k+'-f')});
    if(Object.values(LIEUX).every(l=>l.off))LIEUX.agence.off=false;
    for(const k in OPTS)Object.assign(OPTS[k],{off:!$('r-o-'+k+'-on').checked,n:v('r-o-'+k+'-n')||OPTS[k].n,p:n('r-o-'+k+'-p'),jour:$('r-o-'+k+'-j').checked});
    for(const k in PROTECTIONS)Object.assign(PROTECTIONS[k],{n:v('r-p-'+k+'-n')||PROTECTIONS[k].n,taux:n('r-p-'+k+'-t')/100,fr:n('r-p-'+k+'-f')/100,cau:n('r-p-'+k+'-c')/100});
    const rem=REMISES.map((r,i)=>{const j=n('r-r-'+i+'-j')||1,p=n('r-r-'+i+'-p')/100;return [j,p,j+' jours et +']}).sort((a,b)=>b[0]-a[0]);
    rem.forEach((r,i)=>{const sup=rem[i-1];r[2]=sup?`${r[0]} à ${sup[0]-1} jours`:`${r[0]} jours et +`});REMISES.splice(0,REMISES.length,...rem);
    CGL.forEach((x,i)=>{x[0]=v('r-c-'+i+'-h')||x[0];x[1]=$('r-c-'+i+'-p').value.trim()||x[1]});
    S.conf=conf();sauver();diffuser();toast('Réglages enregistrés · le site est à jour');pReglages()};
  $('r-ok').onclick=$('r-ok2').onclick=ok;
  $('r-raz').onclick=()=>{appliquerConf(JSON.parse(JSON.stringify(CONF0)));delete S.conf;sauver();diffuser();toast('Réglages d\'origine rétablis');pReglages()};
}
let tt;function toast(m){const x=$('toast');x.textContent=m;x.classList.add('vu');clearTimeout(tt);tt=setTimeout(()=>x.classList.remove('vu'),2800)}
function entrer(){document.body.classList.add('loueur');aller(page)}
function sortir(){document.body.classList.remove('loueur');majSite()}

document.addEventListener('click',e=>{
  const b=e.target.closest('button,a');if(!b)return;
  if(b.dataset.loueur!==undefined){if(ss.get('sd-ok')){entrer();return}$('pin-in').value='';$('pin-err').textContent='';$('pin').showModal();return}
  if(!document.body.classList.contains('loueur'))return;
  if(b.id==='g-site'||b.id==='g-logo'){e.preventDefault();sortir();return}
  if(b.id==='g-raz'){try{localStorage.removeItem(CLE)}catch(_){}S=null;charger();toast('Démo remise à zéro');aller('accueil');return}
  if(b.id==='g-ajout'){ajoutTel();return}
  if(b.dataset.page){if(M.open)M.close();aller(b.dataset.page);return}
  if(b.dataset.fr){filtreResa=b.dataset.fr;pResas();return}
  if(b.dataset.client){ficheClient(b.dataset.client);return}
  if(b.dataset.conf){const r=S.resas.find(x=>x.id===b.dataset.conf);r.statut='confirmee';r.nouv=false;sauver();diffuser();toast(r.id+' confirmée · envoyez le message WhatsApp au client');if(M.open)M.close();aller(page);return}
  if(b.dataset.ann){const r=S.resas.find(x=>x.id===b.dataset.ann);r.statut='annulee';sauver();diffuser();if(M.open)M.close();toast(r.id+' refusée');aller(page);return}
  if(b.dataset.docok){const r=S.resas.find(x=>x.id===b.dataset.docok);r.docsOk=true;sauver();detail(r.id);toast('Documents vérifiés');return}
  if(b.dataset.remise){remise(b.dataset.remise);return}
  if(b.dataset.retour){retour(b.dataset.retour);return}
  if(b.dataset.det){detail(b.dataset.det);return}
  if(b.dataset.contrat){contrat(b.dataset.contrat);return}
  if(b.dataset.cb){b.parentElement.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));return}
  if(b.dataset.type){TYPE=b.dataset.type;b.parentElement.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));return}
  if(b.dataset.deldom){DOM.splice(+b.dataset.deldom,1);majSchema();onDom&&onDom();return}
  if(b.dataset.px){const v=V(b.dataset.px),n=+$('px-'+v.id).value;if(n>=1000){v.prix=n;sauver();diffuser();toast('Prix mis à jour sur le site : '+fmt(n)+' / jour')}return}
  if(b.dataset.edit!==undefined){editVoiture(b.dataset.edit);return}
  if(b.dataset.phd){PH.splice(+b.dataset.phd,1);majPhotos();return}
  if(b.dataset.phg){const i=+b.dataset.phg;[PH[i-1],PH[i]]=[PH[i],PH[i-1]];majPhotos();return}
  if(b.dataset.vid){const v=V(b.dataset.vid);v.vid=v.km+10000;sauver();toast('Vidange enregistrée · prochaine à '+nb(v.vid)+' km');pFlotte();return}
  if(b.dataset.gar){const v=V(b.dataset.gar);v.entretien=!v.entretien;sauver();diffuser();toast(v.entretien?v.nom+' au garage : retirée du site':v.nom+' de nouveau disponible');pFlotte();return}
});
$('f-pin').addEventListener('submit',e=>{e.preventDefault();if($('pin-in').value===PIN){ss.set('sd-ok','1');$('pin').close();entrer()}else{$('pin-err').textContent='Code incorrect';$('pin-in').select()}});
try{new BroadcastChannel('sd').onmessage=()=>{charger();if(document.body.classList.contains('loueur'))aller(page);else majSite()}}catch(e){}
if(location.hash==='#loueur'&&ss.get('sd-ok'))entrer();
