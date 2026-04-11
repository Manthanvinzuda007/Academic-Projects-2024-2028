@echo off
title ASCII Art Maker 🎨
color 0D

echo.
echo  ==========================================
echo     ASCII Art Maker  -  Starting up...
echo  ==========================================
echo.

:: Check Python
python --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo  ERROR: Python not found!
    echo.
    echo  Please download Python from:
    echo  https://www.python.org/downloads/
    echo.
    echo  Make sure to tick "Add Python to PATH"
    echo  during installation!
    echo.
    pause
    exit /b 1
)

echo  [OK] Python found!
echo.
echo  Installing packages (only needed once)...
pip install flask pillow numpy --quiet
echo  [OK] All packages ready!
echo.

IF NOT EXIST "%~dp0app.py" (
    echo  ERROR: app.py not found!
    echo  Make sure all files are in the same folder.
    pause
    exit /b 1
)

echo  ==========================================
echo   Opening browser at http://localhost:5050
echo   Close this window to stop the app.
echo  ==========================================
echo.

timeout /t 2 /nobreak >nul
start http://localhost:5050

cd /d "%~dp0"
python app.py

pause
