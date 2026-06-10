import type { CreateRequestInput } from "@/types";

export interface DemoPreset {
  id: string;
  label: string;
  input: CreateRequestInput;
}

/**
 * One-click demo presets so cases can be created quickly and reliably during a
 * live hackathon demo.
 */
export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: "sarah",
    label: "Sarah lunch reimbursement",
    input: {
      title: "Reimburse Sarah for client lunch",
      type: "employee_reimbursement",
      payee: "Sarah Jones",
      amount: 38.4,
      currency: "GBP",
      description: "Client lunch at Pret with the Acme account team.",
      reference: "receipt_103",
      counterpartyRef: "employee_sarah",
      attachmentName: "pret-receipt.pdf",
    },
  },
  {
    id: "northstar",
    label: "Northstar supplier invoice",
    input: {
      title: "Pay Northstar Design invoice INV-2043",
      type: "supplier_invoice",
      payee: "Northstar Design",
      amount: 420,
      currency: "GBP",
      description: "Brand refresh — landing page and design system update.",
      reference: "INV-2043",
      counterpartyRef: "supplier_northstar",
    },
  },
  {
    id: "brightpath",
    label: "BrightPath customer refund",
    input: {
      title: "Refund BrightPath for overbilling",
      type: "customer_refund",
      payee: "BrightPath Ltd",
      amount: 260,
      currency: "GBP",
      description: "Overbilled on the retainer — two extra seats charged in error.",
      reference: "INV-1181",
      counterpartyRef: "customer_brightpath",
    },
  },
  {
    id: "duplicate",
    label: "Duplicate reimbursement",
    input: {
      title: "Duplicate Sarah lunch claim",
      type: "employee_reimbursement",
      payee: "Sarah Jones",
      amount: 38.4,
      currency: "GBP",
      description: "Client lunch at Pret — receipt_102 (already claimed).",
      reference: "receipt_102",
      counterpartyRef: "employee_sarah",
    },
  },
];
