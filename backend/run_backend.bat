@echo off
cd /d "%~dp0"
title InsightFlow AI - Backend (Port 8000)
echo ===================================================
echo   InsightFlow AI Backend (FastAPI on Port 8000)
echo ===================================================
echo Starting server...
.venv\Scripts\python.exe -m uvicorn api:app --reload --port 8000
pause
