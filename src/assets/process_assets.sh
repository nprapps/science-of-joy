#!/bin/bash

# by default this only processes new files
# if you want to update an existing file, delete the output first

# set to "info" for more loggin
ffmpeg_log="error"

# enter the originals directory
cd originals

# handle silenced video
mkdir -p ../synced/silent
for video in silent/*.mp4; do
  # create the videos
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

  # create posters
  ffmpeg -n -nostats -hide_banner -loglevel $ffmpeg_log \
  -i $video \
  -qscale:v 4 \
  -frames:v 1 \
  ../synced/$video.jpg

done



# transcode video with sound
mkdir -p ../synced/video
for video in video/*.mp4; do
  ffmpeg -n -nostats -hide_banner -loglevel $ffmpeg_log \
  -i $video \
  -vcodec libx264 \
  -preset veryslow \
  -strict -2 \
  -pix_fmt yuv420p \
  -crf 30 \
  -vf scale=640:-2 \
  ../synced/$video

  # create posters
  ffmpeg -n -nostats -hide_banner -loglevel $ffmpeg_log \
  -i $video \
  -qscale:v 4 \
  -frames:v 1 \
  ../synced/$video.jpg
done

# processing audio into MP3
mkdir -p ../synced/audio
for audio in audio/*.wav; do
  if [ -f "../synced/$audio.mp3" ]; then
    echo "../synced/$audio.mp3 already exists"
    continue
  fi
  lame -m s -b 128 "$audio" "../synced/$audio.mp3"
done

for audio in audio/*.mp3; do
  if [ -f "../synced/$audio.mp3" ]; then
    echo "../synced/$audio.mp3 already exists"
    continue
  fi
  lame -m s -b 128 "$audio" "../synced/$audio.mp3"
done

# convert parallax images
# requires ImageMagick 7
# mkdir -p ../synced/parallax
# for img in audio/*.png; do
#   magick convert $img -resize 1000x800\> -colors 255 ../synced/$img
# done

# exit back to assets
cd ..