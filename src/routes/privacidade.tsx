import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getLgpdSettings } from "@/lib/visitor-analytics.functions";

const lgpdQuery = queryOptions({
  queryKey: ["lgpd-settings"],
  queryFn: () => getLgpdSettings(),
});

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade & LGPD" },
      { name: "description", content: "Como tratamos seus dados, prazos de retenção e seus direitos sob a LGPD." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(lgpdQuery),
  component: PrivacyPage,
  errorComponent: ({ error }) => <div className="p-6">Erro: {error.message}</div>,
  notFoundComponent: () => <div className="p-6">Página não encontrada.</div>,
});

function PrivacyPage() {
  const { data } = useSuspenseQuery(lgpdQuery);
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 prose prose-neutral dark:prose-invert">
      <h1>Política de Privacidade & LGPD</h1>
      <p className="lead">
        Esta página resume como tratamos dados de navegação no nosso site, em conformidade com a
        Lei Geral de Proteção de Dados (Lei 13.709/2018).
      </p>

      <h2>Dados que coletamos</h2>
      <ul>
        <li><strong>Visita à página</strong>: caminho acessado, data, referenciador, UTMs, país (via Cloudflare).</li>
        <li><strong>Identificador anônimo</strong>: um UUID em cookie <code>0web_vid</code> (HttpOnly) para distinguir
          visitantes recorrentes — só é criado quando você aceita o uso de analytics.</li>
        <li><strong>IP</strong>: nunca armazenamos o IP bruto. Usamos um hash com sal diário (<code>ip_hash</code>) que
          impede engenharia reversa.</li>
      </ul>

      <h2>Prazos de retenção</h2>
      <ul>
        <li><strong>Anonimização parcial:</strong> após <strong>{data.anonymizeAfterDays} dias</strong>, removemos UTMs,
          user-agent, referenciador e cidade dos registros — restam apenas caminho, dia e contagem.</li>
        <li><strong>Exclusão definitiva:</strong> após <strong>{data.purgeAfterDays} dias</strong>, os registros são
          apagados e apenas a contagem agregada por dia é mantida.</li>
      </ul>

      <h2>Consentimento</h2>
      <p>
        Você controla seu consentimento pelo banner exibido na primeira visita. Se negar, nenhum dado
        é gravado em nossa tabela <code>visitantes_rastreio</code> — apenas um identificador efêmero por
        requisição é usado e descartado imediatamente. O servidor confere o cookie <code>0web_consent_v1</code>
        a cada navegação antes de qualquer escrita.
      </p>

      <h2>Seus direitos</h2>
      <p>
        Você pode solicitar acesso, correção, anonimização ou exclusão dos seus dados a qualquer momento
        pelo fluxo interno de privacidade e LGPD.
      </p>

      <p className="text-xs text-muted-foreground mt-12">
        Última revisão: {new Date().toLocaleDateString("pt-BR")}.
      </p>
    </main>
  );
}
