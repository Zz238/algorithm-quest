#!/bin/sh
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  echo '请先安装 Node.js 24 LTS。'; read -r _reply; exit 1
fi
if [ ! -d node_modules ]; then npm ci || exit 1; fi
npm run dev -- --open
