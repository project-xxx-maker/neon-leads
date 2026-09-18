const cheerio = require("cheerio");

async function testGoogleSearch() {
  const q = encodeURIComponent("Barbearias em Santos SP");
  const url = `https://html.duckduckgo.com/html/?q=${q}`;
  
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    const results = [];
    $('.result__body').each((i, el) => {
      const title = $(el).find('.result__title').text().trim();
      const snippet = $(el).find('.result__snippet').text().trim();
      const link = $(el).find('.result__url').attr('href') || $(el).find('a.result__url').text().trim();
      results.push({ title, snippet, link });
    });
    console.log("DDG results:", results.length, JSON.stringify(results.slice(0, 3), null, 2));
  } catch (e) {
    console.error("Error:", e.message);
  }
}

testGoogleSearch();