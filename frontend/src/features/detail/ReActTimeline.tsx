import { motion } from "framer-motion";
import {
  Banknote,
  Brain,
  CheckCircle2,
  Eye,
  ShieldAlert,
  ShieldCheck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { ReActStep, ReActStepKind } from "@/types";
import { AGENT_LABELS } from "@/lib/labels";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/cn";

const KIND_META: Record<
  ReActStepKind,
  { icon: LucideIcon; label: string; ring: string; chip: string }
> = {
  thought: { icon: Brain, label: "Thought", ring: "bg-violet-100 text-violet-600", chip: "text-violet-600" },
  tool_call: { icon: Wrench, label: "Tool call", ring: "bg-blue-100 text-blue-600", chip: "text-blue-600" },
  observation: { icon: Eye, label: "Observation", ring: "bg-slate-100 text-slate-600", chip: "text-slate-500" },
  policy: { icon: ShieldCheck, label: "Policy", ring: "bg-amber-100 text-amber-600", chip: "text-amber-600" },
  risk: { icon: ShieldAlert, label: "Risk", ring: "bg-red-100 text-red-600", chip: "text-red-600" },
  decision: { icon: CheckCircle2, label: "Decision", ring: "bg-emerald-100 text-emerald-600", chip: "text-emerald-600" },
  payment: { icon: Banknote, label: "Payment", ring: "bg-sky-100 text-sky-600", chip: "text-sky-600" },
};

export function ReActTimeline({ steps }: { steps: ReActStep[] }) {
  return (
    <ol className="relative space-y-1">
      {steps.map((step, i) => {
        const meta = KIND_META[step.kind];
        const Icon = meta.icon;
        const isLast = i === steps.length - 1;
        return (
          <motion.li
            key={step.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: Math.min(i * 0.05, 0.6) }}
            className="relative flex gap-3 pb-4"
          >
            {!isLast && (
              <span className="absolute left-[15px] top-9 bottom-0 w-px bg-slate-200 dark:bg-white/10" aria-hidden />
            )}
            <span
              className={cn(
                "z-10 grid size-8 shrink-0 place-items-center rounded-full ring-4 ring-white dark:ring-slate-900",
                meta.ring,
              )}
            >
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide">
                  <span className={meta.chip}>
                    {step.index}. {meta.label}
                  </span>
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">{formatTime(step.timestamp)}</span>
              </div>
              <p className="mt-0.5 text-sm text-slate-700 dark:text-slate-200">{step.title}</p>
              {step.tool && (
                <code className="mt-1.5 inline-block rounded-md bg-slate-900 px-2 py-1 font-mono text-xs text-emerald-300 dark:bg-black/40 dark:ring-1 dark:ring-white/10">
                  {step.tool}
                </code>
              )}
              <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">{AGENT_LABELS[step.agent] || step.agent || "Unknown Agent"}</p>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
