# Start both backend and frontend servers
# This script should be run from the project root

Write-Host "🚀 Starting Restaurant Application..." -ForegroundColor Cyan
Write-Host ""

# Get the current directory
$projectRoot = Get-Location

# Start backend server
Write-Host "📦 Starting Backend Server (NestJS on port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot'; npm run dev:backend"
Start-Sleep -Seconds 3

# Start frontend server
Write-Host "⚛️  Starting Frontend Server (Next.js on port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot'; npm run dev:frontend"
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "✅ Both servers are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend:     http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend:      http://localhost:8000" -ForegroundColor Cyan
Write-Host "API Docs:     http://localhost:8000/api/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Tip: If you see errors, check the terminal windows for details." -ForegroundColor Gray

