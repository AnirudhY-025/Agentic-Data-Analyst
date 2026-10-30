@echo off
set ROOT_DIR=%~dp0
echo ========================================================
echo   Starting Agentic Data Analyst (Backend + Frontend)
echo ========================================================

start "" "%ROOT_DIR%backend\run_backend.bat"
start "" "%ROOT_DIR%frontend\run_frontend.bat"

echo Waiting 5 seconds for servers to initialize...
timeout /t 5 >nul
start http://localhost:5173
echo App launched at http://localhost:5173!
