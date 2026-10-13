import json,re
M=json.load(open('../mots.json'));M.update(json.load(open('mots2.json')))
GOLD={'dzign','studio','gratuit','10','secondes','rembourse','moins','20','%','whatsapp','3d','vitrine','boutique','alger','5','premiers','moitié','site','maintenant'}
GOLD-= {'site'}
def clean(ws):
    out=[]
    for w,s,e in ws:
        if out and (w.startswith("'") or w.startswith('-')):
            out[-1]=(out[-1][0]+w,out[-1][1],e);continue
        w={'Design':'Dzign','moins':'Moins','simple,':'simple ?'}.get(w,w)
        if w=='%' and out: out[-1]=(out[-1][0]+' %',out[-1][1],e);continue
        out.append((w,s,e))
    return out
def chunks(ws):
    cur=[];res=[]
    for w in ws:
        cur.append(w)
        if len(cur)>=3 or len(' '.join(x[0] for x in cur))>=16 or re.search(r'[,.?!]$',w[0]): res.append(cur);cur=[]
    if cur:res.append(cur)
    return res
def t(x):return f"{int(x//3600)}:{int(x%3600//60):02d}:{x%60:05.2f}"
def g(w):return w.lower().strip('?,.!') in GOLD or w.lower().replace(' %','') in {'20'}
ev=[]
for name,off,lead in [('f1-pad',0,0),('f2c-pad',10.031,0),('vo1',25.078,0.05),('vo2',35.078,0.15),('vo3',41.278,0.15)]:
    cs=chunks(clean(M[name]))
    for i,c in enumerate(cs):
        st=c[0][1]+off+lead
        en=(cs[i+1][0][1]+off+lead) if i+1<len(cs) else c[-1][2]+off+lead+0.4
        en=min(en,c[-1][2]+off+lead+0.6)
        txt=' '.join(('{\\c&H006AA9C8&}'+w+'{\\c&H00FFFFFF&}') if g(w) else w for w,_,_ in c)
        ev.append(f"Dialogue: 0,{t(st)},{t(en)},S,,0,0,0,,{txt}")
hdr="""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: S,Inter ExtraBold,80,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,0,0,0,0,100,100,2,0,1,5,0,2,90,90,440,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
open('pub.ass','w').write(hdr+'\n'.join(ev)+'\n');print(len(ev))
