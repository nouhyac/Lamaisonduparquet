#!/bin/sh
# Correctifs de la vidéo v2 du client (ads/pub/film-50s-pub-v2.mp4), sans rien changer d'autre :
#  1) cartes des décors (11-30 s) : WhatsApp à côté du 0794 70 93 23, appel à côté du 0549 50 68 57 (échange des 2 lignes)
#  2) carte de fin (43,4 s et après) : idem, dans la pastille verte WhatsApp et la pastille d'appel
#  3) 35,8-36,9 s : « Représentant EGGER en Algérie » remplacé par « Parquet EGGER · en stock à Alger »
set -e; cd "$(dirname "$0")"
X=${FF:-$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())")}
IN=../../pub/film-50s-pub-v2.mp4; OUT=../../pub/film-50s-pub-v3.mp4
E="between(t,11.05,30.13)"
$X -y -loglevel error -i $IN -loop 1 -i label.png -filter_complex "
[0:v]split=7[m][c1][c2][c3][c4][c5][c6];
[c1]crop=228:42:768:1166[r1];[c2]crop=228:42:768:1222[r2];
[m][r2]overlay=768:1166:enable='$E'[m1];[m1][r1]overlay=768:1222:enable='$E'[m2];
[m2]removelogo=f=mask-label.png:enable='between(t,35.79,36.95)'[m3];
[1:v]format=rgba,trim=0:49.8,fade=t=out:st=36.83:d=0.1:alpha=1[lb];[m3][lb]overlay=0:0:enable='between(t,35.79,36.95)':shortest=1[m4];
[c5]crop=6:61:177:911,scale=434:61[fg];[c6]crop=14:56:532:1071,scale=362:56[fd];[m4][fg]overlay=183:911:enable='gte(t,43.40)'[m4b];[m4b][fd]overlay=168:1071:enable='gte(t,43.40)'[m5];
[c3]crop=430:58:185:910,split[g1][g2];[g1]format=gray,geq=lum='clip((lum(X,Y)-110)*1.7,0,255)'[ga];[g2]format=rgb24,lutrgb=r=255:g=255:b=255[gw];
[gw][ga]alphamerge,scale=370:-1:flags=lanczos,format=rgba[gt];
[c4]crop=358:54:170:1072,split[d1][d2];[d1]format=gray,geq=lum='clip((lum(X,Y)-40)*1.25,0,255)'[da];[d2]format=rgb24,lutrgb=r=255:g=255:b=255[dw];
[dw][da]alphamerge,scale=420:-1:flags=lanczos,format=rgba[dt];
[m5][dt]overlay=x=190:y=940-h/2:enable='gte(t,43.40)'[m6];[m6][gt]overlay=x=170:y=1099-h/2:enable='gte(t,43.40)'[out]" \
 -map "[out]" -map 0:a -c:v libx264 -preset slow -crf 15 -pix_fmt yuv420p -c:a copy -movflags +faststart $OUT
