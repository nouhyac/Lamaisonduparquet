const {appliquer}=require('./neutre');const fs=require('fs'),path=require('path'),cp=require('child_process');
const S={woodpecker:'../../../vente/demos/woodpecker/site',brew:'../../../vente/demos/brew/site'};
const BAD=/wood ?pecker|draria|brew(?!_| ?\(|[a-z])|baraka|alger|algérie|\boran\b|وود|بيكر|الدرارية|instagram\.com|0770 17|0770158841|0770 15 88 41|Démo réalisée/i;
for(const [s,dir] of Object.entries(S)){for(const f of cp.execSync('find '+dir+' -name "*.js" -o -name "*.html" -o -name "*.css"').toString().trim().split('\n')){
 const t=appliquer(fs.readFileSync(f,'utf8'),s);
 if(f.endsWith('.js')){fs.writeFileSync('/tmp/_c.js',t);try{cp.execSync('node --check /tmp/_c.js')}catch(e){console.log('SYNTAX',f)}}
 t.split('\n').forEach((l,i)=>{if(BAD.test(l)&&!/^\s*(\/\/|\/\*|\*)/.test(l))console.log(s,path.basename(f),i+1,l.trim().slice(0,140))})}}
