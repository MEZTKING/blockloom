# CI templates

These files mirror the active workflows in `.github/workflows/`. They are kept here so the CI setup can be restored or reviewed without workflow-scope access.

```powershell
.\scripts\install-workflows.ps1
```

- `windows-build.yml` builds and uploads MSI/NSIS installers, optionally signs with `WINDOWS_CERT_BASE64` + `WINDOWS_CERT_PASSWORD`, and drafts a release on version tags.
- `android-build.yml` builds a universal APK, signs it with a debug keystore when no release secret is configured, and can use `ANDROID_KEYSTORE_BASE64` / `ANDROID_KEYSTORE_PASSWORD` / `ANDROID_KEY_ALIAS` / `ANDROID_KEY_PASSWORD` for a persistent release key.

Android SAF export and Play Store AAB/signing still need validation.
