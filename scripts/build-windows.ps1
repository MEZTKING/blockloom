# Build Blockloom's Windows installers on a Windows 10/11 machine.
# Prerequisites: Node 18+, Rust (MSVC), Visual Studio Build Tools, WebView2.
$ErrorActionPreference = "Stop"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw "Node.js is required." }
if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) { throw "Rust (cargo) is required. Install the MSVC toolchain." }

if (-not (Test-Path "node_modules")) {
    npm install
}

npm run check
npm run tauri:build

$release = Join-Path $PWD "src-tauri\target\release\bundle"
& (Join-Path $PSScriptRoot "sign-windows.ps1")
Write-Host ""
Write-Host "Windows installers:" -ForegroundColor Green
Get-ChildItem -Recurse $release -Include *.msi,*.exe | Select-Object FullName,Length
Write-Host ""
Write-Host "Unsigned installers will trigger Windows SmartScreen until code-signed."
