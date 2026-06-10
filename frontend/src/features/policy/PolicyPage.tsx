import { useRef, useState } from "react";
import { FileText, Sparkles, Upload, Wand2 } from "lucide-react";
import { useParsePolicy } from "@/api/queries";
import { usePolicyStore } from "@/store/policy";
import { DEFAULT_POLICY, type PolicyConfig } from "@/lib/policy";
import { REQUEST_TYPE_LABELS } from "@/lib/labels";
import { toast } from "@/store/toast";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { MoneyOutRequestType } from "@/types";

const PLACEHOLDER = `Paste your expense policy here, or drop a PDF…

e.g.
• Employee reimbursements under £50 are auto-approved.
• Supplier invoices over £250 need finance approval.
• Customer refunds up to £500 can be issued automatically.
• Partner commissions above £200 require sign-off.
• Always block duplicate receipts. Receipts required over £25.
• Allowed categories: travel, software, client_meal, office_supplies.`;

export function PolicyPage() {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string>();
  const [draftJson, setDraftJson] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  const parse = useParsePolicy();
  const { config, setConfig } = usePolicyStore();

  const onFile = async (file?: File) => {
    if (!file) return;
    setFileName(file.name);
    const content = await file.text().catch(() => "");
    if (content.trim()) setText((prev) => prev || content);
  };

  const convert = async () => {
    try {
      const result = await parse.mutateAsync({ text, fileName });
      setDraftJson(JSON.stringify(result, null, 2));
      toast.success("Policy parsed", "Review the JSON and save it.");
    } catch (err) {
      toast.error("Couldn't parse policy", err instanceof Error ? err.message : undefined);
    }
  };

  const save = () => {
    try {
      const parsed = JSON.parse(draftJson) as PolicyConfig;
      if (!parsed.autoApprovalThresholds) {
        throw new Error("Missing autoApprovalThresholds.");
      }
      setConfig({ ...parsed, updatedAt: new Date().toISOString() });
      toast.success("Policy saved", "Agents will enforce this on new investigations.");
    } catch (err) {
      toast.error("Invalid policy JSON", err instanceof Error ? err.message : undefined);
    }
  };

  return (
    <div>
      <PageHeader
        title="Set policy"
        subtitle="Drop in your written policy — AI turns it into the rules the agents enforce."
      />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* The clean, obvious composer */}
        <div className="lg:col-span-3">
          <Card>
            <CardBody>
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={PLACEHOLDER}
                  className="min-h-[260px] w-full resize-none rounded-2xl bg-transparent p-4 text-[15px] leading-relaxed text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  void onFile(e.dataTransfer.files?.[0]);
                }}
                className="mt-2 flex items-center justify-between gap-3 rounded-2xl border border-dashed border-white/15 px-4 py-3"
              >
                <span className="flex min-w-0 items-center gap-2 text-sm text-slate-400">
                  <FileText className="size-4 shrink-0" />
                  <span className="truncate">
                    {fileName ?? "Drag a PDF here, or attach a policy document"}
                  </span>
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="size-4" /> Upload
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.txt,.md,.doc,.docx"
                  className="hidden"
                  onChange={(e) => void onFile(e.target.files?.[0] ?? undefined)}
                />
              </div>

              <div className="mt-4 flex justify-end">
                <Button onClick={convert} loading={parse.isPending} disabled={!text.trim() && !fileName}>
                  <Wand2 className="size-4" /> Convert with AI
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Parsed JSON result */}
          {draftJson && (
            <Card className="mt-6">
              <CardHeader
                title="Generated policy"
                description="Edit if needed, then save to make it live."
                icon={<Sparkles className="size-4" />}
                action={
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setDraftJson("")}>
                      Discard
                    </Button>
                    <Button size="sm" onClick={save}>
                      Save policy
                    </Button>
                  </div>
                }
              />
              <CardBody>
                <textarea
                  value={draftJson}
                  onChange={(e) => setDraftJson(e.target.value)}
                  spellCheck={false}
                  className="h-80 w-full rounded-xl bg-black/40 p-4 font-mono text-xs leading-relaxed text-emerald-200 ring-1 ring-white/10 focus:outline-none"
                />
              </CardBody>
            </Card>
          )}
        </div>

        {/* Current active policy */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Active policy" description="Enforced on every new investigation" />
            <CardBody className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Auto-approval thresholds
                </p>
                <ul className="space-y-1.5 text-sm">
                  {(Object.keys(config.autoApprovalThresholds) as MoneyOutRequestType[]).map((t) => (
                    <li key={t} className="flex items-center justify-between">
                      <span className="text-slate-300">{REQUEST_TYPE_LABELS[t]}</span>
                      <span className="font-medium text-white">
                        {config.currency === "GBP" ? "£" : config.currency === "USD" ? "$" : "€"}
                        {config.autoApprovalThresholds[t]}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge tone={config.blockDuplicates ? "green" : "red"} dot>
                  {config.blockDuplicates ? "Duplicates blocked" : "Duplicates allowed"}
                </Badge>
                <Badge tone="slate">Receipts over {config.currency} {config.receiptRequiredOver}</Badge>
              </div>

              {config.allowedCategories.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                    Allowed categories
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {config.allowedCategories.map((c) => (
                      <span
                        key={c}
                        className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-slate-300 ring-1 ring-inset ring-white/10"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[11px] text-slate-500">
                {config.updatedAt === DEFAULT_POLICY.updatedAt
                  ? "Using default policy."
                  : `Last updated ${new Date(config.updatedAt).toLocaleString()}`}
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
