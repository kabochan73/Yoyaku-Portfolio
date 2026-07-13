#!/bin/sh
set -e

node server.js &
SERVER_PID=$!

# サーバー起動を待ってから、ビルド時に焼き込まれたフォールバック値を
# 実データへ即座に反映させる（frontendの再ビルドだけでも自己修復させるため）
until wget -q -O /dev/null "http://127.0.0.1:3000/api/revalidate?tag=prices" 2>/dev/null; do
  sleep 1
done
wget -q -O /dev/null "http://127.0.0.1:3000/api/revalidate?tag=regular-holidays" 2>/dev/null || true

wait "$SERVER_PID"
