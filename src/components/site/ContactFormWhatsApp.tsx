import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { ArrowRight, MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/lib/site-config";
import { trackConversion } from "@/lib/analytics";
import { persistLead } from "@/lib/persistence";

const schema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(120),
  email: z.string().trim().email("E-mail inválido").max(255),
  phone: z.string().trim().min(8, "Informe um telefone válido").max(40),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(5, "Conte um pouco do seu projeto").max(1000),
});

type Props = {
  source?: string;
  ctx?: string;
  title?: string;
  defaultMessage?: string;
  redirectTo?: string;
};

export function ContactFormWhatsApp({
  source = "contact_form_whatsapp",
  ctx = "contact_form",
  title = "Fale com a 0WEB e receba uma proposta",
  defaultMessage = "Quero uma proposta da 0WEB.",
  redirectTo,
}: Props) {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const raw = {
          name: String(fd.get("name") || ""),
          email: String(fd.get("email") || ""),
          phone: String(fd.get("phone") || ""),
          company: String(fd.get("company") || ""),
          message: String(fd.get("message") || ""),
        };
        const parsed = schema.safeParse(raw);
        if (!parsed.success) {
          const errs: Record<string, string> = {};
          for (const i of parsed.error.issues) errs[String(i.path[0])] = i.message;
          setErrors(errs);
          return;
        }
        setErrors({});
        const d = parsed.data;
        trackConversion("form_submit", { form_name: source });
        void persistLead({
          name: d.name,
          email: d.email,
          phone: d.phone,
          company: d.company || undefined,
          source,
          payload: { message: d.message },
        });
        const msg = `${defaultMessage}\n\nNome: ${d.name}\nEmpresa: ${d.company || "—"}\nE-mail: ${d.email}\nWhatsApp: ${d.phone}\n\n${d.message}`;
        window.open(whatsappUrl(msg, ctx), "_blank", "noopener,noreferrer");
        setSent(true);
      }}
      className="rounded-2xl border border-border bg-card p-6 lg:p-8 space-y-3"
      aria-labelledby="contact-form-title"
    >
      <div className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-primary" />
        <h3 id="contact-form-title" className="text-xl font-bold font-display">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">Enviamos no WhatsApp e respondemos em até 1 hora útil.</p>

      {[
        { name: "name", label: "Seu nome", type: "text", required: true },
        { name: "company", label: "Empresa (opcional)", type: "text", required: false },
        { name: "email", label: "E-mail", type: "email", required: true },
        { name: "phone", label: "WhatsApp", type: "tel", required: true },
      ].map((f) => (
        <div key={f.name}>
          <label htmlFor={`cf-${f.name}`} className="sr-only">{f.label}</label>
          <input
            id={`cf-${f.name}`}
            name={f.name}
            type={f.type}
            required={f.required}
            placeholder={f.label}
            aria-invalid={!!errors[f.name]}
            aria-describedby={errors[f.name] ? `cf-${f.name}-err` : undefined}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary"
          />
          {errors[f.name] && (
            <p id={`cf-${f.name}-err`} className="mt-1 text-xs text-destructive">{errors[f.name]}</p>
          )}
        </div>
      ))}
      <div>
        <label htmlFor="cf-message" className="sr-only">Mensagem</label>
        <textarea
          id="cf-message"
          name="message"
          required
          rows={4}
          placeholder="Conte rapidamente sobre seu projeto"
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "cf-message-err" : undefined}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary"
        />
        {errors.message && (
          <p id="cf-message-err" className="mt-1 text-xs text-destructive">{errors.message}</p>
        )}
      </div>
      <button
        type="submit"
        className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-6 py-3 shadow-glow-primary"
      >
        Enviar pelo WhatsApp <ArrowRight className="w-4 h-4" />
      </button>
      {sent && (
        <p className="text-xs text-emerald-600 text-center" role="status">
          ✓ Abrimos o WhatsApp com sua mensagem e registramos seu contato.
        </p>
      )}
    </form>
  );
}
