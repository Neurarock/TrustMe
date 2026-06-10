import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { RalioStatus, RequestDecision, RiskLevel } from "@/types";
import {
  DECISION_LABELS,
  RALIO_STATUS_LABELS,
  RISK_LEVEL_LABELS,
} from "@/lib/labels";

type Tone =
  | "green"
  | "blue"
  | "amber"
  | "red"
  | "purple"
  | "grey"
  | "slate";

const TONE_CLASSES: Record<Tone, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20",
  blue: "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-300 dark:ring-blue-400/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20",
  red: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-400/10 dark:text-red-300 dark:ring-red-400/20",
  purple: "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-400/10 dark:text-violet-300 dark:ring-violet-400/20",
  grey: "bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-white/10 dark:text-slate-300 dark:ring-white/15",
  slate: "bg-slate-100 text-slate-700 ring-slate-500/20 dark:bg-white/10 dark:text-slate-200 dark:ring-white/15",
};

export function Badge({
  tone = "slate",
  className,
  children,
  dot = false,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}

const DECISION_TONE: Record<RequestDecision, Tone> = {
  draft: "grey",
  investigating: "purple",
  approved: "green",
  needs_approval: "amber",
  blocked: "red",
  rejected: "red",
  paid: "blue",
};

export function DecisionBadge({ decision }: { decision: RequestDecision }) {
  return (
    <Badge tone={DECISION_TONE[decision]} dot>
      {DECISION_LABELS[decision]}
    </Badge>
  );
}

const RALIO_TONE: Record<RalioStatus, Tone> = {
  not_sent: "grey",
  pending: "amber",
  requires_approval: "amber",
  processing: "purple",
  paid: "blue",
  failed: "red",
};

export function RalioBadge({ status }: { status: RalioStatus }) {
  return <Badge tone={RALIO_TONE[status]}>{RALIO_STATUS_LABELS[status]}</Badge>;
}

const RISK_TONE: Record<RiskLevel, Tone> = {
  low: "green",
  medium: "amber",
  high: "red",
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <Badge tone={RISK_TONE[level]} dot>
      {RISK_LEVEL_LABELS[level]} risk
    </Badge>
  );
}
