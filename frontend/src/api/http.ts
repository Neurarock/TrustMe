import type {
  AgentInfo,
  AuditEntry,
  CreateRequestInput,
  MoneyOutRequest,
  RalioExecution,
} from "@/types";
import type { PolicyConfig } from "@/lib/policy";
import { ApiError, type ParsePolicyInput, type TrustMeApi } from "./types";

/**
 * Live HTTP client. Talks to the backend REST API described in the brief. The
 * dev server proxies `/api` to the backend (see vite.config.ts).
 */
export class HttpApi implements TrustMeApi {
  readonly mode = "live" as const;

  constructor(private baseUrl = "/api") {}

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}${path}`, {
        headers: { "Content-Type": "application/json", ...init?.headers },
        ...init,
      });
    } catch (cause) {
      throw new ApiError(
        "Could not reach the TrustMe backend. Check the server or switch to mock mode.",
      );
    }
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new ApiError(body || `Request failed with status ${res.status}`, res.status);
    }
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }

  listRequests() {
    return this.request<MoneyOutRequest[]>("/requests");
  }
  getRequest(id: string) {
    return this.request<MoneyOutRequest>(`/requests/${id}`);
  }
  createRequest(input: CreateRequestInput) {
    return this.request<MoneyOutRequest>("/requests", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }
  investigate(id: string) {
    return this.request<MoneyOutRequest>(`/requests/${id}/investigate`, { method: "POST" });
  }
  approve(id: string) {
    return this.request<MoneyOutRequest>(`/requests/${id}/approve`, { method: "POST" });
  }
  reject(id: string) {
    return this.request<MoneyOutRequest>(`/requests/${id}/reject`, { method: "POST" });
  }
  execute(id: string) {
    return this.request<MoneyOutRequest>(`/requests/${id}/execute`, { method: "POST" });
  }
  refreshRalioStatus(id: string) {
    return this.request<RalioExecution>(`/requests/${id}/ralio-status`);
  }
  getAudit(id: string) {
    return this.request<AuditEntry[]>(`/requests/${id}/audit`);
  }
  listAgents() {
    return this.request<AgentInfo[]>("/agents");
  }
  parsePolicy(input: ParsePolicyInput) {
    return this.request<PolicyConfig>("/policy/parse", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }
}
