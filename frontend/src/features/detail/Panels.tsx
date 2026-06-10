import {
  AlertTriangle,
  Check,
  CircleDot,
  Minus,
  X,
} from "lucide-react";
import type { AuditEntry, DecisionDetail, PolicyCheck, RiskAssessment } from "@/types";
import { DECISION_LABELS, RISK_LEVEL_LABELS } from "@/lib/labels";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import { DecisionBadge, RiskBadge } from "@/components/ui/Badge";

// --- Policy checks -----------------------------------------------------------

export function PolicyPanel({ checks }: { checks: PolicyCheck[] }) {
  return (
    <ul className="space-y-2">
      {checks.map((c) => (
        <li key={c.id} className="flex items-center gap-2.5 text-sm">
          <PolicyIcon status={c.status} />
          <span
            className={
              c.status === "fail"
                ? "text-slate-500 line-through dark:text-slate-500"
                : "text-slate-700 dark:text-slate-200"
            }
          >
            {c.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

function PolicyIcon({ status }: { status: PolicyCheck["status"] }) {
  if (status === "pass")
    return (
      <span className="grid size-5 place-items-center rounded-full bg-emerald-100 text-emerald-600">
        <Check className="size-3.5" />
      </span>
    );
  if (status === "fail")
    return (
      <span className="grid size-5 place-items-center rounded-full bg-red-100 text-red-600">
        <X className="size-3.5" />
      </span>
    );
  return (
    <span className="grid size-5 place-items-center rounded-full bg-amber-100 text-amber-600">
      <Minus className="size-3.5" />
    </span>
  );
}

// --- Risk panel --------------------------------------------------------------

export function RiskPanel({ risk }: { risk: RiskAssessment }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <RiskBadge level={risk.level} />
        <span className="text-xs text-slate-400 dark:text-slate-500">Score {risk.score}/100</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        <div
          className={cn(
            "h-full rounded-full",
            risk.level === "high"
              ? "bg-red-500"
              : risk.level === "medium"
                ? "bg-amber-500"
                : "bg-emerald-500",
          )}
          style={{ width: `${Math.max(risk.score, 4)}%` }}
        />
      </div>
      <dl className="space-y-1.5 text-sm">
        <RiskRow label="Duplicate detected" value={risk.duplicateDetected} danger />
        {risk.existingPayment && (
          <div className="flex items-center justify-between">
            <dt className="text-slate-500 dark:text-slate-400">Existing payment</dt>
            <dd className="font-mono text-xs text-slate-700 dark:text-slate-200">{risk.existingPayment}</dd>
          </div>
        )}
        <RiskRow label="Recipient mismatch" value={risk.recipientMismatch} danger />
        <RiskRow label="Approval required" value={risk.approvalRequired} />
        <RiskRow label="Payment retry risk" value={risk.paymentRetryRisk} danger />
      </dl>
      {risk.notes && (
        <p className="flex items-start gap-2 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600 dark:bg-white/5 dark:text-slate-300">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
          {risk.notes}
        </p>
      )}
    </div>
  );
}

function RiskRow({ label, value, danger }: { label: string; value: boolean; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
      <dd
        className={cn(
          "font-medium",
          value ? (danger ? "text-red-600" : "text-amber-600") : "text-emerald-600",
        )}
      >
        {value ? "Yes" : "No"}
      </dd>
    </div>
  );
}

// --- Decision card -----------------------------------------------------------

export function DecisionCard({ decision }: { decision: DecisionDetail }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Decision</span>
        <DecisionBadge decision={decision.decision} />
      </div>
      {decision.confidence > 0 && (
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Confidence</span>
            <span className="font-medium text-slate-700 dark:text-slate-200">{decision.confidence}%</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-slate-900 dark:bg-white"
              style={{ width: `${decision.confidence}%` }}
            />
          </div>
        </div>
      )}
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Reason</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{decision.reason}</p>
      </div>
    </div>
  );
}

// --- Audit log ---------------------------------------------------------------

export function AuditLog({ entries }: { entries: AuditEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-slate-400 dark:text-slate-500">No audit events yet.</p>;
  }
  return (
    <ul className="space-y-2.5">
      {entries.map((e) => (
        <li key={e.id} className="flex items-start gap-3 text-sm">
          <CircleDot className="mt-0.5 size-3.5 shrink-0 text-slate-300 dark:text-slate-600" />
          <span className="w-12 shrink-0 font-mono text-xs text-slate-400 dark:text-slate-500">
            {formatTime(e.timestamp)}
          </span>
          <span className="text-slate-600 dark:text-slate-300">{e.message}</span>
        </li>
      ))}
    </ul>
  );
}

export { DECISION_LABELS, RISK_LEVEL_LABELS };
