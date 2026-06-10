import {
  Banknote,
  Brain,
  Building2,
  HandCoins,
  Receipt,
  ShieldAlert,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { AgentType } from "@/types";
import { AGENT_LABELS } from "@/lib/labels";

export const AGENT_ICON: Record<AgentType, LucideIcon> = {
  orchestrator: Brain,
  reimbursement_agent: Receipt,
  supplier_invoice_agent: Building2,
  customer_refund_agent: Undo2,
  partner_commission_agent: HandCoins,
  risk_duplicate_agent: ShieldAlert,
  ralio_payment_agent: Banknote,
};

const AGENT_ACCENT: Record<AgentType, string> = {
  orchestrator: "bg-violet-50 text-violet-600 ring-violet-600/15",
  reimbursement_agent: "bg-blue-50 text-blue-600 ring-blue-600/15",
  supplier_invoice_agent: "bg-amber-50 text-amber-600 ring-amber-600/15",
  customer_refund_agent: "bg-emerald-50 text-emerald-600 ring-emerald-600/15",
  partner_commission_agent: "bg-fuchsia-50 text-fuchsia-600 ring-fuchsia-600/15",
  risk_duplicate_agent: "bg-red-50 text-red-600 ring-red-600/15",
  ralio_payment_agent: "bg-sky-50 text-sky-600 ring-sky-600/15",
};

export function AgentGlyph({
  agent,
  size = "md",
  className,
}: {
  agent: AgentType;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const Icon = AGENT_ICON[agent];
  const box = size === "lg" ? "size-10" : size === "sm" ? "size-7" : "size-9";
  const icon = size === "lg" ? "size-5" : size === "sm" ? "size-3.5" : "size-4";
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-lg ring-1 ring-inset",
        box,
        AGENT_ACCENT[agent],
        className,
      )}
      title={AGENT_LABELS[agent]}
    >
      <Icon className={icon} />
    </span>
  );
}

export function AgentTag({ agent }: { agent: AgentType }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-slate-700">
      <AgentGlyph agent={agent} size="sm" />
      {AGENT_LABELS[agent]}
    </span>
  );
}
