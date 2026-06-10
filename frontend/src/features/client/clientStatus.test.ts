import { describe, expect, it } from "vitest";
import { createSeedRequests } from "@/data/seed";
import type { MoneyOutRequest } from "@/types";
import { clientStatus } from "./clientStatus";

const byId = (id: string): MoneyOutRequest =>
  createSeedRequests().find((r) => r.id === id)!;

describe("clientStatus", () => {
  it("shows a paid request as a celebratory, settled 'Paid'", () => {
    const s = clientStatus(byId("req_brightpath"));
    expect(s.label).toBe("Paid");
    expect(s.tone).toBe("green");
    expect(s.settled).toBe(true);
  });

  it("shows an over-threshold supplier invoice as awaiting approval", () => {
    const s = clientStatus(byId("req_northstar"));
    expect(s.label).toBe("Awaiting approval");
    expect(s.tone).toBe("amber");
    expect(s.settled).toBe(false);
  });

  it("explains a blocked duplicate without scary internals", () => {
    const s = clientStatus(byId("req_duplicate"));
    expect(s.tone).toBe("red");
    expect(s.settled).toBe(true);
    expect(s.description.toLowerCase()).toContain("duplicate");
  });

  it("shows a fresh draft as 'Submitted'", () => {
    const s = clientStatus(byId("req_sarah"));
    expect(s.label).toBe("Submitted");
    expect(s.settled).toBe(false);
  });
});
