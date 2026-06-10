import { beforeEach, describe, expect, it } from "vitest";
import { MockApi } from "./mock";
import { ApiError } from "./types";
import { usePolicyStore } from "@/store/policy";
import { DEFAULT_POLICY } from "@/lib/policy";

// Zero-latency client for fast, deterministic tests.
const makeApi = () => new MockApi(0);

// Investigations read the active policy; keep it at the default per test.
beforeEach(() => {
  usePolicyStore.setState({ config: DEFAULT_POLICY });
});

describe("MockApi", () => {
  it("seeds the four demo cases", async () => {
    const api = makeApi();
    const requests = await api.listRequests();
    expect(requests).toHaveLength(4);
    const ids = requests.map((r) => r.id);
    expect(ids).toContain("req_sarah");
    expect(ids).toContain("req_northstar");
    expect(ids).toContain("req_brightpath");
    expect(ids).toContain("req_duplicate");
  });

  it("starts Sarah's reimbursement as an un-investigated draft", async () => {
    const api = makeApi();
    const sarah = await api.getRequest("req_sarah");
    expect(sarah.decision).toBe("draft");
    expect(sarah.steps).toHaveLength(0);
    expect(sarah.ralioReady).toBe(false);
  });

  it("investigating Sarah produces a ReAct trail and approves it", async () => {
    const api = makeApi();
    const result = await api.investigate("req_sarah");
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.decision).toBe("approved");
    expect(result.ralioReady).toBe(true);
    // Last reasoning step is the approval decision.
    expect(result.steps.at(-1)?.kind).toBe("decision");
    expect(result.policyChecks.every((c) => c.status !== "fail")).toBe(true);
  });

  it("executes an approved request through Ralio and marks it paid", async () => {
    const api = makeApi();
    await api.investigate("req_sarah");
    const paid = await api.execute("req_sarah");
    expect(paid.ralioStatus).toBe("paid");
    expect(paid.decision).toBe("paid");
    expect(paid.ralio.reference).toBeTruthy();
    expect(paid.audit.some((a) => a.message.includes("Ralio status: paid"))).toBe(true);
    expect(paid.steps.at(-1)?.kind).toBe("payment");
  });

  it("never lets a blocked duplicate reach Ralio", async () => {
    const api = makeApi();
    const dup = await api.getRequest("req_duplicate");
    expect(dup.decision).toBe("blocked");
    expect(dup.ralioStatus).toBe("not_sent");
    expect(dup.risk.duplicateDetected).toBe(true);

    await expect(api.execute("req_duplicate")).rejects.toBeInstanceOf(ApiError);
    await expect(api.approve("req_duplicate")).rejects.toBeInstanceOf(ApiError);

    const after = await api.getRequest("req_duplicate");
    expect(after.ralioStatus).toBe("not_sent");
  });

  it("requires approval for amounts over the auto-approval threshold", async () => {
    const api = makeApi();
    const created = await api.createRequest({
      title: "Pay BigCo invoice",
      type: "supplier_invoice",
      payee: "BigCo",
      amount: 999,
      currency: "GBP",
    });
    const investigated = await api.investigate(created.id);
    expect(investigated.decision).toBe("needs_approval");
    expect(investigated.ralioReady).toBe(false);
    await expect(api.execute(created.id)).rejects.toBeInstanceOf(ApiError);
  });

  it("auto-approves small amounts and allows manual approval to unlock Ralio", async () => {
    const api = makeApi();
    const created = await api.createRequest({
      title: "Reimburse taxi",
      type: "employee_reimbursement",
      payee: "Dev Patel",
      amount: 18.5,
      currency: "GBP",
    });
    const investigated = await api.investigate(created.id);
    expect(investigated.decision).toBe("approved");
    expect(investigated.ralioReady).toBe(true);

    const paid = await api.execute(created.id);
    expect(paid.ralioStatus).toBe("paid");
  });

  it("blocks a newly created duplicate of an already-paid request (the bug fix)", async () => {
    const api = makeApi();

    // Original: small reimbursement with a unique receipt -> approved and paid.
    const original = await api.createRequest({
      title: "Reimburse Mia for taxi",
      type: "employee_reimbursement",
      payee: "Mia Chen",
      amount: 22,
      currency: "GBP",
      reference: "receipt_900",
    });
    await api.investigate(original.id);
    const paid = await api.execute(original.id);
    expect(paid.ralioStatus).toBe("paid");

    // Duplicate: same receipt reference, submitted later.
    const dup = await api.createRequest({
      title: "Reimburse Mia for taxi (again)",
      type: "employee_reimbursement",
      payee: "Mia Chen",
      amount: 22,
      currency: "GBP",
      reference: "receipt_900",
    });
    const investigated = await api.investigate(dup.id);

    expect(investigated.decision).toBe("blocked");
    expect(investigated.ralioReady).toBe(false);
    expect(investigated.risk.duplicateDetected).toBe(true);
    await expect(api.execute(dup.id)).rejects.toBeInstanceOf(ApiError);
  });

  it("does not block duplicates when policy disables it", async () => {
    const api = makeApi();
    usePolicyStore.setState({ config: { ...DEFAULT_POLICY, blockDuplicates: false } });

    const a = await api.createRequest({
      title: "Refund A",
      type: "customer_refund",
      payee: "Acme",
      amount: 30,
      currency: "GBP",
      reference: "INV-777",
    });
    await api.investigate(a.id);
    const b = await api.createRequest({
      title: "Refund A again",
      type: "customer_refund",
      payee: "Acme",
      amount: 30,
      currency: "GBP",
      reference: "INV-777",
    });
    const investigated = await api.investigate(b.id);
    expect(investigated.decision).not.toBe("blocked");
  });

  it("respects an updated policy threshold from the Set Policy screen", async () => {
    const api = makeApi();
    usePolicyStore.setState({
      config: {
        ...DEFAULT_POLICY,
        autoApprovalThresholds: { ...DEFAULT_POLICY.autoApprovalThresholds, employee_reimbursement: 10 },
      },
    });
    const created = await api.createRequest({
      title: "Reimburse coffee",
      type: "employee_reimbursement",
      payee: "Sam",
      amount: 18,
      currency: "GBP",
    });
    const investigated = await api.investigate(created.id);
    // £18 now exceeds the lowered £10 threshold.
    expect(investigated.decision).toBe("needs_approval");
  });

  it("parses a free-text policy into structured JSON", async () => {
    const api = makeApi();
    const policy = await api.parsePolicy({
      text: "Supplier invoices over £400 need approval. Block duplicates.",
    });
    expect(policy.autoApprovalThresholds.supplier_invoice).toBe(400);
    expect(policy.blockDuplicates).toBe(true);
  });

  it("throws a 404 ApiError for unknown requests", async () => {
    const api = makeApi();
    await expect(api.getRequest("nope")).rejects.toMatchObject({ status: 404 });
  });
});
