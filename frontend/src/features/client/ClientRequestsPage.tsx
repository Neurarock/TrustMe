import { Link } from "react-router-dom";
import { ChevronRight, PlusCircle } from "lucide-react";
import { useRequests } from "@/api/queries";
import { REQUEST_TYPE_LABELS } from "@/lib/labels";
import { formatMoney, formatRelative } from "@/lib/format";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { AgentGlyph } from "@/components/AgentGlyph";
import { clientStatus } from "./clientStatus";
import { ClientStatusBadge } from "./ClientStatusBadge";

export function ClientRequestsPage() {
  const requests = useRequests();
  const mine = (requests.data ?? []).filter((r) => r.source === "client");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">My requests</h1>
        <p className="mt-1 text-sm text-slate-500">Track each request and see when it's accepted.</p>
      </div>

      {requests.isError ? (
        <ErrorState
          title="Couldn't load your requests"
          description="Please try again in a moment."
          onRetry={() => requests.refetch()}
        />
      ) : requests.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : mine.length === 0 ? (
        <EmptyState
          icon={<PlusCircle className="size-6" />}
          title="No requests yet"
          description="Create your first money-out request from the New request screen."
          action={
            <Link
              to="/"
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              New request
            </Link>
          }
        />
      ) : (
        <ul className="space-y-3">
          {mine.map((r) => {
            const status = clientStatus(r);
            return (
              <li key={r.id}>
                <Link
                  to={`/requests/${r.id}`}
                  className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5 transition-shadow hover:shadow-md"
                >
                  <AgentGlyph agent={r.assignedAgent} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">{r.title}</p>
                    <p className="text-xs text-slate-500">
                      {REQUEST_TYPE_LABELS[r.type]} · {formatRelative(r.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{formatMoney(r.amount, r.currency)}</p>
                    <div className="mt-1">
                      <ClientStatusBadge status={status} />
                    </div>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-slate-300" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
