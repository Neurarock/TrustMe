import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

type Tone = "slate" | "green" | "blue" | "amber" | "red" | "violet";

const TONES: Record<Tone, string> = {
  slate: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300",
  green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  blue: "bg-blue-50 text-blue-600 dark:bg-sky-500/15 dark:text-sky-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  red: "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400",
  violet: "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
};

export function MetricCard({
  label,
  value,
  icon,
  tone = "slate",
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  tone?: Tone;
}) {
  return (
    <Card className="p-4 transition-colors hover:ring-slate-300 dark:hover:ring-white/20">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
        <span className={cn("grid size-7 place-items-center rounded-lg", TONES[tone])}>
          {icon}
        </span>
      </div>
      <p className="mt-3 text-[26px] font-semibold leading-none tracking-tight text-slate-900 dark:text-white">
        {value}
      </p>
    </Card>
  );
}
