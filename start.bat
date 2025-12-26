@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM ================= CONFIG =================
set ENV_KEY=VITE_API_SOCKET_URL
set BACKEND_PORT=8800
set WIFI_INTERFACE=Wi-Fi
REM =========================================

echo ========================================
echo Starting Dev Environment Setup
echo ========================================

REM ===== Kill processes by port (robust) =====
call :KILL_PORT 5173
call :KILL_PORT 3001

REM ===== Get Wi-Fi IPv4 address =====
echo.
echo Detecting Wi-Fi IPv4 address...

for /f "tokens=2 delims=:" %%i in ('
    netsh interface ip show addresses "%WIFI_INTERFACE%" ^| findstr /c:"IP Address"
') do (
    set CURRENT_IP=%%i
)

if not defined CURRENT_IP (
    echo ERROR: Could not detect Wi-Fi IP address.
    echo Check interface name using: netsh interface show interface
    exit /b 1
)

set CURRENT_IP=%CURRENT_IP: =%
echo Wi-Fi IP detected: %CURRENT_IP%

REM ===== Create frontend .env =====
echo.
echo Creating frontend .env file...

if exist .env (
    del .env
    echo Existing .env removed
)

REM Write env variables
echo %ENV_KEY%=%CURRENT_IP%:%BACKEND_PORT%>>.env
echo MONGODB_URI=mongodb://localhost:27017/sling-shot>>.env
echo PORT=3001>>.env

echo .env content:
type .env

REM ===== Install frontend dependencies =====
echo.
echo Installing frontend dependencies...
call npm install
if errorlevel 1 (
    echo Frontend installation failed!
    exit /b 1
)

REM ===== Install backend dependencies =====
echo.
echo Installing backend dependencies...
call npm install
if errorlevel 1 (
    echo Backend installation failed!
    exit /b 1
)

REM ===== Start dev servers =====
echo.
echo Starting frontend and backend servers...
start cmd /k "npm run dev"
start cmd /k "npm run dev:server"

echo.
echo Setup complete. Servers are starting...
exit /b


REM ==================================================
REM Function: Kill process listening on a given port
REM ==================================================
:KILL_PORT
set PORT=%1
echo.
echo Checking port %PORT%...

for /f "tokens=5" %%p in ('
    netstat -ano ^| findstr ":%PORT% " ^| findstr "LISTENING"
') do (
    echo Killing PID %%p on port %PORT%
    taskkill /PID %%p /F >nul 2>&1
)

exit /b
