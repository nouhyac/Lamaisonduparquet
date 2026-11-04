#!/bin/sh
# Film 50 s : film du client, dont seules changent les 2 photos de pose (5,5-10,9 s), remplacées par les originaux
# en haute qualité, même mise en page (carré 1080 px à y=300 sur fond flouté) ; prise showroom IMG_0046 ; calques SARL MYF.
set -e
cd "$(dirname "$0")"
X=${FF:-$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())")}
U=/root/.claude/uploads/86514f05-489c-5247-97d5-80e5bfdbe1cd
V="$U/039a9b21-Film_50s_version_musique.mp4"; N="$U/4ee860cf-IMG_0046.mov"
# photo 1 : 5,5-7,95 s ; fondu 0,15 s ; photo 2 : jusqu'à 10,9 s
ph() { # $1 durée, $2 nb d'images, $3 étiquette
  echo "split[$3a][$3b];[$3a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=40,eq=brightness=-0.05[$3bg];
[$3b]crop=ih:ih,scale=2160:2160:flags=lanczos,zoompan=z='1+0.04*on/$2':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1080:fps=30,unsharp=5:5:0.6,eq=contrast=1.04:saturation=1.05[$3fg];
[$3bg][$3fg]overlay=0:300,setsar=1,format=yuv420p"
}
$X -y -loglevel error -i "$V" -i "$N" -loop 1 -i card-showroom.png -loop 1 -i intro.png -loop 1 -i end.png \
  -framerate 30 -loop 1 -t 2.6 -i chantier/1-pose-seau.jpg -framerate 30 -loop 1 -t 2.95 -i chantier/2-pose-poseur.jpg \
  -loop 1 -i card-chantier.png -filter_complex "
[5:v]$(ph 2.6 78 s)[p1];
[6:v]$(ph 2.95 89 w)[p2];
[p1][p2]xfade=transition=fade:duration=0.15:offset=2.45,trim=0:5.4[ph];
[7:v]format=rgba,trim=0:5.4,fade=t=in:st=0.1:d=0.4:alpha=1,setpts=PTS-STARTPTS[cc];[ph][cc]overlay=0:0:shortest=1[pc];
[0:v]trim=0:5.5,setpts=PTS-STARTPTS[a0];
[0:v]trim=10.9:40.25,setpts=PTS-STARTPTS[a1];
[1:v]trim=0.9:3.0,setpts=PTS-STARTPTS,scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,setsar=1,fps=30,format=yuv420p[nb];
[2:v]format=rgba,trim=0:2.1,fade=t=in:st=0:d=0.3:alpha=1,setpts=PTS-STARTPTS[cd];[nb][cd]overlay=0:0:shortest=1[b];
[0:v]trim=42.35,setpts=PTS-STARTPTS[c];
[a0][pc][a1][b][c]concat=n=5:v=1:a=0,fps=30[v];
[3:v]format=rgba,trim=0:5.5,fade=t=in:st=0.3:d=0.5:alpha=1,setpts=PTS-STARTPTS[i];
[4:v]format=rgba,trim=0:49.8,fade=t=in:st=43.3:d=0.5:alpha=1,setpts=PTS-STARTPTS[e];
[v][i]overlay=0:0:enable='lt(t,5.5)':eof_action=pass[v1];[v1][e]overlay=0:0:enable='gte(t,43.2)':shortest=1[out]" \
  -map "[out]" -map 0:a -c:v libx264 -preset veryslow -crf 12 -tune film -profile:v high -level 4.2 -pix_fmt yuv420p \
  -c:a copy -movflags +faststart -t 49.8 film-50s-sarl-myf.mp4
