@echo off
REM Update-Journal.bat - double-click me!
REM Reads data\ojt.js and rebuilds the Markdown files in the ojt-journal repo.
title Update OJT Journal
echo.
echo  Updating your OJT journal...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\build-journal.ps1" %*
echo.
pause