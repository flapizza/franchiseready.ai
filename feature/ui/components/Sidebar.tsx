import Link from "next/link";

import {
  BarChart3,
  BrainCircuit,
  ClipboardList,
  FileText,
  Home,
  Settings,
  Users,
} from "lucide-react";

const navigation = [
  {
    label: "Mission Control",
    href: "/crm",
    icon: Home,
  },
  {
    label: "Candidates",
    href: "/crm/candidates",
    icon: Users,
  },
  {
    label: "Discovery",
    href: "/crm/discovery",
    icon: ClipboardList,
  },
  {
    label: "Brand Strategy",
    href: "/crm/brand-strategy",
    icon: BrainCircuit,
  },
  {
    label: "Referral Packages",
    href: "/crm/referrals",
    icon: FileText,
  },
  {
    label: "Analytics",
    href: "/crm/analytics",
    icon: BarChart3,
  },
];

export function Sidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-slate-950 lg:flex lg:flex-col">

      <div className="border-b border-slate-800 px-8 py-8">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-lg font-black text-white">
            F
          </div>

          <div>

            <div className="text-lg font-bold text-white">
              FranchiseReady AI
            </div>

            <div className="text-sm text-slate-400">
              Consultant Workspace
            </div>

          </div>

        </div>

      </div>

      <nav className="flex-1 px-4 py-6">

        <div className="space-y-2">

          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-4 rounded-2xl px-4 py-3 text-slate-300 transition-all hover:bg-slate-900 hover:text-white"
              >
                <Icon className="h-5 w-5" />

                <span className="font-medium">
                  {item.label}
                </span>
              </Link>
            );
          })}

        </div>

      </nav>

      <div className="border-t border-slate-800 p-6">

        <div className="rounded-2xl bg-blue-600/10 p-5">

          <div className="flex items-center gap-3">

            <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />

            <span className="text-sm font-semibold text-emerald-300">
              AI Systems Online
            </span>

          </div>

          <p className="mt-4 text-sm leading-6 text-slate-400">
            Mission Control is continuously monitoring candidate
            activity and updating recommendations.
          </p>

        </div>

        <button
          type="button"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-900"
        >
          <Settings className="h-4 w-4" />

          Settings

        </button>

      </div>

    </aside>
  );
}