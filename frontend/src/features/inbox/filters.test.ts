import { describe, expect, it } from "vitest";
import { createSeedRequests } from "@/data/seed";
import { filterRequests } from "./filters";

const seed = createSeedRequests();

describe("filterRequests", () => {
  it("returns everything for the 'all' filter and empty query", () => {
    expect(filterRequests(seed, "all", "")).toHaveLength(seed.length);
  });

  it("filters by decision and Ralio status", () => {
    const paid = filterRequests(seed, "paid", "");
    expect(paid.every((r) => r.ralioStatus === "paid" || r.decision === "paid")).toBe(true);

    const needs = filterRequests(seed, "needs_approval", "");
    expect(needs.every((r) => r.decision === "needs_approval")).toBe(true);

    const blocked = filterRequests(seed, "blocked", "");
    expect(blocked.every((r) => r.decision === "blocked")).toBe(true);
  });

  it("filters by request type", () => {
    const refunds = filterRequests(seed, "customer_refund", "");
    expect(refunds.every((r) => r.type === "customer_refund")).toBe(true);
    expect(refunds.length).toBeGreaterThan(0);
  });

  it("searches across title, payee and amount", () => {
    expect(filterRequests(seed, "all", "northstar")).toHaveLength(1);
    expect(filterRequests(seed, "all", "Sarah").length).toBeGreaterThanOrEqual(1);
    expect(filterRequests(seed, "all", "38.40").length).toBeGreaterThanOrEqual(1);
    expect(filterRequests(seed, "all", "no-such-payee")).toHaveLength(0);
  });

  it("sorts newest first", () => {
    const result = filterRequests(seed, "all", "");
    for (let i = 1; i < result.length; i++) {
      expect(new Date(result[i - 1].createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(result[i].createdAt).getTime(),
      );
    }
  });
});
