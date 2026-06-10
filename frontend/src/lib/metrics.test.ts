import { describe, expect, it } from "vitest";
import { createSeedRequests } from "@/data/seed";
import { computeMetrics } from "./metrics";

describe("computeMetrics", () => {
  it("derives headline metrics from the seed cases", () => {
    const m = computeMetrics(createSeedRequests());
    expect(m.total).toBe(4);
    // BrightPath is paid via Ralio.
    expect(m.paid).toBe(1);
    expect(m.totalProcessed).toBeCloseTo(260);
    // Northstar needs approval.
    expect(m.needsApproval).toBe(1);
    // The duplicate is a blocked duplicate.
    expect(m.blockedDuplicates).toBe(1);
  });

  it("returns zeroed metrics for an empty inbox", () => {
    const m = computeMetrics([]);
    expect(m).toEqual({
      total: 0,
      approvedToday: 0,
      paid: 0,
      needsApproval: 0,
      blockedDuplicates: 0,
      totalProcessed: 0,
    });
  });
});
