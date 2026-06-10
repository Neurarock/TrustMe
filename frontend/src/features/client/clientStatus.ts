import type { MoneyOutRequest } from "@/types";

export type ClientTone = "blue" | "amber" | "green" | "red" | "grey";

export interface ClientStatus {
  label: string;
  tone: ClientTone;
  description: string;
  /** True when the outcome is final (paid / declined / blocked). */
  settled: boolean;
}

/** Translate the internal decision + Ralio status into friendly client copy. */
export function clientStatus(request: MoneyOutRequest): ClientStatus {
  if (request.ralioStatus === "paid" || request.decision === "paid") {
    return {
      label: "Paid",
      tone: "green",
      description: "All done — the money has been sent. 🎉",
      settled: true,
    };
  }
  switch (request.decision) {
    case "approved":
      return {
        label: "Approved",
        tone: "green",
        description: "Approved by the finance team. Payment is being arranged.",
        settled: false,
      };
    case "needs_approval":
      return {
        label: "Awaiting approval",
        tone: "amber",
        description: "Looks good so far — a finance team member needs to give the final yes.",
        settled: false,
      };
    case "blocked":
      return {
        label: "Couldn't process",
        tone: "red",
        description:
          request.risk.duplicateDetected
            ? "This appears to duplicate a payment that was already made."
            : "This was stopped by our safety checks before any money moved.",
        settled: true,
      };
    case "rejected":
      return {
        label: "Declined",
        tone: "red",
        description: "The finance team wasn't able to approve this request.",
        settled: true,
      };
    case "investigating":
      return {
        label: "Under review",
        tone: "blue",
        description: "Our agents are checking the details right now.",
        settled: false,
      };
    case "draft":
    default:
      return {
        label: "Submitted",
        tone: "grey",
        description: "Received! Our agents will review this shortly.",
        settled: false,
      };
  }
}
