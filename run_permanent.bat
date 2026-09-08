@echo off
TITLE AMS 24/7 Permanent Server Supervisor
echo ================================================================
echo   AMS Enterprise System - Permanent Execution Supervisor
echo ================================================================
echo Starting backend and frontend in persistent auto-restart loops...
echo If any service encounters an error or exits, it will restart automatically!
echo Press Ctrl+C to stop all services.
echo ================================================================

cd /d "%~dp0"

:: Ensure logs directory exists
if not exist "logs" mkdir "logs"

:: Check if virtual environment exists
if not exist "backend\venv\Scripts\python.exe" (
    echo [ERROR] backend\venv not found! Please create it first.
    pause
    exit /b 1
)

:: Start Backend in separate persistent loop window
start "AMS Backend (Permanent Supervisor)" cmd /k "echo Backend Supervisor Active... & :loop & echo [%date% %time%] Starting FastAPI Backend... & cd backend & venv\Scripts\uvicorn.exe app.main:app --host 0.0.0.0 --port 8000 & echo [%date% %time%] [ALERT] Backend stopped unexpectedly! Auto-restarting in 3 seconds... >> ..\logs\supervisor.log & timeout /t 3 /nobreak >nul & goto loop"

:: Start Frontend in separate persistent loop window
start "AMS Frontend (Permanent Supervisor)" cmd /k "echo Frontend Supervisor Active... & :loop & echo [%date% %time%] Starting Next.js Frontend... & cd frontend & npm run dev & echo [%date% %time%] [ALERT] Frontend stopped unexpectedly! Auto-restarting in 3 seconds... >> ..\logs\supervisor.log & timeout /t 3 /nobreak >nul & goto loop"

echo.
echo [SUCCESS] Both Backend (Port 8000) and Frontend (Port 3000) are running!
echo Active keepalive loops are preventing database sleep and timeouts.
echo Keep this window open or minimize it to keep services permanently alive.
echo.
pause
