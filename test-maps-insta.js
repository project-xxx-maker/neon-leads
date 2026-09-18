const { chromium } = require("playwright");

async function testMapsForInsta() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ locale: "pt-BR" });

  await page.goto("https://www.google.com/maps/search/barbearia+santos+sp?hl=pt-BR", { waitUntil: "domcontentloaded" });
  await page.waitForSelector('div[role="feed"]', { timeout: 10000 });

  const places = await page.evaluate(() => {
    const feed = document.querySelector('div[role="feed"]');
    const items = Array.from(feed.querySelectorAll('div > div[jsaction]'));
    const list = [];
    for (const item of items) {
      const nameEl = item.querySelector('.fontHeadlineSmall');
      if (!nameEl) continue;
      const name = nameEl.textContent?.trim() || "";
      const links = Array.from(item.querySelectorAll('a[href]')).map(a => a.getAttribute("href"));
      list.push({ name, links });
    }
    return list.slice(0, 5);
  });

  console.log("Maps places with links:", JSON.stringify(places, null, 2));
  await browser.close();
}

testMapsForInsta().catch(console.error);