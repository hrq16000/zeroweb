import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, Plus, Upload, X, ImageOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  listServicesAdmin,
  upsertService,
  deleteService,
  reorderServices,
  getServiceImageUploadUrl,
  listFunnelsForServices,
  type ServiceRow,
} from "@/lib/services-crud.functions";


export const Route = createFileRoute("/_authenticated/app/servicos")({
  component: ServicesAdminPage,
});

type EditState = Partial<ServiceRow> & { _isNew?: boolean };

function ServicesAdminPage() {
  const fetchList = useServerFn(listServicesAdmin);
  const fnUpsert = useServerFn(upsertService);
  const fnDelete = useServerFn(deleteService);
  const fnReorder = useServerFn(reorderServices);

  const [rows, setRows] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    try {
      const r = await fetchList();
      setRows(r.services);
    } catch (e) {
      toast.error("Falha ao carregar serviços", { description: (e as Error).message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = rows.findIndex((r) => r.id === active.id);
    const newIdx = rows.findIndex((r) => r.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const next = arrayMove(rows, oldIdx, newIdx).map((r, i) => ({ ...r, display_order: (i + 1) * 10 }));
    setRows(next);
    try {
      await fnReorder({ data: { order: next.map((r) => ({ id: r.id, display_order: r.display_order })) } });
      toast.success("Ordem atualizada");
    } catch (err) {
      toast.error("Falha ao reordenar", { description: (err as Error).message });
      void reload();
    }
  };

  const onSave = async (payload: EditState) => {
    try {
      await fnUpsert({ data: serializeForSave(payload) });
      toast.success(payload.id ? "Serviço atualizado" : "Serviço criado");
      setEditing(null);
      void reload();
    } catch (err) {
      toast.error("Falha ao salvar", { description: (err as Error).message });
    }
  };

  const onDelete = async () => {
    if (!deletingId) return;
    try {
      await fnDelete({ data: { id: deletingId } });
      toast.success("Serviço excluído");
      setDeletingId(null);
      void reload();
    } catch (err) {
      toast.error("Falha ao excluir", { description: (err as Error).message });
    }
  };

  return (
    <div className="max-w-6xl">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold font-display">Serviços</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie os cards exibidos em <code className="text-xs">/servicos</code>. Arraste para reordenar.
          </p>
        </div>
        <Button onClick={() => setEditing({ _isNew: true, is_active: true, display_order: (rows.length + 1) * 10 })}>
          <Plus className="w-4 h-4 mr-1" /> Novo serviço
        </Button>
      </div>

      {/* Auditoria: serviços ativos sem imagem real */}
      {(() => {
        const missing = rows.filter((r) => r.is_active && !r.image_url);
        if (!missing.length) return null;
        return (
          <div className="mb-4 flex items-start gap-3 p-4 rounded-lg border border-amber-500/40 bg-amber-500/10 text-sm">
            <ImageOff className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-amber-900 dark:text-amber-100">
                {missing.length} serviço{missing.length > 1 ? "s" : ""} ativo{missing.length > 1 ? "s" : ""} sem imagem real cadastrada
              </p>
              <p className="mt-1 text-xs text-amber-800/80 dark:text-amber-200/80">
                Estes cards aparecem em <code>/servicos</code> com placeholder. Edite cada um e faça upload da imagem real (sem usar IA genérica): {" "}
                <span className="font-medium">
                  {missing.slice(0, 5).map((m) => m.name).join(", ")}{missing.length > 5 ? `, +${missing.length - 5}` : ""}
                </span>
              </p>
            </div>
          </div>
        );
      })()}


      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum serviço ainda. Clique em "Novo serviço".</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {rows.map((row) => (
                <SortableRow
                  key={row.id}
                  row={row}
                  onEdit={() => setEditing(row)}
                  onDelete={() => setDeletingId(row.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {editing && (
        <ServiceEditDialog
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={onSave}
        />
      )}

      <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir serviço?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O card sairá de /servicos imediatamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SortableRow({ row, onEdit, onDelete }: { row: ServiceRow; onEdit: () => void; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card"
    >
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground" aria-label="Arrastar">
        <GripVertical className="w-4 h-4" />
      </button>
      {row.image_url ? (
        <img src={row.image_url} alt="" className="w-12 h-12 rounded object-cover bg-muted" />
      ) : (
        <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-[10px] text-muted-foreground">sem img</div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium truncate">{row.name}</span>
          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{row.category}</span>
          {row.is_featured && <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">destaque</span>}
          {!row.is_active && <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">inativo</span>}
        </div>
        <div className="text-xs text-muted-foreground truncate">/{row.slug} · ordem {row.display_order}</div>
      </div>
      <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Editar"><Pencil className="w-4 h-4" /></Button>
      <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Excluir"><Trash2 className="w-4 h-4 text-destructive" /></Button>
    </div>
  );
}

function ServiceEditDialog({
  initial, onClose, onSave,
}: {
  initial: EditState;
  onClose: () => void;
  onSave: (s: EditState) => void | Promise<void>;
}) {
  const [s, setS] = useState<EditState>(() => normalizeForm(initial));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const isNew = !s.id;
  const fnUpload = useServerFn(getServiceImageUploadUrl);

  const set = <K extends keyof EditState>(k: K, v: EditState[K]) => setS((p) => ({ ...p, [k]: v }));

  const onUpload = async (file: File) => {
    const slug = s.slug?.trim();
    if (!slug) { toast.error("Defina o slug antes de enviar a imagem"); return; }
    if (!/^[a-z0-9-]+$/.test(slug)) { toast.error("Slug inválido (use apenas minúsculas, números e hífen)"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Imagem acima de 5 MB"); return; }
    setUploading(true);
    try {
      const { path, token, publicUrl } = await fnUpload({ data: { slug, filename: file.name } });
      const { error } = await supabase.storage.from("service-images").uploadToSignedUrl(path, token, file, { upsert: true });
      if (error) throw error;
      set("image_path", path);
      set("image_url", publicUrl);
      toast.success("Imagem enviada");
    } catch (e) {
      toast.error("Falha no upload", { description: (e as Error).message });
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    setSaving(true);
    try { await onSave(s); } finally { setSaving(false); }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? "Novo serviço" : `Editar: ${s.name}`}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Slug (URL)" required>
              <Input
                value={s.slug ?? ""}
                onChange={(e) => set("slug", e.target.value.toLowerCase())}
                placeholder="trafego-pago-local"
                disabled={!isNew}
              />
              {!isNew && <p className="text-[11px] text-muted-foreground mt-1">Slug é imutável após criação (preserva URLs e SEO).</p>}
            </Field>
            <Field label="Categoria" required>
              <Input value={s.category ?? ""} onChange={(e) => set("category", e.target.value)} placeholder="Tráfego" />
            </Field>
          </div>

          <Field label="Nome" required>
            <Input value={s.name ?? ""} onChange={(e) => set("name", e.target.value)} placeholder="Tráfego Pago Local" />
          </Field>

          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Title (SEO)" required>
              <Input value={s.title ?? ""} onChange={(e) => set("title", e.target.value)} />
            </Field>
            <Field label="H1" required>
              <Input value={s.h1 ?? ""} onChange={(e) => set("h1", e.target.value)} />
            </Field>
          </div>

          <Field label="Descrição (meta description)" required>
            <Textarea rows={2} value={s.description ?? ""} onChange={(e) => set("description", e.target.value)} />
          </Field>

          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Service Type (schema.org)" required>
              <Input value={s.service_type ?? ""} onChange={(e) => set("service_type", e.target.value)} placeholder="Digital Marketing" />
            </Field>
            <Field label="Preço a partir de (R$)">
              <Input
                type="number" min={0} step="0.01"
                value={s.price_from ?? ""}
                onChange={(e) => set("price_from", e.target.value === "" ? null : Number(e.target.value))}
              />
            </Field>
          </div>

          {/* Comercial (vitrine) */}
          <div className="rounded-lg border border-border p-3 space-y-3">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Comercial · aparece no card e na página do produto</Label>
            <div className="grid sm:grid-cols-3 gap-3">
              <Field label="Preço (R$)">
                <Input
                  type="number" min={0} step="0.01"
                  value={s.price ?? ""}
                  onChange={(e) => set("price", e.target.value === "" ? null : Number(e.target.value))}
                  placeholder="499"
                />
              </Field>
              <Field label="Período">
                <Input
                  value={s.price_period ?? ""}
                  onChange={(e) => set("price_period", e.target.value)}
                  placeholder="único · /mês · sob consulta"
                />
              </Field>
              <Field label="Prazo de entrega">
                <Input
                  value={s.delivery_days ?? ""}
                  onChange={(e) => set("delivery_days", e.target.value)}
                  placeholder="24h · 7 dias · 15 dias"
                />
              </Field>
            </div>
            <Field label="Condições (texto livre, aparece na página)">
              <Textarea
                rows={2}
                value={s.conditions ?? ""}
                onChange={(e) => set("conditions", e.target.value)}
                placeholder="Inclui domínio + SSL · pagamento único · suporte por 30 dias"
              />
            </Field>
          </div>


          <Field label="Tagline curta">
            <Input value={s.tagline ?? ""} onChange={(e) => set("tagline", e.target.value)} />
          </Field>

          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Texto do botão (CTA)">
              <Input value={s.cta_label ?? ""} onChange={(e) => set("cta_label", e.target.value)} placeholder="Quero esse serviço" />
            </Field>
            <Field label="Destino do CTA (opcional)">
              <Input value={s.cta_target ?? ""} onChange={(e) => set("cta_target", e.target.value)} placeholder="/contato ou https://wa.me/…" />
            </Field>
          </div>

          {/* Image */}
          <div className="rounded-lg border border-border p-3">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Imagem do card</Label>
            <div className="mt-2 flex items-center gap-3">
              {s.image_url ? (
                <div className="relative">
                  <img src={s.image_url} alt="" className="w-24 h-24 rounded object-cover bg-muted" />
                  <button
                    type="button"
                    onClick={() => { set("image_path", null); set("image_url", null); }}
                    className="absolute -top-2 -right-2 bg-background border border-border rounded-full p-0.5"
                    aria-label="Remover imagem"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">Sem imagem</div>
              )}
              <div className="flex-1">
                <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border cursor-pointer hover:bg-muted text-sm">
                  <Upload className="w-4 h-4" />
                  {uploading ? "Enviando…" : "Enviar imagem"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      e.target.value = "";
                      if (f) void onUpload(f);
                    }}
                  />
                </label>
                <Input
                  className="mt-2"
                  placeholder="Texto alternativo (acessibilidade)"
                  value={s.image_alt ?? ""}
                  onChange={(e) => set("image_alt", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Arrays */}
          <ArrayEditor label="Benefícios" items={s.benefits ?? []} onChange={(v) => set("benefits", v)} />
          <ArrayEditor label="Problemas que resolve" items={s.problems ?? []} onChange={(v) => set("problems", v)} />
          <ArrayEditor label="Palavras-chave (SEO)" items={s.keywords ?? []} onChange={(v) => set("keywords", v)} />

          <KvEditor label="Etapas do processo" items={s.process ?? []} keyLabel="Etapa" valLabel="Descrição" onChange={(v) => set("process", v)} />
          <KvEditor label="FAQ" items={s.faq ?? []} keyLabel="Pergunta" valLabel="Resposta" onChange={(v) => set("faq", v.map((x) => ({ q: x.step, a: x.desc })) as never)} adapt />

          {/* SEO overrides */}
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="SEO title (override)">
              <Input value={s.seo_title ?? ""} onChange={(e) => set("seo_title", e.target.value)} />
            </Field>
            <Field label="SEO description (override)">
              <Input value={s.seo_description ?? ""} onChange={(e) => set("seo_description", e.target.value)} />
            </Field>
          </div>

          {/* Flags */}
          <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-border">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={!!s.is_active} onCheckedChange={(v) => set("is_active", v)} />
              Ativo
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={!!s.is_featured} onCheckedChange={(v) => set("is_featured", v)} />
              Destaque
            </label>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Ordem</span>
              <Input
                type="number" min={0}
                className="w-24"
                value={s.display_order ?? 100}
                onChange={(e) => set("display_order", Number(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button onClick={submit} disabled={saving}>{saving ? "Salvando…" : "Salvar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function ArrayEditor({ label, items, onChange }: { label: string; items: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...items, v]);
    setDraft("");
  };
  return (
    <div className="rounded-lg border border-border p-3">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="mt-2 space-y-1">
        {items.map((it, i) => (
          <div key={i} className="flex gap-2 items-center">
            <Input
              value={it}
              onChange={(e) => { const next = [...items]; next[i] = e.target.value; onChange(next); }}
            />
            <Button variant="ghost" size="icon" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Remover">
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <Input
          placeholder={`Adicionar ${label.toLowerCase()}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        />
        <Button type="button" variant="secondary" onClick={add}><Plus className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}

type Kv = { step: string; desc: string };
function KvEditor({
  label, items, keyLabel, valLabel, onChange, adapt,
}: {
  label: string;
  items: Kv[] | { q: string; a: string }[];
  keyLabel: string;
  valLabel: string;
  onChange: (v: Kv[]) => void;
  adapt?: boolean;
}) {
  // Normalize FAQ {q,a} → {step:q, desc:a}
  const norm: Kv[] = useMemo(
    () => (items as Array<Record<string, string>>).map((it) => adapt
      ? { step: it.q ?? "", desc: it.a ?? "" }
      : { step: it.step ?? "", desc: it.desc ?? "" }),
    [items, adapt],
  );
  const update = (next: Kv[]) => onChange(next);

  return (
    <div className="rounded-lg border border-border p-3">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="mt-2 space-y-2">
        {norm.map((it, i) => (
          <div key={i} className="grid sm:grid-cols-[1fr_2fr_auto] gap-2 items-start">
            <Input
              placeholder={keyLabel}
              value={it.step}
              onChange={(e) => { const n = [...norm]; n[i] = { ...n[i], step: e.target.value }; update(n); }}
            />
            <Textarea
              rows={2}
              placeholder={valLabel}
              value={it.desc}
              onChange={(e) => { const n = [...norm]; n[i] = { ...n[i], desc: e.target.value }; update(n); }}
            />
            <Button variant="ghost" size="icon" onClick={() => update(norm.filter((_, j) => j !== i))} aria-label="Remover">
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="secondary" size="sm" onClick={() => update([...norm, { step: "", desc: "" }])}>
          <Plus className="w-4 h-4 mr-1" /> Adicionar
        </Button>
      </div>
    </div>
  );
}

function normalizeForm(initial: EditState): EditState {
  return {
    is_active: true,
    is_featured: false,
    display_order: 100,
    cta_label: "Solicitar proposta",
    problems: [],
    benefits: [],
    process: [],
    faq: [],
    keywords: [],
    ...initial,
    _isNew: !initial.id,
  };
}

function serializeForSave(s: EditState) {
  // Strip UI-only fields and adapt FAQ shape if needed.
  // Cast through Record to satisfy zod input expectations on the server.
  const faq = Array.isArray(s.faq)
    ? (s.faq as Array<{ q?: string; a?: string; step?: string; desc?: string }>).map((x) => ({
        q: (x.q ?? x.step ?? "").trim(),
        a: (x.a ?? x.desc ?? "").trim(),
      })).filter((x) => x.q && x.a)
    : [];
  const proc = Array.isArray(s.process)
    ? s.process.map((p) => ({ step: (p.step ?? "").trim(), desc: (p.desc ?? "").trim() })).filter((p) => p.step && p.desc)
    : [];
  return {
    id: s.id,
    slug: s.slug?.trim(),
    name: (s.name ?? "").trim(),
    category: (s.category ?? "").trim(),
    title: (s.title ?? "").trim(),
    h1: (s.h1 ?? "").trim(),
    description: (s.description ?? "").trim(),
    service_type: (s.service_type ?? "").trim(),
    tagline: s.tagline?.trim() || null,
    price_from: s.price_from ?? null,
    cta_label: (s.cta_label ?? "Solicitar proposta").trim(),
    cta_target: s.cta_target?.trim() || null,
    image_path: s.image_path ?? null,
    image_alt: s.image_alt?.trim() || null,
    seo_title: s.seo_title?.trim() || null,
    seo_description: s.seo_description?.trim() || null,
    problems: (s.problems ?? []).map((x) => x.trim()).filter(Boolean),
    benefits: (s.benefits ?? []).map((x) => x.trim()).filter(Boolean),
    process: proc,
    faq,
    keywords: (s.keywords ?? []).map((x) => x.trim()).filter(Boolean),
    is_active: !!s.is_active,
    is_featured: !!s.is_featured,
    display_order: Number(s.display_order ?? 100),
  };
}
