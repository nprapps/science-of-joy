#!/bin/bash

# by default this only processes new files
# if you want to update an existing file, delete the output first

# enter the originals directory
cd originals

# handle silenced video
mkdir -p ../synced/silent
for video in silent/*.mp4; do
  ffmpeg -n \
  -i $video \
  -an \
  -vcodec libx264 \
  -preset veryslow \
  -strict -2 \
  -pix_fmt yuv420p \
  -crf 30 \
  -vf scale=640:-2 \
  ../synced/$video
done

# # transcode video with sound
mkdir -p ../synced/video
for video in video/*.mp4; do
  ffmpeg -n \
  -i $video \
  -vcodec libx264 \
  -preset veryslow \
  -strict -2 \
  -pix_fmt yuv420p \
  -crf 30 \
  -vf scale=640:-2 \
  ../synced/$video
done

# processing audio into MP3
mkdir -p ../synced/audio
for wav in audio/*.wav; do
  if [ -f "../synced/$wav.mp3" ]; then
    echo "../synced/$wav.mp3 already exists"
    continue
  fi
  lame -m s -b 128 "$wav" "../synced/$wav.mp3"
done

for mp3 in audio/*.mp3; do
  if [ -f "../synced/$mp3.mp3" ]; then
    echo "../synced/$mp3.mp3 already exists"
    continue
  fi
  lame -m s -b 128 "$mp3" "../synced/$mp3.mp3"
done

# convert parallax images
# mkdir -p ../synced/parallax
# for img in audio/*.png; do
#   convert $img -resize 1000x800\> -colors 255 ../synced/$img
# done

# exit back to assets
cd ..