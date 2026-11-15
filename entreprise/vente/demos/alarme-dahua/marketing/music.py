import numpy as np, wave
sr=44100; D=24.0; n=int(sr*D); out=np.zeros(n); rng=np.random.default_rng(3)
def env(L,a=.005,r=.3):
    x=np.arange(L)/sr; return np.minimum(1,x/a)*np.exp(-x/r)
def add(s,st):
    i=int(st*sr); j=min(n,i+len(s))
    if 0<=i<n: out[i:j]+=s[:j-i]
# 0-5.2 s : nappe grave + battements de cœur
L=int(5.2*sr); x=np.arange(L)/sr
drone=(np.sin(2*np.pi*55*x)+.5*np.sin(2*np.pi*82.4*x)+.25*np.sin(2*np.pi*110.3*x))*np.minimum(1,x/1.2)*.09
add(drone,0)
for b in np.arange(0.4,5.0,0.75):
    for k,dl in ((1,0),(0.6,0.18)):
        Lk=int(.25*sr); xk=np.arange(Lk)/sr; add(np.sin(2*np.pi*(60*np.exp(-xk*10)+40)*xk)*env(Lk,.002,.09)*.5*k,b+dl)
# grincement de porte (bruit filtré) à 1.0 s
Ln=int(1.2*sr); nz=rng.standard_normal(Ln); nz=np.convolve(nz,np.ones(40)/40,'same'); xn=np.arange(Ln)/sr
add(nz*np.sin(np.pi*xn/1.2)*.25*(1+np.sin(2*np.pi*7*xn)),1.0)
# bips d'alarme 2.7-5.0 s (deux tons)
t0=2.7
while t0<5.0:
    for f,dt in ((1250,0),(950,.18)):
        Lb=int(.16*sr); xb=np.arange(Lb)/sr; add(np.sign(np.sin(2*np.pi*f*xb))*np.minimum(1,xb/.005)*np.minimum(1,(.16-xb)/.01)*.07,t0+dt)
    t0+=.4
# vibration téléphone
Lv=int(1.6*sr); xv=np.arange(Lv)/sr; add(np.sin(2*np.pi*165*xv)*(np.sin(2*np.pi*9*xv)>0)*.08,2.8)
# montée 4.6-5.2 s
Lr=int(.6*sr); xr=np.arange(Lr)/sr; add(rng.standard_normal(Lr)*(xr/.6)**2*.12,4.6)
# 5.2-24 s : rythme + accords (confiance)
beat=60/104; ch=[[220,277.18,329.63],[185,233.08,277.18],[146.83,185,220],[164.81,207.65,246.94]]
bar=beat*4; k=0; t=5.2
while t<D:
    f=ch[k%4]; Lc=int(bar*sr); xc=np.arange(Lc)/sr
    pad=sum(np.sin(2*np.pi*q*xc)+.3*np.sin(4*np.pi*q*xc) for q in f)*np.minimum(1,xc/.3)*np.minimum(1,(bar-xc)/.3)*.045
    add(pad,t)
    for h in range(4):
        bt=t+h*beat
        Lk=int(.3*sr); xk=np.arange(Lk)/sr; add(np.sin(2*np.pi*np.cumsum(100*np.exp(-xk*20)+45)/sr)*env(Lk,.002,.11)*.6,bt)
        if h%2: Ls=int(.18*sr); add(rng.standard_normal(Ls)*env(Ls,.001,.05)*.15,bt)
        for e in (0,.5): Lh=int(.05*sr); hh=np.diff(np.concatenate([[0],rng.standard_normal(Lh)])); add(hh*env(Lh,.001,.012)*.06,bt+e*beat)
        bl=int(beat*sr); xb=np.arange(bl)/sr; add(np.sin(2*np.pi*f[0]/2*xb)*env(bl,.01,.35)*.2,bt)
    t+=bar; k+=1
# impact de révélation 5.2 s et 19.4 s
for ts in (5.2,19.4):
    Li=int(1.5*sr); xi=np.arange(Li)/sr; add((np.sin(2*np.pi*48*xi)*.8+rng.standard_normal(Li)*.15)*env(Li,.003,.5)*.6,ts)
fade=np.ones(n); fo=int(2*sr); fade[-fo:]=np.linspace(1,0,fo)
out*=fade; out/=np.max(np.abs(out))*1.12
w=wave.open('music.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((out*32767).astype(np.int16).tobytes()); w.close(); print('ok')
