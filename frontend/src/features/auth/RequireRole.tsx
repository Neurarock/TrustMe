import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSession, type Role } from "@/store/session";

/** Gate a route tree behind a chosen role. Redirects to login or the other home. */
export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const user = useSession((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    return <Navigate to={user.role === "host" ? "/host" : "/"} replace />;
  }
  return <>{children}</>;
}
