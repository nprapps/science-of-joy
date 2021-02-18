#!/bin/bash


mkdir -p resized
rm -f resized/*

# handle silenced video
cd silent
for video in *.mp4; do
  ffmpeg \
  -i $video \
  -an \
  -vcodec libx264 \
  -preset veryslow \
  -strict -2 \
  -pix_fmt yuv420p \
  -crf 30 \
  -vf scale=640:-2 \
  ../resized/$video
done

# transcode video with sound
cd ../video
for video in *.mp4; do
  ffmpeg \
  -i $video \
  -vcodec libx264 \
  -preset veryslow \
  -strict -2 \
  -pix_fmt yuv420p \
  -crf 30 \
  -vf scale=640:-2 \
  ../resized/$video
done

# processing audio into MP3

cd ../audio
for wav in *.wav; do
  lame -m s -b 128 $wav ../resized/$wav.mp3
done

for mp3 in *.mp3; do
  lame -m s -b 128 $mp3 ../resized/$mp3.mp3
done

cd ..