const cheerio = require("cheerio");

async function testBing() {
  const url = "https://www.bing.com/search?q=site%3Ainstagram.com+barbearia+santos+sp&setlang=pt-br";
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept-Language": "pt-BR,pt;q=0.9"
    }
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  const items = [];
  $("li.b_algo").each((i, el) => {
    const title = $(el).find("h2").text().trim();
    const link = $(el).find("h2 a").attr("href") || "";
    const snippet = $(el).find(".b_caption p").text().trim();
    if (link.includes("instagram.com/")) {
      items.push({ title, link, snippet });
    }
  });
  console.log("Bing Instagram items found:", items.length);
  console.log(JSON.stringify(items.slice(0, 5), null, 2));
}

testBing().catch(console.error);