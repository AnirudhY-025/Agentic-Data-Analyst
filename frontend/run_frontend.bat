@echo off
cd /d "%~dp0"
title InsightFlow AI - Frontend (Port 5173)
echo ===================================================
echo   InsightFlow AI Frontend (Vite on Port 5173)
echo ===================================================
echo Starting Vite dev server...
npm run dev
pause
