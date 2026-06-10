import type { MoneyOutRequestType } from "@/types";
import { DEFAULT_POLICY, type PolicyConfig } from "./policy";

/**
 * Heuristic policy extractor used in mock mode to simulate the AI that turns a
 * free-text / PDF expense policy into our structured PolicyConfig. In live mode
 * the same job is done by the backend's LLM (POST /api/policy/parse); this keeps
 * the demo working offline and gives the parser deterministic, testable rules.
 */

const TYPE_KEYWORDS: Record<MoneyOutRequestType, string[]> = {
  employee_reimbursement: ["reimbursement", "reimburse", "expense", "employee"],
  supplier_invoice: ["supplier", "vendor", "invoice"],
  customer_refund: ["refund", "customer"],
  partner_commission: ["commission", "partner", "affiliate", "referral"],
};

// Match an amount like "£250", "250 GBP", "1,000", "38.40".
const AMOUNT_RE = /(?:£|gbp|usd|eur|\$|€)?\s*([\d][\d,]*(?:\.\d+)?)/i;

function toNumber(raw: string): number {
  return Number(raw.replace(/,/g, ""));
}

/** Split into clauses we can scan independently (sentences, lines, list items). */
function clauses(text: string): string[] {
  return text
    .split(/[\n.;•\-–]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parsePolicyText(text: string): PolicyConfig {
  const lower = text.toLowerCase();
  const thresholds = { ...DEFAULT_POLICY.autoApprovalThresholds };

  for (const clause of clauses(lower)) {
    const amountMatch = clause.match(AMOUNT_RE);
    if (!amountMatch) continue;
    const amount = toNumber(amountMatch[1]);
    if (!Number.isFinite(amount) || amount <= 0) continue;

    for (const [type, keywords] of Object.entries(TYPE_KEYWORDS) as [
      MoneyOutRequestType,
      string[],
    ][]) {
      if (keywords.some((k) => clause.includes(k))) {
        thresholds[type] = amount;
      }
    }
  }

  // Duplicate handling: on unless the doc explicitly allows duplicates.
  const blockDuplicates = !/(allow|permit).{0,20}duplicat/.test(lower);

  // Receipt requirement, e.g. "receipts required over £25".
  let receiptRequiredOver = DEFAULT_POLICY.receiptRequiredOver;
  const receiptClause = clauses(lower).find((c) => c.includes("receipt"));
  if (receiptClause) {
    const m = receiptClause.match(AMOUNT_RE);
    if (m) receiptRequiredOver = toNumber(m[1]);
  }

  // Allowed categories, e.g. "allowed categories: travel, software, meals".
  let allowedCategories = DEFAULT_POLICY.allowedCategories;
  const catMatch = lower.match(/categor(?:y|ies)[:\s]+([a-z0-9 ,_&/]+)/);
  if (catMatch) {
    const parsed = catMatch[1]
      .split(/[,/&]| and /)
      .map((c) => c.trim().replace(/\s+/g, "_"))
      .filter(Boolean);
    if (parsed.length) allowedCategories = parsed;
  }

  const currency = lower.includes("usd") || lower.includes("$")
    ? "USD"
    : lower.includes("eur") || lower.includes("€")
      ? "EUR"
      : "GBP";

  return {
    autoApprovalThresholds: thresholds,
    allowedCategories,
    blockDuplicates,
    receiptRequiredOver,
    currency,
    notes: text.trim().slice(0, 280) || undefined,
    updatedAt: new Date().toISOString(),
  };
}
