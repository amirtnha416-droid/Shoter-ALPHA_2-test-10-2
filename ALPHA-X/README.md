# ALPHA-X application project

The original game is stored unchanged at `game/index.html`. It includes the Three.js r128 renderer and the Rapier physics module inline, so the build does not need to fetch those libraries from a CDN. Google Fonts are optional online fonts and fall back to system fonts when unavailable.

## Build

Node.js 22 is required.

### Windows

```sh
npm install
npm run build:windows
```

The Windows build produces an x64 installer and a portable EXE in `release/`.

### Android

Install JDK 17 and the Android SDK, then run:

```sh
npm install
npm run prepare:game
npx cap add android
npx cap sync android
cd android
./gradlew assembleDebug
```

The GitHub Actions workflow runs both platform builds automatically on pushes to `main`.
