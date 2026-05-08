import { copyFileSync, existsSync } from "node:fs";

if (!existsSync("docs/index.html")) {
  throw new Error("docs/index.html was not produced by the build");
}

copyFileSync("docs/index.html", "docs/404.html");
