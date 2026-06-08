import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ImageOff, Upload, ExternalLink, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  listServicesAdmin,
  getServiceImageUploadUrl,
  upsertService,
  type ServiceRow,
} from "@/lib/services-crud.functions";

export const Route = createFileRoute("/_authenticated/app/servicos-imagens")({
  component: ServiceImagesPage,
});

function ServiceImagesPage() {
  const fnList = useServerFn(listServicesAdmin);
  const fnUpload = useServerFn(getServiceImageUploadUrl);
  const fnUpsert = useServerFn(upsertService);

  const [rows, setRows] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    try {
      const { services } = await fnList();
      setRows(services);
    } catch (e) {
      toast.error("Falha ao carregar serviços", { description: (e as Error).message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void reload(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const orphans = rows.filter((r) => !r.image_path);
  const withImage = rows.filter((r) => r.image_path);

  const handleUpload = async (row: ServiceRow, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem acima de 5 MB");
      return;
    }
    if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) {
      toast.error("Formato inválido (use JPG, PNG, WEBP ou AVIF)");
      return;
    }
    setUploadingId(row.id);
    try {
      const { path, token } = await fnUpload({ data: { slug: row.slug, filename: file.name } });
      const { error: upErr } = await supabase.storage
        .from("service-images")
        .uploadToSignedUrl(path, token, file, { upsert: true });
      if (upErr) throw upErr;
      // Persiste image_path no serviço
      await fnUpsert({
        data: {
          id: row.id,
          name: row.name,
          category: row.category,
          title: row.title,
          h1: row.h1,
          description: row.description,
          service_type: row.service_type,
          cta_label: row.cta_label,
          image_path: path,
          og_image_path: row.og_image_path ?? path,
          og_type: (row.og_type as "website" | "article" | "product") || "website",
          schema_jsonld: row.schema_jsonld ?? [],
          problems: row.problems,
          benefits: row.benefits,
          process: row.process,
          faq: row.faq,
          keywords: row.keywords,
          is_active: row.is_active,
          is_featured: row.is_featured,
          show_in_menu: row.show_in_menu,
          show_in_footer: row.show_in_footer,
          show_in_home_featured: row.show_in_home_featured,
          show_in_sitemap: row.show_in_sitemap,
          funnels: row.funnels ?? {},
          display_order: row.display_order,
        },
      });
      toast.success(`Capa enviada — ${row.name}`);
      void reload();
    } catch (e) {
      toast.error("Falha no upload", { description: (e as Error).message });
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-display">Imagens dos serviços</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Lista de serviços sem capa cadastrada. Faça upload direto para o bucket
          <code className="text-xs mx-1">service-images</code> — o caminho é gravado em <code className="text-xs">services.image_path</code>.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : (
        <>
          <section className="mb-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <ImageOff className="w-4 h-4 text-amber-500" />
              Órfãos ({orphans.length})
            </h2>
            {orphans.length === 0 ? (
              <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Todos os serviços têm capa. 🎉
              </div>
            ) : (
              <div className="space-y-2">
                {orphans.map((row) => (
                  <OrphanRow
                    key={row.id}
                    row={row}
                    uploading={uploadingId === row.id}
                    onUpload={(f) => handleUpload(row, f)}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Com capa ({withImage.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {withImage.map((row) => (
                <Link
                  key={row.id}
                  to="/servicos/$slug"
                  params={{ slug: row.slug }}
                  target="_blank"
                  className="group rounded-lg border border-border overflow-hidden hover:border-primary transition"
                >
                  <div className="aspect-video bg-muted overflow-hidden">
                    {row.image_url ? (
                      <img
                        src={row.image_url}
                        alt={row.image_alt ?? row.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                        loading="lazy"
                      />
                    ) : null}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium truncate">{row.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                      /servicos/{row.slug} <ExternalLink className="w-2.5 h-2.5" />
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function OrphanRow({
  row, uploading, onUpload,
}: { row: ServiceRow; uploading: boolean; onUpload: (file: File) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
      <div className="w-16 h-16 rounded-md bg-muted grid place-items-center text-muted-foreground shrink-0">
        <ImageOff className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{row.name}</p>
        <p className="text-xs text-muted-foreground">
          /servicos/{row.slug} · {row.is_active ? "ativo" : "rascunho"} · {row.category}
        </p>
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUpload(f);
          if (ref.current) ref.current.value = "";
        }}
      />
      <Button
        size="sm"
        variant="outline"
        onClick={() => ref.current?.click()}
        disabled={uploading}
      >
        <Upload className="w-3.5 h-3.5 mr-1" />
        {uploading ? "Enviando…" : "Enviar capa"}
      </Button>
    </div>
  );
}
