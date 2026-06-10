import type { MoneyOutRequest } from "@/types";
import { AGENT_LABELS, REQUEST_TYPE_LABELS } from "@/lib/labels";

export type InboxFilter =
  | "all"
  | "approved"
  | "paid"
  | "needs_approval"
  | "blocked"
  | "employee_reimbursement"
  | "supplier_invoice"
  | "customer_refund"
  | "partner_commission";

export const INBOX_FILTERS: { id: InboxFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "approved", label: "Approved" },
  { id: "paid", label: "Paid" },
  { id: "needs_approval", label: "Needs approval" },
  { id: "blocked", label: "Blocked" },
  { id: "employee_reimbursement", label: "Reimbursements" },
  { id: "supplier_invoice", label: "Supplier invoices" },
  { id: "customer_refund", label: "Customer refunds" },
  { id: "partner_commission", label: "Partner commissions" },
];

function matchesFilter(req: MoneyOutRequest, filter: InboxFilter): boolean {
  switch (filter) {
    case "all":
      return true;
    case "approved":
      return req.decision === "approved";
    case "paid":
      return req.ralioStatus === "paid" || req.decision === "paid";
    case "needs_approval":
      return req.decision === "needs_approval";
    case "blocked":
      return req.decision === "blocked";
    default:
      // Remaining filters are request types.
      return req.type === filter;
  }
}

/** Free-text search across title, payee, amount, type label and agent label. */
function matchesSearch(req: MoneyOutRequest, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    req.title,
    req.payee,
    req.reference ?? "",
    String(req.amount),
    req.amount.toFixed(2),
    REQUEST_TYPE_LABELS[req.type],
    AGENT_LABELS[req.assignedAgent],
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

export function filterRequests(
  requests: MoneyOutRequest[],
  filter: InboxFilter,
  query: string,
): MoneyOutRequest[] {
  return requests
    .filter((r) => matchesFilter(r, filter) && matchesSearch(r, query))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
