import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { createSeedRequests } from "@/data/seed";
import { renderWithProviders } from "@/test/utils";
import { RequestTable } from "./RequestTable";

describe("RequestTable", () => {
  it("renders a row per request with title, amount and decision", () => {
    const requests = createSeedRequests();
    renderWithProviders(<RequestTable requests={requests} />);

    expect(screen.getByText("Pay Northstar Design invoice INV-2042")).toBeInTheDocument();
    expect(screen.getByText("Refund BrightPath for overbilling")).toBeInTheDocument();
    // Northstar amount + its "Needs approval" decision badge.
    expect(screen.getByText("£420.00")).toBeInTheDocument();
    expect(screen.getByText("Needs approval")).toBeInTheDocument();
    // The blocked duplicate is shown as Blocked.
    expect(screen.getByText("Blocked")).toBeInTheDocument();
  });
});
