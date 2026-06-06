// Pure client-side evaluator that mirrors the SQL trigger
// `apply_pipeline_rules_on_insert()` in semantics.

export type Stage = "novo" | "contatado" | "qualificado" | "ganho" | "perdido";
export type Intent = "cold" | "warm" | "hot";

export interface PipelineRule {
  id?: string;
  form_id: string | null;
  name: string;
  priority: number;
  enabled: boolean;
  trigger: {
    score_gte?: number;
    score_lte?: number;
    intent_in?: Intent[];
    has_any_tag?: string[];
    answer?: {
      question_key: string;
      equals?: string;
      contains?: string;
      in?: string[];
    };
  };
  action: {
    stage?: Stage;
    add_tags?: string[];
    remove_tags?: string[];
  };
}

export interface MockLead {
  form_id: string | null;
  score: number;
  intent: Intent;
  tags: string[];
  answers: Record<string, string>;
  stage: Stage;
}

export interface RuleMatch {
  rule: PipelineRule;
  matched: boolean;
  reasons: string[];
  applied: boolean; // true only for the first matching enabled rule
}

export interface SimulationResult {
  matches: RuleMatch[];
  finalStage: Stage;
  finalTags: string[];
  appliedRuleId?: string;
}

function answerMatches(t: NonNullable<PipelineRule["trigger"]["answer"]>, answers: Record<string, string>): boolean {
  const v = answers[t.question_key];
  if (v == null) return false;
  if (t.equals != null) return v === t.equals;
  if (t.contains != null) return v.toLowerCase().includes(t.contains.toLowerCase());
  if (t.in != null && t.in.length) return t.in.includes(v);
  return false;
}

function evalRule(rule: PipelineRule, lead: MockLead): { matched: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const t = rule.trigger;

  // Scope: form
  if (rule.form_id && lead.form_id && rule.form_id !== lead.form_id) {
    return { matched: false, reasons: ["funil diferente"] };
  }

  if (t.score_gte != null) {
    const ok = lead.score >= t.score_gte;
    reasons.push(`score ≥ ${t.score_gte} → ${lead.score} ${ok ? "✓" : "✗"}`);
    if (!ok) return { matched: false, reasons };
  }
  if (t.score_lte != null) {
    const ok = lead.score <= t.score_lte;
    reasons.push(`score ≤ ${t.score_lte} → ${lead.score} ${ok ? "✓" : "✗"}`);
    if (!ok) return { matched: false, reasons };
  }
  if (t.intent_in?.length) {
    const ok = t.intent_in.includes(lead.intent);
    reasons.push(`intenção em [${t.intent_in.join(", ")}] → ${lead.intent} ${ok ? "✓" : "✗"}`);
    if (!ok) return { matched: false, reasons };
  }
  if (t.has_any_tag?.length) {
    const ok = t.has_any_tag.some((tag) => lead.tags.includes(tag));
    reasons.push(`tem tag em [${t.has_any_tag.join(", ")}] ${ok ? "✓" : "✗"}`);
    if (!ok) return { matched: false, reasons };
  }
  if (t.answer?.question_key) {
    const ok = answerMatches(t.answer, lead.answers);
    const op = t.answer.equals != null ? `= "${t.answer.equals}"` : t.answer.contains != null ? `contém "${t.answer.contains}"` : `em [${(t.answer.in ?? []).join(", ")}]`;
    reasons.push(`resposta ${t.answer.question_key} ${op} ${ok ? "✓" : "✗"}`);
    if (!ok) return { matched: false, reasons };
  }

  if (reasons.length === 0) reasons.push("sem condições (sempre aplica)");
  return { matched: true, reasons };
}

export function simulateRules(rules: PipelineRule[], lead: MockLead): SimulationResult {
  // Order matches the SQL trigger: priority DESC, created_at ASC.
  const ordered = [...rules].sort((a, b) => b.priority - a.priority);

  let applied: PipelineRule | undefined;
  const matches: RuleMatch[] = [];

  for (const rule of ordered) {
    if (!rule.enabled) {
      matches.push({ rule, matched: false, reasons: ["regra desativada"], applied: false });
      continue;
    }
    const { matched, reasons } = evalRule(rule, lead);
    const isFirstMatch = matched && !applied;
    matches.push({ rule, matched, reasons, applied: isFirstMatch });
    if (isFirstMatch) applied = rule;
  }

  let finalStage = lead.stage;
  const tagSet = new Set(lead.tags);
  if (applied) {
    if (applied.action.stage) finalStage = applied.action.stage;
    applied.action.add_tags?.forEach((t) => tagSet.add(t));
    applied.action.remove_tags?.forEach((t) => tagSet.delete(t));
  }

  return {
    matches,
    finalStage,
    finalTags: Array.from(tagSet),
    appliedRuleId: applied?.id,
  };
}
