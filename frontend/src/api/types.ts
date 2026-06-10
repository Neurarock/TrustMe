import type {
  AgentInfo,
  AuditEntry,
  CreateRequestInput,
  MoneyOutRequest,
  RalioExecution,
} from "@/types";
import type { PolicyConfig } from "@/lib/policy";

/** Input for the AI policy parser: free text and/or an uploaded document. */
export interface ParsePolicyInput {
  text?: string;
  fileName?: string;
}

/**
 * The contract every API client (mock or live HTTP) implements. The rest of the
 * app talks only to this interface, so swapping VITE_API_MODE changes nothing
 * about the UI.
 */
export interface TrustMeApi {
  readonly mode: "mock" | "live";
  listRequests(): Promise<MoneyOutRequest[]>;
  getRequest(id: string): Promise<MoneyOutRequest>;
  createRequest(input: CreateRequestInput): Promise<MoneyOutRequest>;
  investigate(id: string): Promise<MoneyOutRequest>;
  approve(id: string): Promise<MoneyOutRequest>;
  reject(id: string): Promise<MoneyOutRequest>;
  execute(id: string): Promise<MoneyOutRequest>;
  refreshRalioStatus(id: string): Promise<RalioExecution>;
  getAudit(id: string): Promise<AuditEntry[]>;
  listAgents(): Promise<AgentInfo[]>;
  /** Turn a free-text / PDF policy into the structured PolicyConfig (AI). */
  parsePolicy(input: ParsePolicyInput): Promise<PolicyConfig>;
}

/** Thrown by clients so the UI can show friendly, typed error states. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
