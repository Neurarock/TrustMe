import { describe, expect, it } from "vitest";
import { DEFAULT_POLICY } from "./policy";
import { parsePolicyText } from "./parsePolicy";

describe("parsePolicyText", () => {
  it("extracts per-type auto-approval thresholds from prose", () => {
    const policy = parsePolicyText(`
      Employee reimbursements under £40 are auto-approved.
      Supplier invoices over £300 need finance approval.
      Customer refunds up to £600 can be issued automatically.
      Partner commissions above £150 require sign-off.
    `);
    expect(policy.autoApprovalThresholds.employee_reimbursement).toBe(40);
    expect(policy.autoApprovalThresholds.supplier_invoice).toBe(300);
    expect(policy.autoApprovalThresholds.customer_refund).toBe(600);
    expect(policy.autoApprovalThresholds.partner_commission).toBe(150);
  });

  it("handles thousands separators", () => {
    const policy = parsePolicyText("Supplier invoices up to £1,000 are fine.");
    expect(policy.autoApprovalThresholds.supplier_invoice).toBe(1000);
  });

  it("blocks duplicates by default and respects an explicit allowance", () => {
    expect(parsePolicyText("Always block duplicate receipts.").blockDuplicates).toBe(true);
    expect(parsePolicyText("We allow duplicate submissions.").blockDuplicates).toBe(false);
  });

  it("parses allowed categories", () => {
    const policy = parsePolicyText("Allowed categories: travel, software, client meal.");
    expect(policy.allowedCategories).toContain("travel");
    expect(policy.allowedCategories).toContain("software");
  });

  it("falls back to defaults for types it can't find", () => {
    const policy = parsePolicyText("Reimbursements capped at £25.");
    expect(policy.autoApprovalThresholds.employee_reimbursement).toBe(25);
    expect(policy.autoApprovalThresholds.customer_refund).toBe(
      DEFAULT_POLICY.autoApprovalThresholds.customer_refund,
    );
  });
});
