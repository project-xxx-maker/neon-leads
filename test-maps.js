const { chromium } = require("playwright");

async function test() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ locale: "pt-BR" });
  const page = await context.newPage();

  console.log("Acessando Google Maps...");
  await page.goto("https://www.google.com/maps/search/Barbearias+em+Santos+SP?hl=pt-BR", {
    waitUntil: "domcontentloaded",
    timeout: 30000
  });

  try {
    await page.waitForSelector('div[role="feed"]', { timeout: 10000 });
  } catch (e) {
    console.log("Aviso: feed nao apareceu em 10s");
  }

  const data = await page.evaluate(() => {
    const feed = document.querySelector('div[role="feed"]');
    if (!feed) return { error: "feed not found" };

    // Cada estabelecimento no Google Maps é envolvido em div.Nv2PK
    const placeCards = Array.from(feed.querySelectorAll("div.Nv2PK, div:has(a.hfpxzc)"));
    const links = Array.from(feed.querySelectorAll("a.hfpxzc, a[href*='/maps/place/']"));

    return {
      cardsCount: placeCards.length,
      linksCount: links.length,
      sampleLinks: links.slice(0, 4).map(a => ({
        label: a.getAttribute("aria-label"),
        href: a.getAttribute("href")
      }))
    };
  });

  console.log("Resultado da inspecao:", JSON.stringify(data, null, 2));
  await browser.close();
}

test().catch(console.error);