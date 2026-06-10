import { useNavigate } from "react-router-dom";
import type { MoneyOutRequest } from "@/types";
import { REQUEST_TYPE_LABELS } from "@/lib/labels";
import { formatMoney, formatRelative } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { DecisionBadge, RalioBadge, RiskBadge } from "@/components/ui/Badge";
import { AgentGlyph } from "@/components/AgentGlyph";
import { AGENT_LABELS } from "@/lib/labels";

export function RequestTable({ requests }: { requests: MoneyOutRequest[] }) {
  const navigate = useNavigate();
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-400 dark:border-white/10 dark:text-slate-500">
              <th className="px-5 py-3">Request</th>
              <th className="px-3 py-3">Type</th>
              <th className="px-3 py-3">Amount</th>
              <th className="px-3 py-3">Agent</th>
              <th className="px-3 py-3">Risk</th>
              <th className="px-3 py-3">Decision</th>
              <th className="px-3 py-3">Ralio</th>
              <th className="px-5 py-3 text-right">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {requests.map((r) => (
              <tr
                key={r.id}
                onClick={() => navigate(`/host/inbox/${r.id}`)}
                className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
              >
                <td className="px-5 py-3">
                  <p className="font-medium text-slate-900 dark:text-white">{r.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{r.payee}</p>
                </td>
                <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{REQUEST_TYPE_LABELS[r.type]}</td>
                <td className="px-3 py-3 font-semibold text-slate-900 dark:text-white">
                  {formatMoney(r.amount, r.currency)}
                </td>
                <td className="px-3 py-3">
                  <span
                    className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300"
                    title={AGENT_LABELS[r.assignedAgent]}
                  >
                    <AgentGlyph agent={r.assignedAgent} size="sm" />
                    <span className="hidden xl:inline">{AGENT_LABELS[r.assignedAgent]}</span>
                  </span>
                </td>
                <td className="px-3 py-3">
                  <RiskBadge level={r.riskLevel} />
                </td>
                <td className="px-3 py-3">
                  <DecisionBadge decision={r.decision} />
                </td>
                <td className="px-3 py-3">
                  <RalioBadge status={r.ralioStatus} />
                </td>
                <td className="px-5 py-3 text-right text-xs text-slate-400 dark:text-slate-500">
                  {formatRelative(r.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
