# Bande son « pub TV » : pulsation cinéma, basse ostinato, impacts, montées, whoosh, voix off placée + ducking.
import numpy as np, json, sys, wave
SR=44100
def lire(f):
    w=wave.open(f);n=w.getnframes();ch=w.getnchannels();sr=w.getframerate();d=np.frombuffer(w.readframes(n),np.int16).astype(float)/32768
    if ch==2:d=d.reshape(-1,2).mean(1)
    if sr!=SR:d=np.interp(np.arange(int(len(d)*SR/sr))*sr/SR,np.arange(len(d)),d)
    return d
def put(b,s,t):
    i=int(t*SR)
    if i<0:s=s[-i:];i=0
    j=min(len(b),i+len(s))
    if i<len(b):b[i:j]+=s[:j-i]
def lp(x,a):  # passe-bas 1 pôle (a petit = plus sourd)
    y=np.zeros_like(x);acc=0.
    # version vectorisée approchée par convolution exponentielle
    k=np.exp(-a*np.arange(int(5/a)+1)) if a>0 else np.ones(1);k/=k.sum()
    return np.convolve(x,k,'same')
def tt(d):return np.arange(int(SR*d))/SR
def kick():
    t=tt(.45);f=45+90*np.exp(-t*28);return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*7)*.9
def hat(a=.08):
    t=tt(.05);n=np.random.uniform(-1,1,len(t));n=n-lp(n,.5);return n*np.exp(-t*90)*a
def boom(a=1.):
    t=tt(2.6);f=38+70*np.exp(-t*9);s=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*1.6)
    n=np.random.uniform(-1,1,len(t));n=lp(n,.02)*np.exp(-t*3)*2.5
    return (s+n)*a
def riser(d=1.4,a=.5):
    t=tt(d);f=180+1400*(t/d)**2;s=np.sin(2*np.pi*np.cumsum(f)/SR)*.25
    n=np.random.uniform(-1,1,len(t));n=n-lp(n,.05)
    return (s+n*.6)*(t/d)**2.2*a
def whoosh(a=.45):
    t=tt(.7);n=np.random.uniform(-1,1,len(t));n=lp(n,.08);return n*np.sin(np.pi*t/.7)**2*a*3
def tick():
    t=tt(.03);return np.random.uniform(-1,1,len(t))*np.exp(-t*220)*.12
def scie(f,t):return 2*((t*f)%1)-1
def pad(freqs,d,a=.06):
    t=tt(d);s=sum(scie(f,t)+scie(f*1.004,t) for f in freqs);s=lp(lp(s,.01),.01)
    e=np.minimum(1,t/1.5)*np.minimum(1,(d-t)/1.2);return s*e*a
def reverb(x,d=1.8,mix=.25):
    t=tt(d);ir=np.random.uniform(-1,1,len(t))*np.exp(-t*3.2);ir=lp(ir,.15);ir/=np.abs(ir).sum()/6
    n=len(x)+len(ir);F=np.fft.rfft(x,n)*np.fft.rfft(ir,n);y=np.fft.irfft(F,n)[:len(x)]
    return x+y*mix
cfg=json.load(open(sys.argv[1]));L=cfg['L'];bpm=cfg.get('bpm',118);beat=60/bpm
m=np.zeros(int(SR*L));fx=np.zeros(int(SR*L))
m0,m1=cfg['mus']  # pulsation de m0 à m1
# accords (la mineur cinéma) : Am F C G
prog=[[110,164.81,220,261.63],[87.31,130.81,174.61,220],[130.81,196,261.63,329.63],[98,146.83,196,246.94]]
basse=[55,43.65,65.41,49]
t=0.;k=0
while t<L:
    put(m,pad(prog[k%4],beat*8+1,.05 if t<m0 else .07),t)
    if m0<=t<m1:
        for j in range(32):  # ostinato double-croches
            tj=t+j*beat/4
            if tj>=m1:break
            f=basse[k%4]*(2 if j%4==2 else 1);s=scie(f,tt(.16))*np.exp(-tt(.16)*22)*.16;put(m,lp(s,.08),tj)
        for j in range(8):
            tj=t+j*beat
            if tj>=m1:break
            if j%2==0 or cfg.get('dense'):put(m,kick()*.55,tj)
            put(m,hat(),tj+beat/2)
    t+=beat*8;k+=1
for ev in cfg['ev']:
    typ,tm=ev[0],ev[1];a=ev[2] if len(ev)>2 else 1
    if typ=='boom':put(fx,boom(a),tm)
    elif typ=='riser':put(fx,riser(a),tm-a)
    elif typ=='whoosh':put(fx,whoosh(),tm-.35)
    elif typ=='ticks':
        for i in range(int(a)):put(fx,tick(),tm+i*.08+np.random.uniform(0,.02))
    elif typ=='tail':put(m,pad([110,164.81,220,329.63,440],a,.09),tm)
# coupe la pulsation proprement avant m1 puis fondu final
f1=int(cfg.get('fin',L)*SR);m[f1:]*=0
fo=int(1.5*SR);m[f1-fo:f1]*=np.linspace(1,0,fo)
m=reverb(m,1.6,.3);fx=reverb(fx,2.2,.35)
# voix
v=np.zeros(int(SR*L));src=lire(cfg['voix'])
for a,b,tm in cfg['vo']:
    s=src[int(a*SR):int(b*SR)].copy();r=int(.02*SR);s[:r]*=np.linspace(0,1,r);s[-r:]*=np.linspace(1,0,r);put(v,s,tm)
v=v/np.abs(v).max()*.9
envv=lp(np.abs(v),.0008);envv=envv/envv.max();g=1-.68*np.clip(envv*6,0,1)
mus=(m/np.abs(m).max())*.55*g+fx/np.abs(fx).max()*.6*(1-.35*np.clip(envv*6,0,1))
out=v+mus;out=np.tanh(out*1.1)/np.tanh(1.1);out*=.95/np.abs(out).max()
st=np.stack([out,out],1);d=(st*32767).astype(np.int16)
with wave.open(sys.argv[2],'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes(d.tobytes())
print('ok',L)
