@echo off
REM Batch script pour démarrer le proxy automatiquement
REM Ce fichier peut être ajouté au démarrage de Windows

title AI Job Assistant - Proxy Server

echo =========================================
echo   AI Job Assistant - Demarrage Proxy
echo =========================================
echo.

REM Définir les variables
set GEMINI_API_KEY=VOTRE_API_KEY_ICI
set PORT=3002

REM Aller dans le dossier server
cd /d "%~dp0server"

REM Vérifier que Node.js est installé
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Node.js n'est pas installe !
    echo Telechargez-le sur : https://nodejs.org/
    pause
    exit /b 1
)

REM Vérifier que les dépendances sont installées
if not exist "node_modules\" (
    echo [INFO] Installation des dependances...
    call npm install
)

echo [OK] Demarrage du proxy sur http://localhost:%PORT%
echo [INFO] Appuyez sur Ctrl+C pour arreter
echo.

REM Démarrer le serveur
node index.js

pause
