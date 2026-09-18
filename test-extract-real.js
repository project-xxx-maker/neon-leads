const cheerio = require("cheerio");

async function extractRealInstagramProfiles(query, location, maxCount = 20) {
  const variations = [
    `site:instagram.com ${query} ${location}`,
    `site:instagram.com "${query}" "${location}"`,
    `site:instagram.com/ ${location} ${query}`
  ];

  const found = new Map();

  for (const q of variations) {
    if (found.size >= maxCount) break;
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`;

    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept-Language": "pt-BR,pt;q=0.9"
        }
      });
      const html = await res.text();
      const $ = cheerio.load(html);

      $(".result").each((_, el) => {
        const title = $(el).find(".result__title").text().trim();
        const snippet = $(el).find(".result__snippet").text().trim();
        const rawLink = $(el).find(".result__url").attr("href") || $(el).find("a.result__url").attr("href") || "";

        let targetUrl = "";
        const matchUddg = rawLink.match(/uddg=([^&]+)/);
        if (matchUddg) {
          targetUrl = decodeURIComponent(matchUddg[1]);
        } else if (rawLink.includes("instagram.com")) {
          targetUrl = rawLink.startsWith("http") ? rawLink : `https://${rawLink.replace(/^\/\//, "")}`;
        }

        if (targetUrl.includes("instagram.com/")) {
          const matchHandle = targetUrl.match(/instagram\.com\/([a-zA-Z0-9._]+)/i);
          if (matchHandle) {
            const handle = matchHandle[1].toLowerCase().replace(/\/$/, "");
            if (
              !["p", "reel", "reels", "stories", "explore", "about", "legal", "direct", "accounts"].includes(handle) &&
              !found.has(handle)
            ) {
              const cleanName = title
                .replace(/• Fotos e vídeos do Instagram.*$/i, "")
                .replace(/\(@[a-zA-Z0-9._]+\).*$/i, "")
                .replace(/\s*-\s*Instagram.*$/i, "")
                .replace(/Instagram$/i, "")
                .trim() || handle;

              found.set(handle, {
                name: cleanName,
                handle: `@${handle}`,
                url: `https://www.instagram.com/${handle}/`,
                snippet
              });
            }
          }
        }
      });
    } catch (e) {
      console.warn("Fetch error:", e.message);
    }
  }

  return Array.from(found.values());
}

async function run() {
  console.log("=== TESTE 1: Barbearia Santos SP ===");
  const r1 = await extractRealInstagramProfiles("barbearia", "santos sp", 5);
  console.log(JSON.stringify(r1, null, 2));

  console.log("=== TESTE 2: Dentista Campinas SP ===");
  const r2 = await extractRealInstagramProfiles("dentista", "campinas sp", 5);
  console.log(JSON.stringify(r2, null, 2));
}

run().catch(console.error);