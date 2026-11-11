const {chromium}=require('playwright');const {neutre}=require('./neutre');
const w=ms=>new Promise(r=>setTimeout(r,ms));
// horloge décalée : restaurant ouvert (20 h 20, heure locale)
const HEURE=(h)=>`(()=>{const OFF=new Date('2026-11-10T${h}:00+01:00').getTime()-Date.now();const _D=Date;class D extends _D{constructor(...a){if(a.length===0)super(_D.now()+OFF);else super(...a)}static now(){return _D.now()+OFF}};window.Date=D})()`;
const TEL={viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,timezoneId:'Africa/Algiers',locale:'fr-FR'};
const PC={viewport:{width:1440,height:900},deviceScaleFactor:1.5,timezoneId:'Africa/Algiers',locale:'fr-FR'};
async function contexte(b,opts,site,racine,h='20:20'){const ctx=await b.newContext(opts);await ctx.addInitScript(HEURE(h));await neutre(ctx,site,racine);return ctx}
const lisse=(p,y,ms)=>p.evaluate(([y,ms])=>new Promise(res=>{const y0=scrollY,t0=performance.now();(function g(t){const k=Math.min(1,(t-t0)/ms);scrollTo(0,y0+(y-y0)*(k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2));k<1?requestAnimationFrame(g):res()})(t0)}),[y,ms]);
module.exports={chromium,w,TEL,PC,contexte,lisse,EXE:'/opt/pw-browsers/chromium'};
