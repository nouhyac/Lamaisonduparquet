# Bande son synthétisée : arpèges de mandoline (Karplus-Strong), basse douce, crépitement du feu, effets aux moments clés.
import numpy as np, json, sys, wave
SR=44100
def ks(f,d,amp=.3,decay=.996):
    n=int(SR*d);N=max(2,int(SR/f));buf=np.random.uniform(-1,1,N);out=np.zeros(n)
    for i in range(n):
        out[i]=buf[i%N];buf[i%N]=decay*.5*(buf[i%N]+buf[(i+1)%N])
    return out*amp
def env(n,a=.01,r=.3):
    e=np.ones(n);A=int(SR*a);R=int(SR*r);e[:A]=np.linspace(0,1,A);e[-R:]*=np.linspace(1,0,R);return e
def sine(f,d,amp):
    t=np.arange(int(SR*d))/SR;return np.sin(2*np.pi*f*t)*amp
def put(buf,s,t):
    i=int(t*SR);j=min(len(buf),i+len(s))
    if i<len(buf): buf[i:j]+=s[:j-i]
def musique(L,bpm=96,debut=0.0,fin=None):
    b=np.zeros(int(SR*L));beat=60/bpm;fin=fin or L
    N={'A3':220,'C4':261.63,'E4':329.63,'A4':440,'F3':174.61,'A3b':220,'C5':523.25,'G3':196,'B3':246.94,'D4':293.66,'G4':392,'E3':164.81,'G#3':207.65,'B4':493.88,'D5':587.33,'E5':659.25,'F4':349.23}
    prog=[('A',[220,261.63,329.63,440,329.63,261.63,329.63,440],110),('F',[174.61,220,261.63,349.23,261.63,220,261.63,349.23],87.31),('C',[130.81*2,329.63,392,523.25,392,329.63,392,523.25],130.81),('E',[164.81,207.65,246.94,329.63,246.94,207.65,246.94,329.63],82.41)]
    cache={}
    t=debut;k=0
    while t<fin-0.2:
        nom,arp,basse=prog[k%4]
        for j,f in enumerate(arp):
            tt=t+j*beat/2
            if tt>=fin-0.1: break
            key=round(f,2)
            if key not in cache: cache[key]=ks(f,1.1,.16)
            put(b,cache[key]*(1.0 if j%2==0 else .7),tt)
        bs=sine(basse,beat*4,.09)*env(int(SR*beat*4),.02,1.2);put(b,bs,t)
        # tambourin léger
        for j in range(8):
            if j%2==1:
                n=np.random.uniform(-1,1,int(SR*.06))*np.exp(-np.linspace(0,9,int(SR*.06)))*.035;put(b,n,t+j*beat/2)
        t+=beat*4;k+=1
    # fondu
    fi=int(SR*0.8);b[int(debut*SR):int(debut*SR)+fi]*=np.linspace(0,1,min(fi,len(b)-int(debut*SR)))
    fo=int(SR*1.6);e=int(fin*SR);b[max(0,e-fo):e]*=np.linspace(1,0,min(fo,e))
    b[e:]=0
    return b
def feu(d,amp=.12):
    n=int(SR*d);x=np.random.uniform(-1,1,n)*.25
    # grondement filtré
    k=np.ones(200)/200;x=np.convolve(x,k,'same')*3
    for _ in range(int(d*14)):
        i=np.random.randint(0,n-2000);L=np.random.randint(80,600);x[i:i+L]+=np.random.uniform(-1,1,L)*np.exp(-np.linspace(0,8,L))*np.random.uniform(.3,1)
    return x*amp*env(n,.3,.8)
def carillon():
    s=np.zeros(int(SR*1.2))
    for i,f in enumerate([1318.5,1760,2093]):
        put(s,sine(f,.9,.14)*np.exp(-np.linspace(0,6,int(SR*.9))),i*.13)
    return s
def imprimante():
    s=np.zeros(int(SR*1.4))
    for i in range(22):
        n=np.random.uniform(-1,1,int(SR*.03))*np.exp(-np.linspace(0,5,int(SR*.03)))*.06;put(s,n,i*.055)
    return s
def whoosh():
    n=int(SR*.9);x=np.random.uniform(-1,1,n);k=np.ones(30)/30;x=np.convolve(x,k,'same');return x*np.sin(np.linspace(0,np.pi,n))*.35
def ding():
    return sine(1567.98,1.0,.16)*np.exp(-np.linspace(0,5,int(SR*1.0)))+sine(2093,1.0,.07)*np.exp(-np.linspace(0,7,int(SR*1.0)))
def accord():
    s=np.zeros(int(SR*2.5))
    for i,f in enumerate([220,277.18,329.63,440,554.37]):
        put(s,ks(f,2.3,.14,.998),i*.06)
    return s
if __name__=='__main__':
    cfg=json.load(open(sys.argv[1]));L=cfg['L']
    b=musique(L,debut=cfg.get('mus0',0.0),fin=cfg.get('mus1',L))*cfg.get('mvol',1.0)
    for typ,t in cfg['ev']:
        put(b,{'feu':lambda:feu(cfg.get('feuD',5)),'carillon':carillon,'imprimante':imprimante,'whoosh':whoosh,'ding':ding,'accord':accord,'four':lambda:np.concatenate([whoosh(),feu(2.2,.1)])}[typ](),t)
    b=b/max(1e-6,np.abs(b).max())*.85
    st=np.stack([b,b],1);d=(st*32767).astype(np.int16)
    with wave.open(sys.argv[2],'wb') as w: w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes(d.tobytes())
