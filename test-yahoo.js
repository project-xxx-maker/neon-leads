const cheerio = require("cheerio");

async function testYahoo() {
  const url = "https://search.yahoo.com/search?p=site%3Ainstagram.com+barbearia+santos+sp";
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    }
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  const items = [];
  $("a[href*='instagram.com']").each((i, el) => {
    const raw = $(el).attr("href") || "";
    // Yahoo wraps in RU=.../RK=...
    const match = raw.match(/RU=([^/]+)/);
    let decoded = raw;
    if (match) {
      decoded = decodeURIComponent(match[1]);
    }
    if (decoded.includes("instagram.com/")) {
      items.push({
        title: $(el).text().trim(),
        url: decoded
      });
    }
  });
  console.log("Yahoo found:", items.length);
  console.log(JSON.stringify(items.slice(0, 6), null, 2));
}

testYahoo().catch(console.error);