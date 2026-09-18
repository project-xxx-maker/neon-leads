const cheerio = require("cheerio");

async function test() {
  const q = "site:instagram.com barbearia santos sp";
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    }
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  console.log("Results length:", $(".result").length);
  $(".result").slice(0, 5).each((i, el) => {
    console.log("Title:", $(el).find(".result__title").text().trim());
    console.log("Link:", $(el).find(".result__url").text().trim());
  });
}
test();