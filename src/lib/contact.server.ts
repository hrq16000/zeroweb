/**
 * Server-only contact data. This module MUST NOT be imported from client
 * code (route components, hooks, `*.functions.ts` module scope, etc.).
 *
 * The site-wide policy is Funnel-first: no public surface may reveal a raw
 * WhatsApp number, phone or e-mail. Anything that needs the operational
 * contact — checkout, order support, admin — routes through this file so
 * the values are read from environment / DB *inside* server-function
 * handlers and never serialized back to the client.
 */

const SERVER_ONLY_MARKER = "__contact_server_only__" as const;

if (typeof window !== "undefined") {
  // Fail loudly if this ever gets bundled into the browser.
  throw new Error(
    "contact.server.ts was imported from client code — this module is server-only.",
  );
}

export type OperationalContact = {
  whatsappNumber: string;
  supportEmail: string | null;
};

/**
 * Read the operational WhatsApp number from environment. Never expose the
 * value through a public server function; use it only inside privileged /
 * admin flows or to build transactional support links via a signed token.
 */
export function getOperationalContact(): OperationalContact {
  const whatsappNumber =
    process.env.SUPPORT_WHATSAPP_NUMBER ??
    process.env.UAZAPI_ALERT_NUMBER ??
    "";
  const supportEmail = process.env.SUPPORT_EMAIL ?? null;
  return { whatsappNumber, supportEmail };
}

/**
 * Build a wa.me URL for a *verified* order-support flow. Callers must have
 * already validated the caller and the order server-side. The number itself
 * is never returned separately — only the fully-formed URL, and only from
 * inside a server-function handler.
 */
export function buildOrderSupportLink(params: {
  orderRef: string;
  message: string;
}): string | null {
  const { whatsappNumber } = getOperationalContact();
  if (!whatsappNumber) return null;
  const digits = whatsappNumber.replace(/\D/g, "");
  if (!digits) return null;
  const text = encodeURIComponent(
    `${params.message}\n\n—\nRef.: ${params.orderRef}`,
  );
  return `https://wa.me/${digits}?text=${text}`;
}

export const __serverOnlyContactMarker = SERVER_ONLY_MARKER;
