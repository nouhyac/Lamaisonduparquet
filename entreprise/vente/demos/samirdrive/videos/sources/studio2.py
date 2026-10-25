import numpy as np
from PIL import Image,ImageDraw,ImageFilter,ImageEnhance
W,H=1100,825;FLOOR=int(H*.80)
def lay(k):
    c=Image.open(k+'.png').convert('RGBA');a=np.array(c.split()[3])
    T=a>100;ys,xs=np.where(T);b=(xs.min(),ys.min(),xs.max(),ys.max())
    tw,th=c.size;touch=dict(l=b[0]<=2,r=b[2]>=tw-3,t=b[1]<=2,bo=b[3]>=th-3)
    # érosion du masque : enlève le liseré du fond d'origine
    m=c.split()[3].filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(1.2));c.putalpha(m)
    c=c.crop(b);cw,ch=c.size
    s=min(W*.84/cw,H*.66/ch)
    if touch['l'] or touch['r']:s=max(s,min(W*.95/cw,H*.72/ch))
    c=c.resize((int(cw*s),int(ch*s)),Image.LANCZOS);cw,ch=c.size
    x=(W-cw)//2
    if touch['l']:x=0
    if touch['r']:x=W-cw
    y=FLOOR-ch
    if touch['t']:y=0;
    L=Image.new('RGBA',(W,H),(0,0,0,0));L.paste(c,(x,y));return L,touch,(x,y,x+cw,y+ch)
for k in ['livan-blanc','livan-gris','livan-argent','tcross-2']:
    L,touch,(x0,y0,x1,y1)=lay(k);bot=y1
    bg=Image.new('RGB',(W,H),(9,8,7));g=Image.new('L',(W,H),0);cx=(x0+x1)//2
    ImageDraw.Draw(g).ellipse((cx-560,bot-620,cx+560,bot+30),fill=255);g=g.filter(ImageFilter.GaussianBlur(130))
    bg=Image.composite(Image.new('RGB',(W,H),(128,90,36)),bg,g.point(lambda v:int(v*.8)))
    s=Image.new('L',(W,H),0);sd=ImageDraw.Draw(s);sd.rectangle((0,0,24,H),fill=220);sd.rectangle((W-24,0,W,H),fill=220);s=s.filter(ImageFilter.GaussianBlur(36))
    bg=Image.composite(Image.new('RGB',(W,H),(214,160,70)),bg,s.point(lambda v:int(v*.45)))
    fl=Image.new('L',(W,H),0);ImageDraw.Draw(fl).rectangle((0,bot-4,W,H),fill=170);fl=fl.filter(ImageFilter.GaussianBlur(10))
    bg=Image.composite(Image.new('RGB',(W,H),(6,5,4)),bg,fl).convert('RGBA')
    # ligne de lumière du sol
    hl=Image.new('L',(W,H),0);ImageDraw.Draw(hl).rectangle((0,bot-1,W,bot+1),fill=120);hl=hl.filter(ImageFilter.GaussianBlur(3))
    bg=Image.composite(Image.new('RGBA',(W,H),(200,150,70,255)),bg,hl)
    # reflet miroir autour de la ligne du sol
    R=Image.new('RGBA',(W,H),(0,0,0,0));R.paste(L.transpose(Image.FLIP_TOP_BOTTOM),(0,2*bot-H+1))
    ar=np.array(R.split()[3]).astype(float);yy=np.arange(H)[:,None]-bot
    R.putalpha(Image.fromarray((ar*np.where(yy>0,np.clip(.30*(1-yy/150),0,.3),0)).astype(np.uint8)));R=R.filter(ImageFilter.GaussianBlur(1.5))
    bg.alpha_composite(R)
    o=Image.new('L',(W,H),0);ImageDraw.Draw(o).ellipse((x0+30,bot-18,x1-30,bot+12),fill=235);o=o.filter(ImageFilter.GaussianBlur(12))
    bg=Image.composite(Image.new('RGBA',(W,H),(0,0,0,255)),bg,o)
    cc=ImageEnhance.Contrast(L.convert('RGB')).enhance(1.06).convert('RGBA');cc.putalpha(L.split()[3])
    # lumière chaude douce sur la carrosserie (côté gauche), pas de halo
    warm=Image.new('RGBA',(W,H),(255,190,110,0));gr=np.tile(np.clip(1-np.arange(W)/W*1.6,0,1)[None,:]*38,(H,1)).astype(np.uint8)
    wa=(np.array(L.split()[3]).astype(float)/255*gr).astype(np.uint8);warm.putalpha(Image.fromarray(wa))
    bg.alpha_composite(cc);bg.alpha_composite(warm)
    v=Image.new('L',(W,H),0);ImageDraw.Draw(v).ellipse((-260,-200,W+260,H+200),fill=255);v=v.filter(ImageFilter.GaussianBlur(170))
    Image.composite(bg.convert('RGB'),Image.new('RGB',(W,H),(0,0,0)),v).save(f'{k}-studio.jpg',quality=88,optimize=True)
    print(k,touch)
t=Image.new('RGB',(1600,1200))
for i,k in enumerate(['livan-blanc','livan-gris','livan-argent','tcross-2']):t.paste(Image.open(f'{k}-studio.jpg').resize((800,600)),((i%2)*800,(i//2)*600))
t.save('/tmp/stu.jpg')
