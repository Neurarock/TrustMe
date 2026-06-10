import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ArrowUp, Paperclip, Sparkles } from "lucide-react";
import type {
  CreateRequestInput,
  Currency,
  MoneyOutRequestType,
  RequestDecision,
} from "@/types";
import { REQUEST_TYPE_LABELS } from "@/lib/labels";
import { useCreateRequest, useInvestigate } from "@/api/queries";
import { useSession } from "@/store/session";
import { toast } from "@/store/toast";
import { cn } from "@/lib/cn";
import { DEMO_PRESETS } from "@/features/inbox/presets";
import { OrchestrationOverlay } from "./OrchestrationOverlay";

const TYPES = Object.keys(REQUEST_TYPE_LABELS) as MoneyOutRequestType[];
const CURRENCIES: Currency[] = ["GBP", "USD", "EUR"];

const EMPTY: CreateRequestInput = {
  title: "",
  type: "employee_reimbursement",
  payee: "",
  amount: 0,
  currency: "GBP",
  description: "",
  reference: "",
  attachmentName: "",
};

export function ComposerPage() {
  const [form, setForm] = useState<CreateRequestInput>(EMPTY);
  const [orchestrating, setOrchestrating] = useState<{
    id: string;
    type: MoneyOutRequestType;
    title: string;
    outcome?: RequestDecision;
  } | null>(null);

  const user = useSession((s) => s.user);
  const navigate = useNavigate();
  const create = useCreateRequest();
  const investigate = useInvestigate();

  const set = <K extends keyof CreateRequestInput>(key: K, value: CreateRequestInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const valid = form.title.trim() && form.payee.trim() && form.amount > 0;

  const submit = async () => {
    if (!valid || create.isPending) return;
    try {
      const created = await create.mutateAsync({
        ...form,
        source: "client",
        requesterName: user?.name,
      });
      setOrchestrating({ id: created.id, type: created.type, title: created.title });
      // The Orchestrator does its work while the dispatch animation plays; feed
      // the real decision back into the animation when it lands.
      investigate
        .mutateAsync(created.id)
        .then((result) =>
          setOrchestrating((prev) =>
            prev && prev.id === created.id ? { ...prev, outcome: result.decision } : prev,
          ),
        )
        .catch(() =>
          setOrchestrating((prev) =>
            prev && prev.id === created.id ? { ...prev, outcome: "needs_approval" } : prev,
          ),
        );
    } catch (err) {
      toast.error("Could not submit", err instanceof Error ? err.message : undefined);
    }
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Hi {user?.name?.split(" ")[0] ?? "there"} 👋
        </h1>
        <p className="mt-2 text-slate-500">
          What money needs to go out? Describe it and our agents take care of the rest.
        </p>
      </div>

      {/* The shiny hero input box */}
      <div className="relative">
        <div className="absolute -inset-0.5 rounded-[28px] bg-gradient-to-r from-sky-300 via-indigo-300 to-fuchsia-300 opacity-60 blur-lg" />
        <div className="relative rounded-3xl bg-white p-2 shadow-xl shadow-slate-900/5 ring-1 ring-slate-900/5">
          <div className="flex items-end gap-2">
            <textarea
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
              }}
              rows={2}
              placeholder="e.g. Reimburse Sarah £38.40 for a client lunch at Pret"
              className="min-h-[64px] flex-1 resize-none bg-transparent px-4 py-3 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            <button
              onClick={submit}
              disabled={!valid || create.isPending}
              aria-label="Send to Orchestrator"
              className={cn(
                "mb-1 grid size-11 shrink-0 place-items-center rounded-2xl text-white transition-all",
                valid && !create.isPending
                  ? "bg-slate-900 hover:bg-slate-800"
                  : "cursor-not-allowed bg-slate-300",
              )}
            >
              <ArrowUp className="size-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Presets */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <Sparkles className="size-3.5" /> Try
        </span>
        {DEMO_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => setForm({ ...preset.input, source: "client" })}
            className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200 transition-colors hover:bg-slate-50"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Details */}
      <div className="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
        <p className="mb-3 text-sm font-medium text-slate-700">Details</p>

        <div className="mb-4 flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => set("type", t)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                form.type === t
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200",
              )}
            >
              {REQUEST_TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Payee">
            <input
              className={inputClass}
              value={form.payee}
              onChange={(e) => set("payee", e.target.value)}
              placeholder="Sarah Jones"
            />
          </Field>
          <div className="grid grid-cols-[1fr_96px] gap-3">
            <Field label="Amount">
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputClass}
                value={form.amount || ""}
                onChange={(e) => set("amount", Number(e.target.value))}
                placeholder="38.40"
              />
            </Field>
            <Field label="Currency">
              <select
                className={inputClass}
                value={form.currency}
                onChange={(e) => set("currency", e.target.value as Currency)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Reference (optional)">
            <input
              className={inputClass}
              value={form.reference}
              onChange={(e) => set("reference", e.target.value)}
              placeholder="receipt_102 / INV-2042"
            />
          </Field>
          <Field label="Note (optional)">
            <input
              className={inputClass}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Client lunch with the Acme team"
            />
          </Field>
        </div>

        <label className="mt-4 flex cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500 transition-colors hover:bg-slate-50">
          <Paperclip className="size-4" />
          <span className="flex-1 truncate">
            {form.attachmentName || "Attach a receipt or invoice (optional)"}
          </span>
          <input
            type="file"
            className="hidden"
            onChange={(e) => set("attachmentName", e.target.files?.[0]?.name ?? "")}
          />
        </label>
      </div>

      <AnimatePresence>
        {orchestrating && (
          <OrchestrationOverlay
            type={orchestrating.type}
            title={orchestrating.title}
            outcome={orchestrating.outcome}
            onDone={() => navigate(`/requests/${orchestrating.id}`)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}
