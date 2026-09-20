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

async function mapSearch(page, body, emit) {
  const { query, location, limit = 20 } = body;
  const max = Math.min(Math.max(Number(limit) || 20, 1), 100);
  await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(`${query} ${location}`)}?hl=pt-BR`, { waitUntil: "domcontentloaded", timeout: 45000 });
  const accept = page.getByRole("button", { name: /aceitar|concordo/i });
  if (await accept.count()) await accept.first().click().catch(() => {});
  await page.locator('div[role="feed"]').waitFor({ timeout: 15000 });

  const seen = new Set();
  for (let scroll = 0; scroll < 20 && seen.size < max; scroll++) {
    const cards = await page.locator('a.hfpxzc').evaluateAll((els) => els.map((a) => ({
      name: a.getAttribute("aria-label") || a.textContent || "",
      url: a.href,
      text: a.closest('[role="article"]')?.textContent || a.parentElement?.parentElement?.textContent || "",
    })));
    for (const card of cards) {
      const name = card.name.trim();
      if (seen.size >= max || !validName(name) || seen.has(name.toLowerCase())) continue;
      seen.add(name.toLowerCase());
      const rating = card.text.match(/(\d[,.]\d)/)?.[1]?.replace(",", ".") || "0";
      const reviews = card.text.match(/\(([\d.]+)\)/)?.[1]?.replace(/\D/g, "") || "0";
      emit(lead({ name, mapsUrl: card.url, rating, reviewsCount: reviews }, query, location, "google_maps"));
    }
    await page.locator('div[role="feed"]').evaluate((feed) => { feed.scrollTop = feed.scrollHeight; });
    await page.waitForTimeout(850);
  }
}

async function instagramSearch(page, body, emit) {
  const { query, location, limit = 20 } = body;
  const city = String(location).split(",")[0].trim();
  const max = Math.min(Math.max(Number(limit) || 20, 1), 50);
  await page.goto(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(`site:instagram.com ${query} ${city}`)}`, { waitUntil: "domcontentloaded", timeout: 30000 });
  const profiles = await page.locator('.result__a').evaluateAll((els) => els.map((a) => ({ href: a.href, text: a.textContent || "" })));
  const seen = new Set();
  for (const result of profiles) {
    const match = `${result.href} ${result.text}`.match(/instagram\.com\/([a-zA-Z0-9._]+)/i);
    if (!match || seen.size >= max) continue;
    const handle = match[1].toLowerCase();
    if (["p", "reel", "reels", "explore", "stories"].includes(handle) || seen.has(handle)) continue;
    seen.add(handle);
    emit(lead({ name: result.text.replace(/\s*[|·-]\s*Instagram.*$/i, "").trim() || handle, instagram: `https://www.instagram.com/${handle}/` }, query, location, "instagram"));
  }
}

async function runSearch(body, res) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ locale: "pt-BR", viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const results = [];
  const emit = (item) => { results.push(item); send(res, "lead", item); };
  try {
    send(res, "status", { message: "Coletor local conectado. Iniciando busca pública..." });
    if (body.source !== "instagram") await mapSearch(page, body, emit);
    if (body.source === "instagram" || body.source === "all") await instagramSearch(page, body, emit);
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
