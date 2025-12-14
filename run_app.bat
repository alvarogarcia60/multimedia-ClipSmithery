@echo off
echo Iniciando Servidor Web Simple para Clip Smithery...
echo.

REM Mantenemos la comprobacion de Python
python --version >nul 2>&1
IF ERRORLEVEL 1 (
    echo ERROR: Python no esta instalado.
    echo Descargalo desde https://www.python.org
    pause
    exit
)

REM DETENER cualquier servidor en el puerto 5000 antes de iniciar (Opcional, pero recomendado para evitar errores)
taskkill /f /im python.exe /fi "WINDOWTITLE eq Python HTTP Server" >nul 2>&1

echo El servidor se esta ejecutando en http://localhost:5000/
echo Presiona Ctrl+C para detener el servidor.

REM Lanzar el servidor HTTP simple de Python en segundo plano
REM La carpeta actual (raiz de Clip Smithery) sera el root del servidor.
start "Python HTTP Server" python -m http.server 5000

REM Esperar un poco para que el servidor inicie
timeout /t 2 >nul

REM Abrir el navegador en el menu principal
start http://127.0.0.1:5000/welcome.html