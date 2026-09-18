const { chromium } = require("playwright");

async function testPlaywrightGoogle() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ locale: "pt-BR" });
  const page = await context.newPage();

  const searchUrl = "https://www.google.com/search?q=site%3Ainstagram.com+barbearia+santos+sp&hl=pt-BR";
  console.log("Navigating to:", searchUrl);
  await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 20000 });

  const data = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href*="instagram.com/"]'));
    return links.map(a => ({
      href: a.getAttribute("href"),
      text: a.textContent?.trim()
    })).filter(x => x.href && !x.href.includes("/p/") && !x.href.includes("/reel/"));
  });

  console.log("Playwright found links:", data.length);
  console.log(JSON.stringify(data.slice(0, 6), null, 2));

  await browser.close();
}

testPlaywrightGoogle().catch(console.error);