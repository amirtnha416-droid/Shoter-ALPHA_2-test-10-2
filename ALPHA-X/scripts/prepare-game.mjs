import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const htmlPath = path.join(projectRoot, "game", "index.html");
const html = await readFile(htmlPath, "utf8");

const requiredMarkers = [
  "THREE",
  'id="rapierSrc"',
  "WebAssembly.instantiate",
  "getElementById('rapierSrc')"
];

for (const marker of requiredMarkers) {
  if (!html.includes(marker)) {
    throw new Error(`The bundled game is missing a required component: ${marker}`);
  }
}

console.log("ALPHA-X verified: Three.js and Rapier are embedded in the game HTML.");
