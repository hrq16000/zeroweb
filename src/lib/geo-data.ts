// ============================================================================
// Sprint 5 — Rich geo dataset.
// Single source of truth for cities and states. Used by /$city/$service,
// the city/state hubs, the sitemaps and the interlinking helpers.
// Designed to scale: add a new row → new SEO route automatically (no other
// code change is required as long as the slug is unique).
// ============================================================================

export type Region = "Norte" | "Nordeste" | "Centro-Oeste" | "Sudeste" | "Sul";

export type CityInfo = {
  slug: string;
  name: string;
  state: string;        // "Paraná"
  stateCode: string;    // "PR"
  region: Region;
  population: number;   // IBGE est.
  gentilico: string;    // "curitibano"
  ddd: string;          // "41"
  lat: number;
  lng: number;
  capitalRegional: boolean;
  microrregiao: string;
  mesorregiao: string;
  /** Short flavor sentence — drives local context variations. */
  flavor: string;
};

export const CITIES: Record<string, CityInfo> = {
  curitiba: {
    slug: "curitiba", name: "Curitiba", state: "Paraná", stateCode: "PR",
    region: "Sul", population: 1773733, gentilico: "curitibano", ddd: "41",
    lat: -25.4284, lng: -49.2733, capitalRegional: true,
    microrregiao: "Curitiba", mesorregiao: "Metropolitana de Curitiba",
    flavor: "polo de tecnologia e indústria do Sul",
  },
  "sao-paulo": {
    slug: "sao-paulo", name: "São Paulo", state: "São Paulo", stateCode: "SP",
    region: "Sudeste", population: 11451245, gentilico: "paulistano", ddd: "11",
    lat: -23.5505, lng: -46.6333, capitalRegional: true,
    microrregiao: "São Paulo", mesorregiao: "Metropolitana de São Paulo",
    flavor: "maior centro econômico da América Latina",
  },
  "rio-de-janeiro": {
    slug: "rio-de-janeiro", name: "Rio de Janeiro", state: "Rio de Janeiro", stateCode: "RJ",
    region: "Sudeste", population: 6211223, gentilico: "carioca", ddd: "21",
    lat: -22.9068, lng: -43.1729, capitalRegional: true,
    microrregiao: "Rio de Janeiro", mesorregiao: "Metropolitana do Rio de Janeiro",
    flavor: "segundo maior mercado consumidor do país",
  },
  "belo-horizonte": {
    slug: "belo-horizonte", name: "Belo Horizonte", state: "Minas Gerais", stateCode: "MG",
    region: "Sudeste", population: 2315560, gentilico: "belo-horizontino", ddd: "31",
    lat: -19.9167, lng: -43.9345, capitalRegional: true,
    microrregiao: "Belo Horizonte", mesorregiao: "Metropolitana de Belo Horizonte",
    flavor: "hub de inovação e startups de Minas",
  },
  "porto-alegre": {
    slug: "porto-alegre", name: "Porto Alegre", state: "Rio Grande do Sul", stateCode: "RS",
    region: "Sul", population: 1332570, gentilico: "porto-alegrense", ddd: "51",
    lat: -30.0346, lng: -51.2177, capitalRegional: true,
    microrregiao: "Porto Alegre", mesorregiao: "Metropolitana de Porto Alegre",
    flavor: "capital criativa do Sul, forte em serviços e tecnologia",
  },
  fortaleza: {
    slug: "fortaleza", name: "Fortaleza", state: "Ceará", stateCode: "CE",
    region: "Nordeste", population: 2428708, gentilico: "fortalezense", ddd: "85",
    lat: -3.7319, lng: -38.5267, capitalRegional: true,
    microrregiao: "Fortaleza", mesorregiao: "Metropolitana de Fortaleza",
    flavor: "principal economia do Ceará e polo digital do Nordeste",
  },
  salvador: {
    slug: "salvador", name: "Salvador", state: "Bahia", stateCode: "BA",
    region: "Nordeste", population: 2417678, gentilico: "soteropolitano", ddd: "71",
    lat: -12.9714, lng: -38.5014, capitalRegional: true,
    microrregiao: "Salvador", mesorregiao: "Metropolitana de Salvador",
    flavor: "maior mercado consumidor do Nordeste",
  },
  brasilia: {
    slug: "brasilia", name: "Brasília", state: "Distrito Federal", stateCode: "DF",
    region: "Centro-Oeste", population: 2817381, gentilico: "brasiliense", ddd: "61",
    lat: -15.8267, lng: -47.9218, capitalRegional: true,
    microrregiao: "Brasília", mesorregiao: "Distrito Federal",
    flavor: "capital federal, forte em serviços, governo e tecnologia",
  },
  florianopolis: {
    slug: "florianopolis", name: "Florianópolis", state: "Santa Catarina", stateCode: "SC",
    region: "Sul", population: 537213, gentilico: "florianopolitano", ddd: "48",
    lat: -27.5949, lng: -48.5482, capitalRegional: true,
    microrregiao: "Florianópolis", mesorregiao: "Grande Florianópolis",
    flavor: "ilha do silício brasileira, referência em startups",
  },
  recife: {
    slug: "recife", name: "Recife", state: "Pernambuco", stateCode: "PE",
    region: "Nordeste", population: 1488920, gentilico: "recifense", ddd: "81",
    lat: -8.0476, lng: -34.8770, capitalRegional: true,
    microrregiao: "Recife", mesorregiao: "Metropolitana de Recife",
    flavor: "berço do Porto Digital, principal polo de TI do Nordeste",
  },
};

export const ALL_CITY_SLUGS = Object.keys(CITIES);

export type StateInfo = {
  code: string;
  name: string;
  region: Region;
  slug: string;
  cities: string[]; // city slugs
};

export const STATES: Record<string, StateInfo> = (() => {
  const map: Record<string, StateInfo> = {};
  for (const c of Object.values(CITIES)) {
    const key = c.stateCode.toLowerCase();
    if (!map[key]) {
      map[key] = { code: c.stateCode, name: c.state, region: c.region, slug: key, cities: [] };
    }
    map[key].cities.push(c.slug);
  }
  return map;
})();

export const ALL_STATE_SLUGS = Object.keys(STATES);

export function getCity(slug: string): CityInfo | undefined {
  return CITIES[slug];
}

export function getState(slug: string): StateInfo | undefined {
  return STATES[slug];
}

/** Returns N "related" cities, excluding the given slug.
 *  Prioritizes same region, then capitals from other regions. Deterministic. */
export function relatedCities(slug: string, n = 4): CityInfo[] {
  const me = CITIES[slug];
  if (!me) return Object.values(CITIES).slice(0, n);
  const sameRegion = Object.values(CITIES).filter((c) => c.slug !== slug && c.region === me.region);
  const others = Object.values(CITIES).filter((c) => c.slug !== slug && c.region !== me.region);
  return [...sameRegion, ...others].slice(0, n);
}
