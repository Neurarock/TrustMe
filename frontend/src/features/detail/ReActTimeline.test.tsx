import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReActStep } from "@/types";
import { ReActTimeline } from "./ReActTimeline";

const steps: ReActStep[] = [
  {
    id: "1",
    index: 1,
    kind: "thought",
    agent: "reimbursement_agent",
    title: "I need to verify the employee.",
    timestamp: new Date().toISOString(),
  },
  {
    id: "2",
    index: 2,
    kind: "tool_call",
    agent: "reimbursement_agent",
    title: "Looking up the employee.",
    tool: 'lookup_employee("Sarah Jones")',
    timestamp: new Date().toISOString(),
  },
  {
    id: "3",
    index: 3,
    kind: "decision",
    agent: "reimbursement_agent",
    title: "Approved.",
    timestamp: new Date().toISOString(),
  },
];

describe("ReActTimeline", () => {
  it("renders each reasoning step with its kind label", () => {
    render(<ReActTimeline steps={steps} />);
    expect(screen.getByText(/1\. Thought/)).toBeInTheDocument();
    expect(screen.getByText(/2\. Tool call/)).toBeInTheDocument();
    expect(screen.getByText(/3\. Decision/)).toBeInTheDocument();
  });

  it("renders tool-call invocations as code", () => {
    render(<ReActTimeline steps={steps} />);
    expect(screen.getByText('lookup_employee("Sarah Jones")')).toBeInTheDocument();
  });
});
