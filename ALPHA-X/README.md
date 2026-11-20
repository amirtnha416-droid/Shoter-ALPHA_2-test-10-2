# ALPHA-X

This folder contains the original ALPHA-X game and its Windows/Android packaging setup.

## Build downloads with GitHub Actions

1. Open the repository's **Actions** tab.
2. Select **Build ALPHA-X**.
3. Press **Run workflow** (or push a commit to `main`).
4. Open the completed workflow run and download its artifacts:
   - **ALPHA-X-Windows** — Windows installer and portable EXE.
   - **ALPHA-X-Android-APK** — installable debug APK.

The Android workflow creates a debug APK. A Play Store/release APK needs signing configuration and a private keystore; no signing key is stored in this repository.

## Build locally

Install Node.js 22 and the Android prerequisites (JDK 17 and Android SDK).

```sh
npm install
npm run build:windows
```

For Android:

```sh
npm run prepare:game
npx cap add android
npx cap sync android
cd android
./gradlew assembleDebug
```

The preparation script bundles the same Three.js r128 and Rapier 0.14.0 versions used by the original game into local files. The game can therefore load its physics and rendering dependencies without relying on a CDN. Google Fonts remain an optional online enhancement.

The original HTML source is kept at `game/index.html`; the build preparation step patches a working checkout to use the bundled local libraries.
