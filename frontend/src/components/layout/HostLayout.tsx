import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Banknote, LayoutDashboard, ListChecks, LogOut, ScrollText } from "lucide-react";
import { cn } from "@/lib/cn";
import { resolveApiMode } from "@/api";
import { useSession } from "@/store/session";
import { Toaster } from "@/components/ui/Toaster";

const NAV = [
  { to: "/host", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/host/inbox", label: "Money-Out Inbox", icon: ListChecks, end: false },
  { to: "/host/policy", label: "Set Policy", icon: ScrollText, end: false },
];

/** Admin (host) shell — crisp dark cockpit. Wrapped in `.dark`. */
export function HostLayout() {
  const mode = resolveApiMode();
  const { user, signOut } = useSession();
  const navigate = useNavigate();

  return (
    <div className="dark min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-[1400px]">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-white/5 px-4 py-6 lg:flex">
          <div className="flex items-center gap-2.5 px-2">
            <img
              src="/logo.avif"
              alt="TrustMe"
              className="size-9 rounded-xl object-cover shadow-lg shadow-blue-500/20"
            />
            <div>
              <p className="text-sm font-semibold text-white">TrustMe</p>
              <p className="text-[11px] text-slate-400">Admin · Command Centre</p>
            </div>
          </div>

          <nav className="mt-8 flex flex-col gap-1">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
                  )
                }
              >
                <Icon className="size-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto space-y-3">
            <div className="rounded-xl bg-white/5 p-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Banknote className="size-4 text-sky-400" />
                <span className="font-medium">Ralio execution</span>
              </div>
              <p className="mt-1.5 leading-relaxed text-slate-400">
                TrustMe decides whether money should move. Ralio safely moves it.
              </p>
              <span
                className={cn(
                  "mt-3 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
                  mode === "live"
                    ? "bg-emerald-500/10 text-emerald-300 ring-emerald-400/30"
                    : "bg-amber-500/10 text-amber-300 ring-amber-400/30",
                )}
              >
                <span className="size-1.5 rounded-full bg-current" />
                {mode === "live" ? "Live backend" : "Mock mode"}
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-white/5 p-2.5">
              <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-xs font-semibold text-white">
                {(user?.name ?? "FO").slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-white">{user?.name ?? "Finance ops"}</p>
                <p className="text-[11px] text-slate-400">Host · admin</p>
              </div>
              <button
                onClick={() => {
                  signOut();
                  navigate("/login");
                }}
                aria-label="Sign out"
                title="Sign out"
                className="grid size-7 place-items-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-5 py-6 sm:px-8">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  );
}
