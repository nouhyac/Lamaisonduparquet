import subprocess,json
F='..'  # dossier final
def run(c):
    r=subprocess.run(c,shell=True,capture_output=True,text=True)
    if r.returncode: print(r.stderr[-1500:]);raise SystemExit(c)
ENC="-an -c:v libx264 -crf 16 -preset medium -pix_fmt yuv420p -r 30"
NORM="scale=1080:-2,crop=1080:1920,setsar=1,fps=30"
GRADE="eq=contrast=1.04:saturation=1.05"
# fond flou pour les écrans
run(f"ffmpeg -v error -y -i /home/user/Lamaisonduparquet/entreprise/campagne/avatar/decor-femme.png -vf \"scale=1080:-2,crop=1080:1920,gblur=sigma=28,eq=brightness=-0.22:saturation=0.8\" fond.png")
segs=[]
def talk(name,src,ss,t,extra=None,ovs=()):
    ins=f"-ss {ss} -t {t} -i {src} -loop 1 -t {t} -i {F}/logo.png"
    fc=f"[0:v]{NORM},{GRADE}[v];[1:v]format=rgba[l];[v][l]overlay[v1]"
    last='v1'
    for i,(png,a,b) in enumerate(ovs):
        ins+=f" -loop 1 -t {t} -i {png}"
        fc+=f";[{2+i}:v]format=rgba,fade=in:st={a}:d=0.25:alpha=1,fade=out:st={b-0.25}:d=0.25:alpha=1[o{i}];[{last}][o{i}]overlay[w{i}]";last=f"w{i}"
    if extra: fc+=f";[{last}]{extra}[x]";last='x'
    run(f"ffmpeg -v error -y {ins} -filter_complex \"{fc}\" -map \"[{last}]\" -t {t} {ENC} {name}.mp4");segs.append((name,t))
def slow(name,src,ss,srcdur,t,ovs=(),hook=False):
    f=t/srcdur
    ins=f"-ss {ss} -t {srcdur} -i {src} -loop 1 -t {t} -i {F}/logo.png"
    fc=f"[0:v]setpts=PTS*{f:.4f},{NORM},{GRADE}[v];[1:v]format=rgba[l];[v][l]overlay[v1]";last='v1'
    for i,(png,a,b) in enumerate(ovs):
        ins+=f" -loop 1 -t {t} -i {png}"
        fc+=f";[{2+i}:v]format=rgba,fade=in:st={a}:d=0.25:alpha=1,fade=out:st={b-0.25}:d=0.25:alpha=1[o{i}];[{last}][o{i}]overlay[w{i}]";last=f"w{i}"
    run(f"ffmpeg -v error -y {ins} -filter_complex \"{fc}\" -map \"[{last}]\" -t {t} {ENC} {name}.mp4");segs.append((name,t))
def phone(name,rec,ss,srcdur,t,lab):
    f=t/srcdur
    fc=(f"[1:v]setpts=(PTS-STARTPTS)*{f:.4f},scale=560:1212,fps=30[s];"
        f"[0:v]scale=1080:1920,zoompan=z='1+0.0006*on':d=1:s=1080x1920:fps=30[bg];"
        f"[bg][s]overlay=260:140[a];[2:v]format=rgba[ph];[a][ph]overlay[b];[3:v]format=rgba,fade=in:st=0:d=0.3:alpha=1[lb];[b][lb]overlay[c]")
    run(f"ffmpeg -v error -y -loop 1 -t {t} -i fond.png -ss {ss} -t {srcdur} -i {rec} -loop 1 -t {t} -i phone.png -loop 1 -t {t} -i {lab} -filter_complex \"{fc}\" -map \"[c]\" -t {t} {ENC} {name}.mp4");segs.append((name,t))
A=10.031;B=15.047
slow('a1','s1.mp4',1.6,3.44,3.4,ovs=[('ov-hook.png',0.1,3.4)])
talk('a2',f'{F}/z-v-f1.mp4',3.4,round(A-3.4,3))
talk('b1',f'{F}/z-v-f2.mp4',0,2.0)
phone('b2','rec-essai.mp4',0.3,10.23,7.3,'ov-lab-essai.png')
talk('b3',f'{F}/z-v-f2.mp4',9.3,1.1)
phone('b4','rec-offre.mp4',0,2.8,2.8,'ov-lab-offre.png')
talk('b5',f'{F}/z-v-f2.mp4',13.2,round(B-13.2,3))
phone('c1','rec-portfolio.mp4',0.2,5.2,4.4,'ov-lab-portfolio.png')
phone('c2','rec-3d.mp4',1.0,17.0,5.6,'ov-lab-3d.png')
slow('d','s2.mp4',0,5.04,6.2,ovs=[('ov-b-5050.png',0.1,2.9),('ov-b-rembourse.png',2.9,6.2)])
slow('e','s3.mp4',0,5.04,7.2,ovs=[('ov-b-20.png',0.1,3.4),('ov-b-voyez.png',3.4,7.2)])
run(f"ffmpeg -v error -y -i {F}/fin.mp4 -an -vf \"{NORM}\" {ENC} f.mp4");segs.append(('f',3.0))
open('segs.txt','w').write('\n'.join(f"file '{n}.mp4'" for n,_ in segs))
print(json.dumps(segs),sum(t for _,t in segs))
