import numpy as np, wave
sr=44100; D=33.0; n=int(sr*D); out=np.zeros(n); rng=np.random.default_rng(11)
def env(L,a=.005,r=.3):
    x=np.arange(L)/sr; return np.minimum(1,x/a)*np.exp(-x/r)
def add(s,st):
    i=int(st*sr); j=min(n,i+len(s))
    if 0<=i<n: out[i:j]+=s[:j-i]
def pluck(f,L,amp):
    x=np.arange(L)/sr; return (np.sin(2*np.pi*f*x)+.45*np.sin(4*np.pi*f*x)+.2*np.sin(6*np.pi*f*x))*env(L,.004,.55)*amp
bpm=92; beat=60/bpm; bar=4*beat
prog=[[261.63,329.63,392.0],[196.0,246.94,293.66],[220.0,261.63,329.63],[174.61,220.0,261.63]]
k=0; t=0.0
while t<D:
    f=prog[k%4]; Lb=int(bar*sr); x=np.arange(Lb)/sr
    pad=sum(np.sin(2*np.pi*q*x) for q in f)*np.minimum(1,x/.5)*np.minimum(1,(bar-x)/.4)*.03; add(pad,t)
    for b8 in range(8):
        q=f[[0,1,2,1,2,1,0,2][b8]]*2; add(pluck(q,int(.6*sr),.06),t+b8*beat/2)
    if t>=3.4:
        for h in range(4):
            bt=t+h*beat
            if h in (0,2): Lk=int(.25*sr); xk=np.arange(Lk)/sr; add(np.sin(2*np.pi*np.cumsum(90*np.exp(-xk*22)+45)/sr)*env(Lk,.002,.1)*.4,bt)
            else: Ls=int(.15*sr); add(rng.standard_normal(Ls)*env(Ls,.001,.04)*.07,bt)
            Lh=int(.04*sr); hh=np.diff(np.concatenate([[0],rng.standard_normal(Lh)])); add(hh*env(Lh,.001,.01)*.035,bt+beat/2)
    bl=int(bar*sr); xb=np.arange(bl)/sr; add(np.sin(2*np.pi*f[0]/2*xb)*env(bl,.02,1.2)*.12,t)
    t+=bar; k+=1
for i,(f,ts) in enumerate([(1318.5,10.25),(1568,10.4),(1046.5,11.05),(1318.5,11.85)]):
    L=int(.5*sr); x=np.arange(L)/sr; add(np.sin(2*np.pi*f*x)*env(L,.003,.18)*.12,ts)
fade=np.ones(n); fo=int(2.5*sr); fade[-fo:]=np.linspace(1,0,fo); fi=int(.6*sr); fade[:fi]=np.linspace(0,1,fi)
out*=fade; out/=np.max(np.abs(out))*1.15
w=wave.open('musicC.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((out*32767).astype(np.int16).tobytes()); w.close(); print('ok')
