import type { MoneyOutRequest } from "@/types";

export interface DashboardMetrics {
  total: number;
  approvedToday: number;
  paid: number;
  needsApproval: number;
  blockedDuplicates: number;
  totalProcessed: number;
}

/**
 * Derive the headline dashboard metrics from the request list. "Processed"
 * means money actually moved (paid via Ralio).
 */
export function computeMetrics(requests: MoneyOutRequest[]): DashboardMetrics {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  let approvedToday = 0;
  let paid = 0;
  let needsApproval = 0;
  let blockedDuplicates = 0;
  let totalProcessed = 0;

  for (const r of requests) {
    if (r.decision === "approved" || r.decision === "paid") {
      if (new Date(r.createdAt).getTime() >= startOfToday.getTime()) approvedToday++;
    }
    if (r.ralioStatus === "paid") {
      paid++;
      totalProcessed += r.amount;
    }
    if (r.decision === "needs_approval") needsApproval++;
    if (r.decision === "blocked" && r.risk.duplicateDetected) blockedDuplicates++;
  }

  return {
    total: requests.length,
    approvedToday,
    paid,
    needsApproval,
    blockedDuplicates,
    totalProcessed,
  };
}
