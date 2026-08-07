"use client";

import {
  BarChart3,
  Brain,
  Briefcase,
  FileText,
  Home,
  Settings,
  Target,
  Users,
} from "lucide-react";

import { NavigationItem } from "./NavigationItem";

export function Sidebar() {
  return (
    <aside className="flex h-screen w-72 flex-col border-r border-slate-800 bg-slate-950 text-white">

      <div className="border-b border-slate-800 px-8 py-8">

        <div className="text-3xl font-black tracking-tight">
          FranchiseReady
        </div>

        <div className="mt-1 text-sm text-slate-400">
          AI Consultant OS
        </div>

      </div>

      <nav className="flex-1 space-y-2 p-5">

        <NavigationItem
          href="/mission-control"
          label="Mission Control"
          icon={<Home size={20} />}
        />

        <NavigationItem
          href="/crm"
          label="Candidates"
          icon={<Users size={20} />}
        />

        <NavigationItem
          href="/crm/pipeline"
          label="Discovery"
          icon={<Brain size={20} />}
        />

        <NavigationItem
          href="/crm/brands"
          label="Brand Strategy"
          icon={<Target size={20} />}
        />

        <NavigationItem
          href="/crm/reports"
          label="Introductions"
          icon={<Briefcase size={20} />}
        />

        <NavigationItem
          href="/crm/tasks"
          label="Reports"
          icon={<FileText size={20} />}
        />

        <NavigationItem
          href="/workbench"
          label="AI Workbench"
          icon={<BarChart3 size={20} />}
        />

        <NavigationItem
          href="/settings/profile"
          label="Settings"
          icon={<Settings size={20} />}
        />

      </nav>

      <div className="border-t border-slate-800 p-6">

        <div className="rounded-2xl bg-slate-900 p-5">

          <div className="text-xs uppercase tracking-widest text-slate-400">
            AI Status
          </div>

          <div className="mt-3 text-4xl font-black text-emerald-400">
            96%
          </div>

          <div className="mt-2 text-sm text-slate-400">
            All systems synchronized.
          </div>

        </div>

      </div>

    </aside>
  );
}