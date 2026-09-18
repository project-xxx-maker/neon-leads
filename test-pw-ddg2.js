const { chromium } = require("playwright");

async function testDDGPlaywright() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ locale: "pt-BR" });

  await page.goto("https://duckduckgo.com/?q=site%3Ainstagram.com+barbearia+santos+sp&t=h_&ia=web", {
    waitUntil: "domcontentloaded",
    timeout: 20000
  });

  await page.waitForTimeout(3000);

  const results = await page.evaluate(() => {
    const list = [];
    const articles = Array.from(document.querySelectorAll("article[data-testid='result']"));
    for (const art of articles) {
      const titleEl = art.querySelector("h2 a");
      const snippetEl = art.querySelector("[data-result='snippet']");
      const title = titleEl?.textContent?.trim() || "";
      const rawHref = titleEl?.getAttribute("href") || "";
      
      let finalUrl = rawHref;
      const match = rawHref.match(/uddg=([^&]+)/);
      if (match) {
        finalUrl = decodeURIComponent(match[1]);
      }
      list.push({ title, finalUrl, snippet: snippetEl?.textContent?.trim() });
    }
    return list;
  });

  console.log("DDG Playwright articles found:", results.length);
  console.log(JSON.stringify(results.slice(0, 5), null, 2));

  await browser.close();
}

testDDGPlaywright().catch(console.error);