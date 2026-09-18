export interface LeadSocials {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
}

export type LeadStatus =
  | "novo"
  | "contatado"
  | "negociando"
  | "proposta"
  | "fechado"
  | "perdido";

export interface LeadAudit {
  hasWebsite: boolean;
  priorityLevel: "ALTA_OPORTUNIDADE" | "MEDIA" | "OTIMIZACAO";
  primaryOpportunity: string;
  painPoints: string[];
  recommendedOffer: string;
  offerDescription: string;
  suggestedPrice: string;
  estimatedROI: string;
  pitchWhatsapp: string;
  pitchWhatsappUrl: string;
  pitchEmail: string;
  pitchInstagramDirect?: string;
}

export interface Lead {
  id: string;
  name: string;
  category: string;
  phone: string;
  formattedPhone?: string;
  isWhatsapp: boolean;
  whatsappUrl?: string | null;
  website?: string;
  emails: string[];
  socials: LeadSocials;
  address: string;
  city: string;
  state?: string;
  rating: number;
  reviewsCount: number;
  googleMapsUrl: string;
  placeId?: string;
  latitude?: number;
  longitude?: number;
  enriched: boolean;
  openingHours?: string;
  status?: LeadStatus;
  notes?: string;
  dealValue?: number;
  savedAt?: string;
  audit?: LeadAudit;
  // Campos de Origem e Fonte
  source?: "google_maps" | "instagram";
  sourceUrl?: string; // Link direto de onde foi encontrado (Google Maps ou Perfil do Instagram)
  instagramHandle?: string; // ex: @dentistascampinas
  followersCount?: number;
  bioText?: string;
}

export interface SearchFilterParams {
  query: string;
  location: string;
  limit: number;
  source?: "maps" | "instagram" | "all"; // Fonte de busca
  deepScan?: boolean;
  onlyWithPhone?: boolean;
  onlyWithWhatsapp?: boolean;
  onlyWithWebsite?: boolean;
  onlyWithoutWebsite?: boolean;
  minRating?: number;
  enrichSocialsAndEmail?: boolean;
  googleApiKey?: string;
}

export interface SearchProgressStep {
  stage: "starting" | "maps_search" | "instagram_search" | "enriching" | "filtering" | "completed" | "error";
  progress: number;
  message: string;
  leadsFound: number;
  emailsFound: number;
}
