@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo 请先安装 Node.js 24 LTS，然后重新打开这个文件。
 pause
 exit /b 1
)
if not exist node_modules (
 echo 正在安装锁定版本的依赖，首次启动需要联网……
 call npm ci
 if errorlevel 1 (
  echo 安装失败，请检查网络和上面的提示。
  pause
  exit /b 1
 )
)
echo 浏览器将打开本地算法之旅。关闭此窗口会停止开发服务。
call npm run dev -- --open
pause
