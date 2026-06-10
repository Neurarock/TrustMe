import type {
  AgentType,
  MoneyOutRequestType,
  RalioStatus,
  RequestDecision,
  RiskLevel,
} from "@/types";

export const AGENT_LABELS: Record<AgentType, string> = {
  orchestrator: "Orchestrator Agent",
  reimbursement_agent: "Reimbursement Agent",
  supplier_invoice_agent: "Supplier Invoice Agent",
  customer_refund_agent: "Customer Refund Agent",
  partner_commission_agent: "Partner Commission Agent",
  risk_duplicate_agent: "Risk & Duplicate Agent",
  ralio_payment_agent: "Ralio Payment Agent",
};

export const REQUEST_TYPE_LABELS: Record<MoneyOutRequestType, string> = {
  employee_reimbursement: "Employee reimbursement",
  supplier_invoice: "Supplier invoice",
  customer_refund: "Customer refund",
  partner_commission: "Partner commission",
};

export const DECISION_LABELS: Record<RequestDecision, string> = {
  draft: "Draft",
  investigating: "Investigating",
  approved: "Approved",
  needs_approval: "Needs approval",
  blocked: "Blocked",
  rejected: "Rejected",
  paid: "Paid",
};

export const RALIO_STATUS_LABELS: Record<RalioStatus, string> = {
  not_sent: "Not sent",
  pending: "Pending",
  requires_approval: "Requires approval",
  processing: "Processing",
  paid: "Paid",
  failed: "Failed",
};

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

/**
 * Which specialist agent the orchestrator routes a given request type to.
 * Risk routing (duplicate detection) is layered on top by the backend.
 */
export const DEFAULT_AGENT_FOR_TYPE: Record<MoneyOutRequestType, AgentType> = {
  employee_reimbursement: "reimbursement_agent",
  supplier_invoice: "supplier_invoice_agent",
  customer_refund: "customer_refund_agent",
  partner_commission: "partner_commission_agent",
};
