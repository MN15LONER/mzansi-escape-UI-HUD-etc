@echo off
cd /d "%~dp0"
node release-server.mjs
if errorlevel 1 pause
