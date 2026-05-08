import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

const pkg = JSON.parse(
  readFileSync(resolve(__dirname, "package.json"), "utf8"),
) as {
  version: string;
};

const gitCommit = (() => {
  try {
    return execSync("git rev-parse --short=12 HEAD", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "dev";
  }
})();

export default defineConfig({
  base: "/room-vj/",
  plugins: [react(), tailwindcss()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __APP_COMMIT__: JSON.stringify(gitCommit),
    __REPO_URL__: JSON.stringify("https://github.com/baditaflorin/room-vj"),
    __PAYPAL_URL__: JSON.stringify(
      "https://www.paypal.com/paypalme/florinbadita",
    ),
    __PAGES_URL__: JSON.stringify("https://baditaflorin.github.io/room-vj/"),
  },
  build: {
    outDir: "docs",
    emptyOutDir: false,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/@mediapipe")) return "vision";
          if (id.includes("node_modules/three")) return "three";
          if (id.includes("node_modules/peerjs")) return "sync";
          if (id.includes("node_modules/meyda")) return "audio";
          if (id.includes("node_modules")) return "vendor";
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      reporter: ["text", "html"],
    },
  },
});
