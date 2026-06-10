import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import type { CreateRequestInput, MoneyOutRequest } from "@/types";
import { api } from "./index";

export const queryKeys = {
  requests: ["requests"] as const,
  request: (id: string) => ["requests", id] as const,
  audit: (id: string) => ["requests", id, "audit"] as const,
  agents: ["agents"] as const,
};

export function useRequests() {
  return useQuery({
    queryKey: queryKeys.requests,
    queryFn: () => api.listRequests(),
  });
}

export function useRequest(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.request(id ?? "_"),
    queryFn: () => api.getRequest(id as string),
    enabled: Boolean(id),
  });
}

export function useAgents() {
  return useQuery({
    queryKey: queryKeys.agents,
    queryFn: () => api.listAgents(),
  });
}

export function useAudit(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.audit(id ?? "_"),
    queryFn: () => api.getAudit(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateRequest(): UseMutationResult<
  MoneyOutRequest,
  Error,
  CreateRequestInput
> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRequestInput) => api.createRequest(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.requests });
      void qc.invalidateQueries({ queryKey: queryKeys.agents });
    },
  });
}

/** Shared invalidation after any action that mutates a single request. */
function useRequestAction(
  fn: (id: string) => Promise<MoneyOutRequest>,
): UseMutationResult<MoneyOutRequest, Error, string> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.request(data.id), data);
      void qc.invalidateQueries({ queryKey: queryKeys.requests });
      void qc.invalidateQueries({ queryKey: queryKeys.audit(data.id) });
      void qc.invalidateQueries({ queryKey: queryKeys.agents });
    },
  });
}

export const useInvestigate = () => useRequestAction((id) => api.investigate(id));
export const useApprove = () => useRequestAction((id) => api.approve(id));
export const useReject = () => useRequestAction((id) => api.reject(id));
export const useExecute = () => useRequestAction((id) => api.execute(id));

export function useParsePolicy() {
  return useMutation({
    mutationFn: (input: { text?: string; fileName?: string }) => api.parsePolicy(input),
  });
}

export function useRefreshRalio(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.refreshRalioStatus(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.request(id) });
    },
  });
}
