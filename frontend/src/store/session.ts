import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "client" | "host";

export interface SessionUser {
  role: Role;
  /** Display name shown in the UI and attached to requests a client submits. */
  name: string;
}

interface SessionState {
  user: SessionUser | null;
  signIn: (user: SessionUser) => void;
  signOut: () => void;
}

/** Mock auth: a chosen role + name, persisted to localStorage. No real login. */
export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      signIn: (user) => set({ user }),
      signOut: () => set({ user: null }),
    }),
    { name: "trustme-session" },
  ),
);
