import type { ReactNode } from "react";
import { AlertTriangle, Inbox } from "lucide-react";
import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-slate-200/70 dark:bg-white/10", className)} />
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-16 text-center dark:border-white/10 dark:bg-white/5">
      <span className="grid size-12 place-items-center rounded-xl bg-slate-100 text-slate-400 dark:bg-white/10 dark:text-slate-400">
        {icon ?? <Inbox className="size-6" />}
      </span>
      <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50/60 px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-xl bg-red-100 text-red-500">
        <AlertTriangle className="size-6" />
      </span>
      <h3 className="mt-4 text-sm font-semibold text-red-800">{title}</h3>
      {description && (
        <p className="mt-1 max-w-md text-sm text-red-600">{description}</p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500"
        >
          Try again
        </button>
      )}
    </div>
  );
}
