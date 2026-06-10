import { Ban, Banknote, ExternalLink, RefreshCw } from "lucide-react";
import type { MoneyOutRequest } from "@/types";
import { formatMoney, formatTime } from "@/lib/format";
import { RalioBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function RalioPanel({
  request,
  onExecute,
  onRefresh,
  executing,
  refreshing,
}: {
  request: MoneyOutRequest;
  onExecute: () => void;
  onRefresh: () => void;
  executing: boolean;
  refreshing: boolean;
}) {
  const { ralio } = request;
  const blocked = request.decision === "blocked" || request.decision === "rejected";
  const paid = ralio.status === "paid";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 dark:bg-white/10 dark:text-slate-300">
            {ralio.mode}
          </span>
          Ralio mode
        </span>
        <RalioBadge status={ralio.status} />
      </div>

      {blocked ? (
        <div className="flex items-start gap-2.5 rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-inset ring-red-100">
          <Ban className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">Not sent to Ralio</p>
            <p className="text-xs text-red-600">
              {ralio.blockedReason ?? "This request was stopped before any money moved."}
            </p>
          </div>
        </div>
      ) : (
        <dl className="space-y-2 text-sm">
          <Row label="Amount" value={formatMoney(ralio.amount, ralio.currency)} />
          <Row label="Payee" value={ralio.payee} />
          <Row
            label="Ralio reference"
            value={ralio.reference ?? "—"}
            mono={Boolean(ralio.reference)}
          />
          {ralio.createdAt && <Row label="Payment created" value={formatTime(ralio.createdAt)} />}
          {ralio.updatedAt && <Row label="Last status update" value={formatTime(ralio.updatedAt)} />}
        </dl>
      )}

      {!blocked && (
        <div className="flex flex-wrap gap-2">
          {request.ralioReady && !paid && (
            <Button variant="success" onClick={onExecute} loading={executing}>
              <Banknote className="size-4" /> Execute with Ralio
            </Button>
          )}
          {(ralio.reference || paid) && (
            <Button variant="secondary" onClick={onRefresh} loading={refreshing}>
              <RefreshCw className="size-4" /> Refresh status
            </Button>
          )}
          {paid && (
            <a
              href="#audit"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900"
            >
              View event log <ExternalLink className="size-3.5" />
            </a>
          )}
        </div>
      )}

      {!blocked && !request.ralioReady && !paid && (
        <p className="rounded-lg bg-amber-50 p-2.5 text-xs text-amber-700 ring-1 ring-inset ring-amber-100">
          Execution unlocks once the request is approved (<code>ralio_ready</code>).
        </p>
      )}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
      <dd
        className={
          mono
            ? "font-mono text-xs text-slate-700 dark:text-slate-200"
            : "font-medium text-slate-700 dark:text-slate-200"
        }
      >
        {value}
      </dd>
    </div>
  );
}
