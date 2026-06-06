import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r: any) => r.role);
  if (!roles.includes("admin") && !roles.includes("super_admin")) throw new Error("forbidden");
}

export const getIssueDetail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);

    const { data: row, error } = await supabase
      .from("index_coverage_issues")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Issue não encontrado.");

    // History: any other issue rows for the same URL (chronological)
    const { data: history } = await supabase
      .from("index_coverage_issues")
      .select("id, issue_type, status_code, message, detected_at, resolved_at, source")
      .eq("url", row.url)
      .order("detected_at", { ascending: false })
      .limit(50);

    return { row, history: history ?? [] };
  });

/** Server-side fetch of the URL to extract JSON-LD blocks + meta robots. */
export const scrapeUrlEvidence = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { url: string }) =>
    z.object({ url: z.string().url().max(2000) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(data.url, {
        redirect: "manual",
        signal: controller.signal,
        headers: { "User-Agent": "0web-IndexCoverage/1.0 (+admin)" },
      });
      const status = res.status;
      const location = res.headers.get("location");
      const contentType = res.headers.get("content-type") ?? "";
      let html = "";
      if (contentType.includes("text/html") && status >= 200 && status < 400) {
        html = (await res.text()).slice(0, 500_000);
      }
      const ldBlocks: unknown[] = [];
      const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
      let m: RegExpExecArray | null;
      while ((m = re.exec(html))) {
        try { ldBlocks.push(JSON.parse(m[1].trim())); }
        catch { ldBlocks.push({ _parse_error: true, raw: m[1].trim().slice(0, 300) }); }
      }
      const metaRobots = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i)?.[1] ?? null;
      const canonical = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] ?? null;
      const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? null;

      return { status, location, contentType, metaRobots, canonical, title, ldBlocks };
    } catch (e: any) {
      return { status: 0, location: null, contentType: "", metaRobots: null, canonical: null, title: null, ldBlocks: [], error: e?.message ?? "fetch_failed" };
    } finally {
      clearTimeout(timer);
    }
  });
