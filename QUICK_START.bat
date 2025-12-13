@echo off
REM Restaurant Management System - Quick Start Script for Windows

echo.
echo ========================================
echo Restaurant Management System - Setup
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if MongoDB is running
echo Checking MongoDB connection...
powershell -Command "try { $conn = New-Object System.Net.Sockets.TcpClient('localhost', 27017); $conn.Close(); Write-Host '[OK] MongoDB is running' } catch { Write-Host '[WARNING] MongoDB is not accessible on localhost:27017' }"

echo.
echo [INFO] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Start MongoDB (if not already running):
echo    mongod
echo.
echo 2. Open TWO terminal windows
echo.
echo    Terminal 1 - Backend:
echo    cd src
echo    npm run start:dev
echo.
echo    Terminal 2 - Frontend:
echo    cd frontend
echo    npm run dev
echo.
echo 3. Open browser: http://localhost:3000
echo.
echo ========================================
echo.
pause

