import numpy as np, wave, sys
sys.path.insert(0,'.')
import son
SR=44100
def lire(f):
    with wave.open(f) as w: d=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32)/32768
    return d
L=39.6;N=int(L*SR)
v=lire('voix.wav');voix=np.zeros(N);voix[:min(N,len(v))]=v[:N]
mus=son.musique(L,bpm=100,debut=6.4,fin=L)
# sonnerie de téléphone (440 + 480 Hz, 2 s on / 1 s off) pendant l'ouverture
ring=np.zeros(N)
for t0 in [0.15,2.9]:
    n=int(SR*1.6);t=np.arange(n)/SR;r=(np.sin(2*np.pi*440*t)+np.sin(2*np.pi*480*t))*0.11*(np.sin(2*np.pi*20*t)>0)
    son.put(ring,r*son.env(n,.01,.1),t0)
fx=np.zeros(N)
for typ,t in [('whoosh',6.5),('carillon',15.6),('imprimante',16.1),('whoosh',20.6),('whoosh',26.2),('ding',26.7),('ding',29.4),('accord',33.4)]:
    son.put(fx,{'whoosh':son.whoosh,'carillon':son.carillon,'imprimante':son.imprimante,'ding':son.ding,'accord':son.accord}[typ](),t)
# la musique s'efface sous la voix (ducking)
env=np.abs(voix);k=int(SR*0.25);env=np.convolve(env,np.ones(k)/k,'same');duck=1-0.6*np.clip(env/0.05,0,1)
m=mus/max(1e-6,np.abs(mus).max())*0.32*duck
out=voix/max(1e-6,np.abs(voix).max())*0.92+m+ring+fx*0.8
out=out/max(1,np.abs(out).max())*0.95
st=(np.stack([out,out],1)*32767).astype(np.int16)
with wave.open('pub-son.wav','wb') as w: w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes(st.tobytes())
