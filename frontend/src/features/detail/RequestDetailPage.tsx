import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  RefreshCw,
  ScanSearch,
  Sparkles,
} from "lucide-react";
import {
  useApprove,
  useExecute,
  useInvestigate,
  useRefreshRalio,
  useReject,
  useRequest,
} from "@/api/queries";
import { toast } from "@/store/toast";
import { ApiError } from "@/api";
import { REQUEST_TYPE_LABELS } from "@/lib/labels";
import { formatMoney, formatTime } from "@/lib/format";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DecisionBadge } from "@/components/ui/Badge";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { AgentGlyph } from "@/components/AgentGlyph";
import { AGENT_LABELS } from "@/lib/labels";
import { ReActTimeline } from "./ReActTimeline";
import { AuditLog, DecisionCard, PolicyPanel, RiskPanel } from "./Panels";
import { RalioPanel } from "./RalioPanel";
import { Confetti } from "./Confetti";

export function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: request, isLoading, isError, error, refetch } = useRequest(id);

  const investigate = useInvestigate();
  const approve = useApprove();
  const reject = useReject();
  const execute = useExecute();
  const refresh = useRefreshRalio(id ?? "");

  const [confetti, setConfetti] = useState(false);
  const wasPaid = useRef(false);

  // Fire confetti the moment a request transitions into "paid".
  useEffect(() => {
    if (request?.ralioStatus === "paid" && !wasPaid.current) {
      wasPaid.current = true;
      setConfetti(true);
      const t = setTimeout(() => setConfetti(false), 1300);
      return () => clearTimeout(t);
    }
    if (request && request.ralioStatus !== "paid") wasPaid.current = false;
  }, [request?.ralioStatus, request]);

  if (isError) {
    const notFound = error instanceof ApiError && error.status === 404;
    return notFound ? (
      <EmptyState
        title="Request not found"
        description="This money-out request doesn't exist or was removed."
        action={
          <Link to="/host/inbox">
            <Button variant="secondary">Back to inbox</Button>
          </Link>
        }
      />
    ) : (
      <ErrorState
        title="Couldn't load this request"
        description={error instanceof Error ? error.message : undefined}
        onRetry={() => refetch()}
      />
    );
  }

  if (isLoading || !request) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-28 rounded-2xl" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  const run = async (
    label: string,
    action: () => Promise<unknown>,
    success: string,
  ) => {
    try {
      await action();
      toast.success(success);
    } catch (err) {
      toast.error(`${label} failed`, err instanceof Error ? err.message : undefined);
    }
  };

  const notInvestigated = request.steps.length === 0;

  return (
    <div className="relative">
      <Confetti show={confetti} />

      <Link
        to="/host/inbox"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        <ArrowLeft className="size-4" /> Back to inbox
      </Link>

      {/* A. Header summary */}
      <Card className="mb-6">
        <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <AgentGlyph agent={request.assignedAgent} size="lg" />
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {request.title}
              </h1>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                <span>{REQUEST_TYPE_LABELS[request.type]}</span>
                <span aria-hidden>·</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatMoney(request.amount, request.currency)}
                </span>
                <span aria-hidden>·</span>
                <span>{request.payee}</span>
                <span aria-hidden>·</span>
                <span>{AGENT_LABELS[request.assignedAgent]}</span>
              </p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Created {formatTime(request.createdAt)}
                {request.reference && ` · Ref ${request.reference}`}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <DecisionBadge decision={request.decision} />
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                loading={investigate.isPending}
                onClick={() =>
                  run("Investigation", () => investigate.mutateAsync(request.id), "Investigation complete")
                }
              >
                <ScanSearch className="size-4" />
                {notInvestigated ? "Investigate" : "Re-investigate"}
              </Button>
              {request.decision !== "blocked" && request.decision !== "paid" && (
                <>
                  <Button
                    variant="success"
                    size="sm"
                    loading={approve.isPending}
                    disabled={notInvestigated}
                    onClick={() =>
                      run("Approval", () => approve.mutateAsync(request.id), "Request approved")
                    }
                  >
                    <CheckCircle2 className="size-4" /> Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    loading={reject.isPending}
                    disabled={notInvestigated}
                    onClick={() =>
                      run("Rejection", () => reject.mutateAsync(request.id), "Request rejected")
                    }
                  >
                    <Ban className="size-4" /> Reject
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* B. Agent investigation timeline (hero) */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Agent investigation"
            description="The ReAct reasoning trail: thoughts, tool calls, observations, and the decision."
            icon={<Sparkles className="size-4" />}
          />
          <CardBody>
            {notInvestigated ? (
              <EmptyState
                icon={<ScanSearch className="size-6" />}
                title="Not investigated yet"
                description="Run the specialist agent to see its step-by-step reasoning."
                action={
                  <Button
                    loading={investigate.isPending}
                    onClick={() =>
                      run("Investigation", () => investigate.mutateAsync(request.id), "Investigation complete")
                    }
                  >
                    <ScanSearch className="size-4" /> Investigate now
                  </Button>
                }
              />
            ) : (
              <ReActTimeline steps={request.steps} />
            )}
          </CardBody>
        </Card>

        {/* Right sidebar: decision + Ralio + checks */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Decision" />
            <CardBody>
              <DecisionCard decision={request.decisionDetail} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Ralio execution"
              action={
                refresh.isPending ? <RefreshCw className="size-4 animate-spin text-slate-400" /> : null
              }
            />
            <CardBody>
              <RalioPanel
                request={request}
                executing={execute.isPending}
                refreshing={refresh.isPending}
                onExecute={() =>
                  run("Execution", () => execute.mutateAsync(request.id), "Payment executed via Ralio")
                }
                onRefresh={() =>
                  run("Refresh", () => refresh.mutateAsync(), "Ralio status refreshed")
                }
              />
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* C. Policy checks */}
        <Card>
          <CardHeader title="Policy checks" />
          <CardBody>
            {request.policyChecks.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500">No checks yet — investigate first.</p>
            ) : (
              <PolicyPanel checks={request.policyChecks} />
            )}
          </CardBody>
        </Card>

        {/* D. Risk panel */}
        <Card>
          <CardHeader title="Risk assessment" />
          <CardBody>
            <RiskPanel risk={request.risk} />
          </CardBody>
        </Card>

        {/* G. Audit log */}
        <Card id="audit">
          <CardHeader title="Audit log" />
          <CardBody>
            <AuditLog entries={request.audit} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
