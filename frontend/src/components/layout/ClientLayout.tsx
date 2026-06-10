import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut, PlusCircle, ScrollText } from "lucide-react";
import { cn } from "@/lib/cn";
import { useSession } from "@/store/session";
import { Toaster } from "@/components/ui/Toaster";

const NAV = [
  { to: "/", label: "New request", icon: PlusCircle, end: true },
  { to: "/requests", label: "My requests", icon: ScrollText, end: false },
];

/** Client portal shell — light, friendly, Apple-clean. */
export function ClientLayout() {
  const { user, signOut } = useSession();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.avif"
              alt="TrustMe"
              className="size-8 rounded-xl object-cover shadow-md shadow-blue-500/20"
            />
            <span className="text-sm font-semibold tracking-tight">TrustMe</span>
          </div>

          <nav className="flex items-center gap-1">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
                  )
                }
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
            <div className="ml-2 flex items-center gap-2 border-l border-slate-200 pl-3">
              <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-xs font-semibold text-white">
                {(user?.name ?? "Me").slice(0, 2).toUpperCase()}
              </span>
              <button
                onClick={() => {
                  signOut();
                  navigate("/login");
                }}
                aria-label="Sign out"
                title="Sign out"
                className="grid size-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}
