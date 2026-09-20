import { NextRequest } from "next/server";
import { scrapeGoogleMaps } from "@/lib/extractor/maps-scraper";
import { scrapeInstagramBusiness } from "@/lib/extractor/instagram-scraper";
import { searchGooglePlacesAPI } from "@/lib/extractor/google-places";
import { enrichWebsite } from "@/lib/extractor/enricher";
import { Lead, SearchFilterParams } from "@/lib/extractor/types";
import { generateLeadAudit } from "@/lib/ai/advisor";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SearchFilterParams;
    const {
      query,
      location,
      limit = 20,
      source = "maps",
      deepScan = false,
      onlyWithPhone = false,
      onlyWithWhatsapp = false,
      onlyWithWebsite = false,
      onlyWithoutWebsite = false,
      minRating = 0,
      enrichSocialsAndEmail = true,
      googleApiKey,
    } = body;

    if (!query || !location) {
      return new Response(JSON.stringify({ error: "Palavra-chave e localização são obrigatórios." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const targetLimit = limit > 0 ? limit : 25;
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let isClosed = false;

        const sendEvent = (event: string, data: any) => {
          if (isClosed) return;
          try {
            const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
            controller.enqueue(encoder.encode(payload));
          } catch (e) {
            isClosed = true;
          }
        };

        const allFoundLeads: Lead[] = [];
        const seenIds = new Set<string>();

        try {
          sendEvent("status", {
            message: `Radar ativado para "${query}" em "${location}"...`,
          });

          const handleLiveLead = async (rawLead: Lead) => {
            if (isClosed) return;

            // Filtros
            if (onlyWithPhone && !rawLead.phone) return;
            if (onlyWithWhatsapp && !rawLead.isWhatsapp) return;
            if (onlyWithWebsite && !rawLead.website) return;
            if (onlyWithoutWebsite && rawLead.website) return;
            if (minRating > 0 && (rawLead.rating || 0) < minRating) return;

            const uniqueKey = rawLead.name.toLowerCase().trim() + "_" + (rawLead.phone || rawLead.address || "");
            if (seenIds.has(uniqueKey)) return;
            seenIds.add(uniqueKey);

            // Gerar Auditoria e diagnóstico de vendas por IA
            const audit = generateLeadAudit(rawLead);
            const fullLead: Lead = {
              ...rawLead,
              status: rawLead.status || "novo",
              dealValue: rawLead.dealValue || 1500,
              audit,
            };

            allFoundLeads.push(fullLead);

            // Emitir lead individualmente em tempo real
            sendEvent("lead", fullLead);
            sendEvent("status", {
              message: `Encontrado: ${fullLead.name} (${allFoundLeads.length} leads)`,
            });

            // Enriquecimento assíncrono se tiver site
            if (enrichSocialsAndEmail && fullLead.website && !fullLead.enriched) {
              enrichWebsite(fullLead.website).then((enriched) => {
                if (enriched.emails.length > 0 || enriched.socials.instagram) {
                  fullLead.emails = Array.from(new Set([...fullLead.emails, ...enriched.emails]));
                  fullLead.socials = { ...fullLead.socials, ...enriched.socials };
                  fullLead.enriched = true;
                  sendEvent("lead_update", fullLead);
                }
              }).catch(() => {});
            }
          };

          if (source === "instagram") {
            await scrapeInstagramBusiness({
              query,
              location,
              limit: targetLimit,
              onLead: handleLiveLead,
            });
          } else if (source === "all") {
            await Promise.all([
              googleApiKey && googleApiKey.trim().length > 10
                ? searchGooglePlacesAPI(query, location, googleApiKey, targetLimit).then((places) => {
                    places.forEach(handleLiveLead);
                  })
                : scrapeGoogleMaps({
                    query,
                    location,
                    limit: targetLimit,
                    deepScan,
                    onLead: handleLiveLead,
                  }),
              scrapeInstagramBusiness({
                query,
                location,
                limit: targetLimit,
                onLead: handleLiveLead,
              }),
            ]);
          } else {
            // Google Maps
            if (googleApiKey && googleApiKey.trim().length > 10) {
              try {
                const apiLeads = await searchGooglePlacesAPI(query, location, googleApiKey, targetLimit);
                apiLeads.forEach(handleLiveLead);
              } catch (err: any) {
                await scrapeGoogleMaps({
                  query,
                  location,
                  limit: targetLimit,
                  deepScan,
                  onLead: handleLiveLead,
                });
              }
            } else {
              await scrapeGoogleMaps({
                query,
                location,
                limit: targetLimit,
                deepScan,
                onLead: handleLiveLead,
              });
            }
          }

          // Estatísticas finais
          const stats = {
            total: allFoundLeads.length,
            withPhone: allFoundLeads.filter((l) => !!l.phone).length,
            withWhatsapp: allFoundLeads.filter((l) => l.isWhatsapp).length,
            withEmail: allFoundLeads.filter((l) => l.emails.length > 0).length,
            withWebsite: allFoundLeads.filter((l) => !!l.website).length,
            withoutWebsite: allFoundLeads.filter((l) => !l.website).length,
            withSocials: allFoundLeads.filter(
              (l) => l.socials.instagram || l.socials.facebook || l.socials.linkedin
            ).length,
            fromInstagram: allFoundLeads.filter((l) => l.source === "instagram").length,
          };

          sendEvent("status", { message: `Varredura concluída! ${allFoundLeads.length} estabelecimentos encontrados.` });
          sendEvent("done", { stats, total: allFoundLeads.length });
        } catch (err: any) {
          sendEvent("error", { message: err.message || "Erro na extração de leads." });
        } finally {
          if (!isClosed) {
            isClosed = true;
            try {
              controller.close();
            } catch (e) {}
          }
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
