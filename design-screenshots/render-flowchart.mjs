import { chromium } from "playwright";
import path from "node:path";
import { pathToFileURL } from "node:url";

const html = pathToFileURL(path.resolve("flowchart.html")).href;
const out = path.resolve("flowchart.png");

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(html);
await page.waitForSelector("body[data-ready='1']", { timeout: 30000 });
await page.waitForTimeout(800);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log("ok", out);
