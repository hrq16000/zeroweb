import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getIssueDetail, scrapeUrlEvidence } from "@/lib/index-coverage-detail.functions";
import { resolveIndexIssue } from "@/lib/index-coverage.functions";
import {
  ACTION_KEYS,
  ACTION_LABELS,
  addIndexAction,
  deleteIndexAction,
  listIndexActions,
  type ActionKey,
} from "@/lib/index-coverage-actions.functions";
import { ArrowLeft, ExternalLink, RefreshCw, CheckCircle2, AlertTriangle, FileSearch, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/indexacao/$urlId")({
  component: IssueDetailPage,
});

const SUGGESTIONS: Record<string, { title: string; steps: string[]; cta?: { label: string; to: string } }> = {
  "404": {
    title: "404 — não encontrado",
    steps: [
      "Confirme se a URL deveria existir. Se sim, restaure o conteúdo.",
      "Se a página foi movida, crie um redirect 301 para o novo destino.",
      "Remova links internos que ainda apontam para esta URL.",
    ],
    cta: { label: "Criar redirect 301", to: "/painel" },
  },
  soft_404: {
    title: "Soft 404 — conteúdo fraco/ausente",
    steps: [
      "Revise se a página tem conteúdo substancial.",
      "Adicione título, descrição e blocos de conteúdo relevantes.",
      "Se for um listing vazio, exiba mensagem clara e links para alternativas.",
    ],
  },
  redirect: {
    title: "Redirecionamento detectado",
    steps: [
      "Verifique se a cadeia de redirects é direta (origem → destino final).",
      "Elimine redirects intermediários (cadeias 301→301→200).",
      "Atualize links internos para apontar diretamente ao destino final.",
    ],
    cta: { label: "Gerenciar redirects", to: "/painel" },
  },
  noindex: {
    title: "Marcada como noindex",
    steps: [
      "Confirme se a página realmente deve ser excluída do Google.",
      "Se foi sem querer, remova o meta robots noindex.",
      "Verifique também o cabeçalho X-Robots-Tag enviado pelo servidor.",
    ],
  },
  blocked_robots: {
    title: "Bloqueada pelo robots.txt",
    steps: [
      "Revise o robots.txt e veja qual regra está bloqueando esta URL.",
      "Se a página é importante, libere a regra correspondente.",
    ],
  },
  server_error: {
    title: "Erro de servidor (5xx)",
    steps: [
      "Verifique logs do servidor no momento da detecção.",
      "Reproduza o erro acessando a URL diretamente.",
      "Corrija a causa raiz e solicite reindexação no Search Console.",
    ],
  },
  excluded: {
    title: "Excluída do índice",
    steps: ["Avalie o motivo informado pelo Google e ajuste conteúdo, canonical ou diretrizes."],
  },
  other: { title: "Outro problema", steps: ["Investigue o detalhe do problema reportado e ajuste."] },
};

function IssueDetailPage() {
  const { urlId } = Route.useParams();
  const detailFn = useServerFn(getIssueDetail);
  const scrapeFn = useServerFn(scrapeUrlEvidence);
  const resolveFn = useServerFn(resolveIndexIssue);
  const listActionsFn = useServerFn(listIndexActions);
  const addActionFn = useServerFn(addIndexAction);
  const deleteActionFn = useServerFn(deleteIndexAction);

  const [row, setRow] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [actionNotes, setActionNotes] = useState<Partial<Record<ActionKey, string>>>({});
  const [evidence, setEvidence] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [savingAction, setSavingAction] = useState<ActionKey | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setErr(null);
    try {
      const [r, a] = await Promise.all([
        detailFn({ data: { id: urlId } }),
        listActionsFn({ data: { issueId: urlId } }),
      ]);
      setRow(r.row); setHistory(r.history);
      setActions(a.rows);
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); /* eslint-disable-next-line */ }, [urlId]);

  const runScrape = async () => {
    if (!row?.url) return;
    setScraping(true); setErr(null);
    try { setEvidence(await scrapeFn({ data: { url: row.url } })); }
    catch (e: any) { setErr(e.message); }
    finally { setScraping(false); }
  };

  const onResolve = async () => {
    try { await resolveFn({ data: { id: urlId } }); await load(); } catch (e: any) { setErr(e.message); }
  };

  const onAddAction = async (key: ActionKey) => {
    setSavingAction(key); setErr(null);
    try {
      await addActionFn({ data: { issueId: urlId, action_key: key, notes: actionNotes[key] || undefined } });
      setActionNotes((s) => ({ ...s, [key]: "" }));
      const a = await listActionsFn({ data: { issueId: urlId } });
      setActions(a.rows);
    } catch (e: any) { setErr(e.message); }
    finally { setSavingAction(null); }
  };

  const onRemoveAction = async (id: string) => {
    try {
      await deleteActionFn({ data: { id } });
      setActions((rs) => rs.filter((r) => r.id !== id));
    } catch (e: any) { setErr(e.message); }
  };

  const checklistDone = new Set<string>(actions.map((a) => a.action_key));

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Carregando…</div>;
  if (err || !row) return (
    <div className="p-6 space-y-2">
      <p className="text-sm text-destructive">{err ?? "Issue não encontrado."}</p>
      <Link to="/app/indexacao" className="text-sm text-primary inline-flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> Voltar</Link>
    </div>
  );

  const sug = SUGGESTIONS[row.issue_type] ?? SUGGESTIONS.other;

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <Link to="/app/indexacao" className="text-xs text-muted-foreground inline-flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="w-3 h-3" /> Cobertura de indexação
        </Link>
        <h1 className="mt-2 text-2xl font-bold font-display">Detalhe da URL</h1>
        <a href={row.url} target="_blank" rel="noopener noreferrer" className="mt-1 text-primary inline-flex items-center gap-1 break-all hover:underline">
          {row.url} <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <Info label="Tipo">{row.issue_type}</Info>
        <Info label="Status HTTP">{row.status_code ?? "—"}</Info>
        <Info label="Estado">
          {row.resolved_at
            ? <span className="text-emerald-600 inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> resolvido</span>
            : <span className="text-amber-600 inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> aberto</span>}
        </Info>
      </div>

      {/* Suggested actions */}
      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="font-semibold">Ações sugeridas — {sug.title}</h2>
        <ol className="mt-2 list-decimal pl-5 text-sm space-y-1 text-muted-foreground">
          {sug.steps.map((s, i) => <li key={i}>{s}</li>)}
        </ol>
        <div className="mt-3 flex gap-2">
          {sug.cta && (
            <Link to={sug.cta.to} className="text-xs rounded-full border border-border px-3 py-1.5 hover:bg-muted">
              {sug.cta.label}
            </Link>
          )}
          {!row.resolved_at && (
            <button onClick={onResolve} className="text-xs rounded-full bg-primary text-primary-foreground px-3 py-1.5">
              Marcar resolvido
            </button>
          )}
        </div>
      </section>

      {/* Action checklist */}
      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="font-semibold">Checklist de ações</h2>
          <span className="text-xs text-muted-foreground">
            {checklistDone.size}/{ACTION_KEYS.length} aplicadas
          </span>
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          {ACTION_KEYS.map((key) => {
            const done = checklistDone.has(key);
            return (
              <div
                key={key}
                className={`rounded-lg border p-3 ${done ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800" : "border-border bg-background"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium inline-flex items-center gap-2">
                    {done && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    {ACTION_LABELS[key]}
                  </span>
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    value={actionNotes[key] ?? ""}
                    onChange={(e) => setActionNotes((s) => ({ ...s, [key]: e.target.value }))}
                    placeholder="Anotação opcional"
                    className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-xs"
                  />
                  <button
                    onClick={() => onAddAction(key)}
                    disabled={savingAction === key}
                    className="text-xs rounded-md border border-border px-2 py-1 hover:bg-muted disabled:opacity-50"
                  >
                    {savingAction === key ? "…" : done ? "Registrar de novo" : "Aplicar"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {actions.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Histórico de execução</h3>
            <ul className="text-sm divide-y divide-border">
              {actions.map((a) => (
                <li key={a.id} className="py-2 flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-medium">{ACTION_LABELS[a.action_key as ActionKey] ?? a.action_key}</div>
                    {a.notes && <div className="text-[11px] text-muted-foreground mt-0.5">{a.notes}</div>}
                    <div className="text-[10px] text-muted-foreground mt-0.5">{new Date(a.created_at).toLocaleString("pt-BR")}</div>
                  </div>
                  <button onClick={() => onRemoveAction(a.id)} className="text-muted-foreground hover:text-destructive" aria-label="Remover">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* History */}
      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="font-semibold mb-2">Histórico desta URL</h2>
        <ul className="text-sm divide-y divide-border">
          {history.map((h) => (
            <li key={h.id} className="py-2 flex items-center justify-between gap-2">
              <span className="text-xs">
                <strong>{h.issue_type}</strong>
                {h.status_code ? <span className="ml-1 font-mono">[{h.status_code}]</span> : null}
                <span className="ml-2 text-muted-foreground">{new Date(h.detected_at).toLocaleString("pt-BR")}</span>
                {h.source ? <span className="ml-2 text-[10px] uppercase text-muted-foreground">{h.source}</span> : null}
              </span>
              <span className="text-xs">
                {h.resolved_at
                  ? <span className="text-emerald-600">resolvido {new Date(h.resolved_at).toLocaleDateString("pt-BR")}</span>
                  : <span className="text-amber-600">aberto</span>}
              </span>
            </li>
          ))}
          {history.length === 0 && <li className="py-2 text-muted-foreground">Sem ocorrências anteriores.</li>}
        </ul>
      </section>

      {/* Evidence */}
      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h2 className="font-semibold inline-flex items-center gap-2"><FileSearch className="w-4 h-4" /> Evidências (schema + meta)</h2>
          <button onClick={runScrape} disabled={scraping} className="text-xs rounded-full border border-border px-3 py-1.5 inline-flex items-center gap-1 hover:bg-muted disabled:opacity-50">
            <RefreshCw className={`w-3 h-3 ${scraping ? "animate-spin" : ""}`} /> {evidence ? "Atualizar" : "Verificar agora"}
          </button>
        </div>
        {!evidence && <p className="text-xs text-muted-foreground">Clique em "verificar agora" para buscar a URL e extrair JSON-LD, meta robots, canonical e título.</p>}
        {evidence && (
          <div className="space-y-2 text-xs">
            <div className="grid sm:grid-cols-2 gap-2">
              <Info small label="Status">{evidence.status || "—"}</Info>
              <Info small label="Content-Type">{evidence.contentType || "—"}</Info>
              <Info small label="Title">{evidence.title || "—"}</Info>
              <Info small label="Canonical">{evidence.canonical || "—"}</Info>
              <Info small label="Meta robots">{evidence.metaRobots || "—"}</Info>
              <Info small label="Location">{evidence.location || "—"}</Info>
            </div>
            {evidence.error && <p className="text-destructive">Erro ao buscar: {evidence.error}</p>}
            <div>
              <p className="font-semibold mb-1">JSON-LD encontrados: {evidence.ldBlocks?.length ?? 0}</p>
              {evidence.ldBlocks?.length
                ? <pre className="max-h-80 overflow-auto rounded bg-muted/40 p-2 text-[10px]">{(evidence.ldBlocks as string[]).map((raw, i) => {
                    try { return JSON.stringify(JSON.parse(raw), null, 2); } catch { return `// parse error\n${raw}`; }
                  }).join("\n\n")}</pre>
                : <p className="text-muted-foreground">Nenhum bloco encontrado.</p>}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Info({ label, children, small }: { label: string; children: React.ReactNode; small?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className={`text-muted-foreground ${small ? "text-[10px]" : "text-xs"}`}>{label}</div>
      <div className={`mt-0.5 ${small ? "text-xs" : "text-sm"} font-medium break-all`}>{children}</div>
    </div>
  );
}
