#!/bin/sh
# Film 50 s : film du client + photos de chantier (5,5-10,9 s) + prise showroom IMG_0046 + calques SARL MYF.
set -e
cd "$(dirname "$0")"
X=${FF:-$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())")}
U=/root/.claude/uploads/86514f05-489c-5247-97d5-80e5bfdbe1cd
V="$U/039a9b21-Film_50s_version_musique.mp4"; N="$U/4ee860cf-IMG_0046.mov"
D=1.967; FD=0.25; n=59   # 3 photos x 1,967 s - 2 fondus de 0,25 s = 5,4 s
G="eq=contrast=1.05:saturation=1.06,unsharp=5:5:0.5"
Z="zoompan=z='1+0.06*on/$n':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30"
$X -y -loglevel error -i "$V" -i "$N" -loop 1 -i card-showroom.png -loop 1 -i intro.png -loop 1 -i end.png \
  -framerate 30 -loop 1 -t $D -i chantier/1-salon.jpg -framerate 30 -loop 1 -t $D -i chantier/2-baie.jpg -framerate 30 -loop 1 -t $D -i chantier/3-chambre.jpg -loop 1 -i card-chantier.png -filter_complex "
[5:v]scale=2880:3840:flags=lanczos,crop=2160:3840,$Z,$G,setsar=1,format=yuv420p[p1];
[6:v]scale=2880:3840:flags=lanczos,crop=2160:3840:600:0,$Z,$G,eq=gamma=1.12:brightness=0.02:saturation=1.04,setsar=1,format=yuv420p[p2];
[7:v]split[s1][s2];[s1]scale=2160:3840:force_original_aspect_ratio=increase,crop=2160:3840,gblur=sigma=60,eq=brightness=-0.06[bg];
[s2]scale=2160:-2:flags=lanczos[fg];[bg][fg]overlay=0:(H-h)/2-260,$Z,$G,setsar=1,format=yuv420p[p3];
[p1][p2]xfade=transition=fade:duration=$FD:offset=$(echo "$D-$FD"|bc)[x1];[x1][p3]xfade=transition=fade:duration=$FD:offset=$(echo "2*$D-2*$FD"|bc),trim=0:5.4[ph];
[8:v]format=rgba,trim=0:5.4,fade=t=in:st=0.15:d=0.35:alpha=1,setpts=PTS-STARTPTS[cc];[ph][cc]overlay=0:0:shortest=1[pc];
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
