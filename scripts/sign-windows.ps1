# Sign Blockloom's Windows executables and installers after `npm run tauri:build`.
# Configure one of:
#   $env:WINDOWS_CERT_PATH + $env:WINDOWS_CERT_PASSWORD   (PFX)
#   $env:WINDOWS_CERT_THUMBPRINT                          (certificate in CurrentUser\My)
# Optional: $env:WINDOWS_TIMESTAMP_URL (defaults to DigiCert's RFC3161 service)
param(
    [string]$BundleDir = (Join-Path $PSScriptRoot "..\src-tauri\target\release\bundle")
)

$ErrorActionPreference = "Stop"
$certPath = $env:WINDOWS_CERT_PATH
$certPassword = $env:WINDOWS_CERT_PASSWORD
$thumbprint = $env:WINDOWS_CERT_THUMBPRINT
$timestamp = if ($env:WINDOWS_TIMESTAMP_URL) { $env:WINDOWS_TIMESTAMP_URL } else { "http://timestamp.digicert.com" }

if (-not $certPath -and -not $thumbprint) {
    Write-Host "No Windows signing certificate configured; leaving installers unsigned." -ForegroundColor Yellow
    Write-Host "Set WINDOWS_CERT_PATH/WINDOWS_CERT_PASSWORD or WINDOWS_CERT_THUMBPRINT to sign."
    exit 0
}

$signtool = Get-Command signtool.exe -ErrorAction SilentlyContinue
if (-not $signtool) {
    $kits = Get-ChildItem "C:\Program Files (x86)\Windows Kits\10\bin" -Directory -ErrorAction SilentlyContinue |
        Sort-Object Name -Descending
    foreach ($kit in $kits) {
        $candidate = Get-ChildItem (Join-Path $kit.FullName "x64") -Filter signtool.exe -ErrorAction SilentlyContinue |
            Select-Object -First 1
        if ($candidate) { $signtool = $candidate; break }
    }
}
if (-not $signtool) { throw "signtool.exe was not found. Install the Windows SDK." }

$files = Get-ChildItem -Path $BundleDir -Recurse -File -Include *.exe,*.msi -ErrorAction SilentlyContinue
if (-not $files) { throw "No installers found in $BundleDir. Run npm run tauri:build first." }

foreach ($file in $files) {
    Write-Host "Signing $($file.FullName)" -ForegroundColor Cyan
    $arguments = @("sign", "/fd", "SHA256", "/td", "SHA256", "/tr", $timestamp)
    if ($thumbprint) {
        $arguments += @("/sha1", $thumbprint)
    } else {
        $arguments += @("/f", $certPath)
        if ($certPassword) { $arguments += @("/p", $certPassword) }
    }
    $arguments += $file.FullName
    & $signtool.Source @arguments
    if ($LASTEXITCODE -ne 0) { throw "Signing failed for $($file.Name)" }
}

Get-ChildItem -Path $BundleDir -Recurse -File -Include *.exe,*.msi |
    ForEach-Object { Get-AuthenticodeSignature $_.FullName } |
    Format-Table Status, Path -AutoSize
