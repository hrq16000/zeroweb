import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { trackEvent, trackConversion } from "@/lib/analytics";
import { WHATSAPP } from "@/lib/site-config";
import { persistLead } from "@/lib/persistence";
import { getLeadAttribution, attributionToEventParams } from "@/lib/lead-attribution";
import { saveAttributionSnapshot } from "@/lib/lead-attribution-snapshot";

const WHATSAPP_NUMBER = WHATSAPP.number; // edite aqui se necessário

type RadioOption = { value: string; label: string };

const HAS_SITE: RadioOption[] = [
  { value: "nao", label: "Não tenho nenhum" },
  { value: "ruim", label: "Tenho, mas é ruim / desatualizado" },
  { value: "bom", label: "Tenho e está bom" },
];

const DIVULGA: RadioOption[] = [
  { value: "boca", label: "Boca a boca / indicação" },
  { value: "redes", label: "Instagram / redes sociais" },
  { value: "ads", label: "Google / anúncios" },
  { value: "nao_divulgo", label: "Ainda não divulgo" },
];

const PROBLEMA: RadioOption[] = [
  { value: "encontrado", label: "Ninguém me encontra na internet" },
  { value: "credibilidade", label: "Meu site é feio e não passa credibilidade" },
  { value: "tempo", label: "Não tenho tempo pra montar um site" },
  { value: "preco", label: "Achava que seria muito caro" },
];

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source?: string;
};

export function SiteExpressFunnelModal({ open, onOpenChange, source = "site_express" }: Props) {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [negocio, setNegocio] = useState("");
  const [temSite, setTemSite] = useState<string>("");
  const [divulga, setDivulga] = useState<string>("");
  const [problema, setProblema] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // Snapshot de atribuição: garante que /obrigado leia o mesmo canal/UTM
  // que o lead persistido, mesmo após o navigate().
  const attribution = useMemo(() => {
    if (typeof window === "undefined") return null;
    return getLeadAttribution("site_express", "site_express_funnel");
  }, [open]);

  useEffect(() => {
    if (open) trackEvent("site_express_funnel_open", { source });
  }, [open, source]);

  const valid = useMemo(() => {
    return (
      nome.trim().length >= 2 &&
      whatsapp.replace(/\D/g, "").length >= 10 &&
      negocio.trim().length >= 2 &&
      temSite &&
      divulga &&
      problema
    );
  }, [nome, whatsapp, negocio, temSite, divulga, problema]);

  function labelOf(opts: RadioOption[], v: string) {
    return opts.find((o) => o.value === v)?.label ?? v;
  }

  async function handleSubmit() {
    if (!valid || submitting) return;
    setSubmitting(true);

    const answers = {
      tem_site: { value: temSite, label: labelOf(HAS_SITE, temSite) },
      divulga: { value: divulga, label: labelOf(DIVULGA, divulga) },
      problema: { value: problema, label: labelOf(PROBLEMA, problema) },
      negocio,
      offer: "site_express_499",
      consent_at: new Date().toISOString(),
      source,
    };

    const message =
      `Olá! Quero meu *Site Express em 24h* (R$ 499).\n\n` +
      `*Nome:* ${nome}\n` +
      `*WhatsApp:* ${whatsapp}\n` +
      `*Negócio:* ${negocio}\n` +
      `*Tem site hoje:* ${labelOf(HAS_SITE, temSite)}\n` +
      `*Como divulga:* ${labelOf(DIVULGA, divulga)}\n` +
      `*Maior problema:* ${labelOf(PROBLEMA, problema)}`;

    const url = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(
      message,
    )}`;

    const attrParams = attribution ? attributionToEventParams(attribution) : { source };

    // 1) Persistir lead em lead_submissions (anon insert via RLS)
    try {
      await persistLead({
        name: nome,
        phone: whatsapp,
        source: "site_express",
        offer_slug: "site_express_499",
        audience_tag: problema,
        payload: { ...answers, attribution: attrParams },
      });
    } catch {
      /* best effort */
    }

    // 2) Snapshot pro /obrigado conseguir mostrar o canal correto
    if (attribution) saveAttributionSnapshot(attribution);

    // 3) Telemetria GA4 + Pixel (via trackConversion)
    trackConversion("site_express_funnel_submit", {
      ...attrParams,
      tem_site: temSite,
      divulga,
      problema,
      offer: "site_express_499",
      value: 499,
      currency: "BRL",
    });

    // 4) Abre WhatsApp em nova aba
    window.open(url, "_blank", "noopener,noreferrer");

    // 5) Fecha modal e leva para /obrigado com status do pedido
    onOpenChange(false);
    setSubmitting(false);
    void navigate({ to: "/obrigado", search: { source: "site_express" } });
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg p-0 gap-0 overflow-hidden rounded-2xl bg-white border-0 shadow-2xl max-h-[92vh] overflow-y-auto [&>button]:text-gray-400 [&>button]:hover:text-gray-700"
      >
        {/* Cabeçalho */}
        <div className="relative px-6 pt-6 pb-4">
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-orange-100 text-orange-600">
            Começar Agora
          </span>


          <h2 className="mt-3 text-2xl sm:text-[26px] font-bold text-gray-900 leading-tight">
            Me conta um pouco sobre o seu negócio
          </h2>
          <p className="mt-1.5 text-sm text-gray-500">
            Preencha abaixo e entro em contato pelo WhatsApp em minutos.
          </p>
        </div>

        {/* Form */}
        <div className="px-6 pb-6 space-y-5">
          {/* Nome */}
          <FieldLabel>Nome</FieldLabel>
          <TextInput
            value={nome}
            onChange={setNome}
            placeholder="Seu nome completo"
            autoComplete="name"
          />

          {/* WhatsApp */}
          <FieldLabel>WhatsApp</FieldLabel>
          <TextInput
            value={whatsapp}
            onChange={(v) => setWhatsapp(maskPhone(v))}
            placeholder="(11) 99999-9999"
            inputMode="tel"
            autoComplete="tel"
          />

          {/* Negócio */}
          <FieldLabel>Qual é o seu negócio?</FieldLabel>
          <TextInput
            value={negocio}
            onChange={setNegocio}
            placeholder="Ex: salão de beleza, eletricista, loja de roupas..."
          />

          {/* Tem site */}
          <FieldLabel>Você já tem site hoje?</FieldLabel>
          <RadioCards options={HAS_SITE} value={temSite} onChange={setTemSite} name="tem_site" />

          {/* Divulga */}
          <FieldLabel>Como você divulga seu negócio hoje?</FieldLabel>
          <RadioCards options={DIVULGA} value={divulga} onChange={setDivulga} name="divulga" />

          {/* Problema */}
          <FieldLabel>Qual o seu maior problema agora?</FieldLabel>
          <RadioCards options={PROBLEMA} value={problema} onChange={setProblema} name="problema" />

          {/* CTA */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!valid}
            className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 active:bg-orange-700 disabled:bg-orange-300 disabled:cursor-not-allowed py-4 text-white font-bold uppercase tracking-wide text-sm shadow-lg shadow-orange-600/30 transition"
          >
            Quero meu site em 24h <ArrowRight className="w-5 h-5" />
          </button>

          <p className="text-center text-[11px] text-gray-400">
            Ao enviar, você concorda em receber contato pelo WhatsApp.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold text-gray-900 -mb-3">
      {children} <span className="text-orange-600">*</span>
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  inputMode,
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      inputMode={inputMode}
      autoComplete={autoComplete}
      className="w-full rounded-lg bg-gray-50 border border-transparent focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none px-4 py-3 text-[15px] text-gray-900 placeholder:text-gray-400 transition"
    />
  );
}

function RadioCards({
  options,
  value,
  onChange,
  name,
}: {
  options: RadioOption[];
  value: string;
  onChange: (v: string) => void;
  name: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={`w-full text-left flex items-center justify-between gap-3 rounded-lg px-4 py-3 text-[15px] transition border ${
              active
                ? "bg-orange-50 border-orange-500 text-gray-900 font-semibold"
                : "bg-gray-50 border-transparent text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span>{opt.label}</span>
            <span
              className={`grid place-items-center w-5 h-5 rounded-full border-2 shrink-0 ${
                active ? "border-orange-600 bg-orange-600 text-white" : "border-gray-300 bg-white"
              }`}
            >
              {active ? <Check className="w-3 h-3" strokeWidth={3} /> : null}
            </span>
            <input type="radio" name={name} value={opt.value} checked={active} readOnly hidden />
          </button>
        );
      })}
    </div>
  );
}
