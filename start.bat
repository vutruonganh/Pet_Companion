@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
if "%PORT%"=="" set PORT=4000

where node >nul 2>nul
if %errorlevel%==0 goto use_node

where python >nul 2>nul
if %errorlevel%==0 (
  set "PY=python"
  goto use_python
)

where py >nul 2>nul
if %errorlevel%==0 (
  set "PY=py -3"
  goto use_python
)

echo.
echo [ERROR] Khong tim thay Node.js hoac Python tren may.
echo Cai Node.js tai https://nodejs.org hoac Python tai https://python.org roi chay lai.
echo.
pause
goto end

:use_node
echo [PetCompanion] Dang chay bang Node.js...
echo Mo trinh duyet: http://localhost:%PORT%/
start "" "http://localhost:%PORT%/"
node mock-api\server.js
goto end

:use_python
echo [PetCompanion] Khong thay Node.js - dang chay bang Python...
echo Mo trinh duyet: http://localhost:%PORT%/
start "" "http://localhost:%PORT%/"
%PY% mock-api\server.py
goto end

:end
endlocal
pause
