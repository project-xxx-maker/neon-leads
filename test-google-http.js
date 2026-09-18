const cheerio = require("cheerio");

async function testGoogleHttp() {
  const q = encodeURIComponent("barbearia santos sp");
  const url = `https://www.google.com/search?q=${q}&hl=pt-BR&num=20`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept-Language": "pt-BR,pt;q=0.9"
    }
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  
  // Look for Google Local Pack / Maps items
  console.log("Page title:", $("title").text());
  const places = [];
  $('div[data-cid], div.VkpGBb, div.cXedhc').each((i, el) => {
    const name = $(el).find('div[role="heading"], .dbg0pd').text().trim();
    const rating = $(el).find('.Y0A0hc, span[aria-label*="estrelas"]').text().trim();
    const phone = $(el).text();
    if (name) {
      places.push({ name, rating });
    }
  });
  console.log("Local pack places found:", places.length, JSON.stringify(places.slice(0, 5), null, 2));
}
testGoogleHttp();