/**
 * Server-only helpers for the tokenized WhatsApp redirect flow.
 *
 * The client submits the funnel → server persists the lead → server issues a
 * short-lived opaque token → client navigates to `/r/whatsapp/:token` →
 * server route builds and 302s to the wa.me URL. The operational number never
 * leaves the server bundle.
 */
if (typeof window !== "undefined") {
  throw new Error("whatsapp-redirect.server.ts imported from client code");
}

import { randomBytes, createHash } from "node:crypto";
import { getOperationalContact } from "@/lib/contact.server";
import type { FunnelOption } from "@/lib/dynamic-funnel.functions";

export function generateRedirectToken(): string {
  // 32 hex chars = 128 bits of entropy — url-safe, non-guessable.
  return randomBytes(16).toString("hex");
}

export function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  const salt = process.env.IP_HASH_SALT ?? "0web-default-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

export type FunnelMessageContext = {
  funnelName: string;
  answers: Record<string, unknown>;
  questions: { key: string; label: string; options: FunnelOption[] }[];
  pageUrl?: string | null;
  pageTitle?: string | null;
  serviceSlug?: string | null;
  productSlug?: string | null;
  productName?: string | null;
  productPriceLabel?: string | null;
  citySlug?: string | null;
  cartSummary?: string | null;
  utm?: Record<string, string> | null;
  protocol: string;
};

/**
 * Builds a human-readable WhatsApp message. Never includes telemetry:
 * no IP, no ASN, no user-agent, no fingerprint. Only user-provided
 * answers plus commercial context (page, product, campaign summary).
 */
export function buildFunnelWhatsAppMessage(ctx: FunnelMessageContext): string {
  const lines: string[] = [];
  lines.push(`Olá! Acabei de preencher uma solicitação na 0WEB.`);
  lines.push("");
  lines.push(`Protocolo: ${ctx.protocol}`);
  lines.push("");
  lines.push(`*INTERESSE*`);
  lines.push(`Funil: ${ctx.funnelName}`);
  if (ctx.productName) lines.push(`Produto: ${ctx.productName}`);
  if (ctx.productPriceLabel) lines.push(`Plano/valor: ${ctx.productPriceLabel}`);
  if (ctx.serviceSlug) lines.push(`Serviço: ${ctx.serviceSlug}`);
  if (ctx.pageTitle) lines.push(`Página: ${ctx.pageTitle}`);
  else if (ctx.pageUrl) lines.push(`Página: ${ctx.pageUrl}`);
  lines.push("");

  const answersFmt = ctx.questions
    .filter(
      (q) =>
        ctx.answers[q.key] !== undefined &&
        ctx.answers[q.key] !== null &&
        ctx.answers[q.key] !== "" &&
        q.key !== "email" &&
        q.key !== "telefone" &&
        q.key !== "phone" &&
        q.key !== "whatsapp",
    )
    .map((q) => {
      const raw = ctx.answers[q.key];
      const display = Array.isArray(raw)
        ? raw
            .map((v) => q.options.find((o) => o.value === v)?.label ?? String(v))
            .join(", ")
        : q.options.find((o) => o.value === raw)?.label ?? String(raw);
      return `• ${q.label}: ${display}`;
    })
    .join("\n");
  if (answersFmt) {
    lines.push(`*MINHA SOLICITAÇÃO*`);
    lines.push(answersFmt);
    lines.push("");
  }

  if (ctx.citySlug) {
    lines.push(`*LOCALIDADE*`);
    lines.push(`Cidade: ${ctx.citySlug}`);
    lines.push("");
  }

  if (ctx.cartSummary) {
    lines.push(`*CARRINHO*`);
    lines.push(ctx.cartSummary);
    lines.push("");
  }

  const utm = ctx.utm ?? {};
  const utmParts = Object.entries(utm).filter(([, v]) => v);
  if (utmParts.length) {
    lines.push(`*REFERÊNCIA*`);
    lines.push(
      `Campanha: ${utmParts.map(([k, v]) => `${k}=${v}`).join(" | ")}`,
    );
  }

  // Trim to safe WhatsApp URL size (~1500 chars).
  const out = lines.join("\n").trim();
  return out.length > 1400 ? `${out.slice(0, 1380)}…\n\nProtocolo: ${ctx.protocol}` : out;
}

/**
 * Returns the destination digits or null when contact isn't configured.
 * Callers should treat null as "cannot redirect" and surface the fallback.
 */
export function getWhatsAppDestinationDigits(): string | null {
  const { whatsappNumber } = getOperationalContact();
  const digits = (whatsappNumber ?? "").replace(/\D/g, "");
  return digits || null;
}

export function buildWaMeUrl(digits: string, message: string): string {
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function makeProtocol(): string {
  const now = new Date();
  const ymd =
    now.getFullYear().toString().slice(-2) +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  const rand = randomBytes(3).toString("hex").toUpperCase();
  return `0W-${ymd}-${rand}`;
}
