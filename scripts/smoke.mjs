import { chromium } from "playwright";

const url = process.env.SMOKE_URL ?? "http://127.0.0.1:4173/room-vj/";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
const errors = [];

page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
page.on("pageerror", (error) => errors.push(error.message));

await page.goto(url, { waitUntil: "networkidle" });
await page.getByRole("heading", { name: "Room VJ" }).waitFor();

const repoHref = await page
  .getByRole("link", { name: /Star on GitHub/i })
  .getAttribute("href");
const paypalHref = await page
  .getByRole("link", { name: /PayPal/i })
  .getAttribute("href");
if (repoHref !== "https://github.com/baditaflorin/room-vj")
  throw new Error(`Unexpected repo link: ${repoHref}`);
if (paypalHref !== "https://www.paypal.com/paypalme/florinbadita") {
  throw new Error(`Unexpected PayPal link: ${paypalHref}`);
}

await page.getByText(/v0\.1\.0/).waitFor();
await page.getByRole("button", { name: "Demo" }).click();
await page.getByText(/Demo mode is running/i).waitFor();
await page.waitForTimeout(800);

if (errors.length > 0)
  throw new Error(`Console/page errors:\n${errors.join("\n")}`);

await browser.close();
