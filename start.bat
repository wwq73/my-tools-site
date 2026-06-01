@echo off
chcp 65001 >nul
title My Tools Site - Start
color 0A

echo ==========================================
echo    My Tools Site - Local Dev Server
echo ==========================================
echo.

set "BASE_DIR=%~dp0"
set "BACKEND_DIR=%BASE_DIR%backend"
set "FRONTEND_DIR=%BASE_DIR%frontend"

if not exist "%BACKEND_DIR%" (
    echo [ERROR] Backend dir not found: %BACKEND_DIR%
    pause
    exit /b 1
)

if not exist "%FRONTEND_DIR%" (
    echo [ERROR] Frontend dir not found: %FRONTEND_DIR%
    pause
    exit /b 1
)

echo [1/3] Checking dependencies...

python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Please install Python 3.11+
    pause
    exit /b 1
)
for /f "tokens=*" %%a in ('python --version') do echo        %%a

node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
)
for /f "tokens=*" %%a in ('node --version') do echo        %%a

echo.
echo [2/3] Starting Backend...
echo        Path: %BACKEND_DIR%

start "Backend API (8000)" cmd /k "cd /d "%BACKEND_DIR%" && echo [Backend] Starting... && "venv\Scripts\python.exe" -m uvicorn main:app --reload --port 8000"

echo        Backend window opened, initializing...
timeout /t 3 /nobreak >nul

echo.
echo [3/3] Starting Frontend...
echo        Path: %FRONTEND_DIR%

start "Frontend DEV (5173)" cmd /k "cd /d "%FRONTEND_DIR%" && echo [Frontend] Starting... && npm run dev"

echo        Frontend window opened, initializing...
timeout /t 3 /nobreak >nul

echo.
echo ==========================================
echo    All services started!
echo ==========================================
echo.
echo  URLs:
echo    Frontend: http://localhost:5173
echo    API Docs: http://localhost:8000/docs
echo    Backend:  http://localhost:8000
echo.
echo  Tips:
echo    - Press Ctrl+C in each window to stop
echo    - Close windows directly to stop
echo    - This window can be closed safely
echo.

choice /c YN /n /m "Open browser now? [Y/N] " /t 5 /d Y
if errorlevel 2 goto :skip
if errorlevel 1 start http://localhost:5173

:skip
echo.
echo Press any key to close this window (services keep running)...
pause >nul
