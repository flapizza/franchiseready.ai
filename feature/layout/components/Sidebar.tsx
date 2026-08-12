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

import { BrandLockup } from "@/feature/branding/components/BrandLockup";

import { NavigationItem } from "./NavigationItem";

export function Sidebar() {
  return (
    <aside className="flex h-screen w-72 flex-col border-r border-slate-800 bg-slate-950 text-white">

      <div className="border-b border-slate-800 px-8 py-8">

        <BrandLockup theme="dark" />

      </div>

      <nav className="flex-1 space-y-2 p-5">

        <NavigationItem
          href="/mission-control"
          label="Mission Control"
          icon={<Home size={20} />}
        />

        <NavigationItem
          href="/crm"
          label="Candidate Intelligence"
          icon={<Users size={20} />}
        />

        <NavigationItem
          href="/crm/pipeline"
          label="Discovery Copilot"
          icon={<Brain size={20} />}
        />

        <NavigationItem
          href="/crm/brands"
          label="Brand Strategy"
          icon={<Target size={20} />}
        />

        <NavigationItem
          href="/crm/reports"
          label="Referral Studio"
          icon={<Briefcase size={20} />}
        />

        <NavigationItem
          href="/crm/tasks"
          label="Insights"
          icon={<FileText size={20} />}
        />

        <NavigationItem
          href="/workbench"
          label="AI Studio"
          icon={<BarChart3 size={20} />}
        />

        <NavigationItem
          href="/settings/profile"
          label="Settings"
          icon={<Settings size={20} />}
        />

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
            FranGroove AI is continuously monitoring candidate
            conversations, buying signals, brand alignment,
            and next best actions across your pipeline.
          </p>

        </div>

      </div>

    </aside>
  );
}