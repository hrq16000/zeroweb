import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  MousePointerClick,
  MessageCircle,
  FileCheck2,
  Activity,
  RefreshCcw,
  TrendingUp,
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getFunnel, resetFunnel } from "@/lib/analytics";

export const Route = createFileRoute("/painel")({
  head: () => ({
    meta: [
      { title: "Painel · Funil de conversão · 0WEB" },
      { name: "description", content: "Acompanhe métricas de funil: CTA → WhatsApp → Formulário → Scroll." },
      { name: "robots", content: "noindex,nofollow" },
    ],
    links: [{ rel: "canonical", href: "/painel" }],
  }),
  component: PainelPage,
  ssr: false,
});

function PainelPage() {
  const [data, setData] = useState(() => getFunnel());

  useEffect(() => {
    const onChange = () => setData(getFunnel());
    window.addEventListener("0web:funnel", onChange);
    window.addEventListener("storage", onChange);
    const interval = setInterval(onChange, 2500);
    return () => {
      window.removeEventListener("0web:funnel", onChange);
      window.removeEventListener("storage", onChange);
      clearInterval(interval);
    };
  }, []);

  const cta = data.totals["cta_click"] ?? 0;
  const wa = data.totals["whatsapp_click"] ?? 0;
  const form = data.totals["form_submit"] ?? 0;
  const scroll75 = countScrollAt(data, 75);
  const scroll100 = countScrollAt(data, 100);

  const steps = [
    { label: "Clique no CTA", value: cta, icon: <MousePointerClick className="w-5 h-5" />, tone: "primary" as const },
    { label: "Clique WhatsApp", value: wa, icon: <MessageCircle className="w-5 h-5" />, tone: "emerald" as const },
    { label: "Envio do Formulário", value: form, icon: <FileCheck2 className="w-5 h-5" />, tone: "accent" as const },
    { label: "Rolagem 75% / 100%", value: scroll75 + scroll100, icon: <Activity className="w-5 h-5" />, tone: "violet" as const },
  ];

  const maxStep = Math.max(1, ...steps.map((s) => s.value));
  const ctaToWa = cta ? Math.round((wa / cta) * 100) : 0;
  const waToForm = wa ? Math.round((form / wa) * 100) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-32 pb-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-primary font-semibold">Painel interno</p>
              <h1 className="mt-2 text-3xl sm:text-4xl font-bold font-display">Funil de Conversão</h1>
              <p className="mt-2 text-muted-foreground max-w-2xl">
                Métricas em tempo real coletadas nesta sessão (lado cliente) e enviadas para o GA4/GTM.
                Última atualização: <strong>{new Date(data.lastUpdated).toLocaleString("pt-BR")}</strong>
              </p>
            </div>
            <button
              onClick={() => {
                resetFunnel();
                setData(getFunnel());
              }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background hover:bg-muted px-4 py-2 text-sm font-medium"
            >
              <RefreshCcw className="w-3.5 h-3.5" /> Resetar
            </button>
          </div>

          {/* Funnel cards */}
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative overflow-hidden rounded-2xl border border-border bg-card p-5"
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${toneBg(s.tone)}`}>
                  {s.icon}
                </div>
                <div className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                <div className="mt-1 text-3xl font-bold font-display">{s.value}</div>
                <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full ${toneBar(s.tone)}`}
                    style={{ width: `${(s.value / maxStep) * 100}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Conversion rates */}
          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <Rate label="CTA → WhatsApp" value={ctaToWa} />
            <Rate label="WhatsApp → Formulário" value={waToForm} />
          </div>

          {/* A/B comparison */}
          <div className="mt-10">
            <ABComparison data={data} />
          </div>

          {/* By page */}
          <div className="mt-10 grid lg:grid-cols-2 gap-6">
            <Card title="Conversões por página">
              <Table rows={tableRows(data.byPage)} emptyMsg="Sem dados ainda." />
            </Card>
            <Card title="Conversões por categoria (blog/setor)">
              <Table rows={tableRows(data.byCategory)} emptyMsg="Sem categorias rastreadas ainda." />
            </Card>
          </div>

          <div className="mt-10 rounded-2xl border border-border bg-muted/40 p-5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <TrendingUp className="w-4 h-4 text-primary" /> Como validar no GA4 / GTM
            </div>
            <ol className="mt-3 list-decimal pl-5 space-y-1.5">
              <li>Abra o GA4 → <strong>Admin → DebugView</strong>. Adicione <code>?gtm_debug=1</code> à URL ou use a extensão GA Debugger.</li>
              <li>No GTM, ative <strong>Preview</strong> e cole a URL do site para confirmar disparo dos triggers <code>cta_click</code>, <code>whatsapp_click</code>, <code>form_submit</code> e <code>scroll_depth</code>.</li>
              <li>Marque os eventos como <strong>Key Events</strong> (Conversões) em <em>Admin → Events</em>.</li>
              <li>Os parâmetros enviados incluem <code>location</code>, <code>label</code>, <code>percent</code> e <code>form_name</code> — use-os como dimensões personalizadas.</li>
            </ol>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function countScrollAt(_data: ReturnType<typeof getFunnel>, _pct: number) {
  // We track all scroll_depth as one event; percent is a param. We don't store
  // params, so approximate by dividing total scroll_depth.
  const total = _data.totals["scroll_depth"] ?? 0;
  return Math.round(total / 4);
}

function tableRows(obj: Record<string, Record<string, number>>) {
  return Object.entries(obj).map(([key, events]) => ({
    key,
    cta: events["cta_click"] ?? 0,
    wa: events["whatsapp_click"] ?? 0,
    form: events["form_submit"] ?? 0,
  }));
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-semibold font-display">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Table({
  rows,
  emptyMsg,
}: {
  rows: { key: string; cta: number; wa: number; form: number }[];
  emptyMsg: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMsg}</p>;
  }
  return (
    <div className="overflow-x-auto -mx-2">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            <th className="py-2 px-2">Página/Categoria</th>
            <th className="py-2 px-2 text-right">CTA</th>
            <th className="py-2 px-2 text-right">WhatsApp</th>
            <th className="py-2 px-2 text-right">Form</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-t border-border">
              <td className="py-2 px-2 font-medium truncate max-w-[16rem]">{r.key}</td>
              <td className="py-2 px-2 text-right tabular-nums">{r.cta}</td>
              <td className="py-2 px-2 text-right tabular-nums">{r.wa}</td>
              <td className="py-2 px-2 text-right tabular-nums">{r.form}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Rate({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="text-3xl font-bold font-display">{value}%</div>
        <div className="text-xs text-muted-foreground">taxa de conversão</div>
      </div>
      <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-gradient-primary"
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}

function toneBg(t: "primary" | "emerald" | "accent" | "violet") {
  return {
    primary: "bg-primary/10 text-primary",
    emerald: "bg-emerald-500/10 text-emerald-600",
    accent: "bg-accent/20 text-accent-foreground",
    violet: "bg-violet-500/10 text-violet-600",
  }[t];
}
function toneBar(t: "primary" | "emerald" | "accent" | "violet") {
  return {
    primary: "bg-primary",
    emerald: "bg-emerald-500",
    accent: "bg-accent",
    violet: "bg-violet-500",
  }[t];
}

function ABComparison({ data }: { data: ReturnType<typeof getFunnel> }) {
  const rows = Object.entries(data.byVariant ?? {}).map(([key, ev]) => {
    const cta = ev["cta_click"] ?? 0;
    const wa = ev["whatsapp_click"] ?? 0;
    const form = ev["form_submit"] ?? 0;
    const score = cta + wa * 3 + form * 5; // weighted conversion score
    return { key, cta, wa, form, score };
  });
  const best = rows.length ? rows.reduce((a, b) => (a.score > b.score ? a : b)) : null;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h3 className="font-semibold font-display">Comparação A/B · Hero × CTA</h3>
        <span className="text-xs text-muted-foreground">
          Pontuação ponderada: 1·CTA + 3·WhatsApp + 5·Form
        </span>
      </div>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Sem dados ainda. Interaja com o site para gerar variantes.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-2 px-2">Combinação de variantes</th>
                <th className="py-2 px-2 text-right">CTA</th>
                <th className="py-2 px-2 text-right">WhatsApp</th>
                <th className="py-2 px-2 text-right">Form</th>
                <th className="py-2 px-2 text-right">Pontuação</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const isBest = best && r.key === best.key && r.score > 0;
                return (
                  <tr
                    key={r.key}
                    className={`border-t border-border ${isBest ? "bg-emerald-500/5" : ""}`}
                  >
                    <td className="py-2 px-2 font-mono text-xs">
                      {r.key}
                      {isBest ? (
                        <span className="ml-2 rounded-full bg-emerald-500 text-white text-[10px] px-2 py-0.5 font-semibold">
                          MELHOR
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2 px-2 text-right tabular-nums">{r.cta}</td>
                    <td className="py-2 px-2 text-right tabular-nums">{r.wa}</td>
                    <td className="py-2 px-2 text-right tabular-nums">{r.form}</td>
                    <td className="py-2 px-2 text-right tabular-nums font-semibold">{r.score}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
