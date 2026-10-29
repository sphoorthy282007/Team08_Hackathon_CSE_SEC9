@echo off
title TeamFair Stopper
color 0C
cls

echo ======================================================================
echo    Stopping TeamFair Application...
echo ======================================================================
echo.

cd /d "%~dp0"

echo [1/3] Closing TeamFair Server windows...
taskkill /FI "WINDOWTITLE eq TeamFair*" /F >nul 2>&1

echo.
echo [2/3] Terminating any processes on port 5173 and 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING 2^>nul') do (
    echo Stopping PID %%a on port 5173...
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING 2^>nul') do (
    echo Stopping PID %%a on port 3000...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [3/3] Stopping Docker microservices (if active)...
docker-compose down >nul 2>&1

echo.
echo ======================================================================
echo    [SUCCESS] TeamFair has been stopped completely!
echo    Ports 5173 and 3000 have been released.
echo ======================================================================
echo.
ping 127.0.0.1 -n 3 >nul
exit
