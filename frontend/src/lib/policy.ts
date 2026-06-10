import type { Currency, MoneyOutRequestType } from "@/types";

/**
 * The machine-readable policy the agents enforce. This is the JSON shape the
 * "Set Policy" screen produces from free-text / PDF policy documents.
 */
export interface PolicyConfig {
  /** Per-type auto-approval ceilings (in `currency`). At or under = auto-approve. */
  autoApprovalThresholds: Record<MoneyOutRequestType, number>;
  /** Expense categories employees are allowed to claim. Empty = no restriction. */
  allowedCategories: string[];
  /** Block payments that duplicate an existing request (same ref or payee+amount). */
  blockDuplicates: boolean;
  /** Require a receipt/attachment for reimbursements at or above this amount. */
  receiptRequiredOver: number;
  currency: Currency;
  notes?: string;
  updatedAt: string;
}

export const DEFAULT_POLICY: PolicyConfig = {
  autoApprovalThresholds: {
    employee_reimbursement: 50,
    supplier_invoice: 250,
    customer_refund: 500,
    partner_commission: 200,
  },
  allowedCategories: [
    "client_meal",
    "travel",
    "software",
    "office_supplies",
    "design_services",
  ],
  blockDuplicates: true,
  receiptRequiredOver: 25,
  currency: "GBP",
  updatedAt: new Date(0).toISOString(),
};

export function thresholdFor(policy: PolicyConfig, type: MoneyOutRequestType): number {
  return policy.autoApprovalThresholds[type];
}
