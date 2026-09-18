const cheerio = require("cheerio");

async function testDDGLite() {
  const url = "https://lite.duckduckgo.com/lite/";
  const params = new URLSearchParams({
    q: "site:instagram.com barbearia santos sp"
  });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    },
    body: params.toString()
  });

  const html = await res.text();
  const $ = cheerio.load(html);
  const items = [];
  $("a.result-link").each((i, el) => {
    items.push({
      title: $(el).text().trim(),
      href: $(el).attr("href")
    });
  });

  console.log("DDG Lite results:", items.length);
  console.log(JSON.stringify(items.slice(0, 6), null, 2));
}

testDDGLite().catch(console.error);