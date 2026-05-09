import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";

const url = process.env.STRANGER_URL ?? "http://127.0.0.1:4174/room-vj/";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  acceptDownloads: true,
  permissions: ["clipboard-read", "clipboard-write"],
  viewport: { width: 1366, height: 900 },
});
const page = await context.newPage();
const downloadDir = mkdtempSync(join(tmpdir(), "room-vj-stranger-"));
const notes = [];

page.on("console", (message) => {
  if (message.type() === "error")
    notes.push(`console-error: ${message.text()}`);
});
page.on("pageerror", (error) => {
  notes.push(`page-error: ${error.message}`);
});

await page.goto(url, { waitUntil: "networkidle" });
await page.getByRole("heading", { name: "Room VJ" }).waitFor();
await page.getByText(/start live mode/i).waitFor();

await page.getByRole("button", { name: "Demo" }).click();
await page.getByText(/Demo mode is running/i).waitFor();

const roomCodeBeforeReset = await page
  .getByLabel("WebRTC room code")
  .inputValue();

await page.getByRole("button", { name: "Copy State" }).click();
await page.getByText(/Session JSON copied/i).waitFor();
const copiedState = await page.evaluate(() => navigator.clipboard.readText());
const statePath = join(
  downloadDir,
  `room-vj-session-${roomCodeBeforeReset.toLowerCase()}.json`,
);
writeFileSync(statePath, copiedState, "utf8");

await page.getByRole("button", { name: "Start Fresh" }).click({ force: true });
await page.waitForTimeout(750);
const bodyTextAfterReset = await page.locator("body").innerText();
const roomCodeAfterReset = await page
  .getByLabel("WebRTC room code")
  .inputValue();
if (roomCodeAfterReset === roomCodeBeforeReset) {
  throw new Error(
    `Reset did not produce a fresh room code. before=${roomCodeBeforeReset} after=${roomCodeAfterReset} body=${bodyTextAfterReset.slice(0, 240)}`,
  );
}

await page.getByRole("button", { name: "Import State" }).click();
await page.locator('input[type="file"]').setInputFiles(statePath);
await page.getByText(/Session import applied/i).waitFor();
const roomCodeAfterImport = await page
  .getByLabel("WebRTC room code")
  .inputValue();
if (roomCodeAfterImport !== roomCodeBeforeReset) {
  throw new Error("Imported state did not restore the original room code.");
}

const downloadPromise = page.waitForEvent("download");
await page.getByRole("button", { name: "Download State" }).click();
const download = await downloadPromise;
const downloadedStatePath = join(downloadDir, download.suggestedFilename());
await download.saveAs(downloadedStatePath);

await page.getByLabel("Debug overlay").check();
await page.getByText(/Session State/i).waitFor();

const repoHref = await page
  .getByRole("link", { name: /Star on GitHub/i })
  .getAttribute("href");
if (repoHref !== "https://github.com/baditaflorin/room-vj") {
  throw new Error(`Unexpected repo link: ${repoHref}`);
}

if (notes.length > 0) {
  throw new Error(notes.join("\n"));
}

console.log(
  JSON.stringify(
    {
      roomCodeBeforeReset,
      roomCodeAfterReset,
      roomCodeAfterImport,
      sawResetMessage: bodyTextAfterReset.includes("Room VJ is reset"),
      downloadedState: downloadedStatePath,
    },
    null,
    2,
  ),
);

await browser.close();
