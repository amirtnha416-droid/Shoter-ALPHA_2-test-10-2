import { copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const gameDir = path.join(projectRoot, "game");
const vendorDir = path.join(gameDir, "vendor");
const rapierDir = path.join(vendorDir, "rapier");

await mkdir(rapierDir, { recursive: true });

async function firstExisting(paths) {
  for (const candidate of paths) {
    try {
      await readFile(candidate);
      return candidate;
    } catch {
      // Try the next known package layout.
    }
  }
  throw new Error("A required local dependency was not found. Run npm install first.");
}

const threeSource = await firstExisting([
  path.join(projectRoot, "node_modules/three/build/three.min.js"),
  path.join(projectRoot, "node_modules/three/build/three.js")
]);
await copyFile(threeSource, path.join(vendorDir, "three.min.js"));

const rapierPackageDir = path.join(projectRoot, "node_modules/@dimforge/rapier3d-compat");
const rapierModule = path.join(rapierPackageDir, "rapier.es.js");
await copyFile(rapierModule, path.join(rapierDir, "rapier.es.js"));

const rapierPackageFiles = await readdir(rapierPackageDir);
const wasmFiles = rapierPackageFiles.filter((name) => name.endsWith(".wasm"));
if (wasmFiles.length === 0) {
  throw new Error("Rapier WASM file was not found in @dimforge/rapier3d-compat.");
}
for (const wasmFile of wasmFiles) {
  await copyFile(path.join(rapierPackageDir, wasmFile), path.join(rapierDir, wasmFile));
}

const htmlPath = path.join(gameDir, "index.html");
let html = await readFile(htmlPath, "utf8");

html = html.replace(
  /<!-- Three\.js r128[\s\S]*?(?=<style>)/,
  '<!-- Locally bundled Three.js r128 -->\n<script src="./vendor/three.min.js"></script>\n'
);

const remoteRapier = "https://cdn.jsdelivr.net/npm/@dimforge/rapier3d-compat@0.14.0/rapier.es.js";
if (html.includes(remoteRapier)) {
  html = html.replaceAll(remoteRapier, "./vendor/rapier/rapier.es.js");
} else if (!html.includes("./vendor/rapier/rapier.es.js")) {
  throw new Error("Could not find the expected Rapier import in game/index.html.");
}

if (!html.includes('./vendor/three.min.js')) {
  throw new Error("Could not replace the external Three.js scripts.");
}

await writeFile(htmlPath, html, "utf8");
console.log("ALPHA-X game prepared with local Three.js and Rapier assets.");
