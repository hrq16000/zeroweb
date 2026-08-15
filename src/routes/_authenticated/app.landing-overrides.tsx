import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  adminListLandingOverrideHistory,
  adminListLandingOverrides,
  adminPreviewLandingOverride,
  adminPublishLandingOverride,
  adminRollbackLandingOverride,
  adminSaveLandingOverrideDraft,
  adminUnpublishLandingOverride,
} from "@/lib/landing-overrides-admin.functions";


export const Route = createFileRoute("/_authenticated/app/landing-overrides")({
  component: LandingOverridesAdmin,
});

function LandingOverridesAdmin() {
  const queryClient = useQueryClient();
  const list = useServerFn(adminListLandingOverrides);
  const saveDraft = useServerFn(adminSaveLandingOverrideDraft);
  const publish = useServerFn(adminPublishLandingOverride);
  const unpublish = useServerFn(adminUnpublishLandingOverride);
  const previewFn = useServerFn(adminPreviewLandingOverride);
  const historyFn = useServerFn(adminListLandingOverrideHistory);
  const rollback = useServerFn(adminRollbackLandingOverride);

  const [scope, setScope] = useState("global");
  const [key, setKey] = useState("");
  const [draftValue, setDraftValue] = useState('{\n  "title": ""\n}');
  const [openId, setOpenId] = useState<string | null>(null);


  const overrides = useQuery({
    queryKey: ["admin", "landing-overrides"],
    queryFn: () => list({ data: undefined }),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "landing-overrides"] });

  const saveMutation = useMutation({
    mutationFn: () => saveDraft({ data: { scope, key, draftValue } }),
    onSuccess: () => {
      toast.success("Rascunho salvo (draft).");
      void invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => publish({ data: { id } }),
    onSuccess: () => {
      toast.success("Override publicado — já visível no site.");
      void invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const unpublishMutation = useMutation({
    mutationFn: (id: string) => unpublish({ data: { id } }),
    onSuccess: () => {
      toast.success("Override despublicado — site volta ao conteúdo padrão.");
      void invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const rows = overrides.data?.rows ?? [];

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Landing Overrides</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Edite conteúdos de landing em rascunho e publique quando aprovado. O site público
          renderiza somente o valor publicado.
        </p>
      </header>

      <section className="rounded-lg border border-border p-5 space-y-4">
        <h2 className="font-semibold">Novo / atualizar rascunho</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="scope">Escopo</Label>
            <Input id="scope" value={scope} onChange={(e) => setScope(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="key">Chave</Label>
            <Input
              id="key"
              placeholder="home.hero"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="draft">Valor (JSON)</Label>
          <Textarea
            id="draft"
            rows={8}
            className="font-mono text-sm"
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
          />
        </div>
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={!key.trim() || saveMutation.isPending}
        >
          {saveMutation.isPending ? "Salvando..." : "Salvar rascunho"}
        </Button>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Overrides ({rows.length})</h2>
        {overrides.isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
        {overrides.isError && (
          <p className="text-sm text-destructive">
            {(overrides.error as Error)?.message ?? "Falha ao carregar."}
          </p>
        )}
        <div className="space-y-3">
          {rows.map((row) => {
            const published = row.published_value !== null && row.published_value !== undefined;
            const hasDraft = row.draft_value !== null && row.draft_value !== undefined;
            return (
              <article key={row.id} className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm">{row.key}</span>
                  <Badge variant="outline">{row.scope}</Badge>
                  <Badge variant={published ? "default" : "secondary"}>
                    {published ? "published" : hasDraft ? "draft" : "vazio"}
                  </Badge>
                </div>
                <pre className="max-h-40 overflow-auto rounded bg-muted p-3 text-xs">
                  {JSON.stringify(published ? row.published_value : row.draft_value, null, 2)}
                </pre>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setScope(row.scope);
                      setKey(row.key);
                      setDraftValue(
                        JSON.stringify(row.draft_value ?? row.published_value ?? {}, null, 2),
                      );
                    }}
                  >
                    Editar rascunho
                  </Button>
                  <Button
                    size="sm"
                    disabled={!hasDraft || publishMutation.isPending}
                    onClick={() => publishMutation.mutate(row.id)}
                  >
                    Publicar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={!published || unpublishMutation.isPending}
                    onClick={() => unpublishMutation.mutate(row.id)}
                  >
                    Despublicar
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
