import { copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const gameDir = path.join(projectRoot, "game");
const htmlPath = path.join(gameDir, "index.html");
const rapierPackageDir = path.join(projectRoot, "node_modules", "@dimforge", "rapier3d-compat");
const wasmOutputDir = path.join(gameDir, "vendor", "rapier");

const html = await readFile(htmlPath, "utf8");
if (!html.includes('id="rapierSrc"') || !html.includes("WebAssembly.instantiate")) {
  throw new Error("The HTML file does not contain the expected bundled Rapier loader.");
}

const packageFiles = await readdir(rapierPackageDir);
const wasmFile = packageFiles.find((name) => name === "rapier_wasm3d_bg.wasm");
if (!wasmFile) {
  throw new Error("rapier_wasm3d_bg.wasm was not found in @dimforge/rapier3d-compat.");
}

await mkdir(wasmOutputDir, { recursive: true });
await copyFile(path.join(rapierPackageDir, wasmFile), path.join(wasmOutputDir, wasmFile));

const originalCall = "await RP.RAPIER.init();";
const patchedCall = "await RP.RAPIER.init(new URL('./vendor/rapier/rapier_wasm3d_bg.wasm', location.href));";
let outputHtml = html;
if (outputHtml.includes(originalCall)) {
  outputHtml = outputHtml.replace(originalCall, patchedCall);
} else if (!outputHtml.includes(patchedCall)) {
  throw new Error("Could not locate the Rapier initialization call to set its local WASM URL.");
}

await writeFile(htmlPath, outputHtml, "utf8");
console.log("ALPHA-X prepared with its Rapier WASM file bundled locally.");
