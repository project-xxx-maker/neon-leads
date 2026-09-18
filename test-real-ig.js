const cheerio = require("cheerio");

async function testRealInstagramSearch() {
  const query = "Barbearia";
  const location = "Santos SP";
  // Busca perfis reais do Instagram via DuckDuckGo HTML (funciona 100% na Vercel sem navegador!)
  const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(`site:instagram.com "${location}" "${query}"`)}`;

  console.log("Consultando:", searchUrl);
  const res = await fetch(searchUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept-Language": "pt-BR,pt;q=0.9"
    }
  });

  const html = await res.text();
  const $ = cheerio.load(html);
  const realProfiles = [];

  $(".result__body").each((i, el) => {
    const title = $(el).find(".result__title").text().trim();
    const snippet = $(el).find(".result__snippet").text().trim();
    const rawLink = $(el).find(".result__url").attr("href") || $(el).find("a.result__url").attr("href") || "";

    // Decodifica link do duckduckgo uddg=...
    let targetUrl = "";
    const matchUddg = rawLink.match(/uddg=([^&]+)/);
    if (matchUddg) {
      targetUrl = decodeURIComponent(matchUddg[1]);
    } else if (rawLink.includes("instagram.com")) {
      targetUrl = rawLink.startsWith("http") ? rawLink : `https://${rawLink.replace(/^\/\//, "")}`;
    }

    if (targetUrl.includes("instagram.com/")) {
      // Filtrar páginas de sistema
      const matchHandle = targetUrl.match(/instagram\.com\/([a-zA-Z0-9._]+)/i);
      if (matchHandle) {
        const handle = matchHandle[1];
        if (!["p", "reel", "reels", "stories", "explore", "about", "legal"].includes(handle)) {
          realProfiles.push({
            name: title.replace(/• Fotos e vídeos.*| - Instagram.*/i, "").trim(),
            handle: `@${handle}`,
            url: `https://www.instagram.com/${handle}/`,
            snippet
          });
        }
      }
    }
  });

  console.log("Perfis reais encontrados no Instagram via HTTP:", realProfiles.length);
  console.log(JSON.stringify(realProfiles.slice(0, 5), null, 2));
}

testRealInstagramSearch().catch(console.error);