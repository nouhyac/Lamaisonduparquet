import numpy as np, wave, sys, json
sys.path.insert(0,'.');import son
SR=44100
for mode,ev in [('client',[('whoosh',3.3),('ding',8.8),('carillon',12.6),('whoosh',16.7),('accord',16.9)]),('cuisine',[('carillon',1.0),('imprimante',1.5),('whoosh',6.6),('whoosh',9.2),('whoosh',16.7),('accord',16.9)])]:
    L=20.0;N=int(L*SR);m=son.musique(L,bpm=104,debut=0.0,fin=L);m=m/np.abs(m).max()*0.55
    fx=np.zeros(N)
    for typ,t in ev: son.put(fx,{'whoosh':son.whoosh,'carillon':son.carillon,'imprimante':son.imprimante,'ding':son.ding,'accord':son.accord}[typ](),t)
    o=m+fx;o=o/max(1,np.abs(o).max())*0.9;st=(np.stack([o,o],1)*32767).astype(np.int16)
    with wave.open('ex_%s.wav'%mode,'wb') as w: w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes(st.tobytes())
