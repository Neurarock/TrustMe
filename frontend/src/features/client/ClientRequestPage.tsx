import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock, ShieldX, Sparkles } from "lucide-react";
import { useRequest } from "@/api/queries";
import { ApiError } from "@/api";
import { AGENT_LABELS, REQUEST_TYPE_LABELS } from "@/lib/labels";
import { formatMoney, formatTime } from "@/lib/format";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { AgentGlyph } from "@/components/AgentGlyph";
import { ReActTimeline } from "@/features/detail/ReActTimeline";
import { PolicyPanel } from "@/features/detail/Panels";
import { Confetti } from "@/features/detail/Confetti";
import { clientStatus, type ClientTone } from "./clientStatus";

const HERO_STYLES: Record<ClientTone, { ring: string; icon: typeof Clock; iconWrap: string }> = {
  green: { ring: "ring-emerald-200 bg-emerald-50", icon: CheckCircle2, iconWrap: "bg-emerald-500" },
  blue: { ring: "ring-sky-200 bg-sky-50", icon: Sparkles, iconWrap: "bg-sky-500" },
  amber: { ring: "ring-amber-200 bg-amber-50", icon: Clock, iconWrap: "bg-amber-500" },
  red: { ring: "ring-red-200 bg-red-50", icon: ShieldX, iconWrap: "bg-red-500" },
  grey: { ring: "ring-slate-200 bg-slate-50", icon: Clock, iconWrap: "bg-slate-500" },
};

export function ClientRequestPage() {
  const { id } = useParams<{ id: string }>();
  const { data: request, isLoading, isError, error, refetch } = useRequest(id);

  const [confetti, setConfetti] = useState(false);
  const celebrated = useRef(false);

  useEffect(() => {
    if (request?.ralioStatus === "paid" && !celebrated.current) {
      celebrated.current = true;
      setConfetti(true);
      const t = setTimeout(() => setConfetti(false), 1400);
      return () => clearTimeout(t);
    }
  }, [request?.ralioStatus]);

  if (isError) {
    const notFound = error instanceof ApiError && error.status === 404;
    return notFound ? (
      <EmptyState
        title="Request not found"
        description="We couldn't find this request."
        action={
          <Link to="/requests" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            Back to my requests
          </Link>
        }
      />
    ) : (
      <ErrorState description={error instanceof Error ? error.message : undefined} onRetry={() => refetch()} />
    );
  }

  if (isLoading || !request) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-40 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  const status = clientStatus(request);
  const hero = HERO_STYLES[status.tone];
  const HeroIcon = hero.icon;
  const reviewed = request.steps.length > 0;

  return (
    <div className="relative">
      <Confetti show={confetti} />

      <Link
        to="/requests"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="size-4" /> My requests
      </Link>

      {/* Status hero */}
      <div className={`rounded-3xl p-6 ring-1 ${hero.ring}`}>
        <div className="flex items-start gap-4">
          <span className={`grid size-12 shrink-0 place-items-center rounded-2xl text-white ${hero.iconWrap}`}>
            <HeroIcon className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{status.label}</p>
            <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-slate-900">{request.title}</h1>
            <p className="mt-1 text-sm text-slate-600">{status.description}</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-900/5 pt-4 text-sm sm:grid-cols-4">
          <Stat label="Amount" value={formatMoney(request.amount, request.currency)} />
          <Stat label="Payee" value={request.payee} />
          <Stat label="Type" value={REQUEST_TYPE_LABELS[request.type]} />
          <Stat label="Requested" value={formatTime(request.createdAt)} />
        </div>
      </div>

      {/* Who's handling it */}
      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
        <AgentGlyph agent={request.assignedAgent} />
        <div>
          <p className="text-sm font-medium text-slate-900">{AGENT_LABELS[request.assignedAgent]}</p>
          <p className="text-xs text-slate-500">
            {reviewed ? "Reviewed your request" : "Will review your request shortly"}
          </p>
        </div>
      </div>

      {/* What we checked */}
      {request.policyChecks.length > 0 && (
        <div className="mt-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
          <p className="mb-3 text-sm font-medium text-slate-700">What we checked</p>
          <PolicyPanel checks={request.policyChecks} />
        </div>
      )}

      {/* How we reviewed it */}
      <div className="mt-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
        <p className="mb-4 text-sm font-medium text-slate-700">How we reviewed it</p>
        {reviewed ? (
          <ReActTimeline steps={request.steps} />
        ) : (
          <p className="text-sm text-slate-400">
            Our agents will walk through your request and show their work here.
          </p>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-0.5 truncate font-medium text-slate-900">{value}</p>
    </div>
  );
}
