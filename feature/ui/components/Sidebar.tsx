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

import { BrandLockup } from "@/feature/branding/components/BrandLockup";
import { APP_ROUTES } from "@/lib/auth/constants";

const navigation = [
  {
    label: "Mission Control",
    href: APP_ROUTES.missionControl,
    icon: Home,
  },
  {
    label: "Candidate Intelligence",
    href: APP_ROUTES.candidateIntelligence,
    icon: Users,
  },
  {
    label: "Discovery Copilot",
    href: APP_ROUTES.discoveryCopilot,
    icon: ClipboardList,
  },
  {
    label: "Brand Strategy",
    href: APP_ROUTES.brandStrategy,
    icon: BrainCircuit,
  },
  {
    label: "Referral Studio",
    href: APP_ROUTES.referralStudio,
    icon: FileText,
  },
  {
    label: "Insights",
    href: APP_ROUTES.insights,
    icon: BarChart3,
  },
];

export function Sidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-800 bg-slate-950 lg:flex lg:flex-col">

      <div className="border-b border-slate-800 px-8 py-8">

        <BrandLockup theme="dark" />

      </div>

      <nav className="flex-1 px-4 py-6">

        <div className="space-y-2">

          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-4 rounded-2xl px-4 py-3 text-slate-300 transition-all duration-200 hover:bg-slate-900 hover:text-white"
              >
                <Icon className="h-5 w-5 text-slate-400 transition-colors group-hover:text-teal-400" />

                <span className="font-medium">
                  {item.label}
                </span>
              </Link>
            );
          })}

        </div>

      </nav>

      <div className="border-t border-slate-800 p-6">

        <div className="rounded-2xl border border-teal-500/10 bg-gradient-to-br from-slate-900 to-slate-950 p-5">

          <div className="flex items-center gap-3">

            <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />

            <span className="text-sm font-semibold text-emerald-300">
              AI Copilot Active
            </span>

          </div>

          <p className="mt-4 text-sm leading-7 text-slate-400">
            FranGroove AI is continuously analyzing candidate
            conversations, buying signals, brand alignment,
            and next best actions to help you move every
            opportunity forward.
          </p>

        </div>

        <button
          type="button"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-teal-500/40 hover:bg-slate-900 hover:text-white"
        >
          <Settings className="h-4 w-4" />

          Settings

        </button>

      </div>

    </aside>
  );
}
