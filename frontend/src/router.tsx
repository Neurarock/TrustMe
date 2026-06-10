import { createBrowserRouter, Navigate } from "react-router-dom";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { HostLayout } from "@/components/layout/HostLayout";
import { RequireRole } from "@/features/auth/RequireRole";
import { LoginPage } from "@/features/auth/LoginPage";
import { ComposerPage } from "@/features/client/ComposerPage";
import { ClientRequestsPage } from "@/features/client/ClientRequestsPage";
import { ClientRequestPage } from "@/features/client/ClientRequestPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { InboxPage } from "@/features/inbox/InboxPage";
import { RequestDetailPage } from "@/features/detail/RequestDetailPage";
import { PolicyPage } from "@/features/policy/PolicyPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },

  // Client portal (light, friendly).
  {
    path: "/",
    element: (
      <RequireRole role="client">
        <ClientLayout />
      </RequireRole>
    ),
    children: [
      { index: true, element: <ComposerPage /> },
      { path: "requests", element: <ClientRequestsPage /> },
      { path: "requests/:id", element: <ClientRequestPage /> },
    ],
  },

  // Host / admin cockpit (dark).
  {
    path: "/host",
    element: (
      <RequireRole role="host">
        <HostLayout />
      </RequireRole>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "inbox", element: <InboxPage /> },
      { path: "inbox/:id", element: <RequestDetailPage /> },
      { path: "policy", element: <PolicyPage /> },
    ],
  },

  { path: "*", element: <Navigate to="/login" replace /> },
]);
