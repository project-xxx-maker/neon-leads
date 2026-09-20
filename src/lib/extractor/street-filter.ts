/**
 * Filtro rigoroso para eliminar ruas, avenidas, logradouros públicos e nomes genéricos,
 * garantindo que apenas EMPRESAS e ESTABELECIMENTOS REAIS sejam catalogados como leads.
 */

const STREET_PREFIX_REGEX = /^(rua|r\.|avenida|av\.|av\s|travessa|tv\.|alameda|al\.|rodovia|rod\.|estrada|est\.|praça|pça\.|praca|largo|passagem|trevo|ponte|viaduto|servidão|servidao|beco|autoestrada|anel viário|marginal)\s+/i;

const GEOGRAPHIC_INDICATORS = [
  "região metropolitana",
  "regiao metropolitana",
  "região imediata",
  "regiao imediata",
  "região intermediária",
  "regiao intermediaria",
  "região geográfica",
  "zona metropolitana",
  "microrregião",
  "mesorregião",
  "subdistrito",
];

const COMMON_CITIES = [
  "são paulo",
  "sao paulo",
  "campinas",
  "santos",
  "rio de janeiro",
  "belo horizonte",
  "curitiba",
  "florianópolis",
  "florianopolis",
  "brasília",
  "brasilia",
  "salvador",
  "fortaleza",
  "recife",
  "porto alegre",
  "goiânia",
  "goiania",
  "brasil",
];

/**
 * Valida se um nome pertence a um estabelecimento/empresa real e NÃO a uma rua ou entidade geográfica.
 */
export function isValidBusinessEntity(name: string, query?: string): boolean {
  if (!name || typeof name !== "string") return false;

  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();

  // 1. Rejeitar nomes muito curtos ou vazios
  if (trimmed.length < 3) return false;

  // 2. Rejeitar se for prefixo de via pública / rua / avenida
  if (STREET_PREFIX_REGEX.test(trimmed)) {
    return false;
  }

  // 3. Rejeitar termos cartográficos e geográficos típicos do OpenStreetMap
  for (const geo of GEOGRAPHIC_INDICATORS) {
    if (lower.includes(geo)) {
      return false;
    }
  }

  // 4. Rejeitar se o nome for apenas a cidade ou país
  if (COMMON_CITIES.includes(lower)) {
    return false;
  }

  // 5. Rejeitar se o nome for idêntico à própria palavra-chave genérica de busca
  // Exemplo: se buscou "Dentistas", rejeitar estabelecimentos chamados meramente "Dentistas" ou "Dentista"
  if (query) {
    const cleanQuery = query.toLowerCase().trim();
    // Variações de plural/singular
    const singularQuery = cleanQuery.endsWith("s") ? cleanQuery.slice(0, -1) : cleanQuery;
    const pluralQuery = cleanQuery.endsWith("s") ? cleanQuery : `${cleanQuery}s`;

    if (
      lower === cleanQuery ||
      lower === singularQuery ||
      lower === pluralQuery ||
      lower === `os ${cleanQuery}` ||
      lower === `as ${cleanQuery}`
    ) {
      return false;
    }
  }

  // 6. Rejeitar se for formato de CEP ou coordenadas
  if (/^\d{5}-\d{3}$/.test(trimmed) || /^-?\d+\.\d+,\s*-?\d+\.\d+$/.test(trimmed)) {
    return false;
  }

  return true;
}

/**
 * Limpa o nome da empresa removendo sufixos desnecessários como traços de cidade ou títulos do Instagram
 */
export function cleanBusinessName(rawName: string): string {
  if (!rawName) return "";

  let cleaned = rawName.trim();

  // Remover marcações comuns do Instagram: "Nome da Empresa (@handle) • Fotos e vídeos"
  cleaned = cleaned.split("(@")[0];
  cleaned = cleaned.split("•")[0];
  cleaned = cleaned.split("|")[0];

  // Remover sufixos como " - São Paulo, SP" ou " - SP"
  cleaned = cleaned.replace(/\s*-\s*[A-Za-zÀ-ÿ\s]+(?:\/[A-Z]{2}|\s*-\s*[A-Z]{2})?$/i, "");
  
  // Remover " - Instagram" ou " | Google Maps"
  cleaned = cleaned.replace(/\s*-\s*Instagram$/i, "");
  cleaned = cleaned.replace(/\s*\|\s*Google Maps$/i, "");

  return cleaned.trim() || rawName.trim();
}
