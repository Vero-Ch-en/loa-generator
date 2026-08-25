$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js is required. Install the current LTS version from https://nodejs.org, then run this file again." -ForegroundColor Yellow
  Read-Host "Press Enter to close"
  exit 1
}

if (-not (Test-Path (Join-Path $Root "node_modules"))) {
  Write-Host "Preparing the local LOA Generator for first use..." -ForegroundColor Cyan
  npm install
}

Start-Process "http://127.0.0.1:8787"
node server.mjs
