import { chromium, Browser, Page } from "playwright";
import { Lead } from "./types";
import { formatPhoneNumber, getWhatsAppLink } from "../utils";
import { buildAggressiveSweepPlan } from "./intent-engine";

interface PlaywrightScrapeParams {
  query: string;
  location: string;
  limit?: number; // 0 = Sem limite
  deepScan?: boolean;
}

/**
 * Motor oficial de extração real do Google Maps via Playwright sem limites
 * Executa varreduras de alta intenção comercial e por bairros/zonas geográficas.
 */
export async function scrapeRealGoogleMaps(
  params: PlaywrightScrapeParams
): Promise<Lead[]> {
  const { query, location, limit = 0, deepScan = false } = params;

  let browser: Browser | null = null;
  const leadMap = new Map<string, Lead>();

  try {
    // 1. Inicializar navegador
    try {
      browser = await chromium.launch({
        channel: "chrome",
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-blink-features=AutomationControlled",
        ],
      });
    } catch {
      browser = await chromium.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-blink-features=AutomationControlled",
        ],
      });
    }

    const context = await browser.newContext({
      locale: "pt-BR",
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 900 },
    });

    const page = await context.newPage();

    // 2. Determinar as consultas usando o Motor de Intenção e Varredura
    const searchQueries = buildAggressiveSweepPlan(query, location, deepScan);
    console.log(`[Neon Leads] Plano de Varredura montado com ${searchQueries.length} consultas estratégicas:`, searchQueries);

    // 3. Executar extração em cada consulta acumulando e removendo duplicatas
    for (let i = 0; i < searchQueries.length; i++) {
      const currentQueryText = searchQueries[i];
      console.log(`[Neon Leads] Varrendo [${i + 1}/${searchQueries.length}]: "${currentQueryText}"...`);

      // Se já atingiu o limite definido pelo usuário (quando limit > 0), pode parar
      if (limit > 0 && leadMap.size >= limit) {
        break;
      }

      try {
        const remainingLimit = limit > 0 ? limit - leadMap.size : 0;
        await scrapeSingleQuery(page, currentQueryText, remainingLimit, leadMap, location, query);
      } catch (subErr: any) {
        console.warn(`[Neon Leads] Erro parcial na consulta "${currentQueryText}":`, subErr.message);
      }
    }
  } catch (err: any) {
    console.error("[Neon Leads] Erro no Playwright:", err);
    throw err;
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }

  const results = Array.from(leadMap.values());
  console.log(`[Neon Leads] Total de leads consolidados e únicos: ${results.length}`);
  return limit > 0 ? results.slice(0, limit) : results;
}

/**
 * Executa a extração em uma única página de resultados do Google Maps
 */
async function scrapeSingleQuery(
  page: Page,
  searchQuery: string,
  targetLimit: number, // 0 = Sem limite
  leadMap: Map<string, Lead>,
  baseLocation: string,
  categoryKeyword: string
) {
  const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}?hl=pt-BR`;

  await page.goto(searchUrl, {
    waitUntil: "domcontentloaded",
    timeout: 40000,
  });

  // Tratar consentimento de cookies se existir
  try {
    const consentBtn = page.locator(
      'button:has-text("Aceitar tudo"), button:has-text("Concordo"), form button:has-text("Aceitar")'
    );
    if (await consentBtn.isVisible({ timeout: 2000 })) {
      await consentBtn.first().click();
      await page.waitForTimeout(800);
    }
  } catch {}

  // Aguardar carregamento do feed
  try {
    await page.waitForSelector('div[role="feed"]', { timeout: 15000 });
  } catch {
    console.warn(`Feed não localizado para "${searchQuery}". Pode não haver resultados.`);
    return;
  }

  await page.waitForTimeout(1200);

  // Rolagem Inteligente do Feed
  let previousCount = 0;
  let consecutiveNoChange = 0;
  const maxConsecutiveNoChange = 4;
  const maxTotalScrolls = targetLimit === 0 ? 80 : Math.ceil(targetLimit / 5) + 10;

  for (let s = 0; s < maxTotalScrolls; s++) {
    const currentCardsCount = await page.locator('div[role="feed"] .fontHeadlineSmall').count();

    // Se já atingiu o limite solicitado (e limit > 0)
    if (targetLimit > 0 && currentCardsCount >= targetLimit) {
      break;
    }

    // Rolar feed
    await page.evaluate(() => {
      const feed = document.querySelector('div[role="feed"]');
      if (feed) {
        feed.scrollTop = feed.scrollHeight;
      }
    });

    await page.waitForTimeout(1200);

    const newCount = await page.locator('div[role="feed"] .fontHeadlineSmall').count();

    if (newCount === previousCount) {
      consecutiveNoChange++;
      // Verificar se chegou explicitamente ao final da lista
      const reachedEnd = await page
        .locator('text="Você chegou ao final da lista"')
        .isVisible({ timeout: 400 })
        .catch(() => false);

      if (reachedEnd || consecutiveNoChange >= maxConsecutiveNoChange) {
        console.log(`[Neon Leads] Fim real do feed atingido com ${newCount} estabelecimentos.`);
        break;
      }
    } else {
      consecutiveNoChange = 0;
    }

    previousCount = newCount;
  }

  // Extrair os dados dos cards
  const places = await page.evaluate(() => {
    const feed = document.querySelector('div[role="feed"]');
    if (!feed) return [];

    const items = Array.from(feed.querySelectorAll('div > div[jsaction]'));
    const list = [];
    const localSeen = new Set();

    for (const item of items) {
      const nameEl = item.querySelector('.fontHeadlineSmall');
      if (!nameEl) continue;

      const name = nameEl.textContent?.trim() || "";
      if (!name || localSeen.has(name)) continue;
      localSeen.add(name);

      const fullText = item.textContent || "";

      // Nota
      const ratingMatch = fullText.match(/(\d[.,]\d)(?:\s*estrelas|\s*\(|\s*[A-ZÀ-Ú])/i);
      let rating = 4.5;
      if (ratingMatch) {
        rating = parseFloat(ratingMatch[1].replace(",", "."));
      }

      // Avaliações
      const revMatch = fullText.match(/\((\d[\d.,]*)\)/);
      const reviewsCount = revMatch ? parseInt(revMatch[1].replace(/\D/g, ""), 10) : 0;

      // Telefone
      const phoneMatch = fullText.match(/(?:\(?\d{2}\)?\s*)?(?:9\d{4}|\d{4})[-.\s]?\d{4}/);
      const phone = phoneMatch ? phoneMatch[0].trim() : "";

      // Website
      let website = "";
      const links = Array.from(item.querySelectorAll('a[href]'));
      for (const a of links) {
        const href = a.getAttribute("href") || "";
        if (
          href.startsWith("http") &&
          !href.includes("google.com") &&
          !href.includes("gstatic.com") &&
          !href.includes("goo.gl")
        ) {
          website = href;
          break;
        }
      }

      // Maps URL - Captura o link oficial do card no Google Maps (a.hfpxzc ou a[href*="/maps/place/"])
      const hfpxzc = item.querySelector('a.hfpxzc');
      const mapsLink = hfpxzc || item.querySelector('a[href*="/maps/place/"]') || item.querySelector('a[href*="maps"]');
      let googleMapsUrl = mapsLink ? mapsLink.getAttribute("href") || "" : "";
      if (googleMapsUrl && googleMapsUrl.startsWith("/")) {
        googleMapsUrl = `https://www.google.com${googleMapsUrl}`;
      }

      // Categoria e Endereço aproximado
      let category = "";
      let address = "";
      const textParts = fullText.split("·").map((p) => p.trim());
      if (textParts.length >= 2) {
        const catCandidate = textParts[0].split(/\d[.,]\d/).pop()?.trim();
        if (catCandidate && catCandidate.length < 35) {
          category = catCandidate;
        }
        address = textParts[1].replace(/Aberto.*|Fechado.*/, "").trim();
      }

      list.push({
        name,
        category,
        phone,
        website,
        rating,
        reviewsCount,
        address,
        googleMapsUrl,
      });
    }

    return list;
  });

  // Inserir no Map deduplicando
  for (const p of places) {
    const isWhats = isMobilePhone(p.phone);
    const formatted = formatPhoneNumber(p.phone);

    // Chave única para evitar duplicatas: Nome + Telefone (ou Nome + Endereço)
    const uniqueKey = `${p.name.toLowerCase().trim()}_${p.phone.replace(/\D/g, "") || p.address.toLowerCase().slice(0, 20)}`;

    if (!leadMap.has(uniqueKey)) {
      // Link direto e oficial de onde foi encontrado no Google Maps
      const directMapsUrl = p.googleMapsUrl && p.googleMapsUrl.includes("http")
        ? p.googleMapsUrl
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.name} ${p.address || baseLocation}`)}`;

      leadMap.set(uniqueKey, {
        id: `gm_real_${Date.now()}_${leadMap.size}`,
        name: p.name,
        category: p.category || categoryKeyword,
        phone: p.phone,
        formattedPhone: formatted,
        isWhatsapp: isWhats,
        whatsappUrl: isWhats ? getWhatsAppLink(p.phone, p.name) : null,
        website: p.website || undefined,
        emails: [],
        socials: {},
        address: p.address || baseLocation,
        city: baseLocation,
        rating: p.rating,
        reviewsCount: p.reviewsCount,
        googleMapsUrl: directMapsUrl,
        sourceUrl: directMapsUrl,
        source: "google_maps",
        enriched: false,
      });
    }

    if (targetLimit > 0 && leadMap.size >= targetLimit) {
      break;
    }
  }
}

function isMobilePhone(phone: string): boolean {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.charAt(2) === "9") return true;
  if (digits.length === 13 && digits.startsWith("55") && digits.charAt(4) === "9") return true;
  return digits.length >= 9;
}
