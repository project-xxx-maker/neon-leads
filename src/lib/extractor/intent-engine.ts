/**
 * Motor de Expansão de Intenção e Varredura Territorial
 * Gera variações semânticas de alta conversão e subdivisões por bairros/zonas
 * para minerar o MÁXIMO possível de leads únicos em qualquer nicho ou cidade.
 */

export const BRAZILIAN_CITY_NEIGHBORHOODS: Record<string, string[]> = {
  santos: [
    "Gonzaga",
    "Boqueirão",
    "Ponta da Praia",
    "Embaré",
    "Centro",
    "Aparecida",
    "Campo Grande",
    "Marapé",
    "Encruzilhada",
    "Vila Mathias",
  ],
  campinas: [
    "Cambuí",
    "Centro",
    "Taquaral",
    "Barão Geraldo",
    "Guanabara",
    "Nova Campinas",
    "Castelo",
    "Swift",
    "Bonfim",
    "Mansões Santo Antônio",
  ],
  "são paulo": [
    "Centro",
    "Pinheiros",
    "Moema",
    "Vila Mariana",
    "Tatuapé",
    "Santana",
    "Itaim Bibi",
    "Morumbi",
    "Perdizes",
    "Bela Vista",
    "Jardins",
    "Lapa",
    "Santo Amaro",
  ],
  "rio de janeiro": [
    "Centro",
    "Copacabana",
    "Barra da Tijuca",
    "Tijuca",
    "Botafogo",
    "Ipanema",
    "Recreio dos Bandeirantes",
    "Campo Grande",
    "Flamengo",
    "Leblon",
  ],
  "belo horizonte": [
    "Centro",
    "Savassi",
    "Lourdes",
    "Pampulha",
    "Buritis",
    "Funcionários",
    "Gutierrez",
    "Sion",
    "Anchieta",
    "Prado",
  ],
  curitiba: [
    "Centro",
    "Batel",
    "Água Verde",
    "Cabral",
    "Bigorrilho",
    "Portão",
    "Juvevê",
    "Santa Felicidade",
    "Alto da XV",
  ],
  "porto alegre": [
    "Centro Histórico",
    "Moinhos de Vento",
    "Menino Deus",
    "Petrópolis",
    "Bela Vista",
    "Mont'Serrat",
    "Passo d'Areia",
  ],
  florianópolis: [
    "Centro",
    "Trindade",
    "Lagoa da Conceição",
    "Ingleses",
    "Campeche",
    "Coqueiros",
    "Santa Mônica",
    "Cacupé",
  ],
  brasília: [
    "Asa Sul",
    "Asa Norte",
    "Sudoeste",
    "Águas Claras",
    "Taguatinga",
    "Guará",
    "Lago Sul",
    "Lago Norte",
  ],
  goiânia: [
    "Setor Bueno",
    "Setor Marista",
    "Setor Oeste",
    "Centro",
    "Jardim Goiás",
    "Setor Sul",
  ],
  salvador: [
    "Pituba",
    "Barra",
    "Caminho das Árvores",
    "Rio Vermelho",
    "Graça",
    "Imbuí",
    "Itaigara",
    "Ondina",
  ],
  fortaleza: [
    "Aldeota",
    "Meireles",
    "Centro",
    "Cocó",
    "Dionísio Torres",
    "Bairro de Fátima",
  ],
  recife: [
    "Boa Viagem",
    "Espinheiro",
    "Graças",
    "Jaqueira",
    "Madalena",
    "Casa Forte",
    "Pina",
  ],
  "ribeirão preto": [
    "Centro",
    "Jardim Sumaré",
    "Jardim Irajá",
    "Nova Aliança",
    "Ribeirânia",
    "Vila Tibério",
  ],
  sorocaba: [
    "Centro",
    "Campolim",
    "Além Ponte",
    "Trujilo",
    "Mangal",
    "Jardim dos Estados",
  ],
  "são josé dos campos": [
    "Centro",
    "Jardim Aquárius",
    "Vila Ema",
    "Jardim Satélite",
    "Urbanova",
  ],
};

const NICHE_INTENT_SYNONYMS: Record<string, string[]> = {
  barbearia: ["barbeiro", "corte masculino", "salão masculino", "barbearia tradicional"],
  dentista: [
    "clínica odontológica",
    "consultório dentário",
    "implantes dentários",
    "ortodontia",
    "odontologia",
  ],
  advogado: [
    "escritório de advocacia",
    "advocacia",
    "consultoria jurídica",
    "advogado trabalhista",
    "advogado cível",
  ],
  restaurante: [
    "gastronomia",
    "pizzaria",
    "hamburgueria",
    "bistrô",
    "restaurante delivery",
    "comida",
  ],
  estética: [
    "clínica de estética",
    "salão de beleza",
    "harmonização facial",
    "estética avançada",
    "espaço de beleza",
  ],
  "clínica de estética": [
    "estética facial",
    "estética corporal",
    "harmonização",
    "biomedicina estética",
  ],
  pet: [
    "pet shop",
    "clínica veterinária",
    "banho e tosa",
    "hospital veterinário",
  ],
  academia: [
    "centro de treinamento",
    "crossfit",
    "academia de musculação",
    "personal trainer",
  ],
  mecânica: [
    "oficina mecânica",
    "auto center",
    "funilaria e pintura",
    "manutenção automotiva",
  ],
  imobiliária: [
    "corretor de imóveis",
    "imóveis",
    "locação e vendas de imóveis",
    "administradora de imóveis",
  ],
  contabilidade: [
    "escritório de contabilidade",
    "contador",
    "assessoria contábil",
    "contabilidade empresarial",
  ],
};

export function generateHighIntentQueries(query: string, location: string): string[] {
  const normalizedQuery = query.toLowerCase().trim();
  const queries: string[] = [];

  queries.push(`${query} em ${location}`);

  for (const [key, synonyms] of Object.entries(NICHE_INTENT_SYNONYMS)) {
    if (normalizedQuery.includes(key)) {
      synonyms.slice(0, 3).forEach((syn) => {
        queries.push(`${syn} em ${location}`);
      });
      break;
    }
  }

  if (queries.length === 1) {
    queries.push(`serviços de ${query} em ${location}`);
    queries.push(`melhores ${query} em ${location}`);
  }

  return queries;
}

export function getCityZones(location: string): string[] {
  const norm = location.toLowerCase();

  for (const [cityName, zones] of Object.entries(BRAZILIAN_CITY_NEIGHBORHOODS)) {
    if (norm.includes(cityName)) {
      return zones;
    }
  }

  return ["Centro", "Zona Sul", "Zona Norte", "Zona Leste", "Zona Oeste"];
}

export function buildAggressiveSweepPlan(
  query: string,
  location: string,
  deepScan: boolean
): string[] {
  const queries: string[] = [];

  queries.push(`${query} em ${location}`);

  const intentVars = generateHighIntentQueries(query, location);
  intentVars.forEach((q) => {
    if (!queries.includes(q)) queries.push(q);
  });

  if (!deepScan) {
    return queries;
  }

  const zones = getCityZones(location);
  zones.slice(0, 6).forEach((zone) => {
    const zoneQuery = `${query} em ${zone}, ${location}`;
    if (!queries.includes(zoneQuery)) {
      queries.push(zoneQuery);
    }
  });

  return queries;
}