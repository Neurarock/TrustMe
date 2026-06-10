import { Link } from "react-router-dom";
import {
  ArrowRight,
  Ban,
  CircleCheck,
  Clock,
  Banknote,
  Layers,
  PoundSterling,
} from "lucide-react";
import { useAgents, useRequests } from "@/api/queries";
import { computeMetrics } from "@/lib/metrics";
import { formatMoney, formatRelative } from "@/lib/format";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { DecisionBadge } from "@/components/ui/Badge";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { AgentGlyph } from "@/components/AgentGlyph";
import { MetricCard } from "./MetricCard";

export function DashboardPage() {
  const requests = useRequests();
  const agents = useAgents();

  const metrics = requests.data ? computeMetrics(requests.data) : undefined;
  const recent = requests.data
    ? [...requests.data]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
    : [];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            One command centre for every money-out request.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs ring-1 ring-inset ring-slate-200 dark:bg-white/5 dark:ring-white/10">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <span className="font-medium text-slate-600 dark:text-slate-300">
            {(agents.data?.length ?? 7)} agents online
          </span>
        </div>
      </div>

      {requests.isError ? (
        <ErrorState
          title="Backend unavailable"
          description="We couldn't load your money-out requests. Switch to mock mode or retry."
          onRetry={() => requests.refetch()}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {metrics ? (
              <>
                <MetricCard label="Total requests" value={metrics.total} icon={<Layers className="size-4" />} tone="slate" />
                <MetricCard label="Approved today" value={metrics.approvedToday} icon={<CircleCheck className="size-4" />} tone="green" />
                <MetricCard label="Paid via Ralio" value={metrics.paid} icon={<Banknote className="size-4" />} tone="blue" />
                <MetricCard label="Needs approval" value={metrics.needsApproval} icon={<Clock className="size-4" />} tone="amber" />
                <MetricCard label="Blocked duplicates" value={metrics.blockedDuplicates} icon={<Ban className="size-4" />} tone="red" />
                <MetricCard
                  label="Total processed"
                  value={formatMoney(metrics.totalProcessed, "GBP")}
                  icon={<PoundSterling className="size-4" />}
                  tone="violet"
                />
              </>
            ) : (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[92px] rounded-2xl" />
              ))
            )}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-5">
            {/* Panel A: Money-Out Activity */}
            <Card className="lg:col-span-3">
              <CardHeader
                title="Money-Out Activity"
                description="Most recent cases across all agents"
                action={
                  <Link
                    to="/host/inbox"
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  >
                    View inbox <ArrowRight className="size-3.5" />
                  </Link>
                }
              />
              <CardBody className="p-0">
                {requests.isLoading ? (
                  <div className="space-y-3 p-5">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-12" />
                    ))}
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100 dark:divide-white/5">
                    {recent.map((r) => (
                      <li key={r.id}>
                        <Link
                          to={`/host/inbox/${r.id}`}
                          className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                        >
                          <AgentGlyph agent={r.assignedAgent} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                              {r.title}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {r.payee} · {formatRelative(r.createdAt)}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {formatMoney(r.amount, r.currency)}
                          </span>
                          <DecisionBadge decision={r.decision} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </CardBody>
            </Card>

            {/* Panel B: Agent Performance */}
            <Card className="lg:col-span-2">
              <CardHeader title="Agent Performance" description="Specialist agents, online" />
              <CardBody className="p-0">
                {agents.isLoading ? (
                  <div className="space-y-3 p-5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12" />
                    ))}
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100 dark:divide-white/5">
                    {agents.data?.map((a) => (
                      <li key={a.type} className="flex items-center gap-3 px-5 py-3">
                        <div className="relative">
                          <AgentGlyph agent={a.type} size="sm" />
                          {a.status === "online" && (
                            <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{a.name}</p>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{a.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{a.casesHandled}</p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500">
                            {formatRelative(a.lastActivity)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardBody>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
