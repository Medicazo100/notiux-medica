@echo off
title Notiux Médica - Asistente de IA Medica
echo ========================================================
echo  Iniciando Notiux Médica local - Asistente de IA para Medicos
echo ========================================================
echo.
set "HOST=127.0.0.1"
set "OPEN_BROWSER=1"
echo Buscando un puerto local disponible y abriendo Notiux Médica en el navegador...
node server.js
pause
