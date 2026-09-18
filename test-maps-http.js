const cheerio = require("cheerio");

async function testMapsHttp() {
  const q = "site:google.com/maps/place barbearia santos sp";
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    }
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  console.log("Results length:", $(".result").length);
  $(".result").slice(0, 6).each((i, el) => {
    const title = $(el).find(".result__title").text().trim();
    const snippet = $(el).find(".result__snippet").text().trim();
    const rawLink = $(el).find(".result__url").attr("href") || $(el).find("a.result__url").attr("href") || "";
    let targetUrl = "";
    const matchUddg = rawLink.match(/uddg=([^&]+)/);
    if (matchUddg) {
      targetUrl = decodeURIComponent(matchUddg[1]);
    } else {
      targetUrl = rawLink;
    }
    console.log("Title:", title);
    console.log("Snippet:", snippet);
    console.log("Maps URL:", targetUrl);
    console.log("---");
  });
}
testMapsHttp();