import { useEffect, useState } from "react";
import { Plus, Trash2, Save, RotateCcw, Download, Upload, GripVertical } from "lucide-react";
import {
  DEFAULT_FUNNEL,
  getFunnelConfig,
  resetFunnelConfig,
  saveFunnelConfig,
  type FunnelConfig,
  type FunnelStep,
} from "@/lib/wa-funnel";
import { useWaFunnel } from "@/components/site/WaFunnelModal";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export function WaFunnelAdmin() {
  const [cfg, setCfg] = useState<FunnelConfig>(() => getFunnelConfig());
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const { open } = useWaFunnel();

  useEffect(() => {
    setCfg(getFunnelConfig());
  }, []);

  function patch(p: Partial<FunnelConfig>) {
    setCfg((c) => ({ ...c, ...p }));
  }

  function patchStep(idx: number, p: Partial<FunnelStep>) {
    setCfg((c) => {
      const steps = [...c.steps];
      steps[idx] = { ...steps[idx], ...p };
      return { ...c, steps };
    });
  }

  function addStep() {
    setCfg((c) => ({
      ...c,
      steps: [
        ...c.steps,
        { id: `pergunta_${uid()}`, question: "Nova pergunta", type: "text", required: true },
      ],
    }));
  }

  function removeStep(idx: number) {
    setCfg((c) => ({ ...c, steps: c.steps.filter((_, i) => i !== idx) }));
  }

  function move(idx: number, dir: -1 | 1) {
    setCfg((c) => {
      const steps = [...c.steps];
      const j = idx + dir;
      if (j < 0 || j >= steps.length) return c;
      [steps[idx], steps[j]] = [steps[j], steps[idx]];
      return { ...c, steps };
    });
  }

  function save() {
    saveFunnelConfig(cfg);
    setSavedAt(new Date().toLocaleTimeString("pt-BR"));
  }

  function resetAll() {
    resetFunnelConfig();
    setCfg(DEFAULT_FUNNEL);
    setSavedAt(null);
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(cfg, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "0web-wa-funnel.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJson(file: File) {
    file.text().then((t) => {
      try {
        const next = JSON.parse(t) as FunnelConfig;
        if (!next.steps?.length) throw new Error("invalid");
        setCfg(next);
      } catch {
        alert("Arquivo JSON inválido.");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold font-display">Funil WhatsApp · Admin</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Personalize as perguntas exibidas em todo botão "WhatsApp" do site. Uma pergunta por vez.
            Salvo no navegador (localStorage) — exporte o JSON para versionar.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => open("admin_preview")}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-2 text-xs font-medium hover:bg-muted"
          >
            Pré-visualizar
          </button>
          <button
            type="button"
            onClick={exportJson}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-2 text-xs font-medium hover:bg-muted"
          >
            <Download className="w-3.5 h-3.5" /> Exportar
          </button>
          <label className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-2 text-xs font-medium hover:bg-muted cursor-pointer">
            <Upload className="w-3.5 h-3.5" /> Importar
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])}
            />
          </label>
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-2 text-xs font-medium hover:bg-muted"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restaurar padrão
          </button>
          <button
            type="button"
            onClick={save}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary text-primary-foreground px-4 py-2 text-xs font-semibold shadow-glow-primary"
          >
            <Save className="w-3.5 h-3.5" /> Salvar
          </button>
        </div>
      </div>
      {savedAt && (
        <p className="mt-2 text-xs text-emerald-600">✓ Salvo às {savedAt}. As mudanças entram em vigor agora.</p>
      )}

      <div className="mt-6 grid lg:grid-cols-2 gap-4">
        <Field label="Funil ativo?">
          <select
            value={cfg.enabled ? "1" : "0"}
            onChange={(e) => patch({ enabled: e.target.value === "1" })}
            className="input"
          >
            <option value="1">Sim — modal abre ao clicar em WhatsApp</option>
            <option value="0">Não — desabilitado</option>
          </select>
        </Field>
        <Field label="Mensagem de sucesso">
          <input className="input" value={cfg.successMessage} onChange={(e) => patch({ successMessage: e.target.value })} />
        </Field>
        <Field label="Título do modal">
          <input className="input" value={cfg.title} onChange={(e) => patch({ title: e.target.value })} />
        </Field>
        <Field label="Subtítulo">
          <input className="input" value={cfg.subtitle} onChange={(e) => patch({ subtitle: e.target.value })} />
        </Field>
        <Field label="Template enviado ao WhatsApp (use {id_da_pergunta})" className="lg:col-span-2">
          <textarea
            rows={5}
            className="input font-mono text-xs"
            value={cfg.whatsappTemplate}
            onChange={(e) => patch({ whatsappTemplate: e.target.value })}
          />
        </Field>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Perguntas ({cfg.steps.length})</h3>
          <button
            type="button"
            onClick={addStep}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-2 text-xs font-medium hover:bg-muted"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar
          </button>
        </div>

        <div className="mt-3 space-y-3">
          {cfg.steps.map((s, i) => (
            <div key={s.id + i} className="rounded-xl border border-border bg-background p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <GripVertical className="w-4 h-4" /> Passo {i + 1}
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => move(i, -1)} className="px-2 py-1 text-xs hover:bg-muted rounded">↑</button>
                  <button type="button" onClick={() => move(i, 1)} className="px-2 py-1 text-xs hover:bg-muted rounded">↓</button>
                  <button type="button" onClick={() => removeStep(i)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="mt-3 grid sm:grid-cols-2 gap-3">
                <Field label="ID (variável no template)">
                  <input className="input" value={s.id} onChange={(e) => patchStep(i, { id: e.target.value.replace(/\s+/g, "_") })} />
                </Field>
                <Field label="Tipo">
                  <select
                    className="input"
                    value={s.type}
                    onChange={(e) => patchStep(i, { type: e.target.value as FunnelStep["type"] })}
                  >
                    <option value="text">Texto livre</option>
                    <option value="tel">Telefone</option>
                    <option value="email">E-mail</option>
                    <option value="choice">Múltipla escolha</option>
                  </select>
                </Field>
                <Field label="Pergunta" className="sm:col-span-2">
                  <input className="input" value={s.question} onChange={(e) => patchStep(i, { question: e.target.value })} />
                </Field>
                {s.type !== "choice" && (
                  <Field label="Placeholder" className="sm:col-span-2">
                    <input className="input" value={s.placeholder ?? ""} onChange={(e) => patchStep(i, { placeholder: e.target.value })} />
                  </Field>
                )}
                {s.type === "choice" && (
                  <Field label="Opções (uma por linha)" className="sm:col-span-2">
                    <textarea
                      rows={Math.max(3, (s.options ?? []).length)}
                      className="input"
                      value={(s.options ?? []).join("\n")}
                      onChange={(e) => patchStep(i, { options: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean) })}
                    />
                  </Field>
                )}
                <Field label="Obrigatório?">
                  <select
                    className="input"
                    value={s.required ? "1" : "0"}
                    onChange={(e) => patchStep(i, { required: e.target.value === "1" })}
                  >
                    <option value="1">Sim</option>
                    <option value="0">Não</option>
                  </select>
                </Field>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`.input{width:100%;border:1px solid var(--border,#e5e7eb);background:var(--card,#fff);border-radius:0.6rem;padding:0.55rem 0.75rem;font-size:0.85rem;outline:none}.input:focus{border-color:hsl(var(--primary))}`}</style>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</span>
      {children}
    </label>
  );
}
