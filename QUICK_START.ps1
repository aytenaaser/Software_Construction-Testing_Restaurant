# Restaurant Management System - Quick Start Script for PowerShell

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Restaurant Management System - Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
$nodeCheck = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCheck) {
    Write-Host "[ERROR] Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[OK] Node.js is installed: $(node --version)" -ForegroundColor Green

# Check if npm is installed
$npmCheck = Get-Command npm -ErrorAction SilentlyContinue
if (-not $npmCheck) {
    Write-Host "[ERROR] npm is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] npm is installed: $(npm --version)" -ForegroundColor Green

# Check MongoDB
Write-Host ""
Write-Host "Checking MongoDB connection on localhost:27017..." -ForegroundColor Yellow
try {
    $connection = New-Object System.Net.Sockets.TcpClient
    $connection.Connect("localhost", 27017)
    $connection.Close()
    Write-Host "[OK] MongoDB is running" -ForegroundColor Green
} catch {
    Write-Host "[WARNING] MongoDB is not accessible on localhost:27017" -ForegroundColor Yellow
    Write-Host "Make sure MongoDB is installed and running:" -ForegroundColor Yellow
    Write-Host "  mongod" -ForegroundColor White
}

Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Ensure MongoDB is running:" -ForegroundColor White
Write-Host "   mongod" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Open TWO PowerShell/Command Prompt windows:" -ForegroundColor White
Write-Host ""
Write-Host "   Terminal 1 - Backend (NestJS on port 3001):" -ForegroundColor Gray
Write-Host "   cd src" -ForegroundColor Gray
Write-Host "   npm run start:dev" -ForegroundColor Gray
Write-Host ""
Write-Host "   Terminal 2 - Frontend (Next.js on port 3000):" -ForegroundColor Gray
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Open your browser and navigate to:" -ForegroundColor White
Write-Host "   http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Test the application:" -ForegroundColor White
Write-Host "   - Click Register to create an account" -ForegroundColor Gray
Write-Host "   - Login with your credentials" -ForegroundColor Gray
Write-Host "   - View the Dashboard" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "For more information, see:" -ForegroundColor Yellow
Write-Host "  - SETUP_AND_RUN.md" -ForegroundColor Gray
Write-Host "  - PROJECT_RESTRUCTURING_REPORT.md" -ForegroundColor Gray
Write-Host ""

Read-Host "Press Enter to exit"

