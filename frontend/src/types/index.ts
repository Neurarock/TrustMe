// Core domain types for the TrustMe Money-Out Command Centre.
// These mirror the backend contract described in the frontend brief and are the
// single source of truth shared by both the mock and live API clients.

export type MoneyOutRequestType =
  | "employee_reimbursement"
  | "supplier_invoice"
  | "customer_refund"
  | "partner_commission";

export type RequestDecision =
  | "draft"
  | "investigating"
  | "approved"
  | "needs_approval"
  | "blocked"
  | "rejected"
  | "paid";

export type RalioStatus =
  | "not_sent"
  | "pending"
  | "requires_approval"
  | "processing"
  | "paid"
  | "failed";

export type AgentType =
  | "orchestrator"
  | "reimbursement_agent"
  | "supplier_invoice_agent"
  | "customer_refund_agent"
  | "partner_commission_agent"
  | "risk_duplicate_agent"
  | "ralio_payment_agent";

export type RiskLevel = "low" | "medium" | "high";

export type Currency = "GBP" | "USD" | "EUR";

/** A single step in an agent's ReAct reasoning loop. */
export type ReActStepKind =
  | "thought"
  | "tool_call"
  | "observation"
  | "policy"
  | "risk"
  | "decision"
  | "payment";

export interface ReActStep {
  id: string;
  index: number;
  kind: ReActStepKind;
  agent: AgentType;
  title: string;
  detail?: string;
  /** Rendered tool invocation, e.g. `lookup_employee("Sarah Jones")`. */
  tool?: string;
  timestamp: string;
}

export type PolicyCheckStatus = "pass" | "fail" | "warn";

export interface PolicyCheck {
  id: string;
  label: string;
  status: PolicyCheckStatus;
}

export interface RiskAssessment {
  level: RiskLevel;
  /** 0-100, higher is riskier. */
  score: number;
  duplicateDetected: boolean;
  existingPayment?: string;
  recipientMismatch: boolean;
  approvalRequired: boolean;
  paymentRetryRisk: boolean;
  notes?: string;
}

export interface DecisionDetail {
  decision: RequestDecision;
  /** 0-100. */
  confidence: number;
  reason: string;
}

export interface RalioExecution {
  mode: "mock" | "live";
  status: RalioStatus;
  reference?: string;
  amount: number;
  currency: Currency;
  payee: string;
  createdAt?: string;
  updatedAt?: string;
  /** Populated when a request never reaches Ralio (e.g. blocked duplicate). */
  blockedReason?: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  message: string;
  agent?: AgentType;
}

/** Which side of the app a request originated from. */
export type RequestSource = "client" | "host";

export interface MoneyOutRequest {
  id: string;
  title: string;
  type: MoneyOutRequestType;
  /** Where the request came from, and who submitted it (client portal). */
  source: RequestSource;
  requesterName?: string;
  payee: string;
  amount: number;
  currency: Currency;
  description?: string;
  reference?: string;
  /** Optional reference to an employee / supplier / customer / deal. */
  counterpartyRef?: string;
  attachmentName?: string;
  assignedAgent: AgentType;
  riskLevel: RiskLevel;
  decision: RequestDecision;
  ralioStatus: RalioStatus;
  /** Execute-with-Ralio is only offered when the backend marks this true. */
  ralioReady: boolean;
  createdAt: string;

  // Investigation detail. Empty until the request has been investigated.
  steps: ReActStep[];
  policyChecks: PolicyCheck[];
  risk: RiskAssessment;
  decisionDetail: DecisionDetail;
  ralio: RalioExecution;
  audit: AuditEntry[];
}

export interface CreateRequestInput {
  title: string;
  type: MoneyOutRequestType;
  payee: string;
  amount: number;
  currency: Currency;
  description?: string;
  reference?: string;
  counterpartyRef?: string;
  attachmentName?: string;
  source?: RequestSource;
  requesterName?: string;
}

export interface AgentInfo {
  type: AgentType;
  name: string;
  description: string;
  status: "online" | "offline";
  casesHandled: number;
  lastActivity: string;
}
