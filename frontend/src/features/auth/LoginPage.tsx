import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, Users } from "lucide-react";
import { useSession, type Role } from "@/store/session";
import { cn } from "@/lib/cn";

const ROLES: {
  role: Role;
  title: string;
  blurb: string;
  defaultName: string;
  icon: typeof Users;
  accent: string;
}[] = [
  {
    role: "client",
    title: "I'm submitting a request",
    blurb: "Send a reimbursement, invoice or refund and track when it's accepted.",
    defaultName: "Sarah Jones",
    icon: Sparkles,
    accent: "from-sky-400 to-indigo-500",
  },
  {
    role: "host",
    title: "I'm the finance team",
    blurb: "Review incoming requests, watch the agents reason, approve and pay via Ralio.",
    defaultName: "Finance Ops",
    icon: ShieldCheck,
    accent: "from-slate-700 to-slate-900",
  },
];

export function LoginPage() {
  const { user, signIn } = useSession();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Role>("client");
  const [name, setName] = useState("");

  if (user) return <Navigate to={user.role === "host" ? "/host" : "/"} replace />;

  const active = ROLES.find((r) => r.role === selected)!;

  const enter = () => {
    const finalName = name.trim() || active.defaultName;
    signIn({ role: selected, name: finalName });
    navigate(selected === "host" ? "/host" : "/", { replace: true });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-12">
      {/* Soft ambient glows */}
      <div className="pointer-events-none absolute -left-40 -top-40 size-96 rounded-full bg-sky-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 size-96 rounded-full bg-indigo-200/40 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <img
            src="/logo.avif"
            alt="TrustMe"
            className="mx-auto size-14 rounded-2xl object-cover shadow-xl shadow-blue-500/20"
          />
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900">TrustMe</h1>
          <p className="mt-1.5 text-sm text-slate-500">Money-Out Command Centre</p>
        </div>

        <div className="rounded-3xl bg-white/80 p-6 shadow-xl shadow-slate-900/5 ring-1 ring-slate-900/5 backdrop-blur">
          <p className="mb-3 text-sm font-medium text-slate-700">Choose how you'll sign in</p>
          <div className="grid gap-3">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const isActive = selected === r.role;
              return (
                <button
                  key={r.role}
                  onClick={() => setSelected(r.role)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all",
                    isActive
                      ? "border-transparent bg-slate-50 ring-2 ring-slate-900/80"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white",
                      r.accent,
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-900">{r.title}</span>
                    <span className="block text-xs leading-snug text-slate-500">{r.blurb}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <label className="mt-5 block">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">Your name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && enter()}
              placeholder={active.defaultName}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </label>

          <button
            onClick={enter}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Continue as {selected === "host" ? "finance team" : "client"}
            <ArrowRight className="size-4" />
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Demo mode · no password required. You can switch roles anytime.
        </p>
      </motion.div>
    </div>
  );
}
