@echo off
setlocal EnableExtensions DisableDelayedExpansion
if /i "%~1"=="--run" goto run
if /i "%~1"=="--check" goto run
rem Keep CMD open even when parsing or startup fails before normal cleanup.
"%ComSpec%" /d /v:off /k call "%~f0" --run
exit /b

:run
title ALGO QUEST - Local Analytics
chcp 65001 >nul
cd /d "%~dp0"
if errorlevel 1 goto folder_error
echo ALGO QUEST - Local Analytics
echo Project folder: "%CD%"
echo.
if not exist "admin\server.mjs" goto files_missing
if not exist "admin\public\index.html" goto files_missing
if not exist "admin\public\app.js" goto files_missing
if not exist "admin\public\style.css" goto files_missing
if not exist "admin\catalog.json" goto files_missing
if not exist "src\config\cloud.js" goto files_missing
if not exist "package.json" goto files_missing
set "AQ_ADMIN_NODE="
for /f "delims=" %%N in ('where node.exe 2^>nul') do if not defined AQ_ADMIN_NODE set "AQ_ADMIN_NODE=%%N"
if not defined AQ_ADMIN_NODE goto node_missing
echo Node.js:
"%AQ_ADMIN_NODE%" --version
if errorlevel 1 goto node_broken
"%AQ_ADMIN_NODE%" -e "var v=process.versions.node.split('.').map(Number);process.exit((v[0]===20&&v[1]>=19)||(v[0]===22&&v[1]>=12)||v[0]>=23?0:1)"
if errorlevel 1 goto node_unsupported
if /i "%~1"=="--check" goto check_ok
echo.
echo Starting http://127.0.0.1:4780/
echo Keep this window open while using the dashboard.
echo.
if /i "%~2"=="--no-open" goto start_without_browser
"%AQ_ADMIN_NODE%" "admin\server.mjs" --open
goto server_finished

:start_without_browser
"%AQ_ADMIN_NODE%" "admin\server.mjs"

:server_finished
set "AQ_ADMIN_EXIT=%errorlevel%"
echo.
if not "%AQ_ADMIN_EXIT%"=="0" goto server_error
echo Server stopped. You can close this window.
exit /b 0

:check_ok
echo Preflight OK. The project files and Node.js version are ready.
exit /b 0

:files_missing
echo ERROR AQ_PROJECT_FILES: Required project files are missing.
echo Extract the ENTIRE project ZIP, then run this file from the extracted folder.
echo Do not run it inside the ZIP or copy only the BAT file.
exit /b 1

:node_missing
echo ERROR AQ_NODE_NOT_FOUND: Node.js was not found on PATH.
echo Install Node.js 24 LTS from https://nodejs.org/
echo After installation, close this window and run this file again.
exit /b 1

:node_broken
echo ERROR AQ_NODE_BROKEN: Node.js could not run.
echo Reinstall Node.js 24 LTS from https://nodejs.org/
exit /b 1

:node_unsupported
echo ERROR AQ_NODE_VERSION: This Node.js version is too old or unsupported.
echo Install Node.js 24 LTS, then close this window and run this file again.
exit /b 1

:folder_error
echo ERROR AQ_PROJECT_FOLDER: The project folder could not be opened.
echo Extract the ZIP to a local folder and try again.
exit /b 1

:server_error
echo ERROR AQ_SERVER_EXIT: The server stopped with exit code %AQ_ADMIN_EXIT%.
echo Read the error above. This window will stay open for troubleshooting.
exit /b %AQ_ADMIN_EXIT%
