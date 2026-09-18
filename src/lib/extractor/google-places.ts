import { Lead } from "./types";
import { formatPhoneNumber, getWhatsAppLink } from "../utils";

/**
 * Busca de Leads via API Oficial Google Places (Text Search + Place Details)
 */
export async function searchGooglePlacesAPI(
  query: string,
  location: string,
  apiKey: string,
  limit: number = 20
): Promise<Lead[]> {
  const searchQuery = `${query} in ${location}`;
  const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
    searchQuery
  )}&language=pt-BR&key=${apiKey}`;

  const response = await fetch(searchUrl);
  if (!response.ok) {
    throw new Error(`Google Places API error: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(`Google Places API returned status: ${data.status} - ${data.error_message || ""}`);
  }

  const results = data.results?.slice(0, limit) || [];
  const leads: Lead[] = [];

  for (const place of results) {
    // Busca detalhes do local (telefone, website)
    let phone = "";
    let website = "";

    try {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_phone_number,international_phone_number,website,url,formatted_address,rating,user_ratings_total&language=pt-BR&key=${apiKey}`;
      const detRes = await fetch(detailsUrl);
      if (detRes.ok) {
        const detData = await detRes.json();
        if (detData.result) {
          phone = detData.result.formatted_phone_number || detData.result.international_phone_number || "";
          website = detData.result.website || "";
        }
      }
    } catch (e) {
      console.warn("Details fetch error:", e);
    }

    const isWhats = phone ? /9\d{8}/.test(phone.replace(/\D/g, "")) : false;

    leads.push({
      id: place.place_id || `place_${Date.now()}`,
      name: place.name,
      category: place.types?.[0] || query,
      phone,
      formattedPhone: formatPhoneNumber(phone),
      isWhatsapp: isWhats,
      whatsappUrl: isWhats ? getWhatsAppLink(phone, place.name) : null,
      website: website || undefined,
      emails: [],
      socials: {},
      address: place.formatted_address || "",
      city: location,
      rating: place.rating || 0,
      reviewsCount: place.user_ratings_total || 0,
      googleMapsUrl: place.url || `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
      placeId: place.place_id,
      latitude: place.geometry?.location?.lat,
      longitude: place.geometry?.location?.lng,
      enriched: false,
    });
  }

  return leads;
}
