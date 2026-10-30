$repoDir = "C:\Users\yekka\Documents\Agentic-Data-Analyst-Repo"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   Starting Agentic Data Analyst (Backend + Frontend)   " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# Start Backend using the venv python directly
Start-Process cmd -ArgumentList "/k", "cd /d `"$repoDir\backend`" && `"$repoDir\backend\.venv\Scripts\python.exe`" -m uvicorn api:app --reload --port 8000"

# Start Frontend
Start-Process cmd -ArgumentList "/k", "cd /d `"$repoDir\frontend`" && npm run dev"

# Wait and open browser
Start-Sleep -Seconds 4
Start-Process "http://localhost:5173"

Write-Host "Both services launched! Browser opened to http://localhost:5173" -ForegroundColor Green
