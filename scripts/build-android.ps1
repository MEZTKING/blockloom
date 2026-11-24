# Build the Android APK on a machine with Android Studio / SDK / NDK and Rust.
$ErrorActionPreference = "Stop"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw "Node.js is required." }
if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) { throw "Rust is required." }
if (-not $env:ANDROID_HOME -and -not $env:ANDROID_SDK_ROOT) { throw "Android SDK is not configured." }

npm install
npm run check
npm run tauri:android:init
npm run tauri:android:build

Write-Host ""
Write-Host "APK output:" -ForegroundColor Green
Get-ChildItem -Recurse "src-tauri\gen\android\app\build\outputs" -Include *.apk,*.aab -ErrorAction SilentlyContinue |
    Select-Object FullName,Length
