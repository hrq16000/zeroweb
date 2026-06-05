// Helper para detectar e formatar erros de license_limit_exceeded vindos do Postgres.
// Mensagem original: 'license_limit_exceeded:<resource>:<current>/<limit>'

export type LicenseLimitInfo = {
  resource: string;
  current: number;
  limit: number;
  label: string;
};

const LABELS: Record<string, string> = {
  users: "usuários",
  leads: "leads",
  service_requests: "solicitações",
  projects: "projetos",
};

export function parseLicenseLimitError(err: unknown): LicenseLimitInfo | null {
  const msg =
    err instanceof Error ? err.message : typeof err === "string" ? err : (err as { message?: string })?.message;
  if (!msg) return null;
  const m = msg.match(/license_limit_exceeded:([a-z_]+):(\d+)\/(\d+)/);
  if (!m) return null;
  const resource = m[1];
  return {
    resource,
    current: Number(m[2]),
    limit: Number(m[3]),
    label: LABELS[resource] ?? resource,
  };
}
