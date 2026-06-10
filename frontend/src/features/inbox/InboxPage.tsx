import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useRequests } from "@/api/queries";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { cn } from "@/lib/cn";
import { RequestTable } from "./RequestTable";
import { filterRequests, INBOX_FILTERS, type InboxFilter } from "./filters";

export function InboxPage() {
  const requests = useRequests();
  const [filter, setFilter] = useState<InboxFilter>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => (requests.data ? filterRequests(requests.data, filter, query) : []),
    [requests.data, filter, query],
  );

  return (
    <div>
      <PageHeader
        title="Money-Out Inbox"
        subtitle="Incoming money-out requests, the agent handling each, and its Ralio status."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {INBOX_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                filter === f.id
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10 dark:hover:bg-white/10",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, payee, amount, agent…"
            aria-label="Search requests"
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      {requests.isError ? (
        <ErrorState
          title="Backend unavailable"
          description="We couldn't load the inbox. Switch to mock mode or retry."
          onRetry={() => requests.refetch()}
        />
      ) : requests.isLoading ? (
        <Card className="p-5">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={query || filter !== "all" ? "No matching requests" : "No requests yet"}
          description={
            query || filter !== "all"
              ? "Try a different filter or search term."
              : "Client submissions will appear here as they come in."
          }
        />
      ) : (
        <RequestTable requests={filtered} />
      )}
    </div>
  );
}
