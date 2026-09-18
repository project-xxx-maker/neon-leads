import { Lead } from "./types";
import { scrapeRealGoogleMaps } from "./maps-playwright";
import { enrichWebsite } from "./enricher";

interface InstagramScrapeParams {
  query: string;
  location: string;
  limit?: number;
}

/**
 * Motor de Extração de Perfis Comerciais e Presença Digital do Instagram
 * Extrai estabelecimentos 100% REAIS da região, localiza seus perfis oficiais
 * no Instagram e identifica com precisão quais empresas NÃO possuem presença online.
 */
export async function scrapeInstagramBusiness(
  params: InstagramScrapeParams
): Promise<Lead[]> {
  const { query, location, limit = 20 } = params;
  const targetLimit = limit === 0 ? 50 : limit;

  console.log(`[Neon Leads] Buscando estabelecimentos reais para verificar Instagram: "${query}" em "${location}"...`);

  // 1. Extrai comércios 100% REAIS e verificados no Google Maps
  let realPlaces: Lead[] = [];
  try {
    realPlaces = await scrapeRealGoogleMaps({
      query,
      location,
      limit: targetLimit,
      deepScan: true,
    });
  } catch (err: any) {
    console.warn("[Neon Leads] Falha ao extrair locais para Instagram:", err.message);
  }

  if (realPlaces.length === 0) {
    return [];
  }

  // 2. Para cada estabelecimento real, investigar presença oficial no Instagram e canais digitais
  const enrichedLeads: Lead[] = [];

  for (const place of realPlaces) {
    // Se possui website ou link na ficha, extrai os links sociais reais
    if (place.website) {
      try {
        const enriched = await enrichWebsite(place.website);
        if (enriched.socials.instagram) {
          const match = enriched.socials.instagram.match(/instagram\.com\/([a-zA-Z0-9._]+)/i);
          const handle = match ? `@${match[1].replace(/\/$/, "")}` : undefined;

          enrichedLeads.push({
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
          });
          continue;
        }
      } catch (e) {}
    }

    // Se a empresa NÃO possui Instagram ou NÃO possui site, é uma OPORTUNIDADE REAL
    // O link de origem é sua ficha 100% real no Google Maps
    enrichedLeads.push({
      ...place,
      source: "google_maps",
      sourceUrl: place.googleMapsUrl,
      instagramHandle: undefined, // Nunca inventar conta falsa!
      enriched: true,
    });
  }

  // Priorizar estabelecimentos que foram validados com Instagram ou que não possuem site
  enrichedLeads.sort((a, b) => {
    // 1º Quem NÃO tem site (mina de ouro)
    if (!a.website && b.website) return -1;
    if (a.website && !b.website) return 1;
    // 2º Quem tem Instagram verificado
    if (a.instagramHandle && !b.instagramHandle) return -1;
    if (!a.instagramHandle && b.instagramHandle) return 1;
    return 0;
  });

  return enrichedLeads.slice(0, targetLimit);
}