// Persistence layer for analytics events, leads, A/B experiments, and WA funnel sessions.
// Best-effort writes via supabase-js with anon key. Fails silently — localStorage continues
// to operate as cache/fallback so the UI never blocks on network errors.

import { supabase } from "@/integrations/supabase/client";
import { getVisitorId, getSessionId, getDeviceType } from "./visitor";
import { getActiveUtms } from "./site-config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = any;

function abState() {
  try {
    const ab = JSON.parse(localStorage.getItem("0web_ab_v1") || "{}") as Record<string, string>;
    return { hero: ab["hero_copy"] ?? null, cta: ab["hero_cta"] ?? null };
  } catch {
    return { hero: null, cta: null };
  }
}

function ctx() {
  if (typeof window === "undefined") {
    return { path: null, page: null, referrer: null, utms: {} as Record<string, string> };
  }
  return {
    path: window.location.pathname,
    page: document.title || window.location.pathname,
    referrer: document.referrer || null,
    utms: getActiveUtms(),
  };
}

export async function persistEvent(eventName: string, params: Json = {}) {
  if (typeof window === "undefined") return;
  try {
    const c = ctx();
    const ab = abState();
    const location = (params.location as string | undefined) ?? null;
    await supabase.from("analytics_events").insert({
      session_id: getSessionId(),
      visitor_id: getVisitorId(),
      event_name: eventName,
      page: c.page,
      path: c.path,
      location,
      hero_variant: ab.hero,
      cta_variant: ab.cta,
      utm_source: c.utms.utm_source ?? null,
      utm_medium: c.utms.utm_medium ?? null,
      utm_campaign: c.utms.utm_campaign ?? null,
      utm_term: c.utms.utm_term ?? null,
      utm_content: c.utms.utm_content ?? null,
      referrer: c.referrer,
      device_type: getDeviceType(),
      metadata_json: params,
    });
  } catch {
    /* swallow */
  }
}

export async function persistLead(input: {
  name?: string;
  email?: string;
  phone?: string;
  source?: string;
  payload?: Json;
}) {
  if (typeof window === "undefined") return;
  try {
    const c = ctx();
    const ab = abState();
    await supabase.from("lead_submissions").insert({
      name: input.name ?? null,
      email: input.email ?? null,
      phone: input.phone ?? null,
      source: input.source ?? null,
      landing_page: c.path,
      hero_variant: ab.hero,
      cta_variant: ab.cta,
      utm_source: c.utms.utm_source ?? null,
      utm_medium: c.utms.utm_medium ?? null,
      utm_campaign: c.utms.utm_campaign ?? null,
      payload_json: input.payload ?? null,
    });
  } catch {
    /* swallow */
  }
}

let waSessionRowId: string | null = null;

export async function persistWaFunnelOpen(totalSteps: number) {
  if (typeof window === "undefined") return;
  try {
    const c = ctx();
    const ab = abState();
    const { data, error } = await supabase
      .from("wa_funnel_sessions")
      .insert({
        session_id: getSessionId(),
        started_at: new Date().toISOString(),
        current_step: 0,
        total_steps: totalSteps,
        completed: false,
        landing_page: c.path,
        hero_variant: ab.hero,
        cta_variant: ab.cta,
        utm_source: c.utms.utm_source ?? null,
        utm_medium: c.utms.utm_medium ?? null,
        utm_campaign: c.utms.utm_campaign ?? null,
        answers_json: {},
      })
      .select("id")
      .single();
    if (!error && data) waSessionRowId = data.id as string;
  } catch {
    /* swallow */
  }
}

export async function persistWaFunnelStep(stepIndex: number, answers: Record<string, string>) {
  if (typeof window === "undefined" || !waSessionRowId) return;
  try {
    await supabase
      .from("wa_funnel_sessions")
      .update({ current_step: stepIndex, answers_json: answers })
      .eq("id", waSessionRowId);
  } catch {
    /* swallow */
  }
}

export async function persistWaFunnelComplete(answers: Record<string, string>) {
  if (typeof window === "undefined") return;
  try {
    if (waSessionRowId) {
      await supabase
        .from("wa_funnel_sessions")
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          answers_json: answers,
        })
        .eq("id", waSessionRowId);
    }
  } catch {
    /* swallow */
  }
  // also persist as a lead
  await persistLead({
    name: answers.nome,
    email: answers.email,
    phone: answers.whatsapp ?? answers.telefone,
    source: "wa_funnel",
    payload: answers,
  });
  waSessionRowId = null;
}

export async function bumpExperiment(
  experiment: string,
  variant: string,
  delta: { impressions?: number; clicks?: number; conversions?: number },
) {
  if (typeof window === "undefined") return;
  try {
    await supabase.rpc("bump_experiment", {
      p_name: experiment,
      p_variant: variant,
      p_impressions: delta.impressions ?? 0,
      p_clicks: delta.clicks ?? 0,
      p_conversions: delta.conversions ?? 0,
    });
  } catch {
    /* swallow */
  }
}
