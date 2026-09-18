const { chromium } = require("playwright");

async function testStealth() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    locale: "pt-BR",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  // Acesse o Google normalmente
  await page.goto("https://www.google.com/?hl=pt-BR", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  // Digite na barra de busca
  await page.fill('textarea[name="q"], input[name="q"]', "instagram barbearia santos sp");
  await page.keyboard.press("Enter");

  await page.waitForSelector("#search", { timeout: 10000 });

  const links = await page.evaluate(() => {
    const list = [];
    const anchors = Array.from(document.querySelectorAll('#search a[href*="instagram.com/"]'));
    for (const a of anchors) {
      const href = a.getAttribute("href") || "";
      const title = a.querySelector("h3")?.textContent || a.textContent || "";
      list.push({ title: title.trim(), href });
    }
    return list;
  });

  console.log("Stealth search found Instagram links:", links.length);
  console.log(JSON.stringify(links.slice(0, 5), null, 2));

  await browser.close();
}

testStealth().catch(console.error);