// Shared evaluator for admin-shaped questions/conditions used by Preview + Logic Tester.
// Mirrors the live runtime logic in FunnelRunner, but operates on the admin DTO
// (options_json instead of options) and without any network/submit side effects.

export type PreviewQuestion = {
  id: string;
  key: string;
  type: string;
  label: string;
  hint?: string | null;
  placeholder?: string | null;
  required?: boolean;
  order_index: number;
  options_json?: Array<{ value: string; label: string; emoji?: string }> | null;
};

export type PreviewCondition = {
  id: string;
  from_question_id: string;
  operator: string;
  value: unknown;
  action: "skip_to" | "end_form" | string;
  target_question_id: string | null;
  priority: number;
};

export type Answers = Record<string, string | string[] | number | null | undefined>;

export type EvalStep = {
  conditionId: string;
  operator: string;
  expected: unknown;
  actual: unknown;
  matched: boolean;
  action: "skip_to" | "end_form" | string;
  target?: string | null;
};

export type EvalResult = {
  end?: boolean;
  skipTo?: string;
  steps: EvalStep[];
};

export function evaluateConditionsFor(
  q: PreviewQuestion,
  answers: Answers,
  conditions: PreviewCondition[],
): EvalResult {
  const conds = conditions
    .filter((c) => c.from_question_id === q.id)
    .sort((a, b) => a.priority - b.priority);
  const a = answers[q.key];
  const steps: EvalStep[] = [];
  for (const c of conds) {
    let match = false;
    switch (c.operator) {
      case "equals": match = a === c.value; break;
      case "not_equals": match = a !== c.value; break;
      case "contains":
        match = Array.isArray(a)
          ? a.includes(c.value as string)
          : String(a ?? "").toLowerCase().includes(String(c.value ?? "").toLowerCase());
        break;
      case "in":
        match = Array.isArray(c.value) && (c.value as unknown[]).includes(a as unknown);
        break;
      case "not_in":
        match = Array.isArray(c.value) && !(c.value as unknown[]).includes(a as unknown);
        break;
      case "is_empty":
        match = a == null || a === "" || (Array.isArray(a) && a.length === 0);
        break;
      case "is_not_empty":
        match = !(a == null || a === "" || (Array.isArray(a) && a.length === 0));
        break;
    }
    steps.push({
      conditionId: c.id,
      operator: c.operator,
      expected: c.value,
      actual: a,
      matched: match,
      action: c.action,
      target: c.target_question_id,
    });
    if (match) {
      if (c.action === "end_form") return { end: true, steps };
      if (c.action === "skip_to" && c.target_question_id) return { skipTo: c.target_question_id, steps };
    }
  }
  return { steps };
}

/** Simulates a full traversal given a fixed map of answers. */
export function simulatePath(
  questions: PreviewQuestion[],
  conditions: PreviewCondition[],
  answers: Answers,
): {
  visited: Array<{ q: PreviewQuestion; eval: EvalResult; nextReason: "linear" | "skip_to" | "end_form" | "complete" }>;
  endedEarly: boolean;
} {
  const ordered = [...questions].sort((a, b) => a.order_index - b.order_index);
  const visited: Array<{ q: PreviewQuestion; eval: EvalResult; nextReason: "linear" | "skip_to" | "end_form" | "complete" }> = [];
  let idx = 0;
  const guard = new Set<string>();
  while (idx >= 0 && idx < ordered.length) {
    const q = ordered[idx];
    if (guard.has(q.id)) break; // prevent infinite loop
    guard.add(q.id);
    const ev = evaluateConditionsFor(q, answers, conditions);
    let reason: "linear" | "skip_to" | "end_form" | "complete" = "linear";
    if (ev.end) { reason = "end_form"; visited.push({ q, eval: ev, nextReason: reason }); return { visited, endedEarly: true }; }
    if (ev.skipTo) {
      reason = "skip_to";
      visited.push({ q, eval: ev, nextReason: reason });
      const f = ordered.findIndex((x) => x.id === ev.skipTo);
      if (f < 0) return { visited, endedEarly: false };
      idx = f;
      continue;
    }
    if (idx + 1 >= ordered.length) reason = "complete";
    visited.push({ q, eval: ev, nextReason: reason });
    idx += 1;
  }
  return { visited, endedEarly: false };
}
