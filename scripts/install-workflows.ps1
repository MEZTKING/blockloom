# Copies the inactive CI templates into .github/workflows.
# Requires a GitHub token with the workflow scope to push the resulting files.
$ErrorActionPreference = "Stop"
$destination = Join-Path $PSScriptRoot "..\.github\workflows"
New-Item -ItemType Directory -Force -Path $destination | Out-Null
Copy-Item (Join-Path $PSScriptRoot "..\ci\windows-build.yml") (Join-Path $destination "windows-build.yml") -Force
Copy-Item (Join-Path $PSScriptRoot "..\ci\android-build.yml") (Join-Path $destination "android-build.yml") -Force
Write-Host "Installed CI templates in $destination"
