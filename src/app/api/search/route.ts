import { NextRequest, NextResponse } from "next/server";
import { scrapeGoogleMaps } from "@/lib/extractor/maps-scraper";
import { scrapeInstagramBusiness } from "@/lib/extractor/instagram-scraper";
import { enrichWebsite } from "@/lib/extractor/enricher";
import { Lead, SearchFilterParams } from "@/lib/extractor/types";
import { generateLeadAudit } from "@/lib/ai/advisor";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SearchFilterParams;
    const {
      query,
      location,
      limit = 0,
      source = "maps",
      deepScan = false,
      onlyWithPhone = false,
      onlyWithWhatsapp = false,
      onlyWithWebsite = false,
      onlyWithoutWebsite = false,
      minRating = 0,
      enrichSocialsAndEmail = true,
    } = body;

    if (!query || !location) {
      return NextResponse.json(
        { error: "Palavra-chave e localização são obrigatórios." },
        { status: 400 }
      );
    }

    let leads: Lead[] = [];

    // 1. Executar extração com base na fonte selecionada
    if (source === "instagram") {
      leads = await scrapeInstagramBusiness({ query, location, limit });
    } else if (source === "all") {
      const [mapsLeads, igLeads] = await Promise.all([
        scrapeGoogleMaps({ query, location, limit, deepScan }),
        scrapeInstagramBusiness({ query, location, limit }),
      ]);
      leads = [...mapsLeads, ...igLeads];
    } else {
      // Padrão: Google Maps
      leads = await scrapeGoogleMaps({ query, location, limit, deepScan });
    }

    // 2. Ajuste Fino: Garantir que a Cidade e a Categoria do painel de busca fiquem perfeitamente alinhadas
    const cleanCity = location.trim();
    const cleanCategory = query.trim();

    leads = leads.map((lead) => {
      // Se a categoria veio vazia ou genérica ("Empresa Local"), assume o nicho pesquisado
      let finalCategory = lead.category;
      if (!finalCategory || finalCategory.toLowerCase() === "empresa local" || finalCategory.length < 2) {
        finalCategory = cleanCategory;
      }

      const isInstagram = lead.source === "instagram";
      const sourceUrl = isInstagram
        ? (lead.sourceUrl || lead.socials?.instagram || (lead.instagramHandle ? `https://instagram.com/${lead.instagramHandle.replace("@", "")}` : ""))
        : (lead.sourceUrl || lead.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lead.name} ${cleanCity}`)}`);

      return {
        ...lead,
        category: finalCategory,
        city: cleanCity, // Cidade exatamente como configurada no painel de busca
        sourceUrl,
        googleMapsUrl: lead.googleMapsUrl || sourceUrl,
      };
    });

    // 3. Enriquecimento de Websites
    if (enrichSocialsAndEmail) {
      const batchSize = 10;
      for (let i = 0; i < leads.length; i += batchSize) {
        const batch = leads.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (lead) => {
            if (lead.website && !lead.enriched) {
              try {
                const enriched = await enrichWebsite(lead.website);
                if (enriched.emails.length > 0) {
                  lead.emails = Array.from(new Set([...lead.emails, ...enriched.emails]));
                }
                lead.socials = { ...lead.socials, ...enriched.socials };
                if (enriched.whatsappFound && !lead.isWhatsapp) {
                  lead.isWhatsapp = true;
                  lead.whatsappUrl = enriched.whatsappFound;
                }
                lead.enriched = true;
              } catch (e) {}
            }
          })
        );
      }
    }

    // 4. Gerar Diagnóstico de Vendas por IA para CADA lead
    leads = leads.map((lead) => {
      const audit = generateLeadAudit(lead);
      return {
        ...lead,
        status: lead.status || "novo",
        dealValue: lead.dealValue || 1500,
        audit,
      };
    });

    // 5. Aplicação de Filtros
    let filteredLeads = leads.filter((l) => {
      if (onlyWithPhone && !l.phone) return false;
      if (onlyWithWhatsapp && !l.isWhatsapp) return false;
      if (onlyWithWebsite && !l.website) return false;
      if (onlyWithoutWebsite && l.website) return false;
      if (minRating > 0 && (l.rating || 0) < minRating) return false;
      return true;
    });

    const usedFiltered = filteredLeads.length > 0 ? filteredLeads : leads;

    // 6. REGRA OBRIGATÓRIA: QUEM NÃO TEM SITE SEMPRE NO TOPO!
    usedFiltered.sort((a, b) => {
      const aNoWeb = !a.website ? 1 : 0;
      const bNoWeb = !b.website ? 1 : 0;
      return bNoWeb - aNoWeb;
    });

    const stats = {
      total: usedFiltered.length,
      withPhone: usedFiltered.filter((l) => !!l.phone).length,
      withWhatsapp: usedFiltered.filter((l) => l.isWhatsapp).length,
      withEmail: usedFiltered.filter((l) => l.emails.length > 0).length,
      withWebsite: usedFiltered.filter((l) => !!l.website).length,
      withoutWebsite: usedFiltered.filter((l) => !l.website).length,
      withSocials: usedFiltered.filter(
        (l) => l.socials.instagram || l.socials.facebook || l.socials.linkedin
      ).length,
      fromInstagram: usedFiltered.filter((l) => l.source === "instagram").length,
    };

    return NextResponse.json({
      success: true,
      data: usedFiltered,
      stats,
    });
  } catch (error: any) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { error: "Falha ao processar extração de leads.", details: error.message },
      { status: 500 }
    );
  }
}
