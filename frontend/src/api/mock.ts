import type {
  AgentInfo,
  AuditEntry,
  CreateRequestInput,
  MoneyOutRequest,
  RalioExecution,
} from "@/types";
import { AGENTS, createSeedRequests } from "@/data/seed";
import { DEFAULT_AGENT_FOR_TYPE } from "@/lib/labels";
import { getActivePolicy } from "@/store/policy";
import { parsePolicyText } from "@/lib/parsePolicy";
import type { PolicyConfig } from "@/lib/policy";
import { ApiError, type ParsePolicyInput, type TrustMeApi } from "./types";
import { runInvestigation } from "./investigation";

let mockCounter = 0;
const id = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${mockCounter++}`;

/**
 * In-memory implementation of the TrustMe API. Holds seed data, mutates it in
 * place, and simulates latency so loading states are exercised. Safe for demos:
 * blocked requests never produce a Ralio payment.
 */
export class MockApi implements TrustMeApi {
  readonly mode = "mock" as const;
  private requests: MoneyOutRequest[];

  constructor(private latencyMs = 350) {
    this.requests = createSeedRequests();
  }

  private async delay() {
    if (this.latencyMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.latencyMs));
    }
  }

  private find(reqId: string): MoneyOutRequest {
    const req = this.requests.find((r) => r.id === reqId);
    if (!req) throw new ApiError(`Request ${reqId} not found`, 404);
    return req;
  }

  private append(req: MoneyOutRequest, message: string, agent?: MoneyOutRequest["assignedAgent"]) {
    req.audit.push({ id: id("au"), timestamp: new Date().toISOString(), message, agent });
  }

  async listRequests(): Promise<MoneyOutRequest[]> {
    await this.delay();
    // Newest first.
    return structuredClone(
      [...this.requests].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    );
  }

  async getRequest(reqId: string): Promise<MoneyOutRequest> {
    await this.delay();
    return structuredClone(this.find(reqId));
  }

  async createRequest(input: CreateRequestInput): Promise<MoneyOutRequest> {
    await this.delay();
    const now = new Date().toISOString();
    const req: MoneyOutRequest = {
      id: id("req"),
      title: input.title,
      type: input.type,
      source: input.source ?? "host",
      requesterName: input.requesterName,
      payee: input.payee,
      amount: input.amount,
      currency: input.currency,
      description: input.description,
      reference: input.reference,
      counterpartyRef: input.counterpartyRef,
      attachmentName: input.attachmentName,
      assignedAgent: DEFAULT_AGENT_FOR_TYPE[input.type],
      riskLevel: "low",
      decision: "draft",
      ralioStatus: "not_sent",
      ralioReady: false,
      createdAt: now,
      steps: [],
      policyChecks: [],
      risk: {
        level: "low",
        score: 0,
        duplicateDetected: false,
        recipientMismatch: false,
        approvalRequired: false,
        paymentRetryRisk: false,
      },
      decisionDetail: {
        decision: "draft",
        confidence: 0,
        reason: "Not yet investigated.",
      },
      ralio: {
        mode: "mock",
        status: "not_sent",
        amount: input.amount,
        currency: input.currency,
        payee: input.payee,
      },
      audit: [
        { id: id("au"), timestamp: now, message: "Request created" },
        {
          id: id("au"),
          timestamp: now,
          message: `Orchestrator classified request as ${input.type}`,
          agent: "orchestrator",
        },
      ],
    };
    this.requests.push(req);
    return structuredClone(req);
  }

  async investigate(reqId: string): Promise<MoneyOutRequest> {
    await this.delay();
    const req = this.find(reqId);
    const others = this.requests.filter((r) => r.id !== req.id);
    const result = runInvestigation(req, { others, policy: getActivePolicy() });

    req.steps = result.steps;
    req.policyChecks = result.policyChecks;
    req.risk = result.risk;
    req.riskLevel = result.riskLevel;
    req.decisionDetail = result.decisionDetail;
    req.decision = result.decision;
    req.ralioReady = result.ralioReady;
    req.audit.push(...result.audit);

    if (result.decision === "blocked") {
      req.ralio.blockedReason = result.risk.notes ?? "Blocked by risk checks.";
    }
    return structuredClone(req);
  }

  async approve(reqId: string): Promise<MoneyOutRequest> {
    await this.delay();
    const req = this.find(reqId);
    if (req.decision === "blocked") {
      throw new ApiError("Blocked requests cannot be approved.", 409);
    }
    req.decision = "approved";
    req.decisionDetail = {
      ...req.decisionDetail,
      decision: "approved",
      reason: req.decisionDetail.reason || "Manually approved by operator.",
    };
    req.ralioReady = true;
    this.append(req, "Manually approved by operator", "orchestrator");
    return structuredClone(req);
  }

  async reject(reqId: string): Promise<MoneyOutRequest> {
    await this.delay();
    const req = this.find(reqId);
    req.decision = "rejected";
    req.decisionDetail = { ...req.decisionDetail, decision: "rejected" };
    req.ralioReady = false;
    req.ralio.status = "not_sent";
    req.ralio.blockedReason = "Rejected by operator.";
    this.append(req, "Rejected by operator", "orchestrator");
    return structuredClone(req);
  }

  async execute(reqId: string): Promise<MoneyOutRequest> {
    await this.delay();
    const req = this.find(reqId);

    // Safety: a request must be Ralio-ready and never blocked/rejected.
    if (!req.ralioReady || req.decision === "blocked" || req.decision === "rejected") {
      throw new ApiError("Request is not ready for Ralio execution.", 409);
    }

    const now = new Date().toISOString();
    req.ralio.reference = req.ralio.reference ?? id("ralio_pay").replace(/_/g, "_");
    req.ralio.status = "paid";
    req.ralio.createdAt = req.ralio.createdAt ?? now;
    req.ralio.updatedAt = now;
    req.ralioStatus = "paid";
    req.decision = "paid";
    req.decisionDetail = { ...req.decisionDetail, decision: "paid" };

    req.steps.push({
      id: id("st"),
      index: req.steps.length + 1,
      kind: "payment",
      agent: "ralio_payment_agent",
      title: `Ralio payment created and settled. Reference ${req.ralio.reference}.`,
      timestamp: now,
    });
    this.append(req, `Ralio payment created (${req.ralio.reference})`, "ralio_payment_agent");
    this.append(req, "Ralio status: paid", "ralio_payment_agent");
    return structuredClone(req);
  }

  async refreshRalioStatus(reqId: string): Promise<RalioExecution> {
    await this.delay();
    const req = this.find(reqId);
    req.ralio.updatedAt = new Date().toISOString();
    return structuredClone(req.ralio);
  }

  async getAudit(reqId: string): Promise<AuditEntry[]> {
    await this.delay();
    return structuredClone(this.find(reqId).audit);
  }

  async listAgents(): Promise<AgentInfo[]> {
    await this.delay();
    return structuredClone(AGENTS);
  }

  async parsePolicy(input: ParsePolicyInput): Promise<PolicyConfig> {
    // Simulate the AI taking a beat to read the document.
    await new Promise((resolve) => setTimeout(resolve, Math.max(this.latencyMs, 600)));
    const source = [input.text, input.fileName ? `\nSource: ${input.fileName}` : ""]
      .filter(Boolean)
      .join("");
    if (!source.trim()) {
      throw new ApiError("Paste some policy text or upload a document first.", 400);
    }
    return parsePolicyText(source);
  }
}
