// Bairros de Belo Horizonte para landing pages locais SEO (estratégia SupremaMídia).
// 30 bairros + microdescrição + coordenadas + perfil de negócio típico.

export type BHNeighborhood = {
  slug: string;
  name: string;
  region: "Centro-Sul" | "Sul" | "Pampulha" | "Oeste" | "Leste" | "Noroeste" | "Norte" | "Nordeste" | "Barreiro" | "Venda Nova";
  /** Perfil curto do bairro para H1/intro. */
  vibe: string;
  /** Negócios típicos do bairro (para cases fictícios e prova). */
  typicalBusinesses: string[];
  /** [lat, lng] WGS84. */
  geo: [number, number];
};

export const BH_NEIGHBORHOODS: BHNeighborhood[] = [
  { slug: "savassi", name: "Savassi", region: "Centro-Sul", vibe: "centro gastronômico e financeiro de BH, com alta densidade de escritórios e marcas premium", typicalBusinesses: ["restaurantes", "clínicas estéticas", "escritórios de advocacia", "lojas de moda"], geo: [-19.9388, -43.9344] },
  { slug: "lourdes", name: "Lourdes", region: "Centro-Sul", vibe: "bairro nobre com prédios corporativos, consultórios médicos e marcas de luxo", typicalBusinesses: ["clínicas médicas", "escritórios de arquitetura", "imobiliárias de alto padrão", "joalherias"], geo: [-19.9335, -43.9472] },
  { slug: "funcionarios", name: "Funcionários", region: "Centro-Sul", vibe: "bairro corporativo com forte concentração de prestadores de serviço B2B", typicalBusinesses: ["consultorias", "contabilidades", "escritórios de advocacia", "agências"], geo: [-19.9325, -43.9395] },
  { slug: "buritis", name: "Buritis", region: "Oeste", vibe: "bairro residencial em expansão com forte comércio de vizinhança e empreendedores locais", typicalBusinesses: ["academias", "pet shops", "padarias artesanais", "clínicas odontológicas"], geo: [-19.9694, -43.9722] },
  { slug: "belvedere", name: "Belvedere", region: "Centro-Sul", vibe: "bairro de altíssimo padrão com público AAA e marcas premium", typicalBusinesses: ["concessionárias premium", "clínicas estéticas", "imobiliárias de luxo", "wine bars"], geo: [-19.9594, -43.9344] },
  { slug: "santa-efigenia", name: "Santa Efigênia", region: "Centro-Sul", vibe: "polo hospitalar de Belo Horizonte com alta demanda por serviços médicos e farmacêuticos", typicalBusinesses: ["hospitais", "clínicas médicas", "laboratórios", "farmácias"], geo: [-19.9244, -43.9255] },
  { slug: "anchieta", name: "Anchieta", region: "Centro-Sul", vibe: "bairro residencial nobre com público de alto poder aquisitivo", typicalBusinesses: ["restaurantes", "clínicas estéticas", "escolas particulares", "boutiques"], geo: [-19.9489, -43.9214] },
  { slug: "sion", name: "Sion", region: "Centro-Sul", vibe: "bairro tradicional de classe alta com comércio de serviços qualificados", typicalBusinesses: ["clínicas médicas", "escritórios de advocacia", "academias premium", "restaurantes"], geo: [-19.9492, -43.9300] },
  { slug: "cidade-jardim", name: "Cidade Jardim", region: "Centro-Sul", vibe: "bairro nobre arborizado, lar de profissionais liberais e famílias de alta renda", typicalBusinesses: ["consultórios médicos", "escolas bilíngues", "imobiliárias", "petshops premium"], geo: [-19.9472, -43.9586] },
  { slug: "santo-agostinho", name: "Santo Agostinho", region: "Centro-Sul", vibe: "bairro corporativo com torres comerciais, escritórios e consultórios", typicalBusinesses: ["clínicas médicas", "escritórios", "agências", "restaurantes executivos"], geo: [-19.9333, -43.9519] },
  { slug: "centro-bh", name: "Centro", region: "Centro-Sul", vibe: "coração comercial de BH, com alto fluxo de pedestres e comércio diverso", typicalBusinesses: ["lojas de varejo", "escritórios", "cafeterias", "óticas"], geo: [-19.9208, -43.9378] },
  { slug: "barro-preto", name: "Barro Preto", region: "Centro-Sul", vibe: "polo da moda mineira, com confecções, atacadistas e marcas autorais", typicalBusinesses: ["confecções", "lojas de moda", "ateliês", "agências de moda"], geo: [-19.9244, -43.9508] },
  { slug: "carmo", name: "Carmo", region: "Sul", vibe: "bairro residencial nobre com público qualificado e comércio sofisticado", typicalBusinesses: ["bistrôs", "clínicas estéticas", "escritórios", "imobiliárias"], geo: [-19.9436, -43.9286] },
  { slug: "mangabeiras", name: "Mangabeiras", region: "Centro-Sul", vibe: "bairro de luxo entre serra e cidade, com público de altíssimo padrão", typicalBusinesses: ["consultórios médicos", "imobiliárias de luxo", "escolas premium", "spas"], geo: [-19.9558, -43.9219] },
  { slug: "santa-lucia", name: "Santa Lúcia", region: "Centro-Sul", vibe: "bairro nobre próximo ao BH Shopping com público AAA", typicalBusinesses: ["clínicas", "lojas premium", "imobiliárias", "restaurantes"], geo: [-19.9608, -43.9461] },
  { slug: "estoril", name: "Estoril", region: "Oeste", vibe: "bairro residencial de classe média alta em ascensão", typicalBusinesses: ["academias", "clínicas odontológicas", "pet shops", "padarias"], geo: [-19.9586, -43.9694] },
  { slug: "palmares", name: "Palmares", region: "Nordeste", vibe: "bairro residencial com forte comércio de bairro e empreendedores locais", typicalBusinesses: ["mercados de bairro", "clínicas", "salões de beleza", "restaurantes"], geo: [-19.8819, -43.9342] },
  { slug: "castelo", name: "Castelo", region: "Pampulha", vibe: "bairro residencial nobre da região da Pampulha com público qualificado", typicalBusinesses: ["clínicas", "escolas particulares", "academias", "restaurantes"], geo: [-19.8722, -43.9817] },
  { slug: "ouro-preto", name: "Ouro Preto", region: "Pampulha", vibe: "bairro consolidado da Pampulha com famílias e comércio local forte", typicalBusinesses: ["padarias", "academias", "clínicas", "papelarias"], geo: [-19.8633, -43.9892] },
  { slug: "pampulha", name: "Pampulha", region: "Pampulha", vibe: "região turística e residencial em torno da lagoa, mistura lazer e moradia", typicalBusinesses: ["restaurantes", "pousadas", "clínicas", "centros esportivos"], geo: [-19.8519, -43.9786] },
  { slug: "uniao", name: "União", region: "Nordeste", vibe: "bairro residencial com comércio de bairro forte e público fiel", typicalBusinesses: ["mercados", "padarias", "salões", "oficinas"], geo: [-19.8786, -43.9211] },
  { slug: "santa-tereza", name: "Santa Tereza", region: "Leste", vibe: "bairro boêmio e cultural, conhecido pelos bares e cena musical", typicalBusinesses: ["bares", "restaurantes", "lojas de discos", "estúdios"], geo: [-19.9189, -43.9189] },
  { slug: "floresta", name: "Floresta", region: "Leste", vibe: "bairro tradicional de classe média com forte comércio de rua", typicalBusinesses: ["clínicas", "escolas", "óticas", "lojas de roupa"], geo: [-19.9156, -43.9269] },
  { slug: "horto", name: "Horto", region: "Leste", vibe: "bairro residencial em valorização com público jovem e profissional", typicalBusinesses: ["cafeterias", "academias", "clínicas odontológicas", "pet shops"], geo: [-19.9089, -43.9261] },
  { slug: "barreiro", name: "Barreiro", region: "Barreiro", vibe: "região com forte comércio popular e indústria, alta demanda por serviços", typicalBusinesses: ["lojas populares", "oficinas", "farmácias", "clínicas"], geo: [-19.9819, -44.0250] },
  { slug: "venda-nova", name: "Venda Nova", region: "Venda Nova", vibe: "região de alta densidade populacional com comércio de bairro forte", typicalBusinesses: ["mercados", "clínicas populares", "salões", "restaurantes"], geo: [-19.8125, -43.9617] },
  { slug: "santo-antonio", name: "Santo Antônio", region: "Centro-Sul", vibe: "bairro tradicional de classe alta com público qualificado", typicalBusinesses: ["clínicas", "escritórios", "restaurantes", "imobiliárias"], geo: [-19.9489, -43.9358] },
  { slug: "luxemburgo", name: "Luxemburgo", region: "Centro-Sul", vibe: "bairro residencial nobre com comércio sofisticado e público fiel", typicalBusinesses: ["clínicas estéticas", "academias", "restaurantes", "óticas"], geo: [-19.9469, -43.9494] },
  { slug: "padre-eustaquio", name: "Padre Eustáquio", region: "Noroeste", vibe: "bairro tradicional de classe média com forte comércio de rua", typicalBusinesses: ["lojas de roupa", "clínicas", "padarias", "academias"], geo: [-19.9075, -43.9669] },
  { slug: "prado", name: "Prado", region: "Oeste", vibe: "bairro consolidado com comércio diverso e público de classe média", typicalBusinesses: ["clínicas", "lojas", "restaurantes", "academias"], geo: [-19.9292, -43.9747] },
];

export const ALL_BH_NEIGHBORHOOD_SLUGS = BH_NEIGHBORHOODS.map((n) => n.slug);

export function findBHNeighborhood(slug: string): BHNeighborhood | undefined {
  return BH_NEIGHBORHOODS.find((n) => n.slug === slug);
}

/** Distância aproximada (km) entre dois pontos — suficiente para ordenar vizinhança. */
function distanceKm(a: [number, number], b: [number, number]): number {
  const dLat = (a[0] - b[0]) * 111;
  const dLng = (a[1] - b[1]) * 111 * Math.cos((a[0] * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

/**
 * Bairros para interlinking do silo: prioriza a mesma região e, dentro dela,
 * os geograficamente mais próximos. Completa com os vizinhos mais próximos
 * de outras regiões até atingir `limit`.
 */
export function nearbyBHNeighborhoods(slug: string, limit = 6): BHNeighborhood[] {
  const current = findBHNeighborhood(slug);
  if (!current) return BH_NEIGHBORHOODS.slice(0, limit);

  const others = BH_NEIGHBORHOODS.filter((n) => n.slug !== slug);
  const sorted = [...others].sort((a, b) => {
    const regionA = a.region === current.region ? 0 : 1;
    const regionB = b.region === current.region ? 0 : 1;
    if (regionA !== regionB) return regionA - regionB;
    return distanceKm(current.geo, a.geo) - distanceKm(current.geo, b.geo);
  });

  return sorted.slice(0, limit);
}

