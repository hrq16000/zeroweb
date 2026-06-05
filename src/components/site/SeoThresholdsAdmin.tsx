// Admin panel: edit per-environment LHCI thresholds and SEO image limits.
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listSettings, upsertSetting } from "@/lib/settings.functions";
import { Save, Sliders } from "lucide-react";

const ENVS = ["dev", "staging", "prod"] as const;
type Env = (typeof ENVS)[number];

const LHCI_FIELDS = [
  { key: "min_performance", label: "Performance mínima (0-1)", def: "0.9" },
  { key: "min_seo", label: "SEO mínimo (0-1)", def: "0.95" },
  { key: "max_lcp_ms", label: "LCP máx (ms)", def: "2500" },
  { key: "max_cls", label: "CLS máx", def: "0.1" },
  { key: "max_tbt_ms", label: "TBT máx (ms)", def: "200" },
];

const IMG_FIELDS = [
  { key: "min_width", label: "Largura mín (px)", def: "1200" },
  { key: "min_height", label: "Altura mín (px)", def: "630" },
  { key: "allowed_formats", label: "Formatos aceitos (CSV)", def: "jpeg,png,webp,avif" },
];

export function SeoThresholdsAdmin() {
  const list = useServerFn(listSettings);
  const upsert = useServerFn(upsertSetting);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const r = await list();
      const map: Record<string, string> = {};
      for (const row of (r.rows ?? []) as Array<{ key: string; value: string | null }>) {
        if (row.value != null) map[row.key] = row.value;
      }
      setValues(map);
    })();
  }, [list]);

  const setVal = (k: string, v: string) => setValues((s) => ({ ...s, [k]: v }));

  const save = async (key: string, def: string) => {
    setSaving(key);
    try {
      await upsert({ data: { key, value: values[key] ?? def } });
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-semibold font-display flex items-center gap-2">
        <Sliders className="w-4 h-4 text-primary" /> Metas Lighthouse & limites de imagens
      </h3>
      <p className="text-xs text-muted-foreground mt-1">
        Valores aplicados pelo endpoint de ingestão LHCI e pelo validador SEO no build.
      </p>

      <div className="mt-5 grid lg:grid-cols-3 gap-5">
        {ENVS.map((env: Env) => (
          <div key={env} className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="text-xs uppercase tracking-wider font-semibold">{env}</div>
            <div className="mt-3 space-y-2">
              {LHCI_FIELDS.map((f) => {
                const key = `lhci.${env}.${f.key}`;
                return (
                  <Row key={key} k={key} label={f.label} def={f.def} value={values[key] ?? ""} onChange={setVal} onSave={() => save(key, f.def)} saving={saving === key} />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4">
        <div className="text-xs uppercase tracking-wider font-semibold">Imagens SEO / Discover (global)</div>
        <div className="mt-3 grid sm:grid-cols-3 gap-2">
          {IMG_FIELDS.map((f) => {
            const key = `seo.images.${f.key}`;
            return (
              <Row key={key} k={key} label={f.label} def={f.def} value={values[key] ?? ""} onChange={setVal} onSave={() => save(key, f.def)} saving={saving === key} />
            );
          })}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
        <div className="text-xs uppercase tracking-wider font-semibold">Token de ingestão LHCI</div>
        <Row
          k="lhci.ingest_token"
          label="Header X-Ingest-Token"
          def=""
          value={values["lhci.ingest_token"] ?? ""}
          onChange={setVal}
          onSave={() => save("lhci.ingest_token", "")}
          saving={saving === "lhci.ingest_token"}
        />
      </div>
    </div>
  );
}

function Row({
  k, label, def, value, onChange, onSave, saving,
}: {
  k: string; label: string; def: string; value: string;
  onChange: (k: string, v: string) => void; onSave: () => void; saving: boolean;
}) {
  return (
    <div>
      <label className="text-[11px] text-muted-foreground">{label}</label>
      <div className="mt-1 flex gap-1">
        <input
          value={value}
          onChange={(e) => onChange(k, e.target.value)}
          placeholder={def}
          className="flex-1 rounded-lg border border-border bg-background px-2 py-1 text-sm font-mono"
        />
        <button
          onClick={onSave}
          disabled={saving}
          className="rounded-lg border border-border bg-background px-2 py-1 text-xs inline-flex items-center gap-1 disabled:opacity-50"
        >
          <Save className="w-3 h-3" /> {saving ? "..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}
