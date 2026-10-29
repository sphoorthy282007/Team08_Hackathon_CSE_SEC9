@echo off
title TeamFair - Group Contribution ^& Dispute System
color 0B
cls

echo ======================================================================
echo    TEAMFAIR: Group Contribution ^& Dispute Management System
echo    Role-Based Portals (Student ^& Faculty) ^| JWT Authentication
echo ======================================================================
echo.

cd /d "%~dp0"

echo [1/3] Verifying dependencies...
if not exist "frontend\node_modules\" (
    echo Installing dependencies, please wait...
    cd frontend && call npm install && cd ..
) else (
    echo [OK] Dependencies verified.
)

echo.
echo [2/3] Opening TeamFair Web Application in your default browser...
start http://localhost:5173

echo.
echo [3/3] Starting TeamFair Server on http://localhost:5173 ...
echo.
echo ======================================================================
echo    The TeamFair server is actively running below.
echo    Keep this window OPEN while using the application!
echo.
echo    Roles Available:
echo      - Student Portal: Sphoorthy, Kavya, Poojitha (Password: student123)
echo      - Faculty Portal: Dr. Robert Vance (Password: faculty123)
echo.
echo    To stop the server at any time:
echo      - Close this window OR double-click STOP_TEAMFAIR.bat
echo ======================================================================
echo.

cd frontend
call npm run dev
