import http from "node:http";
import { chromium } from "playwright";

const PORT = Number(process.env.COLLECTOR_PORT || 3210);
const ALLOWED_ORIGINS = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

function cors(req, res) {
  const origin = req.headers.origin;
  // The collector intentionally accepts browser calls from a deployed panel too.
  // It performs no authentication and must only run on the user's own computer.
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGINS.has(origin) ? origin : origin || "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
}

function send(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function phoneFrom(value = "") {
  return value.match(/(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?(?:9\d{4}|\d{4})[-.\s]?\d{4}/)?.[0] || "";
}

function validName(name) {
  return Boolean(name && name.length > 2 && !/^(rua|avenida|rodovia|bairro|são paulo|brasil)$/i.test(name.trim()));
}

function requestedLimit(limit) {
  // 0 significa "extrair tudo" no painel. Mantemos um teto seguro para o navegador.
  if (Number(limit) === 0) return 500;
  return Math.min(Math.max(Number(limit) || 20, 1), 500);
}

function relatedQueries(query) {
  const groups = [
    { terms: ["dentista", "odontologia", "odontologica", "odontologico"], queries: ["dentista", "clínica odontológica", "ortodontista", "implante dentário", "odontopediatra"] },
    { terms: ["estetica", "estética"], queries: ["clínica de estética", "estética facial", "harmonização facial", "biomédica estética"] },
    { terms: ["advogado", "advocacia"], queries: ["advogado", "escritório de advocacia", "advogado trabalhista", "advogado previdenciário"] },
    { terms: ["barbearia", "barbeiro"], queries: ["barbearia", "barbeiro", "barbearia premium"] },
    { terms: ["academia", "fitness"], queries: ["academia", "personal trainer", "estúdio de pilates", "crossfit"] },
  ];
  const segments = String(query).split(",").map((segment) => segment.trim()).filter(Boolean);
  const expanded = segments.flatMap((segment) => {
    const normalized = segment.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const match = groups.find((group) => group.terms.some((term) => normalized.includes(term)));
    return [segment, ...(match?.queries || [])];
  });
  return [...new Set(expanded)];
}

function passesFilters(item, body) {
  if (body.onlyWithPhone && !item.phone) return false;
  if (body.onlyWithWhatsapp && !item.isWhatsapp) return false;
  if (body.onlyWithWebsite && !item.website) return false;
  if (body.onlyWithoutWebsite && item.website) return false;
  if (Number(body.minRating) > 0 && item.rating < Number(body.minRating)) return false;
  return true;
}

function lead(data, query, location, source) {
  const phone = phoneFrom(data.phone);
  const phoneDigits = phone.replace(/\D/g, "");
  return {
    id: `${source}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: data.name,
    category: query,
    phone,
    formattedPhone: phone,
    isWhatsapp: /^(?:55)?\d{2}9\d{8}$/.test(phoneDigits),
    whatsappUrl: null,
    website: data.website || undefined,
    emails: [],
    socials: data.instagram ? { instagram: data.instagram } : {},
    instagramHandle: data.instagram ? `@${data.instagram.split("/").filter(Boolean).pop()}` : undefined,
    address: data.address || location,
    city: location,
    rating: Number(data.rating) || 0,
    reviewsCount: Number(data.reviewsCount) || 0,
    googleMapsUrl: data.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${data.name} ${location}`)}`,
    sourceUrl: source === "instagram" ? data.instagram : data.mapsUrl,
    source: source === "instagram" ? "instagram" : "google_maps",
    enriched: false,
  };
}

async function mapSearch(page, detailsPage, body, emit, max) {
  const { query, location } = body;
  const candidates = new Map();
  const hasStrictFilter = Boolean(body.onlyWithoutWebsite || body.onlyWithWebsite || body.onlyWithPhone || body.onlyWithWhatsapp || Number(body.minRating) > 0);
  // Com filtros, é preciso avaliar bem mais fichas para repor as empresas descartadas.
  const candidateTarget = Math.min(max * (hasStrictFilter ? 8 : 3), 2000);
  const searchTerms = relatedQueries(query);
  const perTermTarget = Math.max(Math.ceil(candidateTarget / searchTerms.length), 30);
  for (const nicheQuery of searchTerms) {
    if (candidates.size >= candidateTarget) break;
    const beforeTerm = candidates.size;
    await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(`${nicheQuery} ${location}`)}?hl=pt-BR`, { waitUntil: "domcontentloaded", timeout: 45000 });
    const accept = page.getByRole("button", { name: /aceitar|concordo/i });
    if (await accept.count()) await accept.first().click().catch(() => {});
    await page.locator('div[role="feed"]').waitFor({ timeout: 15000 }).catch(() => {});
    let stalledScrolls = 0;
    for (let scroll = 0; scroll < 80 && candidates.size < candidateTarget; scroll++) {
      const beforeScroll = candidates.size;
      const cards = await page.locator('a.hfpxzc').evaluateAll((els) => els.map((a) => ({
        name: a.getAttribute("aria-label") || a.textContent || "",
        url: a.href,
        text: a.closest('[role="article"]')?.textContent || a.parentElement?.parentElement?.textContent || "",
      })));
      for (const card of cards) {
        const name = card.name.trim();
        if (validName(name) && !candidates.has(name.toLowerCase())) candidates.set(name.toLowerCase(), card);
      }
      if (candidates.size - beforeTerm >= perTermTarget) break;
      const feed = page.locator('div[role="feed"]');
      if (!(await feed.count())) break;
      await feed.evaluate((element) => { element.scrollTop = element.scrollHeight; });
      await page.waitForTimeout(700);
      stalledScrolls = candidates.size === beforeScroll ? stalledScrolls + 1 : 0;
      if (stalledScrolls >= 4) break;
    }
  }

  let emitted = 0;
  for (const card of candidates.values()) {
    if (emitted >= max) break;
    const name = card.name.trim();
    try {
      await detailsPage.goto(card.url, { waitUntil: "domcontentloaded", timeout: 30000 });
      await detailsPage.waitForTimeout(450);
      const details = await detailsPage.evaluate(() => {
        const website = document.querySelector('a[data-item-id="authority"], a[aria-label*="Site"], a[aria-label*="Website"]')?.getAttribute("href") || "";
        const phone = document.querySelector('button[data-item-id^="phone:"]')?.getAttribute("data-item-id")?.replace(/^phone:/, "") || "";
        const address = document.querySelector('button[data-item-id="address"]')?.textContent || "";
        const text = document.body.innerText || "";
        return { website, phone, address, text };
      });
      const rating = card.text.match(/(\d[,.]\d)/)?.[1]?.replace(",", ".") || "0";
      const reviews = card.text.match(/\(([\d.]+)\)/)?.[1]?.replace(/\D/g, "") || "0";
      const item = lead({ name, mapsUrl: card.url, rating, reviewsCount: reviews, ...details }, query, location, "google_maps");
      if (!passesFilters(item, body)) continue;
      emit(item);
      emitted++;
    } catch {
      // Uma ficha com erro não interrompe a busca das demais empresas.
    }
  }
  return emitted;
}

function instagramUrlFromResult(href, text) {
  const decoded = decodeURIComponent(href || "");
  const match = `${decoded} ${text}`.match(/instagram\.com\/([a-zA-Z0-9._]+)/i);
  return match ? `https://www.instagram.com/${match[1].toLowerCase()}/` : "";
}

async function instagramSearch(page, body, emit, max) {
  const { query, location } = body;
  const city = String(location).split(",")[0].trim();
  const seen = new Set();
  for (const nicheQuery of relatedQueries(query)) {
    if (seen.size >= max) break;
    await page.goto(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(`site:instagram.com ${nicheQuery} ${city}`)}`, { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => {});
    const profiles = await page.locator('a.result__a, a.result-link').evaluateAll((els) => els.map((a) => ({ href: a.href, text: a.textContent || "" })));
    for (const result of profiles) {
      const instagram = instagramUrlFromResult(result.href, result.text);
      const handle = instagram.split("/").filter(Boolean).pop();
      if (!handle || seen.size >= max || ["p", "reel", "reels", "explore", "stories"].includes(handle) || seen.has(handle)) continue;
      seen.add(handle);
      const item = lead({ name: result.text.replace(/\s*[|·-]\s*Instagram.*$/i, "").trim() || handle, instagram }, query, location, "instagram");
      if (passesFilters(item, body)) emit(item);
    }
  }
  return seen.size;
}

async function runSearch(body, res) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ locale: "pt-BR", viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const detailsPage = await context.newPage();
  const results = [];
  const max = requestedLimit(body.limit);
  const emittedKeys = new Set();
  const emit = (item) => {
    const key = `${item.name.toLowerCase()}_${item.source}`;
    if (results.length >= max || emittedKeys.has(key)) return;
    emittedKeys.add(key); results.push(item); send(res, "lead", item);
  };
  try {
    send(res, "status", { message: `Coletor conectado. Buscando até ${max} leads em Google Maps e Instagram...` });
    if (body.source !== "instagram") await mapSearch(page, detailsPage, body, emit, max);
    if ((body.source === "instagram" || body.source === "all") && results.length < max) await instagramSearch(page, body, emit, max - results.length);
    send(res, "done", { total: results.length, stats: { total: results.length } });
  } finally {
    await browser.close();
  }
}

http.createServer(async (req, res) => {
  cors(req, res);
  if (req.method === "OPTIONS") return res.writeHead(204).end();
  if (req.method !== "POST" || req.url !== "/search") return res.writeHead(404).end();
  let raw = "";
  req.on("data", (chunk) => { raw += chunk; });
  req.on("end", async () => {
    try {
      const body = JSON.parse(raw || "{}");
      if (!body.query || !body.location) throw new Error("Nicho e localização são obrigatórios.");
      res.writeHead(200, { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache", Connection: "keep-alive" });
      await runSearch(body, res);
    } catch (error) {
      send(res, "error", { message: error.message || "Falha no coletor local." });
    } finally { res.end(); }
  });
}).listen(PORT, () => console.log(`Neon Leads Collector ativo em http://localhost:${PORT}`));
