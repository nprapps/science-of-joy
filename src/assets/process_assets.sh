#!/bin/bash

# by default this only processes new files
# if you want to update an existing file, delete the output first

# set to "error" to suppress logs
ffmpeg_log="error"

# enter the originals directory
cd originals

# handle silenced video
mkdir -p ../synced/silent
for video in silent/*.mp4; do
  echo "Processing $video..."

  # create the videos
  if [ ! -f  ../synced/$video ]; then
    ffmpeg -n -nostats -hide_banner -loglevel $ffmpeg_log \
    -i $video \
    -an \
    -vcodec libx264 \
    -preset veryslow \
    -strict -2 \
    -pix_fmt yuv420p \
    -crf 30 \
    -vf scale=1024:-2 \
    -movflags +faststart \
    ../synced/$video
  fi

  # create posters
  if [ ! -f ../synced/$video.jpg ]; then
    ffmpeg -n -nostats -hide_banner -loglevel $ffmpeg_log \
    -i $video \
    -vf scale=1024:-2 \
    -qscale:v 4 \
    -frames:v 1 \
    ../synced/$video.jpg;
  fi
done

# transcode video with sound
mkdir -p ../synced/video

# special case for the sand bubbles
bubbles="ASMR-sand-bubbles.mp4";
if [ ! -f  "../synced/video/$bubbles" ]; then
  echo "Processing video/$bubbles..."
  ffmpeg -n -nostats -hide_banner -loglevel $ffmpeg_log \
  -i "video/$bubbles" \
  -vcodec libx264 \
  -preset veryslow \
  -strict -2 \
  -pix_fmt yuv420p \
  -t 5 \
  -crf 28 \
  -vf scale=1024:-2 \
  -movflags +faststart \
  "../synced/video/$bubbles";
fi
if [ ! -f  "../synced/video/$bubbles.jpg" ]; then
  ffmpeg -n -nostats -hide_banner -loglevel $ffmpeg_log \
  -i "video/$bubbles" \
  -vf scale=1024:-2 \
  -qscale:v 4 \
  -frames:v 1 \
  "../synced/video/$bubbles.jpg";
fi

# handle other files
for video in video/*.mp4; do
  echo "Processing $video..."

  if [ ! -f  "../synced/$video" ]; then
    ffmpeg -n -nostats -hide_banner -loglevel $ffmpeg_log \
    -i "$video" \
    -vcodec libx264 \
    -preset veryslow \
    -strict -2 \
    -pix_fmt yuv420p \
    -t 15 \
    -crf 28 \
    -vf scale=1024:-2 \
    -movflags +faststart \
    "../synced/$video";
  fi

  # create posters
  if [ ! -f  "../synced/$video.jpg" ]; then
    ffmpeg -n -nostats -hide_banner -loglevel $ffmpeg_log \
    -i "$video" \
    -vf scale=1024:-2 \
    -qscale:v 4 \
    -frames:v 1 \
    "../synced/$video.jpg";
  fi
done


# processing audio into MP3
mkdir -p ../synced/audio
for audio in audio/*.wav; do
  echo "Processing $audio..."
  if [ ! -f "../synced/$audio.mp3" ]; then
    lame -m s -b 128 "$audio" "../synced/$audio.mp3"
  fi
done

for audio in audio/*.mp3; do
  echo "Processing $audio..."
  if [ ! -f "../synced/$audio.mp3" ]; then
    lame -m s -b 128 "$audio" "../synced/$audio.mp3"
  fi
done

# convert images
# requires ImageMagick 7
mkdir -p ../synced/images
for img in images/*.jpg; do
  echo "Processing $img..."
  if [ ! -f "../synced/$img" ]; then
    magick convert $img -resize 1200x800\> -quality 70 ../synced/$img
  fi
done
for img in images/*.png; do
  echo "Processing $img..."
  if [ ! -f "../synced/$img" ]; then
    magick convert $img -resize 1200x800\> \
      -define png:compression-filter=5 \
      -define png:compression-level=9 \
      ../synced/$img;
  fi
done
mkdir -p ../synced/social
for img in social/*.png; do
  echo "Processing $img..."
  base=`basename -- $img`
  filename="${base%.*}"
  if [ ! -f "../synced/social/$filename" ]; then
    magick convert $img \
      -resize 1600x1200\> \
      -quality 70 \
      ../synced/social/$filename.jpg;
  fi
done

# exit back to assets
cd ..