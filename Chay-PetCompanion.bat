@echo off
chcp 65001 >nul
setlocal EnableExtensions
cd /d "%~dp0"

title PetCompanion - Khoi dong
echo ============================================
echo    PETCOMPANION - KHOI DONG WEB DEMO
echo ============================================
echo.

set "URL=http://localhost:4000/login%%20register/login.html"

rem --- 1) Server da chay san thi chi mo trang ---
powershell -NoProfile -Command "try{ $r=Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 http://localhost:4000/api/health; if($r.StatusCode -eq 200){ exit 0 } }catch{}; exit 1" >nul 2>&1
if not errorlevel 1 (
  echo Server dang chay san. Dang mo: %URL%
  start "" "%URL%"
  powershell -NoProfile -Command "Start-Sleep -Seconds 2"
  exit /b 0
)

rem --- 2) Tim Node.js ---
set "NODE_EXE="
where node >nul 2>&1 && set "NODE_EXE=node"
if not defined NODE_EXE if exist "%ProgramFiles%\nodejs\node.exe" set "NODE_EXE=%ProgramFiles%\nodejs\node.exe"
if not defined NODE_EXE if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" set "NODE_EXE=%LOCALAPPDATA%\Programs\nodejs\node.exe"

rem Neu may khong cai Node.js thi dung Node tich hop cua Qoder
if not defined NODE_EXE if exist "%USERPROFILE%\Qoder\Qoder.exe" (
  set "NODE_EXE=%USERPROFILE%\Qoder\Qoder.exe"
  set "ELECTRON_RUN_AS_NODE=1"
)
if not defined NODE_EXE if exist "%LOCALAPPDATA%\Programs\Qoder\Qoder.exe" (
  set "NODE_EXE=%LOCALAPPDATA%\Programs\Qoder\Qoder.exe"
  set "ELECTRON_RUN_AS_NODE=1"
)
if not defined NODE_EXE if exist "%ProgramFiles%\Qoder\Qoder.exe" (
  set "NODE_EXE=%ProgramFiles%\Qoder\Qoder.exe"
  set "ELECTRON_RUN_AS_NODE=1"
)

if not defined NODE_EXE (
  echo [LOI] Khong tim thay Node.js tren may.
  echo Hay cai Node.js tai https://nodejs.org roi chay lai file nay.
  echo.
  pause
  exit /b 1
)

rem --- 3) Khoi dong mock API o cua so thu nho ---
echo Dang khoi dong server...
start "PetCompanion Mock API" /min "%NODE_EXE%" "mock-api\server.js"

echo Dang cho server san sang...
powershell -NoProfile -Command "$ok=$false; for($i=0;$i -lt 30;$i++){ try{ $r=Invoke-WebRequest -UseBasicParsing -TimeoutSec 1 http://localhost:4000/api/health; if($r.StatusCode -eq 200){ $ok=$true; break } }catch{}; Start-Sleep -Milliseconds 400 }; if($ok){exit 0}else{exit 1}"

if errorlevel 1 (
  echo.
  echo [LOI] Server khong khoi dong duoc tren cong 4000.
  echo - Co the dang co chuong trinh khac dung cong 4000.
  echo - Hay dong cua so PetCompanion Mock API neu co, roi chay lai file nay.
  echo.
  pause
  exit /b 1
)

echo Server san sang: http://localhost:4000
echo Dang mo trang dang nhap: %URL%
echo.
echo LUU Y: Cua so thu nho "PetCompanion Mock API" phai duoc giu mo
echo        trong luc test. Dong cua so do = tat server.
start "" "%URL%"
powershell -NoProfile -Command "Start-Sleep -Seconds 3"
exit /b 0
