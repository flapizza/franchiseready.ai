"use client";

import {
  BrainCircuit,
  Library,
  FileText,
  Home,
  SearchCheck,
  Settings,
  Users,
} from "lucide-react";

import { BrandLockup } from "@/feature/branding/components/BrandLockup";
import { APP_ROUTES } from "@/lib/auth/constants";

import { NavigationItem } from "./NavigationItem";

export function Sidebar() {
  return (
    <aside className="flex h-screen w-72 flex-col border-r border-slate-800 bg-slate-950 text-white">

      <div className="border-b border-slate-800 px-8 py-8">

        <BrandLockup theme="dark" />

      </div>

      <nav className="flex-1 space-y-2 p-5">

        <NavigationItem
          href={APP_ROUTES.missionControl}
          label="Mission Control"
          icon={<Home size={20} />}
          exactMatch
        />

        <NavigationItem
          href={APP_ROUTES.candidateIntelligence}
          label="Candidates"
          icon={<Users size={20} />}
          excludedSuffixes={["/strategy", "/presentation", "/referral"]}
        />

        <p className="px-4 pt-5 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-600">AI Workspaces</p>

        <NavigationItem
          href={APP_ROUTES.discoveryCopilot}
          label="Discovery Copilot"
          icon={<SearchCheck size={20} />}
          activeSuffixes={["/discovery"]}
        />

        <NavigationItem
          href={APP_ROUTES.brandStrategy}
          label="Brand Strategy"
          icon={<BrainCircuit size={20} />}
          activeSuffixes={["/strategy", "/presentation"]}
        />

        <NavigationItem
          href={APP_ROUTES.brandLibrary}
          label="Brand Library"
          icon={<Library size={20} />}
        />

        <NavigationItem
          href={APP_ROUTES.referralStudio}
          label="Referral Studio"
          icon={<FileText size={20} />}
          activeSuffixes={["/referral"]}
        />

        <div className="pt-5">
        <NavigationItem
          href={APP_ROUTES.settings}
          label="Settings"
          icon={<Settings size={20} />}
        />
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
            FranGroove AI is continuously monitoring candidate
            conversations, buying signals, brand alignment,
            and next best actions across your pipeline.
          </p>

        </div>

      </div>

    </aside>
  );
}
