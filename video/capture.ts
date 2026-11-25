// Takes the real app screenshots used in the demo chapter.
//
//   bun capture.ts [topic]     (the app must be running on http://127.0.0.1:8000)
//
// It prints the generated quiz question and waits for you to type the answer to submit.
// The answers come from the local model, so the pictures change a little on every run.
// Check src/assets/*.png afterwards; the texts shown in the demo scene quote them.
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import puppeteer, { type Page } from "puppeteer-core";

const APP = "http://127.0.0.1:8000/";
const ASSETS = join(import.meta.dir, "src/assets");
const chrome = Bun.spawnSync([join(import.meta.dir, "node_modules/.bin/hyperframes"), "browser", "path"])
	.stdout.toString()
	.trim()
	.split("\n")
	.at(-1);

/** The page shows "... 12 s" while the model is working; wait until that is gone. */
async function waitUntilIdle(page: Page) {
	await Bun.sleep(1500);
	await page.waitForFunction(() => !/\.\.\. \d+ s/.test(document.body.innerText), {
		timeout: 240_000,
		polling: 500,
	});
	await Bun.sleep(400);
}

const quizText = (page: Page) =>
	page.evaluate(() => document.querySelector("#quiz")?.textContent?.replace(/\s+/g, " "));

mkdirSync(ASSETS, { recursive: true });
const browser = await puppeteer.launch({ executablePath: chrome, headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1600, height: 900, deviceScaleFactor: 2 });

// Ask mode: the same question with and without retrieval.
await page.goto(APP, { waitUntil: "networkidle0" });
await page.click("#tab-ask");
await page.type("#ask-q", "How many moons does Saturn have?");
await page.click("#compare");
await waitUntilIdle(page);
await page.screenshot({ path: join(ASSETS, "ask-compare.png") as `${string}.png` });
console.log(await page.evaluate(() => document.querySelector("#ask")?.textContent?.replace(/\s+/g, " ").slice(0, 900)));

// Quiz mode: a generated question, then a graded answer.
await page.goto(APP, { waitUntil: "networkidle0" });
await page.select("#topic", process.argv[2] ?? "Saturn");
await page.click("#new-question");
await waitUntilIdle(page);
await page.screenshot({ path: join(ASSETS, "quiz-question.png") as `${string}.png` });
console.log(await quizText(page));
await page.type("#answer", prompt("Answer to submit:") ?? "I do not know");
await page.click("#check");
await waitUntilIdle(page);
await page.screenshot({ path: join(ASSETS, "quiz-graded.png") as `${string}.png` });
console.log(await quizText(page));
await browser.close();
