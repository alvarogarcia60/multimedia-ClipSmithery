@echo off
echo Iniciando Mini-Netflix AI...
echo.

REM Comprobar si Python existe
python --version >nul 2>&1
IF ERRORLEVEL 1 (
    echo ERROR: Python no esta instalado.
    echo Descargalo desde https://www.python.org
    pause
    exit
)

REM Instalar dependencias si no existen
pip install -r requirements.txt

REM Lanzar servidor Flask
start "" python app_server.py

REM Esperar un poco y abrir navegador
timeout /t 3 >nul
start http://127.0.0.1:5000
