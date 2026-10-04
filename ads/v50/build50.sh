#!/bin/sh
# Film 50 s : film du client + 5 photos de chantier (5,5-10,9 s) + prise showroom IMG_0046 + calques SARL MYF.
set -e
cd "$(dirname "$0")"
X=${FF:-$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())")}
U=/root/.claude/uploads/86514f05-489c-5247-97d5-80e5bfdbe1cd
V="$U/039a9b21-Film_50s_version_musique.mp4"; N="$U/4ee860cf-IMG_0046.mov"
D=1.24; FD=0.2; n=37   # 5 photos x 1,24 s - 4 fondus de 0,2 s = 5,4 s
G="eq=contrast=1.05:saturation=1.06,unsharp=5:5:0.5"
Z="zoompan=z='1+0.05*on/$n':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30"
# photo paysage : sur fond flouté
L="split[s1][s2];[s1]scale=2160:3840:force_original_aspect_ratio=increase,crop=2160:3840,gblur=sigma=60,eq=brightness=-0.06[bg_];[s2]scale=2160:-2:flags=lanczos[fg_];[bg_][fg_]overlay=0:(H-h)/2-260,$Z,$G,setsar=1,format=yuv420p"
P="-framerate 30 -loop 1 -t $D -i"
$X -y -loglevel error -i "$V" -i "$N" -loop 1 -i card-showroom.png -loop 1 -i intro.png -loop 1 -i end.png \
  $P chantier/0a-pose.jpg $P chantier/0b-pose.jpg $P chantier/1-salon.jpg $P chantier/2-baie.jpg $P chantier/3-chambre.jpg \
  -loop 1 -i card-chantier.png -filter_complex "
[5:v]$(echo "$L" | sed 's/_\]/a]/g')[p0];
[6:v]$(echo "$L" | sed 's/_\]/b]/g')[p1];
[7:v]scale=2880:3840:flags=lanczos,crop=2160:3840,$Z,$G,setsar=1,format=yuv420p[p2];
[8:v]scale=2880:3840:flags=lanczos,crop=2160:3840:600:0,$Z,$G,eq=gamma=1.12:brightness=0.02:saturation=1.04,setsar=1,format=yuv420p[p3];
[9:v]$(echo "$L" | sed 's/_\]/c]/g')[p4];
[p0][p1]xfade=transition=fade:duration=$FD:offset=1.04[x1];
[x1][p2]xfade=transition=fade:duration=$FD:offset=2.08[x2];
[x2][p3]xfade=transition=fade:duration=$FD:offset=3.12[x3];
[x3][p4]xfade=transition=fade:duration=$FD:offset=4.16,trim=0:5.4[ph];
[10:v]format=rgba,trim=0:5.4,fade=t=in:st=0.15:d=0.35:alpha=1,setpts=PTS-STARTPTS[cc];[ph][cc]overlay=0:0:shortest=1[pc];
[0:v]trim=0:5.5,setpts=PTS-STARTPTS[a0];
[0:v]trim=10.9:40.25,setpts=PTS-STARTPTS[a1];
[1:v]trim=0.9:3.0,setpts=PTS-STARTPTS,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30,format=yuv420p[nb];
[2:v]format=rgba,trim=0:2.1,fade=t=in:st=0:d=0.3:alpha=1,setpts=PTS-STARTPTS[cd];[nb][cd]overlay=0:0:shortest=1[b];
[0:v]trim=42.35,setpts=PTS-STARTPTS[c];
[a0][pc][a1][b][c]concat=n=5:v=1:a=0,fps=30[v];
[3:v]format=rgba,trim=0:5.5,fade=t=in:st=0.3:d=0.5:alpha=1,setpts=PTS-STARTPTS[i];
[4:v]format=rgba,trim=0:49.8,fade=t=in:st=43.3:d=0.5:alpha=1,setpts=PTS-STARTPTS[e];
[v][i]overlay=0:0:enable='lt(t,5.5)':eof_action=pass[v1];[v1][e]overlay=0:0:enable='gte(t,43.2)':shortest=1[out]" \
  -map "[out]" -map 0:a -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p -c:a copy -movflags +faststart -t 49.8 film-50s-sarl-myf.mp4
