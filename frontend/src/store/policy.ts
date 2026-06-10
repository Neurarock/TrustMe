import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_POLICY, type PolicyConfig } from "@/lib/policy";

interface PolicyState {
  config: PolicyConfig;
  setConfig: (config: PolicyConfig) => void;
  reset: () => void;
}

/** The active money-out policy the agents enforce. Persisted across reloads. */
export const usePolicyStore = create<PolicyState>()(
  persist(
    (set) => ({
      config: DEFAULT_POLICY,
      setConfig: (config) => set({ config }),
      reset: () => set({ config: DEFAULT_POLICY }),
    }),
    { name: "trustme-policy" },
  ),
);

/** Read the active policy outside of React (e.g. in the mock API). */
export const getActivePolicy = (): PolicyConfig => usePolicyStore.getState().config;
