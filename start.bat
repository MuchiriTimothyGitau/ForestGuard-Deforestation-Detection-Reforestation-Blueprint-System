@echo off
echo Starting ForestGuard...
echo.

echo [1/2] Starting backend...
start cmd /k "cd /d %~dp0backend && python main.py"

echo [2/2] Starting frontend...
start cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ForestGuard is starting up!
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8000
