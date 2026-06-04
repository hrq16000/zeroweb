import { useEffect, useState } from "react";
import { trackEvent } from "./analytics";

const KEY = "0web_ab_v1";

type Assignments = Record<string, string>;

function read(): Assignments {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function write(a: Assignments) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(a));
}

/** Deterministically assigns user to a variant and persists it. */
export function assignVariant<T extends string>(experiment: string, variants: readonly T[]): T {
  if (typeof window === "undefined") return variants[0];
  const cur = read();
  if (cur[experiment] && variants.includes(cur[experiment] as T)) return cur[experiment] as T;
  const picked = variants[Math.floor(Math.random() * variants.length)];
  cur[experiment] = picked;
  write(cur);
  return picked;
}

export function useExperiment<T extends string>(experiment: string, variants: readonly T[]): T {
  const [v, setV] = useState<T>(variants[0]);
  useEffect(() => {
    const picked = assignVariant(experiment, variants);
    setV(picked);
    trackEvent("experiment_view", { experiment, variant: picked });
  }, [experiment]);
  return v;
}

export function getAllAssignments(): Assignments {
  return read();
}

export function resetAssignments() {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
}
