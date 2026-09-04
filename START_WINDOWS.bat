@echo off
setlocal
cd /d "%~dp0"

echo ==============================================
echo       INTERVIEW CRACKER AI - STARTUP
echo ==============================================

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Install Node.js 20 or newer, then run this file again.
  pause
  exit /b 1
)

for /f "tokens=1" %%v in ('node -p "process.versions.node.split('.')[0]"') do set NODE_MAJOR=%%v
if %NODE_MAJOR% LSS 20 (
  echo Node.js 20 or newer is required. Current version:
  node --version
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo Dependency installation failed. Check your internet connection and try again.
    pause
    exit /b 1
  )
)

if not exist .env (
  copy /Y .env.example .env >nul
  echo Created .env from .env.example.
  echo Edit .env before production use. The app can start locally without a Gemini key, but AI API features require GEMINI_API_KEY.
)

echo.
echo Starting Interview Cracker AI...
echo Open http://localhost:3000
call npm run dev
