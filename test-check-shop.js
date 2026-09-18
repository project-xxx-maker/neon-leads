const { chromium } = require("playwright");

async function checkRealShopInstagram() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ locale: "pt-BR" });

  // Busca Jorge Barbershop Santos no Google
  await page.goto("https://www.google.com/maps/search/Jorge+Barbershop+Santos+SP?hl=pt-BR", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  const text = await page.textContent("body");
  console.log("Found on Maps. Length:", text.length);

  await browser.close();
}

checkRealShopInstagram().catch(console.error);