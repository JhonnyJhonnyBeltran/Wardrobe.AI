@echo off
title Klozet Admin Dashboard Launcher
echo Verificando servidor local en el puerto 3000...

curl -s -o nul http://localhost:3000
if %errorlevel% neq 0 (
    echo Iniciando Next.js en segundo plano...
    start "Klozet Dev Server" cmd /k "npm run dev"
    timeout /t 5 /nobreak > nul
)

start http://localhost:3000/admin/insights
exit
