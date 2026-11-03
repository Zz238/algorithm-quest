#!/bin/bash
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  echo "请先从 https://nodejs.org/ 安装 Node.js 24 LTS，再重新运行。"
  read -r -p "按回车关闭…"
  exit 1
fi
node admin/server.mjs --open
