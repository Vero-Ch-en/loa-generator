@echo off
if exist "%~dp0Local-LOA-Generator.exe" (
  start "Local LOA Generator" "%~dp0Local-LOA-Generator.exe"
  timeout /t 2 /nobreak >nul
  start "" "http://127.0.0.1:8787"
  exit /b 0
)
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Start-LOA-Generator.ps1"
