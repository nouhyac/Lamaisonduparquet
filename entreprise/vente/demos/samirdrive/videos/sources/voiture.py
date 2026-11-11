# Vidéo par voiture (13 s, 9:16) : clip studio animé + vraies photos + fiche prix + WhatsApp. Prix modifiables dans CARS.
import subprocess as sp, json, sys, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
D=os.path.dirname(os.path.abspath(__file__));O=D+'/out/';os.makedirs(O,exist_ok=True)
FL='/home/user/Lamaisonduparquet/entreprise/vente/demos/samirdrive/site/img/flotte/'
PUB='/tmp/claude-0/-home-user-Lamaisonduparquet/2b12aa86-da61-5f7a-876b-2b76524a1083/scratchpad/pub/'
F='/usr/share/fonts/opentype/inter/InterDisplay-%s.otf'
CARS=json.load(open(D+'/cars.json'))
OR=(212,175,97,255);BL=(245,241,232,255);GR=(190,184,170,255)
def run(c):
    r=sp.run(c,capture_output=True,text=True)
    if r.returncode:print(r.stderr[-1500:]);sys.exit(1)
def f(w,s):return ImageFont.truetype(F%w,s)
def ctr(d,y,t,fo,fill):
    w=d.textlength(t,font=fo);d.text(((1080-w)/2,y),t,font=fo,fill=fill)
def calque(nom,fn):
    im=Image.new('RGBA',(1080,1920),(0,0,0,0));fn(ImageDraw.Draw(im),im);im.save(O+nom);return O+nom
def fabrique(k,c):
    L=[]
    # 1. titre sur le clip studio (haut de l'image, zone noire)
    def t1(d,im):
        ctr(d,250,'SAMIR DRIVE PRÉSENTE',f('SemiBold',30),OR)
        y=310
        for l in c['titre']:ctr(d,y,l,f('Black',104 if len(l)<14 else 86),BL);y+=112
        if c.get('version'):ctr(d,y+10,c['version'].upper(),f('SemiBold',40),OR)
    L.append((calque(k+'-t1.png',t1),0.6,4.8))
    # 2. points forts sur les vraies photos
    n=len(c['points']);dd=4.6/n
    for i,(ph,p) in enumerate(c['points']):
        def tp(d,im,p=p,i=i):
            g=Image.new('L',(1080,1920),0);ImageDraw.Draw(g).rectangle((0,1350,1080,1920),fill=230);g=g.filter(ImageFilter.GaussianBlur(80))
            im.paste(Image.new('RGBA',im.size,(0,0,0,170)),(0,0),g);d=ImageDraw.Draw(im)
            d.text((80,1500),f'0{i+1}',font=f('SemiBold',34),fill=OR);d.text((80,1550),p,font=f('Black',74),fill=BL);d.rectangle((80,1650,200,1656),fill=OR)
        a=5.0+i*dd;L.append((calque(f'{k}-p{i}.png',tp),a+.1,a+dd))
    # 3. fiche finale
    def fin(d,im):
        g=Image.new('L',(1080,1920),0);gd=ImageDraw.Draw(g);gd.rectangle((0,0,1080,760),fill=235);gd.rectangle((0,1540,1080,1920),fill=235);g=g.filter(ImageFilter.GaussianBlur(70))
        im.paste(Image.new('RGBA',im.size,(0,0,0,200)),(0,0),g);d=ImageDraw.Draw(im)
        ctr(d,170,'SAMIR DRIVE',f('SemiBold',32),OR);y=220
        for l in c['titre']:ctr(d,y,l,f('Black',76),BL);y+=84
        if c.get('version'):ctr(d,y,c['version'],f('SemiBold',36),OR);y+=46
        y+=40;ctr(d,y,'À PARTIR DE',f('SemiBold',30),GR)
        ctr(d,y+36,f"{c['prix']:,}".replace(',',' ')+' DA',f('Black',116),OR)
        ctr(d,y+168,'par jour · assurance incluse',f('SemiBold',36),BL)
        fo=f('ExtraBold',50);t='WhatsApp · 0550 35 45 30';w=d.textlength(t,font=fo)
        d.rounded_rectangle(((1080-w)/2-44,1620,(1080+w)/2+44,1720),50,fill=(18,128,74,255));ctr(d,1640,t,fo,BL)
        ctr(d,1770,'Livraison aéroport 24 h/24 · Réservez en 2 minutes',f('SemiBold',32),GR)
    L.append((calque(k+'-fin.png',fin),9.6,13.0))
    return L
def video(k):
    c=CARS[k];clip=D+f'/clip-{k}.mp4';ph=[p[0] for p in c['points']]
    layers=fabrique(k,c);T=13.0
    ins=['-i',clip]
    for p in ph[:3]:ins+=['-loop','1','-t','2.4','-i',FL+p+'.jpg']
    ins+=['-loop','1','-t','3.4','-i',D+f'/{k}.png']
    n0=len(ph[:3])+2
    for l in layers:ins+=['-loop','1','-t',str(T),'-i',l[0]]
    fc=[f"[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,trim=0:5,setpts=PTS-STARTPTS,fps=30,setsar=1[a]"]
    segs=['[a]'];np_=len(ph[:3])
    for i in range(np_):  # photos : plein cadre, léger zoom
        fc.append(f"[{i+1}:v]split[b{i}][g{i}];[b{i}]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=40:2,eq=brightness=-0.22[bb{i}];[g{i}]scale=w='trunc(1080*(1.0+0.05*t)/2)*2':h=-2:eval=frame,eq=contrast=1.05:saturation=1.08[gg{i}];[bb{i}][gg{i}]overlay=x='(W-w)/2':y='(H-h)/2-140',fps=30,trim=0:{4.6/np_:.3f},setpts=PTS-STARTPTS,setsar=1[p{i}]");segs.append(f'[p{i}]')
    # fond fiche : image studio assombrie et floutée en haut
    fc.append(f"[{np_+1}:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,scale=w='trunc(1080*(1.0+0.025*t)/2)*2':h=-2:eval=frame,crop=1080:1920,eq=brightness=-0.12,fps=30,trim=0:3.4,setpts=PTS-STARTPTS,setsar=1[fd]");segs.append('[fd]')
    fc.append(''.join(segs)+f"concat=n={len(segs)}:v=1:a=0,setsar=1[base]")
    prev='[base]'
    for j,(p,a,b) in enumerate(layers):
        fc.append(f"[{n0+j}:v]format=rgba,fade=in:st={a}:d=0.35:alpha=1,fade=out:st={b-0.3}:d=0.3:alpha=1[l{j}]")
        fc.append(f"{prev}[l{j}]overlay=0:0:enable='between(t,{a},{b})'[o{j}]");prev=f'[o{j}]'
    fc.append(f"{prev}fade=in:st=0:d=0.4,vignette=PI/8,noise=alls=4:allf=t,format=yuv420p[v]")
    son=json.dumps({"L":T,"mus":[0.0,9.6],"fin":T,"voix":PUB+"voix-samir.wav","vo":[],
        "ev":[["boom",0.05,0.6],["whoosh",5.0]]+[["whoosh",5.0+i*4.6/len(ph)] for i in range(1,len(ph))]+[["riser",9.6,1.0],["boom",9.6,1.0],["tail",9.6,3.4]]})
    open(O+k+'-son.json','w').write(son)
    run(['python3',D+'/son3.py',O+k+'-son.json',O+k+'.wav'])
    run(['ffmpeg','-y','-v','error']+ins+['-i',O+k+'.wav','-filter_complex',';'.join(fc),'-map','[v]','-map',f'{n0+len(layers)}:a','-t',str(T),
         '-c:v','libx264','-preset','slow','-crf','19','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-af','afade=out:st=12.2:d=0.8','-movflags','+faststart',O+f'samir-drive-{k}.mp4'])
    print('ok',k)
for k in sys.argv[1:]:video(k)
