# ALPHA-X application project

The original game is stored at `game/index.html`. Three.js r128 and the Rapier JavaScript glue are embedded in the HTML. The preparation step copies the matching Rapier WASM binary into `game/vendor/rapier/` and points the loader to that local file, so game physics does not depend on a CDN. Google Fonts remain an optional online enhancement.

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
