// Bairros de Curitiba + cidades-chave da RMC para landing pages locais SEO.
// Mesma estratégia das páginas de BH.

export type CWBNeighborhood = {
  slug: string;
  name: string;
  city: string; // "Curitiba" ou cidade RMC
  region: string;
  vibe: string;
  typicalBusinesses: string[];
  geo: [number, number];
};

export const CWB_NEIGHBORHOODS: CWBNeighborhood[] = [
  // ─────────── Curitiba ───────────
  { slug: "batel", name: "Batel", city: "Curitiba", region: "Centro-Sul", vibe: "polo financeiro e gastronômico premium de Curitiba", typicalBusinesses: ["restaurantes finos", "clínicas estéticas", "escritórios de advocacia", "boutiques de luxo"], geo: [-25.4434, -49.2872] },
  { slug: "agua-verde", name: "Água Verde", city: "Curitiba", region: "Sul", vibe: "bairro residencial nobre com forte comércio local e público AAA", typicalBusinesses: ["clínicas médicas", "academias", "restaurantes", "imobiliárias"], geo: [-25.4592, -49.2839] },
  { slug: "centro-cwb", name: "Centro", city: "Curitiba", region: "Centro", vibe: "coração comercial e financeiro de Curitiba com alto fluxo", typicalBusinesses: ["escritórios", "lojas de varejo", "cafeterias", "óticas"], geo: [-25.4290, -49.2671] },
  { slug: "centro-civico", name: "Centro Cívico", city: "Curitiba", region: "Centro", vibe: "polo administrativo com órgãos públicos e prestadores de serviço B2G", typicalBusinesses: ["consultorias", "escritórios", "restaurantes executivos", "cartórios"], geo: [-25.4178, -49.2706] },
  { slug: "alto-da-xv", name: "Alto da XV", city: "Curitiba", region: "Leste", vibe: "bairro residencial valorizado com comércio refinado", typicalBusinesses: ["clínicas", "cafeterias", "padarias artesanais", "bistrôs"], geo: [-25.4264, -49.2497] },
  { slug: "cabral", name: "Cabral", city: "Curitiba", region: "Norte", vibe: "bairro tradicional de classe média alta com forte comércio local", typicalBusinesses: ["restaurantes", "clínicas odontológicas", "academias", "óticas"], geo: [-25.4106, -49.2611] },
  { slug: "cristo-rei", name: "Cristo Rei", city: "Curitiba", region: "Leste", vibe: "bairro universitário em ascensão com público jovem qualificado", typicalBusinesses: ["cafeterias", "cursos preparatórios", "copiadoras", "restaurantes"], geo: [-25.4361, -49.2475] },
  { slug: "juveve", name: "Juvevê", city: "Curitiba", region: "Norte", vibe: "bairro nobre arborizado com público de alto poder aquisitivo", typicalBusinesses: ["clínicas médicas", "escritórios", "escolas particulares", "pet shops"], geo: [-25.4106, -49.2658] },
  { slug: "rebouças", name: "Rebouças", city: "Curitiba", region: "Centro-Sul", vibe: "bairro misto com comércio diverso e empresas de tecnologia", typicalBusinesses: ["agências", "escritórios", "restaurantes", "academias"], geo: [-25.4439, -49.2667] },
  { slug: "bigorrilho", name: "Bigorrilho", city: "Curitiba", region: "Centro-Sul", vibe: "bairro residencial moderno com forte vida noturna e gastronomia", typicalBusinesses: ["restaurantes", "bares", "academias", "clínicas estéticas"], geo: [-25.4339, -49.2972] },
  { slug: "champagnat", name: "Champagnat", city: "Curitiba", region: "Centro-Sul", vibe: "bairro nobre com clínicas de alto padrão e marcas premium", typicalBusinesses: ["clínicas estéticas", "consultórios médicos", "boutiques", "academias premium"], geo: [-25.4322, -49.3047] },
  { slug: "merces", name: "Mercês", city: "Curitiba", region: "Centro", vibe: "bairro residencial nobre com público qualificado e comércio sofisticado", typicalBusinesses: ["clínicas", "escolas", "restaurantes", "imobiliárias"], geo: [-25.4194, -49.2853] },
  { slug: "ahu", name: "Ahú", city: "Curitiba", region: "Norte", vibe: "bairro residencial tradicional com famílias e comércio de bairro", typicalBusinesses: ["padarias", "clínicas", "academias", "papelarias"], geo: [-25.4078, -49.2742] },
  { slug: "portao", name: "Portão", city: "Curitiba", region: "Sul", vibe: "bairro com forte comércio de rua e alta densidade comercial", typicalBusinesses: ["lojas de roupa", "academias", "clínicas", "restaurantes"], geo: [-25.4733, -49.3025] },
  { slug: "novo-mundo", name: "Novo Mundo", city: "Curitiba", region: "Sul", vibe: "bairro popular em expansão com forte comércio local", typicalBusinesses: ["mercados", "farmácias", "salões", "oficinas"], geo: [-25.4886, -49.3014] },
  { slug: "boqueirao", name: "Boqueirão", city: "Curitiba", region: "Sul", vibe: "bairro populoso com forte comércio de bairro e empreendedores locais", typicalBusinesses: ["mercados", "padarias", "clínicas populares", "lojas"], geo: [-25.5022, -49.2772] },
  { slug: "santa-felicidade", name: "Santa Felicidade", city: "Curitiba", region: "Noroeste", vibe: "polo gastronômico italiano e destino turístico de Curitiba", typicalBusinesses: ["restaurantes italianos", "cantinas", "vinícolas", "padarias"], geo: [-25.3819, -49.3253] },
  { slug: "bacacheri", name: "Bacacheri", city: "Curitiba", region: "Norte", vibe: "bairro residencial consolidado com comércio próximo ao aeroporto militar", typicalBusinesses: ["clínicas", "escolas", "restaurantes", "academias"], geo: [-25.3961, -49.2461] },
  { slug: "boa-vista", name: "Boa Vista", city: "Curitiba", region: "Norte", vibe: "bairro residencial amplo com forte comércio de bairro", typicalBusinesses: ["padarias", "academias", "clínicas", "pet shops"], geo: [-25.3925, -49.2503] },
  { slug: "ecoville", name: "Ecoville", city: "Curitiba", region: "Oeste", vibe: "bairro planejado de alto padrão com torres residenciais e centros empresariais", typicalBusinesses: ["clínicas premium", "academias", "escolas bilíngues", "escritórios"], geo: [-25.4408, -49.3258] },
  { slug: "campo-comprido", name: "Campo Comprido", city: "Curitiba", region: "Oeste", vibe: "bairro residencial em expansão com novos empreendimentos", typicalBusinesses: ["mercados", "clínicas", "academias", "restaurantes"], geo: [-25.4528, -49.3322] },
  { slug: "cic", name: "CIC", city: "Curitiba", region: "Oeste", vibe: "Cidade Industrial de Curitiba — polo industrial e logístico", typicalBusinesses: ["indústrias", "transportadoras", "fornecedores B2B", "restaurantes industriais"], geo: [-25.4825, -49.3392] },
  { slug: "tarumã", name: "Tarumã", city: "Curitiba", region: "Leste", vibe: "bairro residencial tradicional com comércio local e empresas familiares", typicalBusinesses: ["clínicas", "academias", "restaurantes", "lojas"], geo: [-25.4286, -49.2225] },
  { slug: "cajuru", name: "Cajuru", city: "Curitiba", region: "Leste", vibe: "bairro populoso com forte comércio de bairro e empreendedores", typicalBusinesses: ["mercados", "farmácias", "salões", "oficinas"], geo: [-25.4458, -49.2247] },
  { slug: "uberaba", name: "Uberaba", city: "Curitiba", region: "Sudeste", vibe: "bairro misto com indústria, comércio e residências", typicalBusinesses: ["mercados", "oficinas", "restaurantes", "academias"], geo: [-25.4761, -49.2186] },

  // ─────────── RMC — Região Metropolitana ───────────
  { slug: "sao-jose-dos-pinhais-centro", name: "Centro — São José dos Pinhais", city: "São José dos Pinhais", region: "RMC", vibe: "centro da cidade com forte comércio e proximidade ao aeroporto Afonso Pena", typicalBusinesses: ["hotéis", "restaurantes", "clínicas", "lojas"], geo: [-25.5333, -49.2056] },
  { slug: "colombo-centro", name: "Centro — Colombo", city: "Colombo", region: "RMC", vibe: "polo metropolitano ao norte de Curitiba com forte comércio italiano e indústria", typicalBusinesses: ["restaurantes italianos", "indústrias", "lojas", "clínicas"], geo: [-25.2911, -49.2236] },
  { slug: "araucaria-centro", name: "Centro — Araucária", city: "Araucária", region: "RMC", vibe: "polo industrial e refinaria, com economia robusta e prestadores B2B", typicalBusinesses: ["indústrias", "transportadoras", "fornecedores", "restaurantes"], geo: [-25.5933, -49.4106] },
  { slug: "pinhais-centro", name: "Centro — Pinhais", city: "Pinhais", region: "RMC", vibe: "cidade conurbada com Curitiba, forte comércio e indústria leve", typicalBusinesses: ["indústrias", "comércio", "clínicas", "academias"], geo: [-25.4453, -49.1922] },
  { slug: "fazenda-rio-grande-centro", name: "Centro — Fazenda Rio Grande", city: "Fazenda Rio Grande", region: "RMC", vibe: "cidade em forte crescimento ao sul da RMC com novos empreendimentos", typicalBusinesses: ["mercados", "construtoras", "clínicas", "lojas"], geo: [-25.6592, -49.3083] },
];

export const ALL_CWB_NEIGHBORHOOD_SLUGS = CWB_NEIGHBORHOODS.map((n) => n.slug);

export function findCWBNeighborhood(slug: string): CWBNeighborhood | undefined {
  return CWB_NEIGHBORHOODS.find((n) => n.slug === slug);
}

// Cidades-chave da RMC para LocalBusiness areaServed (estendido) no __root.
export const RMC_AREAS_SERVED = [
  { name: "Curitiba", geo: [-25.4284, -49.2733] as [number, number] },
  { name: "São José dos Pinhais", geo: [-25.5333, -49.2056] as [number, number] },
  { name: "Colombo", geo: [-25.2911, -49.2236] as [number, number] },
  { name: "Araucária", geo: [-25.5933, -49.4106] as [number, number] },
  { name: "Pinhais", geo: [-25.4453, -49.1922] as [number, number] },
  { name: "Fazenda Rio Grande", geo: [-25.6592, -49.3083] as [number, number] },
  { name: "Campo Largo", geo: [-25.4581, -49.5269] as [number, number] },
  { name: "Campo Magro", geo: [-25.3719, -49.4156] as [number, number] },
  { name: "Almirante Tamandaré", geo: [-25.3247, -49.3103] as [number, number] },
  { name: "Piraquara", geo: [-25.4419, -49.0681] as [number, number] },
];
