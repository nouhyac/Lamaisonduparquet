# Montage pub TV 1080x1920 : segments ffmpeg, maquette téléphone/ordinateur, sous-titres, étalonnage, grain, son.
import subprocess as sp, json, sys, os
from PIL import Image, ImageDraw, ImageFilter, ImageFont
D=os.path.dirname(os.path.abspath(__file__));O=D+'/out/';os.makedirs(O,exist_ok=True)
F='/usr/share/fonts/opentype/inter/InterDisplay-%s.otf'
def run(c):
    r=sp.run(c,capture_output=True,text=True)
    if r.returncode:print(' '.join(c));print(r.stderr[-2000:]);sys.exit(1)
def fond(src,nom):  # fond flouté sombre + lueur or
    im=Image.open(src).convert('RGB').resize((1080,1920));im=im.filter(ImageFilter.GaussianBlur(38))
    im=Image.blend(im,Image.new('RGB',im.size,(8,7,6)),.62)
    g=Image.new('L',(1080,1920),0);ImageDraw.Draw(g).ellipse((90,500,990,1500),fill=120);g=g.filter(ImageFilter.GaussianBlur(160))
    im=Image.composite(Image.new('RGB',im.size,(150,115,55)),im,g.point(lambda v:v*.5));im.save(O+nom)
def tel():  # cadre téléphone + masque arrondi
    W,H=700,1515;b=22
    m=Image.new('L',(W,H),0);ImageDraw.Draw(m).rounded_rectangle((0,0,W-1,H-1),64,fill=255);m.save(O+'masque.png')
    fr=Image.new('RGBA',(W+2*b+80,H+2*b+80),(0,0,0,0));d=ImageDraw.Draw(fr)
    sh=Image.new('L',fr.size,0);ImageDraw.Draw(sh).rounded_rectangle((40,60,W+2*b+40,H+2*b+60),88,fill=170);sh=sh.filter(ImageFilter.GaussianBlur(30))
    fr=Image.composite(Image.new('RGBA',fr.size,(0,0,0,200)),fr,sh);d=ImageDraw.Draw(fr)
    d.rounded_rectangle((40,40,W+2*b+40,H+2*b+40),86,fill=(18,18,20,255),outline=(120,100,70,255),width=3)
    d.rounded_rectangle((40+b,40+b,40+b+W-1,40+b+H-1),64,fill=(0,0,0,0))
    # trou de l'écran transparent
    hole=Image.new('L',fr.size,0);ImageDraw.Draw(hole).rounded_rectangle((40+b,40+b,40+b+W-1,40+b+H-1),64,fill=255)
    a=fr.split()[3];a=Image.composite(Image.new('L',fr.size,0),a,hole);fr.putalpha(a)
    ImageDraw.Draw(fr).rounded_rectangle((40+b+W//2-70,40+b+18,40+b+W//2+70,40+b+52),17,fill=(0,0,0,255))
    fr.save(O+'tel.png')
def pc():  # écran d'ordinateur
    W,H=1000,625;b=16
    fr=Image.new('RGBA',(W+2*b+80,H+2*b+130),(0,0,0,0));d=ImageDraw.Draw(fr)
    d.rounded_rectangle((40,40,W+2*b+40,H+2*b+40),26,fill=(18,18,20,255),outline=(120,100,70,255),width=3)
    hole=Image.new('L',fr.size,0);ImageDraw.Draw(hole).rectangle((40+b,40+b,40+b+W-1,40+b+H-1),fill=255)
    a=fr.split()[3];a=Image.composite(Image.new('L',fr.size,0),a,hole);fr.putalpha(a)
    d=ImageDraw.Draw(fr);d.polygon([(0,H+2*b+40),(W+2*b+80,H+2*b+40),(W+2*b+40,H+2*b+100),(40,H+2*b+100)],fill=(40,38,36,255))
    fr.save(O+'pc.png')
def legende(nom,txt,pos='bas',sur=None,taille=66):
    im=Image.new('RGBA',(1080,1920),(0,0,0,0));d=ImageDraw.Draw(im)
    fb=ImageFont.truetype(F%'Black',taille);fs=ImageFont.truetype(F%'SemiBold',30)
    lignes=txt.split('\n');lh=int(taille*1.12);H=lh*len(lignes)+(52 if sur else 0)
    y0=1480 if pos=='bas' else 150
    if pos=='bas':
        g=Image.new('L',(1080,1920),0);ImageDraw.Draw(g).rectangle((0,y0-160,1080,1920),fill=200);g=g.filter(ImageFilter.GaussianBlur(90))
        im=Image.composite(Image.new('RGBA',im.size,(0,0,0,150)),im,g);d=ImageDraw.Draw(im)
    y=y0
    if sur:
        d.text((80,y),sur.upper(),font=fs,fill=(212,175,97,255),spacing=0);y+=52
    for l in lignes:
        d.text((83,y+4),l,font=fb,fill=(0,0,0,140));d.text((80,y),l,font=fb,fill=(245,241,232,255));y+=lh
    d.rectangle((80,y+14,200,y+20),fill=(212,175,97,255))
    im.save(O+nom)
def seg(i,s):
    src=D+'/'+s['src'];d=s['d'];ss=s.get('ss',0);sp_=s.get('x',1);out=O+'s%02d.mp4'%i
    inp=['-ss',str(ss),'-i',src]
    lent=f"setpts=PTS/{sp_}," if sp_!=1 else ''
    t=s['t']
    if t=='ia':
        z=s.get('z',.035)
        vf=f"{lent}scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,scale=w='trunc(1080*(1+{z}*t)/2)*2':h=-2:eval=frame,crop=1080:1920"
        cmd=['ffmpeg','-y','-v','error']+inp+['-t',str(d),'-vf',vf+',fps=30,format=yuv420p']
    elif t=='va':
        vf=f"{lent}scale=1080:-2,crop=1080:1920:0:'(ih-1920)*0.45',scale=w='trunc(1080*(1+0.03*t)/2)*2':h=-2:eval=frame,crop=1080:1920"
        cmd=['ffmpeg','-y','-v','error']+inp+['-t',str(d),'-vf',vf+',fps=30,format=yuv420p']
    elif t=='plein':
        cmd=['ffmpeg','-y','-v','error']+inp+['-t',str(d),'-vf',f'{lent}scale=1080:1920,fps=30,format=yuv420p']
    elif t=='tel':
        fc=(f"[1:v]{lent}scale=700:1515,format=rgba[e];[2:v]format=gray,scale=700:1515[m];[e][m]alphamerge[em];"
            f"[0:v]scale=w='trunc(1080*(1+0.02*t)/2)*2':h=-2:eval=frame,crop=1080:1920[bg];"
            f"[bg][em]overlay=x=190:y='{s.get('y',300)}+if(lt(t,0.4),(1-t/0.4)^2*260,0)':shortest=0[a];"
            f"[a][3:v]overlay=x=128:y='{s.get('y',300)}-62+if(lt(t,0.4),(1-t/0.4)^2*260,0)',fps=30,format=yuv420p[v]")
        cmd=['ffmpeg','-y','-v','error','-loop','1','-t',str(d),'-i',O+s['fond']]+inp+['-loop','1','-i',O+'masque.png','-loop','1','-i',O+'tel.png','-filter_complex',fc,'-map','[v]','-t',str(d)]
    elif t=='pc':
        fc=(f"[1:v]{lent}scale=1000:625[e];[0:v]scale=w='trunc(1080*(1+0.02*t)/2)*2':h=-2:eval=frame,crop=1080:1920[bg];"
            f"[bg][e]overlay=x=40:y='{s.get('y',640)}+if(lt(t,0.4),(1-t/0.4)^2*200,0)'[a];"
            f"[a][2:v]overlay=x=-16:y='{s.get('y',640)}-56+if(lt(t,0.4),(1-t/0.4)^2*200,0)',fps=30,format=yuv420p[v]")
        cmd=['ffmpeg','-y','-v','error','-loop','1','-t',str(d),'-i',O+s['fond']]+inp+['-loop','1','-i',O+'pc.png','-filter_complex',fc,'-map','[v]','-t',str(d)]
    run(cmd+['-an','-c:v','libx264','-preset','fast','-crf','16','-r','30',out]);return out
cfg=json.load(open(sys.argv[1]));nom=cfg['nom']
tel();pc()
for f,src in cfg.get('fonds',{}).items():fond(D+'/'+src,f)
outs=[(O+'s%02d.mp4'%i if os.environ.get('RAPIDE') and 0 else seg(i,s)) for i,s in enumerate(cfg['segs'])]
open(O+'liste.txt','w').write(''.join(f"file '{o}'\n" for o in outs))
run(['ffmpeg','-y','-v','error','-f','concat','-safe','0','-i',O+'liste.txt','-c','copy',O+nom+'-brut.mp4'])
L=sum(s['d'] for s in cfg['segs'])
# légendes
ins=[];fc=[];prev='[0:v]'
for k,c in enumerate(cfg['caps']):
    p=f'cap-{nom}-{k}.png';legende(p,c['txt'],c.get('pos','bas'),c.get('sur'),c.get('taille',66))
    ins+=['-loop','1','-t',str(L),'-i',O+p];a,b=c['a'],c['b']
    fc.append(f"[{k+1}:v]format=rgba,fade=in:st={a}:d=0.25:alpha=1,fade=out:st={b-0.25}:d=0.25:alpha=1[c{k}]")
    fc.append(f"{prev}[c{k}]overlay=0:0:enable='between(t,{a},{b})'[o{k}]");prev=f'[o{k}]'
fc.append(f"{prev}eq=contrast=1.06:saturation=1.05,vignette=PI/8,noise=alls=5:allf=t,format=yuv420p[v]")
n=len(cfg['caps'])+1
run(['python3',D+'/son2.py',sys.argv[1].replace('.json','-son.json'),O+nom+'.wav'])
run(['ffmpeg','-y','-v','error','-i',O+nom+'-brut.mp4']+ins+['-i',O+nom+'.wav','-filter_complex',';'.join(fc),'-map','[v]','-map',f'{n}:a','-t',str(L),
     '-c:v','libx264','-preset','slow','-crf','19','-profile:v','high','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart',O+nom+'.mp4'])
print('fini',O+nom+'.mp4',L)
