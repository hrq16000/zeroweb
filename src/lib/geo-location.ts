// Subtle location capture: IP-based geolocation with optional GPS confirmation.
// All values cached in sessionStorage to avoid re-fetching.

export type GeoInfo = {
  city?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  source: "ip" | "gps" | "ip+gps";
};

const KEY = "0web_geo_v1";

function readCache(): GeoInfo | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as GeoInfo) : null;
  } catch { return null; }
}

function writeCache(g: GeoInfo) {
  try { sessionStorage.setItem(KEY, JSON.stringify(g)); } catch { /* noop */ }
}

let inflight: Promise<GeoInfo | null> | null = null;

/** Subliminal IP-based geo lookup. Cached. Never throws. */
export async function getIpGeo(): Promise<GeoInfo | null> {
  if (typeof window === "undefined") return null;
  const cached = readCache();
  if (cached) return cached;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const r = await fetch("https://ipwho.is/?fields=success,city,region,country,latitude,longitude", { cache: "force-cache" });
      const j = await r.json();
      if (!j?.success) return null;
      const g: GeoInfo = {
        city: j.city || undefined,
        region: j.region || undefined,
        country: j.country || undefined,
        latitude: typeof j.latitude === "number" ? j.latitude : undefined,
        longitude: typeof j.longitude === "number" ? j.longitude : undefined,
        source: "ip",
      };
      writeCache(g);
      return g;
    } catch { return null; }
    finally { inflight = null; }
  })();
  return inflight;
}

/** Ask the user for GPS. Falls back to IP geo when denied/unavailable. */
export async function requestGpsThenFallback(): Promise<GeoInfo | null> {
  if (typeof window === "undefined") return null;
  const ip = await getIpGeo();
  if (!("geolocation" in navigator)) return ip;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const merged: GeoInfo = {
          ...(ip || { source: "ip" as const }),
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          source: ip ? "ip+gps" : "gps",
        };
        // Try reverse-geocode city for higher accuracy (best-effort)
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&zoom=10&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`, {
            headers: { "Accept-Language": "pt-BR" },
          });
          const j = await r.json();
          const addr = j?.address ?? {};
          merged.city = addr.city || addr.town || addr.village || addr.municipality || merged.city;
          merged.region = addr.state || merged.region;
          merged.country = addr.country || merged.country;
        } catch { /* keep ip values */ }
        writeCache(merged);
        resolve(merged);
      },
      () => resolve(ip),
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 600000 },
    );
  });
}

export function formatLocation(g: GeoInfo | null | undefined): string {
  if (!g) return "";
  return [g.city, g.region].filter(Boolean).join(" / ");
}
