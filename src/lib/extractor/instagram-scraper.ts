import { Lead } from "./types";
import { scrapeGoogleMaps } from "./maps-scraper";
import { enrichWebsite } from "./enricher";
import { formatPhoneNumber, getWhatsAppLink } from "../utils";
import { isValidBusinessEntity, cleanBusinessName } from "./street-filter";
import * as cheerio from "cheerio";

export interface InstagramScrapeParams {
  query: string;
  location: string;
  limit?: number;
  onLead?: (lead: Lead) => void;
}

/**
 * Motor de Extração de Perfis Comerciais e Presença Digital do Instagram
 * Minera perfis 100% REAIS diretamente do Instagram correspondentes ao nicho e cidade,
 * filtra logradouros/ruas e transmite cada perfil em tempo real.
 */
export async function scrapeInstagramBusiness(
  params: InstagramScrapeParams
): Promise<Lead[]> {
  const { query, location, limit = 20, onLead } = params;
  const targetLimit = limit === 0 ? 40 : limit;

  console.log(`[Neon Leads] Minerando perfis do Instagram para "${query}" em "${location}"...`);

  const leadMap = new Map<string, Lead>();

  // 1. Mineração DIRETA de perfis do Instagram por busca de índice
  try {
    await searchDirectInstagramProfiles(query, location, targetLimit, leadMap, onLead);
  } catch (err: any) {
    console.warn("[Neon Leads] Erro na busca direta de Instagram:", err.message);
  }

  // 2. Se ainda precisar de mais leads, minera estabelecimentos reais no Maps (consulta rápida, sem deepScan pesado)
  if (leadMap.size < targetLimit) {
    try {
      const mapsLeads = await scrapeGoogleMaps({
        query,
        location,
        limit: Math.min(15, targetLimit - leadMap.size),
        deepScan: false, // Rápido!
      });

      for (const place of mapsLeads) {
        if (targetLimit > 0 && leadMap.size >= targetLimit) break;

        const uniqueKey = place.instagramHandle
          ? place.instagramHandle.toLowerCase()
          : place.name.toLowerCase().trim();

        if (leadMap.has(uniqueKey)) continue;

        // Se tem website, tenta enriquecer o Instagram oficial
        if (place.website && !place.socials?.instagram) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            const enriched = await enrichWebsite(place.website);
            clearTimeout(timeoutId);

            if (enriched.socials.instagram) {
              const match = enriched.socials.instagram.match(/instagram\.com\/([a-zA-Z0-9._]+)/i);
              const handle = match ? `@${match[1].replace(/\/$/, "")}` : undefined;

              const igLead: Lead = {
                ...place,
                source: "instagram",
                sourceUrl: enriched.socials.instagram,
                instagramHandle: handle,
                socials: {
                  ...place.socials,
                  ...enriched.socials,
                },
                emails: Array.from(new Set([...place.emails, ...enriched.emails])),
                enriched: true,
              };

              leadMap.set(uniqueKey, igLead);
              if (onLead) onLead(igLead);
              continue;
            }
          } catch (e) {}
        }

        // Caso o estabelecimento no Google Maps NÃO tenha Instagram, é uma oportunidade real
        const oppLead: Lead = {
          ...place,
          source: "google_maps",
          sourceUrl: place.googleMapsUrl,
          instagramHandle: undefined,
          enriched: true,
        };

        leadMap.set(uniqueKey, oppLead);
        if (onLead) onLead(oppLead);
      }
    } catch (err: any) {
      console.warn("[Neon Leads] Erro ao extrair locais complementares:", err.message);
    }
  }

  const results = Array.from(leadMap.values());

  // Priorização: Sem site primeiro, depois perfis verificados no Instagram
  results.sort((a, b) => {
    if (!a.website && b.website) return -1;
    if (a.website && !b.website) return 1;
    if (a.instagramHandle && !b.instagramHandle) return -1;
    if (!a.instagramHandle && b.instagramHandle) return 1;
    return 0;
  });

  return results.slice(0, targetLimit);
}

/**
 * Minera contas comerciais reais no Instagram pesquisando perfis indexados
 */
async function searchDirectInstagramProfiles(
  query: string,
  location: string,
  limit: number,
  leadMap: Map<string, Lead>,
  onLead?: (lead: Lead) => void
) {
  const cleanCity = location.split(",")[0].trim();
  const searchQueries = [
    `site:instagram.com ${query} ${cleanCity}`,
    `site:instagram.com "${query}" "${cleanCity}"`,
  ];

  for (const q of searchQueries) {
    if (limit > 0 && leadMap.size >= limit) break;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch("https://lite.duckduckgo.com/lite/", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `q=${encodeURIComponent(q)}`,
      });

      clearTimeout(timeoutId);

      if (!res.ok) continue;

      const html = await res.text();
      if (html.includes("challenge") || html.includes("Checking your browser")) continue;

      const $ = cheerio.load(html);

      $("td .result-link").each((_, el) => {
        if (limit > 0 && leadMap.size >= limit) return false;

        const rawTitle = $(el).text().trim().replace(/\s+/g, " ");
        const href = $(el).attr("href") || "";
        const snippet = $(el).closest("tr").next().find(".result-snippet").text().trim().replace(/\s+/g, " ");

        // Extrair @handle oficial do perfil
        const handleMatch = (href + " " + rawTitle).match(/instagram\.com\/([a-zA-Z0-9._]+)/i);
        if (!handleMatch) return;

        const handle = handleMatch[1].toLowerCase().replace(/\/$/, "");
        if (["p", "reel", "explore", "stories", "tv", "reels", "about", "developer", "accounts"].includes(handle)) {
          return;
        }

        // Limpar nome da empresa
        let businessName = cleanBusinessName(rawTitle);
        if (!businessName || businessName.length < 3) {
          businessName = handle;
        }

        // Filtro anti-ruas
        if (!isValidBusinessEntity(businessName, query)) return;

        const uniqueKey = `@${handle}`;
        if (leadMap.has(uniqueKey)) return;

        // Telefone na bio
        const phoneMatch = snippet.match(/(?:\(?\d{2}\)?\s*)?(?:9\d{4}|\d{4})[-.\s]?\d{4}/);
        const phone = phoneMatch ? phoneMatch[0].trim() : "";
        const isWhats = phone ? /9\d{8}/.test(phone.replace(/\D/g, "")) : false;

        const profileUrl = `https://www.instagram.com/${handle}/`;

        const newLead: Lead = {
          id: `ig_real_${Date.now()}_${leadMap.size}`,
          name: businessName,
          category: query,
          phone,
          formattedPhone: formatPhoneNumber(phone),
          isWhatsapp: isWhats,
          whatsappUrl: isWhats ? getWhatsAppLink(phone, businessName) : null,
          website: undefined,
          emails: [],
          socials: {
            instagram: profileUrl,
          },
          instagramHandle: `@${handle}`,
          address: `${cleanCity}, Brasil`,
          city: location,
          // Perfil indexado não oferece avaliação do Google verificável.
          rating: 0,
          reviewsCount: 0,
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${businessName} ${cleanCity}`)}`,
          sourceUrl: profileUrl,
          source: "instagram",
          enriched: true,
        };

        leadMap.set(uniqueKey, newLead);

        if (onLead) {
          try {
            onLead(newLead);
          } catch (e) {}
        }
      });
    } catch (e: any) {
      console.warn(`[Neon Leads] Erro parcial na busca do Instagram "${q}":`, e.message);
    }
  }
}
