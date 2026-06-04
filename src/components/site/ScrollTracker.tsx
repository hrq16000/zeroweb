import { useScrollDepthTracking } from "@/lib/analytics";

export function ScrollTracker() {
  useScrollDepthTracking();
  return null;
}
