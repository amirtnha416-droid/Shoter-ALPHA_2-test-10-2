const { app, BrowserWindow } = require("electron");
const fs = require("node:fs/promises");
const http = require("node:http");
const path = require("node:path");

const webRoot = path.resolve(__dirname, "..", "game");
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".wasm": "application/wasm",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg"
};

let server;

function startLocalServer() {
  server = http.createServer(async (req, res) => {
    try {
      const requestUrl = new URL(req.url || "/", "http://127.0.0.1");
      const pathname = decodeURIComponent(requestUrl.pathname);
      const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
      let filePath = path.resolve(webRoot, relativePath);

      if (filePath !== webRoot && !filePath.startsWith(webRoot + path.sep)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }

      let stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        filePath = path.join(filePath, "index.html");
        stat = await fs.stat(filePath);
      }
      if (!stat.isFile()) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      const body = await fs.readFile(filePath);
      res.writeHead(200, {
        "Content-Type": contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
        "Content-Length": body.length,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff"
      });
      res.end(body);
    } catch (error) {
      res.writeHead(error.code === "ENOENT" ? 404 : 500);
      res.end(error.code === "ENOENT" ? "Not found" : "Local game server error");
    }
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
}

async function createWindow() {
  const address = server.address();
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: "ALPHA-X",
    autoHideMenuBar: true,
    backgroundColor: "#0b0d0f",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  await win.loadURL(`http://127.0.0.1:${address.port}/`);
}

app.whenReady().then(async () => {
  await startLocalServer();
  await createWindow();
  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) await createWindow();
  });
}).catch((error) => {
  console.error("ALPHA-X startup failed:", error);
  app.quit();
});

app.on("before-quit", () => {
  if (server) server.close();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
