# CI templates

These are **inactive templates**, not active GitHub Actions workflows. The repository publishing token used during development lacks GitHub's `workflow` scope, so files under `.github/workflows/` cannot be pushed by it.

After granting the scope:

```powershell
gh auth refresh -s workflow
.\scripts\install-workflows.ps1
git add .github/workflows
git commit -m "Enable Windows and Android CI"
git push
```

- `windows-build.yml` builds and uploads MSI/NSIS installers, optionally signs with `WINDOWS_CERT_BASE64` + `WINDOWS_CERT_PASSWORD`, and drafts a release on version tags.
- `android-build.yml` is a draft Android runner template; it has not been exercised yet. Tauri Android generation and the SAF export adapter still need validation.
