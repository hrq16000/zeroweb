import { createServerFn } from "@tanstack/react-start";

export type SocialProofItem = {
  name: string;
  city: string;
  action: string;
  time: string;
};

const CITIES = [
  "Curitiba, PR", "São Paulo, SP", "Rio de Janeiro, RJ", "Belo Horizonte, MG",
  "Florianópolis, SC", "Porto Alegre, RS", "Brasília, DF", "Salvador, BA",
  "Fortaleza, CE", "Recife, PE", "Goiânia, GO", "Campinas, SP",
  "Maringá, PR", "Joinville, SC", "Vitória, ES", "Londrina, PR",
];

const FIRST_NAMES = [
  "Carlos", "Ana", "Rafael", "Mariana", "Bruno", "Luana", "Pedro", "Camila",
  "Felipe", "Joana", "Lucas", "Bruna", "Diego", "Patrícia", "Renato", "Júlia",
  "Fernanda", "Marcos", "Eduardo", "Beatriz",
];

function anonymizeName(raw: string | null, fallbackSeed: string): string {
  if (raw) {
    const parts = raw.trim().split(/\s+/);
    const first = parts[0] ?? "";
    const lastInitial = parts.length > 1 ? parts[parts.length - 1].charAt(0).toUpperCase() : "";
    if (first.length > 1) return lastInitial ? `${first} ${lastInitial}.` : first;
  }
  const seed = fallbackSeed.charCodeAt(0) + (fallbackSeed.charCodeAt(1) ?? 0);
  return `${FIRST_NAMES[seed % FIRST_NAMES.length]} ${String.fromCharCode(65 + (seed % 26))}.`;
}

function cityForSeed(seed: string): string {
  const n = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return CITIES[n % CITIES.length];
}

function timeAgo(date: Date): string {
  const diff = Math.max(0, Date.now() - date.getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora há pouco";
  if (mins < 60) return `há ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days}d`;
}

function actionForLead(args: {
  source: string | null;
  offerSlug: string | null;
  serviceName: string | null;
}): string {
  const { source, offerSlug, serviceName } = args;
  if (serviceName) return `solicitou proposta de ${serviceName}`;
  if (offerSlug) return `iniciou um projeto de ${offerSlug.replace(/-/g, " ")}`;
  if (source === "whatsapp") return "iniciou conversa no WhatsApp";
  if (source === "form") return "solicitou um diagnóstico gratuito";
  if (source === "chatbot") return "interagiu com o assistente IA";
  return "solicitou um orçamento";
}

export const getSocialProofFeed = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ items: SocialProofItem[] }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [leadsRes, servicesRes] = await Promise.all([
      supabaseAdmin
        .from("lead_submissions")
        .select("id, name, source, offer_slug, created_at")
        .order("created_at", { ascending: false })
        .limit(20),
      supabaseAdmin
        .from("services")
        .select("slug, name, updated_at")
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .limit(20),
    ]);

    const services = servicesRes.data ?? [];
    const slugToName = new Map<string, string>(services.map((s) => [s.slug, s.name]));

    const leadItems: SocialProofItem[] = (leadsRes.data ?? []).map((l) => {
      const serviceName = l.offer_slug ? slugToName.get(l.offer_slug) ?? null : null;
      return {
        name: anonymizeName(l.name, l.id),
        city: cityForSeed(l.id),
        action: actionForLead({
          source: l.source,
          offerSlug: l.offer_slug,
          serviceName,
        }),
        time: timeAgo(new Date(l.created_at)),
      };
    });

    const serviceItems: SocialProofItem[] = services.slice(0, 10).map((s, i) => ({
      name: `${FIRST_NAMES[(i * 3) % FIRST_NAMES.length]} ${String.fromCharCode(65 + i)}.`,
      city: cityForSeed(s.slug),
      action: `contratou ${s.name}`,
      time: timeAgo(new Date(s.updated_at)),
    }));

    // Intercalar leads e serviços para variedade
    const merged: SocialProofItem[] = [];
    const max = Math.max(leadItems.length, serviceItems.length);
    for (let i = 0; i < max; i++) {
      if (leadItems[i]) merged.push(leadItems[i]);
      if (serviceItems[i]) merged.push(serviceItems[i]);
    }

    return { items: merged.slice(0, 30) };
  },
);
