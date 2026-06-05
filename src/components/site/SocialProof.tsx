import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, MapPin, Star, Users, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

type Notif = {
  name: string;
  city: string;
  action: string;
  time: string;
};

const POOL: Notif[] = [
  { name: "Carlos M.", city: "Curitiba, PR", action: "solicitou um diagnóstico gratuito", time: "agora há pouco" },
  { name: "Ana P.", city: "São Paulo, SP", action: "fechou plano Pro", time: "há 3 min" },
  { name: "Studio Vértice", city: "Florianópolis, SC", action: "iniciou um projeto de site", time: "há 7 min" },
  { name: "Rafael S.", city: "Porto Alegre, RS", action: "agendou reunião comercial", time: "há 12 min" },
  { name: "Mariana L.", city: "Belo Horizonte, MG", action: "contratou automação de IA", time: "há 18 min" },
  { name: "TechFlow Ltda.", city: "Rio de Janeiro, RJ", action: "lançou novo e-commerce", time: "há 22 min" },
  { name: "Bruno F.", city: "Maringá, PR", action: "pediu auditoria de SEO", time: "há 28 min" },
  { name: "Casa Verde Co.", city: "Brasília, DF", action: "subiu o tráfego em 240%", time: "há 41 min" },
  { name: "Luana T.", city: "Goiânia, GO", action: "ativou campanha no Google Ads", time: "há 2 min" },
  { name: "Pedro K.", city: "Campinas, SP", action: "renovou contrato anual", time: "há 5 min" },
  { name: "Mercado Aurora", city: "Salvador, BA", action: "implantou chatbot de IA", time: "há 9 min" },
  { name: "Camila R.", city: "Recife, PE", action: "alcançou top 3 no Google", time: "há 14 min" },
  { name: "Northway Co.", city: "Manaus, AM", action: "subiu CTR em 3.2x", time: "há 19 min" },
  { name: "Felipe A.", city: "Vitória, ES", action: "pediu proposta de marketing", time: "há 25 min" },
  { name: "Joana B.", city: "Natal, RN", action: "contratou pacote SEO Local", time: "há 32 min" },
  { name: "DentClin", city: "Fortaleza, CE", action: "captou 47 leads nesta semana", time: "há 36 min" },
  { name: "Lucas P.", city: "Londrina, PR", action: "iniciou auditoria GMN", time: "há 45 min" },
  { name: "Bruna H.", city: "Joinville, SC", action: "atualizou identidade visual", time: "há 52 min" },
  { name: "Vila Bistrô", city: "Curitiba, PR", action: "dobrou reservas via Instagram Ads", time: "há 58 min" },
  { name: "Diego N.", city: "Cuiabá, MT", action: "fechou plano Enterprise", time: "há 1h" },
  { name: "Patrícia O.", city: "Uberlândia, MG", action: "implementou WhatsApp Business API", time: "há 1h" },
  { name: "Imobiliária Norte", city: "Belém, PA", action: "lançou portal de imóveis", time: "há 1h" },
  { name: "Renato V.", city: "Sorocaba, SP", action: "começou consultoria de IA", time: "há 1h" },
  { name: "Júlia M.", city: "Ribeirão Preto, SP", action: "subiu conversão de LP em 38%", time: "há 1h" },
  { name: "AutoPeças BR", city: "São José dos Campos, SP", action: "rodou nova campanha PMax", time: "há 2h" },
  { name: "Fernanda G.", city: "Juiz de Fora, MG", action: "marcou diagnóstico estratégico", time: "há 2h" },
  { name: "Studio HUB", city: "Niterói, RJ", action: "publicou novo blog editorial", time: "há 2h" },
  { name: "Marcos T.", city: "Caxias do Sul, RS", action: "ativou remarketing dinâmico", time: "há 2h" },
];

export function SocialProof() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [online, setOnline] = useState(127);

  useEffect(() => {
    if (dismissed) return;
    const start = setTimeout(() => setVisible(true), 4500);
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % POOL.length);
        setVisible(true);
      }, 500);
    }, 8000);
    const live = setInterval(() => {
      setOnline((n) => Math.max(80, Math.min(220, n + Math.floor(Math.random() * 9) - 4)));
    }, 4000);
    return () => {
      clearTimeout(start);
      clearInterval(cycle);
      clearInterval(live);
    };
  }, [dismissed]);

  const item = POOL[idx];

  return (
    <>
      {/* Live online counter (bottom-left) */}
      <div className="fixed bottom-5 left-5 z-40 hidden sm:flex items-center gap-2 rounded-full glass px-3 py-2 shadow-elegant text-xs font-medium">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <Users className="w-3.5 h-3.5 text-emerald-500" />
        <span>
          <strong className="text-foreground">{online}</strong>{" "}
          <span className="text-muted-foreground">pessoas online</span>
        </span>
      </div>

      <AnimatePresence>
        {visible && !dismissed && (
          <motion.div
            key={idx}
            initial={{ y: 24, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            onAnimationStart={() => trackEvent("social_proof_view", { name: item.name })}
            className="fixed bottom-24 left-4 sm:left-5 z-40 max-w-[19rem]"
          >
            <div className="relative rounded-2xl glass shadow-elegant border border-border p-3 pr-8">
              <button
                aria-label="Fechar"
                onClick={() => setDismissed(true)}
                className="absolute top-2 right-2 p-1 rounded-md hover:bg-muted text-muted-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-start gap-3">
                <div className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-primary text-primary-foreground shrink-0 font-bold">
                  {item.name.charAt(0)}
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-foreground flex items-center gap-1">
                    {item.name}
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="text-muted-foreground text-xs">{item.action}</div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {item.city}
                    </span>
                    <span>·</span>
                    <span>{item.time}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function TrustBar() {
  return (
    <section aria-label="Prova social" className="border-y border-border bg-muted/40">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
        <Trust icon={<Star className="w-4 h-4 text-amber-500" />} label="4.9/5 · +180 avaliações" />
        <Trust icon={<Users className="w-4 h-4 text-primary" />} label="+500 empresas atendidas" />
        <Trust icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />} label="20 anos de mercado" />
        <Trust icon={<MapPin className="w-4 h-4 text-foreground" />} label="Curitiba · atende todo Brasil" />
      </div>
    </section>
  );
}

function Trust({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 font-medium text-foreground/80">
      {icon}
      {label}
    </div>
  );
}
