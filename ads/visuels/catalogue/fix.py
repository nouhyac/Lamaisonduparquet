"""Fiches décors du client : prix retirés, WhatsApp 0794 70 93 23, plus de « Représentant EGGER »."""
from PIL import Image, ImageDraw, ImageFont
import glob, os
FD='/tmp/claude-0/fonts/package/files/'
B=lambda s: ImageFont.truetype(FD+'poppins-latin-700-normal.woff', s)
S=lambda s: ImageFont.truetype(FD+'poppins-latin-600-normal.woff', s)
R=lambda s: ImageFont.truetype(FD+'poppins-latin-400-normal.woff', s)
DARK=(22,19,14); INK=(23,21,18)
def text_h(d,xy,t,f,fill,anchor='ls'): d.text(xy,t,font=f,fill=fill,anchor=anchor)
def spaced(d,x_right,y,t,f,fill,tr):
    w=sum(f.getlength(c)+tr for c in t)-tr; x=x_right-w
    for c in t: d.text((x,y),c,font=f,fill=fill,anchor='ls'); x+=f.getlength(c)+tr
for src in sorted(glob.glob('src/*.jpg')):
    im=Image.open(src).convert('RGB'); d=ImageDraw.Draw(im); n=os.path.basename(src)
    if n.startswith('0-'):
        bg=(244,241,236)
        d.rectangle((55,1146,1035,1190),fill=bg)                       # prix sous les décors
        d.rectangle((660,40,1030,75),fill=bg)                          # « Représentant EGGER · Algérie »
        spaced(d,1018,64,'SARL MYF · LAMAISONDUPARQUET.ORG',S(15),(60,55,50),3.2)
        d.rectangle((760,1276,1035,1320),fill=DARK)                    # ancien numéro
        text_h(d,(768,1311),'0794 70 93 23',B(39),(255,255,255))
    else:
        bg=(246,243,238)
        d.rectangle((488,728,1030,815),fill=bg)                        # prix
        text_h(d,(492,782),'Devis gratuit',B(44),INK)
        text_h(d,(494,820),'lamaisonduparquet.org',R(26),(95,90,82))
        d.rectangle((566,952,1012,996),fill=DARK)                      # ancien numéro
        text_h(d,(574,985),'0794 70 93 23',B(34),(255,255,255))
    im.save('out/'+n,quality=94,subsampling=0)
print('ok')
