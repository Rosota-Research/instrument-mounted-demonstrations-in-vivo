#!/usr/bin/env bash
# Re-encode the source clips for the project page. Sources live in the paper workspace;
# pass its root as $1 (default: ../icra2027_paper relative to this repo).
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$HERE")"
SRC="${1:-$ROOT/../icra2027_paper}"
OUT="$ROOT/assets/video"
mkdir -p "$OUT"
H264="-c:v libx264 -preset slow -pix_fmt yuv420p -movflags +faststart -an"

# Supplementary video, 1080p master -> capped bitrate 1080p
ffmpeg -v error -y -i "$SRC/accompanying_videos/build/out/appendectomy_video_1080p.mp4" \
  -crf 25 -maxrate 2500k -bufsize 5000k $H264 "$OUT/supplementary-1080p.mp4"
# Short loops (HEVC phone clips -> H.264)
ffmpeg -v error -y -i "$SRC/accompanying_videos/media/invivo_robot_rollout_outside.mp4" \
  -vf "scale=1092:816" -r 30 -crf 26 $H264 "$OUT/invivo-rollout.mp4"
ffmpeg -v error -y -i "$SRC/accompanying_videos/media/invivo_data_collection_outside.mp4" \
  -vf "scale=1280:720" -r 30 -crf 26 $H264 "$OUT/invivo-collection.mp4"
ffmpeg -v error -y -i "$SRC/accompanying_videos/media/surgilogger_with_phantom_realtime_tracking.mp4" \
  -vf "scale=1280:720" -r 30 -crf 26 $H264 "$OUT/logger-tracking.mp4"
ffmpeg -v error -y -i "$SRC/accompanying_videos/media/latency_collection_robot.mp4" \
  -vf "scale=398:720" -crf 26 $H264 "$OUT/latency-rig.mp4"
ffmpeg -v error -y -i "$SRC/images/exvivo_rollout.mp4" \
  -vf "scale=1280:720" -r 30 -crf 27 $H264 "$OUT/exvivo-rig.mp4"
# Simulator rollouts, one episode per Table II configuration (endoscope view, 10 fps as recorded)
T2="$SRC/table2_videos"
ffmpeg -v error -y -i "$T2/02_model__DP_ResNet-18/episode_010_endoscope.mp4"                   -vf "scale=640:360" -crf 27 $H264 "$OUT/sim-resnet18.mp4"
ffmpeg -v error -y -i "$T2/03_model__DP_DINOv3_frozen/episode_007_endoscope.mp4"               -vf "scale=640:360" -crf 27 $H264 "$OUT/sim-dinov3-frozen.mp4"
ffmpeg -v error -y -i "$T2/10_latency__without_matching/episode_000_endoscope.mp4"             -vf "scale=640:360" -crf 27 $H264 "$OUT/sim-no-latency.mp4"
ffmpeg -v error -y -i "$T2/04_deployed__DP_DINOv3_last_block_unfrozen/episode_001_endoscope.mp4" -vf "scale=640:360" -crf 27 $H264 "$OUT/sim-deployed.mp4"
ffmpeg -v error -y -i "$T2/09_unfrozen__last_4_blocks/episode_000_endoscope.mp4"               -vf "scale=640:360" -crf 27 $H264 "$OUT/sim-4blocks.mp4"
ffmpeg -v error -y -i "$T2/01_model__GR00T-H_VLA_no_phase/s0_episode_000_endoscope.mp4"        -vf "scale=640:360" -crf 27 $H264 "$OUT/sim-groot.mp4"
ls -la "$OUT"
