@echo off
chcp 65001 >nul
cd /d "c:\MES PROJETS\SMARTREUNION\frontend"

echo.
echo ============================================
echo   Redemarrage propre du frontend Next.js
echo ============================================
echo.
echo 1. Arretez d'abord le serveur (Ctrl+C) dans tout terminal ou Next.js tourne.
echo 2. Appuyez sur une touche quand c'est fait...
pause >nul

echo.
echo Suppression du dossier .next ...
rmdir /s /q .next 2>nul
if exist .next (
    echo ERREUR: Impossible de supprimer .next. Fermez Cursor et tous les terminaux, puis relancez ce script.
    pause
    exit /b 1
)
echo OK. Cache supprime.

echo.
echo Lancement: npm run dev
echo Ouvrez http://localhost:3000 quand "Ready" s'affiche.
echo.
call npm run dev

pause
