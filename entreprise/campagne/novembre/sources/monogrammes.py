# Monogrammes neutres (remplacent les logos des prospects pendant le tournage)
from PIL import Image, ImageDraw, ImageFont
import sys
F='/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf'
def mono(txt, fond, encre, out, taille=640, anneau=None):
    S=taille*2;im=Image.new('RGBA',(S,S),(0,0,0,0));d=ImageDraw.Draw(im)
    d.ellipse((0,0,S-1,S-1),fill=fond)
    if anneau:d.ellipse((S*.06,S*.06,S*.94,S*.94),outline=anneau,width=int(S*.012))
    f=ImageFont.truetype(F,int(S*.36));b=d.textbbox((0,0),txt,font=f)
    d.text(((S-(b[2]-b[0]))/2-b[0],(S-(b[3]-b[1]))/2-b[1]),txt,font=f,fill=encre)
    im.resize((taille,taille),Image.LANCZOS).save(out)
mono('LC',(20,18,15),(233,196,120),'logo-comptoir.png',anneau=(233,196,120))
mono('MC',(43,32,28),(245,236,220),'logo-maisoncafe.png',anneau=(245,236,220))
# photo neutre (remplace le sac kraft marqué)
im=Image.new('RGB',(780,872));d=ImageDraw.Draw(im)
for y in range(872):
    k=y/872;d.line([(0,y),(780,y)],fill=(int(120-50*k),int(86-40*k),int(60-30*k)))
lg=Image.open('logo-maisoncafe.png').resize((360,360));im.paste(lg,(210,256),lg);im.save('photo-maisoncafe.jpg',quality=92)
