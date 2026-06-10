import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Clock, Loader2, X } from "lucide-react";
import type { AgentType, MoneyOutRequestType, RequestDecision } from "@/types";
import { AGENT_LABELS, DEFAULT_AGENT_FOR_TYPE, REQUEST_TYPE_LABELS } from "@/lib/labels";
import { AgentGlyph } from "@/components/AgentGlyph";
import { cn } from "@/lib/cn";

type Verdict = "approved" | "pending" | "rejected";

function verdictOf(decision?: RequestDecision): Verdict | undefined {
  if (!decision) return undefined;
  if (decision === "approved" || decision === "paid") return "approved";
  if (decision === "needs_approval") return "pending";
  if (decision === "blocked" || decision === "rejected") return "rejected";
  return undefined;
}

const VERDICT = {
  approved: {
    icon: Check,
    wrap: "bg-emerald-500",
    text: "text-emerald-600",
    line: "Approved — all checks passed.",
  },
  pending: {
    icon: Clock,
    wrap: "bg-amber-500",
    text: "text-amber-600",
    line: "Needs approval before payment.",
  },
  rejected: {
    icon: X,
    wrap: "bg-red-500",
    text: "text-red-600",
    line: "Blocked before any money moved.",
  },
} as const;

/**
 * The hero moment: after a client submits, the Orchestrator visibly classifies
 * the request, dispatches it to the right specialist, and calls the Risk agent.
 * The final marker reflects the real decision — green (approved), amber (needs
 * approval) or red (blocked / rejected).
 */
export function OrchestrationOverlay({
  type,
  title,
  outcome,
  onDone,
}: {
  type: MoneyOutRequestType;
  title: string;
  /** The investigation result; may arrive a moment after the animation starts. */
  outcome?: RequestDecision;
  onDone: () => void;
}) {
  const specialist = DEFAULT_AGENT_FOR_TYPE[type] || "reimbursement_agent";
  const verdict = verdictOf(outcome);

  const stages: { agent: AgentType; line: string }[] = [
    { agent: "orchestrator", line: "Reading and classifying your request…" },
    { agent: "orchestrator", line: `Classified as ${(REQUEST_TYPE_LABELS[type] || type || "request").toLowerCase()}` },
    { agent: specialist, line: `Dispatching to the ${AGENT_LABELS[specialist] || "Specialist"}` },
    { agent: "risk_duplicate_agent", line: "Risk & Duplicate Agent screening for problems…" },
  ];

  const [stage, setStage] = useState(0);
  const done = stage >= stages.length;

  useEffect(() => {
    if (!done) {
      const t = setTimeout(() => setStage((s) => s + 1), stage === 0 ? 900 : 750);
      return () => clearTimeout(t);
    }
    // Hold on the final verdict (once known) so the user sees the result.
    if (verdict) {
      const t = setTimeout(onDone, 1400);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, done, verdict]);

  const pipeline: AgentType[] = ["orchestrator", specialist, "risk_duplicate_agent"];
  const isRiskNode = (agent: AgentType, i: number) =>
    agent === "risk_duplicate_agent" && i === pipeline.length - 1;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 px-4 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl shadow-slate-900/10 ring-1 ring-slate-900/5"
      >
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Orchestrator</p>
        <h2 className="mt-1 truncate text-lg font-semibold text-slate-900">{title}</h2>

        {/* Routed pipeline of agents */}
        <div className="mt-7 flex items-center justify-center gap-3">
          {pipeline.map((agent, i) => {
            const reached = stage > pipeline.findIndex((a) => a === agent);
            const activeStage = stages[Math.min(stage, stages.length - 1)]?.agent === agent;
            const isActive = activeStage && !done;

            // The risk node carries the final verdict colour once we're done.
            const marker = (() => {
              if (!reached) return null;
              if (done && verdict && isRiskNode(agent, i)) {
                const V = VERDICT[verdict];
                const Icon = V.icon;
                return (
                  <span className={cn("grid size-4 place-items-center rounded-full text-white ring-2 ring-white", V.wrap)}>
                    <Icon className="size-2.5" />
                  </span>
                );
              }
              return (
                <span className="grid size-4 place-items-center rounded-full bg-emerald-500 text-white ring-2 ring-white">
                  <Check className="size-2.5" />
                </span>
              );
            })();

            return (
              <div key={agent} className="flex items-center gap-3">
                <motion.div
                  animate={isActive ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                  transition={{ repeat: isActive ? Infinity : 0, duration: 1 }}
                  className="relative"
                >
                  <AgentGlyph agent={agent} size="lg" />
                  {marker && <span className="absolute -bottom-1 -right-1">{marker}</span>}
                </motion.div>
                {i < pipeline.length - 1 && (
                  <span className="h-px w-6 bg-gradient-to-r from-slate-300 to-slate-200" />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-7 flex min-h-[24px] items-center justify-center gap-2 text-sm">
          <AnimatePresence mode="wait">
            <motion.span
              key={done ? `done-${verdict ?? "wait"}` : stage}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-2"
            >
              {!done ? (
                <>
                  <Loader2 className="size-4 animate-spin text-slate-400" />
                  <span className="text-slate-600">{stages[stage].line}</span>
                </>
              ) : verdict ? (
                <>
                  {(() => {
                    const Icon = VERDICT[verdict].icon;
                    return <Icon className={cn("size-4", VERDICT[verdict].text)} />;
                  })()}
                  <span className={cn("font-medium", VERDICT[verdict].text)}>
                    {VERDICT[verdict].line}
                  </span>
                </>
              ) : (
                <>
                  <Loader2 className="size-4 animate-spin text-slate-400" />
                  <span className="text-slate-600">Finishing up…</span>
                </>
              )}
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
