import { useEffect, useState } from "react";
import { Save, CheckCircle2, AlertTriangle } from "lucide-react";
import { getGa4Id, getGtmId, isValidGa4, isValidGtm, setAnalyticsIds, SITE } from "@/lib/site-config";

export function AnalyticsIdsAdmin() {
  const [ga4, setGa4] = useState("");
  const [gtm, setGtm] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const a = getGa4Id();
    const g = getGtmId();
    setGa4(a === SITE.GA4_ID ? "" : a);
    setGtm(g === SITE.GTM_ID ? "" : g);
  }, []);

  const ga4Ok = !ga4 || isValidGa4(ga4);
  const gtmOk = !gtm || isValidGtm(gtm);
  const active = { ga4: getGa4Id(), gtm: getGtmId() };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-semibold font-display">IDs do GA4 e GTM</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Configure as credenciais reais — os scripts de analytics são injetados automaticamente no navegador.
      </p>

      <div className="mt-5 grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">GA4 Measurement ID</span>
          <input
            value={ga4}
            onChange={(e) => { setGa4(e.target.value.toUpperCase()); setSaved(false); }}
            placeholder="G-XXXXXXXXXX"
            className={`mt-1 w-full rounded-xl border bg-background px-4 py-3 text-sm font-mono ${ga4Ok ? "border-border" : "border-red-500"}`}
          />
          {!ga4Ok && <p className="mt-1 text-xs text-red-600">Formato esperado: G-XXXXXXXXXX</p>}
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">GTM Container ID</span>
          <input
            value={gtm}
            onChange={(e) => { setGtm(e.target.value.toUpperCase()); setSaved(false); }}
            placeholder="GTM-XXXXXXX"
            className={`mt-1 w-full rounded-xl border bg-background px-4 py-3 text-sm font-mono ${gtmOk ? "border-border" : "border-red-500"}`}
          />
          {!gtmOk && <p className="mt-1 text-xs text-red-600">Formato esperado: GTM-XXXXXXX</p>}
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          Em uso agora:{" "}
          <span className="font-mono">{isValidGa4(active.ga4) ? active.ga4 : "—"}</span>
          {" · "}
          <span className="font-mono">{isValidGtm(active.gtm) ? active.gtm : "—"}</span>
        </div>
        <button
          disabled={!ga4Ok || !gtmOk}
          onClick={() => {
            setAnalyticsIds(ga4, gtm);
            setSaved(true);
          }}
          className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" /> Salvar e ativar
        </button>
      </div>

      {saved && (
        <p className="mt-3 inline-flex items-center gap-2 text-xs text-emerald-600">
          <CheckCircle2 className="w-3.5 h-3.5" /> IDs salvos e scripts recarregados.
        </p>
      )}
      {(!isValidGa4(active.ga4) || !isValidGtm(active.gtm)) && (
        <p className="mt-3 inline-flex items-center gap-2 text-xs text-amber-600">
          <AlertTriangle className="w-3.5 h-3.5" /> Sem IDs válidos, nenhum evento é enviado ao Google.
        </p>
      )}
    </div>
  );
}
