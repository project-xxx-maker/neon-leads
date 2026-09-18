const { chromium } = require("playwright");

async function testDDGNormal() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ locale: "pt-BR" });

  await page.goto("https://duckduckgo.com/?q=barbearia+santos+sp+instagram&ia=web", {
    waitUntil: "domcontentloaded",
    timeout: 20000
  });

  await page.waitForTimeout(4000);

  const results = await page.evaluate(() => {
    const list = [];
    const allLinks = Array.from(document.querySelectorAll("a[href]"));
    for (const a of allLinks) {
      const href = a.getAttribute("href") || "";
      if (href.includes("instagram.com")) {
        let clean = href;
        const m = href.match(/uddg=([^&]+)/);
        if (m) clean = decodeURIComponent(m[1]);
        list.push({ text: a.textContent?.trim(), url: clean });
      }
    }
    return list;
  });

  console.log("DDG Normal query found:", results.length);
  console.log(JSON.stringify(results.slice(0, 6), null, 2));

  await browser.close();
}

testDDGNormal().catch(console.error);