const { chromium } = require("playwright");

async function test() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ locale: "pt-BR" });
  const page = await context.newPage();

  await page.goto("https://www.google.com/maps/search/Barbearias+em+Santos+SP?hl=pt-BR", {
    waitUntil: "domcontentloaded",
    timeout: 30000
  });

  await page.waitForSelector('div[role="feed"]', { timeout: 10000 });

  const result = await page.evaluate(() => {
    const feed = document.querySelector('div[role="feed"]');
    const items = Array.from(feed.querySelectorAll('div > div[jsaction]'));
    const list = [];
    for (const item of items) {
      const nameEl = item.querySelector('.fontHeadlineSmall');
      if (!nameEl) continue;
      const fullText = item.textContent || "";
      list.push({
        name: nameEl.textContent?.trim(),
        text: fullText
      });
    }
    return list.slice(0, 3);
  });

  console.log("Card texts:", JSON.stringify(result, null, 2));
  await browser.close();
}

test().catch(console.error);