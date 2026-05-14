#!/usr/bin/env node

const http = require("http");
const fs = require("fs");
const path = require("path");

const port = Number(process.env.PORT || 3000);
const buildDir = path.join(__dirname, "..", "build");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

function sendFile(response, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || "application/octet-stream";

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(200, { "Content-Type": contentType });
    response.end(data);
  });
}

http
  .createServer((request, response) => {
    const requestPath = decodeURIComponent((request.url || "/").split("?")[0]);
    const resolvedPath = path.join(
      buildDir,
      requestPath === "/" ? "index.html" : requestPath,
    );

    if (!resolvedPath.startsWith(buildDir)) {
      response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Forbidden");
      return;
    }

    fs.stat(resolvedPath, (error, stats) => {
      if (!error && stats.isFile()) {
        sendFile(response, resolvedPath);
        return;
      }

      const fallbackPath = path.join(buildDir, "index.html");
      sendFile(response, fallbackPath);
    });
  })
  .listen(port, () => {
    console.log(`Serving build on port ${port}`);
  });
