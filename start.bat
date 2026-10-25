@echo off
setlocal
cd /d "%~dp0"
set PORT=4000

where node >nul 2>nul
if %errorlevel%==0 goto use_node

where python >nul 2>nul
if %errorlevel%==0 goto use_python

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
python mock-api\server.py
goto end

:end
endlocal
pause
