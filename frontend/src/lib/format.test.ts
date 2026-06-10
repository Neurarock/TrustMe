import { describe, expect, it } from "vitest";
import { formatMoney, formatRelative } from "./format";

describe("formatMoney", () => {
  it("formats GBP with the pound symbol and two decimals", () => {
    expect(formatMoney(38.4, "GBP")).toBe("£38.40");
    expect(formatMoney(420, "GBP")).toBe("£420.00");
  });

  it("formats USD and EUR", () => {
    expect(formatMoney(260, "USD")).toBe("$260.00");
    expect(formatMoney(100, "EUR")).toContain("100.00");
  });
});

describe("formatRelative", () => {
  const now = new Date("2026-06-10T12:00:00Z").getTime();

  it("reports recent times as 'just now'", () => {
    expect(formatRelative(new Date(now - 5_000).toISOString(), now)).toBe("just now");
  });

  it("reports minutes and hours ago", () => {
    expect(formatRelative(new Date(now - 5 * 60_000).toISOString(), now)).toContain("minute");
    expect(formatRelative(new Date(now - 3 * 3_600_000).toISOString(), now)).toContain("hour");
  });
});
