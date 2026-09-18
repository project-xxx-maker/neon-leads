const { chromium } = require("playwright");

async function testDDGPlaywright() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ locale: "pt-BR" });

  console.log("Navigating to DuckDuckGo in Chrome...");
  await page.goto("https://duckduckgo.com/?q=site%3Ainstagram.com+barbearia+santos+sp&t=h_&ia=web", {
    waitUntil: "domcontentloaded",
    timeout: 20000
  });

  await page.waitForTimeout(3000);

  const links = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll("a[href*='instagram.com/']"));
    return anchors.map(a => ({
      text: a.textContent?.trim(),
      href: a.getAttribute("href")
    }));
  });

  console.log("DDG Playwright links:", links.length);
  console.log(JSON.stringify(links.slice(0, 5), null, 2));

  await browser.close();
}

testDDGPlaywright().catch(console.error);