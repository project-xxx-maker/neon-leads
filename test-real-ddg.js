const cheerio = require("cheerio");

async function fetchRealInstagramHttp(query, location, limit = 15) {
  const leads = [];
  const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(`site:instagram.com ${query} ${location}`)}`;

  try {
    const res = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "pt-BR,pt;q=0.9"
      }
    });

    const html = await res.text();
    const $ = cheerio.load(html);
    const seen = new Set();

    $(".result").each((_, el) => {
      if (leads.length >= limit) return;
      const title = $(el).find(".result__title").text().trim();
      const snippet = $(el).find(".result__snippet").text().trim();
      const rawLink = $(el).find("a.result__url").text().trim() || $(el).find(".result__url").attr("href") || "";

      // Extrai handle
      const matchHandle = (title + " " + rawLink).match(/@([a-zA-Z0-9._]+)/) || rawLink.match(/instagram\.com\/([a-zA-Z0-9._]+)/);
      if (!matchHandle) return;

      const handle = matchHandle[1].toLowerCase().replace(/\/$/, "");
      if (["p", "reel", "reels", "stories", "explore", "about", "legal", "accounts"].includes(handle)) return;
      if (seen.has(handle)) return;
      seen.add(handle);

      const cleanName = title
        .replace(/• Fotos e vídeos.*| - Instagram.*| \(@[a-zA-Z0-9._]+\).*|Instagram photos and videos/gi, "")
        .trim() || handle;

      leads.push({
        name: cleanName,
        handle: `@${handle}`,
        url: `https://www.instagram.com/${handle}/`,
        snippet
      });
    });
  } catch (e) {
    console.warn("HTTP IG error:", e.message);
  }

  return leads;
}

fetchRealInstagramHttp("Barbearia", "Santos SP", 5).then(res => {
  console.log("Real HTTP leads count:", res.length);
  console.log(JSON.stringify(res, null, 2));
});