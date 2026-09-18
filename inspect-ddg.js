const cheerio = require("cheerio");

async function inspectHtml() {
  const url = "https://html.duckduckgo.com/html/?q=site%3Ainstagram.com+barbearia+santos+sp";
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    }
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  $(".result").slice(0, 3).each((i, el) => {
    const a = $(el).find("a.result__url");
    console.log("i:", i);
    console.log("href:", a.attr("href"));
    console.log("text:", a.text().trim());
  });
}
inspectHtml();