import { HttpApi } from "./http";
import { MockApi } from "./mock";
import type { TrustMeApi } from "./types";

export type ApiMode = "mock" | "live";

export function resolveApiMode(): ApiMode {
  return import.meta.env.VITE_API_MODE === "live" ? "live" : "mock";
}

/** The singleton API client selected by VITE_API_MODE (defaults to mock). */
export const api: TrustMeApi =
  resolveApiMode() === "live" ? new HttpApi() : new MockApi();

export { MockApi, HttpApi };
export * from "./types";
