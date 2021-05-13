#!/bin/bash

# by default this only processes new files
# if you want to update an existing file, delete the output first

# set to "error" to suppress logs
ffmpeg_log="info"

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
    -vf scale=640:-2 \
    ../synced/$video
  fi

  # create posters
  if [ ! -f ../synced/$video.jpg ]; then
    ffmpeg -n -nostats -hide_banner -loglevel $ffmpeg_log \
    -i $video \
    -qscale:v 4 \
    -frames:v 1 \
    ../synced/$video.jpg
  fi

done



# transcode video with sound
mkdir -p ../synced/video
for video in video/*.mp4; do
  echo "Processing $video..."

  if [ ! -f  ../synced/$video ]; then
    ffmpeg -n -nostats -hide_banner -loglevel $ffmpeg_log \
    -i $video \
    -vcodec libx264 \
    -preset veryslow \
    -strict -2 \
    -pix_fmt yuv420p \
    -crf 30 \
    -vf scale=640:-2 \
    ../synced/$video
  fi

  # create posters
  if [ ! -f  ../synced/$video.jpg ]; then
    ffmpeg -n -nostats -hide_banner -loglevel $ffmpeg_log \
    -i $video \
    -qscale:v 4 \
    -frames:v 1 \
    ../synced/$video.jpg
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
      ../synced/$img
  fi
done

# exit back to assets
cd ..