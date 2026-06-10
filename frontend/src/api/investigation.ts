import type {
  AuditEntry,
  MoneyOutRequest,
  ReActStep,
  RiskLevel,
} from "@/types";
import { AGENT_LABELS, DEFAULT_AGENT_FOR_TYPE, REQUEST_TYPE_LABELS } from "@/lib/labels";
import { DEFAULT_POLICY, thresholdFor, type PolicyConfig } from "@/lib/policy";

/** The slice of a request produced by running an investigation. */
export interface InvestigationResult {
  steps: ReActStep[];
  policyChecks: MoneyOutRequest["policyChecks"];
  risk: MoneyOutRequest["risk"];
  decisionDetail: MoneyOutRequest["decisionDetail"];
  decision: MoneyOutRequest["decision"];
  riskLevel: RiskLevel;
  ralioReady: boolean;
  /** Audit entries to append to the request's existing log. */
  audit: AuditEntry[];
}

export interface InvestigationContext {
  /** All other requests, used for duplicate detection. */
  others: MoneyOutRequest[];
  policy: PolicyConfig;
}

let counter = 0;
const uid = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${counter++}`;

const normRef = (s?: string) => (s ?? "").trim().toLowerCase();

/**
 * Find an existing request that the given one duplicates. A duplicate is:
 *   - another request with the same non-empty reference, or
 *   - (no reference) same payee + amount + type,
 * as long as that other request was not itself blocked or rejected.
 * The earlier-created request is treated as the original.
 */
export function detectDuplicate(
  request: MoneyOutRequest,
  others: MoneyOutRequest[],
): MoneyOutRequest | null {
  const ref = normRef(request.reference);
  const candidates = others.filter((o) => {
    if (o.id === request.id) return false;
    if (o.decision === "blocked" || o.decision === "rejected") return false;
    // Don't treat a later submission as the original.
    if (new Date(o.createdAt).getTime() > new Date(request.createdAt).getTime()) return false;
    if (ref) return normRef(o.reference) === ref;
    return (
      o.payee.trim().toLowerCase() === request.payee.trim().toLowerCase() &&
      o.amount === request.amount &&
      o.type === request.type
    );
  });
  return candidates[0] ?? null;
}

/**
 * Run a ReAct investigation for a request. Duplicate detection runs first (and
 * blocks before Ralio); otherwise the seeded Sarah case gets a scripted trail
 * and everything else a plausible investigation derived from type + policy.
 */
export function runInvestigation(
  request: MoneyOutRequest,
  ctx: InvestigationContext = { others: [], policy: DEFAULT_POLICY },
): InvestigationResult {
  const duplicate = ctx.policy.blockDuplicates
    ? detectDuplicate(request, ctx.others)
    : null;
  if (duplicate) return blockedInvestigation(request, duplicate);

  if (request.id === "req_sarah") return sarahInvestigation(request, ctx.policy);
  return genericInvestigation(request, ctx.policy);
}

// A small clock that lays steps out a few seconds apart, anchored at "now".
function clock(start = Date.now()) {
  let t = start;
  return () => {
    t += 8000;
    return new Date(t).toISOString();
  };
}

function blockedInvestigation(
  request: MoneyOutRequest,
  match: MoneyOutRequest,
): InvestigationResult {
  const tick = clock();
  const agent = DEFAULT_AGENT_FOR_TYPE[request.type];
  const existing = match.ralio.reference ?? match.reference ?? match.id;
  const matchLabel = match.reference
    ? `reference ${match.reference}`
    : `${match.payee} for £${match.amount.toFixed(2)}`;

  const steps: ReActStep[] = [
    step(1, "thought", agent, `This looks like a ${REQUEST_TYPE_LABELS[request.type].toLowerCase()}. Before anything else I must screen it for duplicates.`, tick()),
    step(2, "tool_call", "risk_duplicate_agent", "Checking for a prior matching payment or request.", tick(), `lookup_previous_payments(${JSON.stringify(request.payee)}, ${request.amount}, ${JSON.stringify(request.reference ?? "")})`),
    step(3, "observation", "risk_duplicate_agent", `Match found. ${matchLabel} was already submitted${match.ralioStatus === "paid" ? " and paid" : ""} (${existing}).`, tick()),
    step(4, "risk", "risk_duplicate_agent", "Duplicate detected. Risk: high. This payment must not reach Ralio.", tick()),
    step(5, "decision", "risk_duplicate_agent", `Blocked before Ralio. ${existing} already covers this.`, tick()),
  ];

  return {
    steps,
    policyChecks: [
      { id: uid("pc"), label: `${request.payee} is a known payee`, status: "pass" },
      { id: uid("pc"), label: "Duplicate payment detected", status: "fail" },
      { id: uid("pc"), label: "Ralio execution blocked", status: "fail" },
    ],
    risk: {
      level: "high",
      score: 92,
      duplicateDetected: true,
      existingPayment: existing,
      recipientMismatch: false,
      approvalRequired: false,
      paymentRetryRisk: true,
      notes: `Matches an existing request (${matchLabel}).`,
    },
    decisionDetail: {
      decision: "blocked",
      confidence: 96,
      reason: `This duplicates an existing request — ${matchLabel} (${existing}). It was blocked before any money moved.`,
    },
    decision: "blocked",
    riskLevel: "high",
    ralioReady: false,
    audit: [
      { id: uid("au"), timestamp: steps[0].timestamp, message: `${AGENT_LABELS["risk_duplicate_agent"]} started investigation`, agent: "risk_duplicate_agent" },
      { id: uid("au"), timestamp: steps[2].timestamp, message: `Duplicate detected: ${matchLabel} (${existing})`, agent: "risk_duplicate_agent" },
      { id: uid("au"), timestamp: steps[4].timestamp, message: "Decision: blocked — not sent to Ralio", agent: "risk_duplicate_agent" },
    ],
  };
}

function sarahInvestigation(request: MoneyOutRequest, policy: PolicyConfig): InvestigationResult {
  const tick = clock();
  const agent = "reimbursement_agent" as const;
  const threshold = thresholdFor(policy, "employee_reimbursement");
  const steps: ReActStep[] = [
    step(1, "thought", agent, "The request looks like an employee reimbursement. I need to verify the employee, receipt, policy, and duplicates.", tick()),
    step(2, "tool_call", agent, "Verifying the employee record.", tick(), 'lookup_employee("Sarah Jones")'),
    step(3, "observation", agent, "Sarah Jones exists. Department: Sales. Manager: Priya Shah.", tick()),
    step(4, "tool_call", agent, "Fetching the attached receipt.", tick(), 'lookup_receipt("receipt_102")'),
    step(5, "observation", agent, "Receipt found. Merchant: Pret. Amount: £38.40.", tick()),
    step(6, "policy", agent, "Checking category and threshold policy.", tick(), 'check_policy("employee_reimbursement", 38.40, "client_meal")'),
    step(7, "observation", agent, `Policy passed. Auto-approval threshold: £${threshold}.`, tick()),
    step(8, "tool_call", "risk_duplicate_agent", "Checking for a prior matching payment.", tick(), 'lookup_previous_payments("Sarah Jones", 38.40, "client lunch")'),
    step(9, "observation", "risk_duplicate_agent", "No duplicate payment found.", tick()),
    step(10, "decision", agent, "Approved. Ready for Ralio execution.", tick()),
  ];

  return {
    steps,
    policyChecks: [
      { id: uid("pc"), label: "Employee exists", status: "pass" },
      { id: uid("pc"), label: "Receipt found", status: "pass" },
      { id: uid("pc"), label: "Category allowed", status: "pass" },
      { id: uid("pc"), label: "Amount under auto-approval threshold", status: "pass" },
      { id: uid("pc"), label: "No duplicate found", status: "pass" },
      { id: uid("pc"), label: "Risk agent passed", status: "pass" },
    ],
    risk: {
      level: "low",
      score: 7,
      duplicateDetected: false,
      recipientMismatch: false,
      approvalRequired: false,
      paymentRetryRisk: false,
      notes: "Receipt matches the claim and there is no prior payment.",
    },
    decisionDetail: {
      decision: "approved",
      confidence: 92,
      reason: `Employee exists, receipt found, amount is under the £${threshold} policy threshold, and no duplicate payment was found.`,
    },
    decision: "approved",
    riskLevel: "low",
    ralioReady: true,
    audit: auditFromSteps(request, steps, "Decision: approved"),
  };
}

function genericInvestigation(request: MoneyOutRequest, policy: PolicyConfig): InvestigationResult {
  const tick = clock();
  const agent = DEFAULT_AGENT_FOR_TYPE[request.type];
  const threshold = thresholdFor(policy, request.type);
  const underThreshold = request.amount <= threshold;
  const typeLabel = REQUEST_TYPE_LABELS[request.type].toLowerCase();
  const money = `£${request.amount.toFixed(2)}`;

  const steps: ReActStep[] = [
    step(1, "thought", agent, `This looks like a ${typeLabel}. I'll verify the payee, check policy and thresholds, and screen for duplicates.`, tick()),
    step(2, "tool_call", agent, `Looking up the payee record for ${request.payee}.`, tick(), `lookup_counterparty(${JSON.stringify(request.payee)})`),
    step(3, "observation", agent, `${request.payee} found and verified.`, tick()),
    step(4, "policy", agent, underThreshold
      ? `Amount ${money} is within the ${typeLabel} auto-approval threshold of £${threshold}.`
      : `Amount ${money} exceeds the ${typeLabel} auto-approval threshold of £${threshold}.`, tick(), `check_policy(${JSON.stringify(request.type)}, ${request.amount})`),
    step(5, "tool_call", "risk_duplicate_agent", "Screening for duplicate or repeated payment attempts.", tick(), `lookup_previous_payments(${JSON.stringify(request.payee)}, ${request.amount})`),
    step(6, "observation", "risk_duplicate_agent", "No duplicate or recipient change detected.", tick()),
    step(7, "decision", agent, underThreshold
      ? "Approved. Ready for Ralio execution."
      : "Needs human approval before Ralio execution — amount above threshold.", tick()),
  ];

  const decision = underThreshold ? "approved" : "needs_approval";

  return {
    steps,
    policyChecks: [
      { id: uid("pc"), label: `${request.payee} is a known payee`, status: "pass" },
      { id: uid("pc"), label: "Reference / documentation present", status: request.reference ? "pass" : "warn" },
      { id: uid("pc"), label: "Amount under auto-approval threshold", status: underThreshold ? "pass" : "fail" },
      { id: uid("pc"), label: "No duplicate found", status: "pass" },
      { id: uid("pc"), label: "Risk agent passed", status: "pass" },
    ],
    risk: {
      level: underThreshold ? "low" : "medium",
      score: underThreshold ? 12 : 41,
      duplicateDetected: false,
      recipientMismatch: false,
      approvalRequired: !underThreshold,
      paymentRetryRisk: false,
      notes: underThreshold
        ? "No duplicates and amount within policy."
        : `Amount exceeds the £${threshold} auto-approval threshold for this request type.`,
    },
    decisionDetail: {
      decision,
      confidence: underThreshold ? 90 : 84,
      reason: underThreshold
        ? `${request.payee} verified, no duplicate found, and ${money} is within the £${threshold} threshold. Approved for Ralio.`
        : `${request.payee} verified and no duplicate found, but ${money} exceeds the £${threshold} threshold and needs human approval first.`,
    },
    decision,
    riskLevel: underThreshold ? "low" : "medium",
    ralioReady: underThreshold,
    audit: auditFromSteps(request, steps, `Decision: ${decision}`),
  };
}

function step(
  index: number,
  kind: ReActStep["kind"],
  agent: ReActStep["agent"],
  title: string,
  timestamp: string,
  tool?: string,
): ReActStep {
  return { id: uid("st"), index, kind, agent, title, timestamp, tool };
}

function auditFromSteps(
  request: MoneyOutRequest,
  steps: ReActStep[],
  decisionLine: string,
): AuditEntry[] {
  const agent = DEFAULT_AGENT_FOR_TYPE[request.type];
  const start = steps[0]?.timestamp ?? new Date().toISOString();
  const end = steps[steps.length - 1]?.timestamp ?? start;
  return [
    {
      id: uid("au"),
      timestamp: start,
      message: `${AGENT_LABELS[agent]} started investigation`,
      agent,
    },
    {
      id: uid("au"),
      timestamp: end,
      message: decisionLine,
      agent,
    },
  ];
}
