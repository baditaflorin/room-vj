import { rmSync } from "node:fs";

for (const path of [
  "docs/assets",
  "docs/index.html",
  "docs/404.html",
  "docs/favicon.svg",
  "docs/site.webmanifest",
  "docs/sw.js",
  "docs/icons.svg",
]) {
  rmSync(path, { force: true, recursive: true });
}
