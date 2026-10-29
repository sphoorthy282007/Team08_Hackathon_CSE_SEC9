@echo off
title TeamFair Docker Fullstack Launcher
color 0A
cls

echo ======================================================================
echo    TEAMFAIR: Microservices Docker Compose Launcher
echo ======================================================================
echo.

cd /d "%~dp0"

echo [1/2] Building and starting all Docker microservice containers...
docker-compose up --build -d

echo.
echo [2/2] Opening TeamFair Web Dashboard...
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo.
echo ======================================================================
echo    Docker Containers Active:
echo      - Frontend UI:        http://localhost:3000
echo      - Spring Cloud Gateway: http://localhost:8080
echo      - Eureka Discovery:   http://localhost:8761
echo.
echo    To stop Docker services, run: STOP_TEAMFAIR.bat
echo ======================================================================
echo.
pause

