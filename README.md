# ALPHA-X

ALPHA-X is packaged as a Windows desktop application and an Android application from the same original HTML game.

## Downloads from GitHub Actions

Open **Actions** → **Build ALPHA-X** → select the latest completed run.

- **ALPHA-X-Windows**: Windows x64 installer and portable executable.
- **ALPHA-X-Android-APK**: installable Android debug APK.

Every push to `main` starts both builds. You can also start them manually with **Run workflow**.

The Android output is a debug APK. A signed release APK requires a private Android signing keystore; no signing key is included in this repository.
