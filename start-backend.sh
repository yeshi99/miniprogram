#!/usr/bin/env bash
# 一键启动后端服务（macOS / Linux）
set -e
cd "$(dirname "$0")/backend"

if ! command -v npm >/dev/null 2>&1; then
  echo "[错误] 未检测到 Node.js，请先安装 https://nodejs.org/ 的 LTS 版本"
  exit 1
fi

[ -f .env ] || cp .env.example .env
[ -d node_modules ] || npm install

echo "后端启动中： http://localhost:3000"
npm run dev
