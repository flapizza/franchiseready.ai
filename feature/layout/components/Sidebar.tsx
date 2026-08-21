"use client";

import {
  BrainCircuit,
  Library,
  FileText,
  Home,
  SearchCheck,
  Settings,
  ListTodo,
  CalendarDays,
  Users,
  Network,
  MessagesSquare,
} from "lucide-react";

import { BrandLockup } from "@/feature/branding/components/BrandLockup";
import { APP_ROUTES } from "@/lib/auth/constants";

import { NavigationItem } from "./NavigationItem";
import { demoTeamViewer } from "@/feature/team-mission-control/repositories/DemoTeamOperationsRepository";
import { roleHasCapability } from "@/feature/identity/auth/capabilities";

export function Sidebar() {
  return (
    <aside data-app-sidebar className="flex h-full min-h-0 w-72 flex-col overflow-hidden border-r border-slate-800 bg-slate-950 text-white">

      <div className="border-b border-slate-800 px-8 py-5 [@media(min-height:900px)]:py-8">

        <BrandLockup theme="dark" />

      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-4 [@media(min-height:900px)]:space-y-2 [@media(min-height:900px)]:p-5">

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

        {roleHasCapability(demoTeamViewer.role, "hierarchy:view_descendants") && <NavigationItem
          href={APP_ROUTES.teamMissionControl}
          label="Team Command Center"
          icon={<Network size={20} />}
          exactMatch
        />}

        <NavigationItem
          href={APP_ROUTES.tasks}
          label="Tasks"
          icon={<ListTodo size={20} />}
          exactMatch
        />

        <NavigationItem href={APP_ROUTES.calendar} label="Calendar" icon={<CalendarDays size={20} />} exactMatch />

        <NavigationItem href={APP_ROUTES.communications} label="Communications" icon={<MessagesSquare size={20} />} exactMatch />

        <p className="px-4 pt-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-600 [@media(min-height:900px)]:pt-5">AI Workspaces</p>

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

        <div className="pt-3 [@media(min-height:900px)]:pt-5">
        <NavigationItem
          href={APP_ROUTES.settings}
          label="Settings"
          icon={<Settings size={20} />}
        />
        </div>

      </nav>

      <div className="hidden shrink-0 border-t border-slate-800 p-4 [@media(min-height:900px)]:block">

        <div className="rounded-2xl border border-teal-500/10 bg-gradient-to-br from-slate-900 to-slate-950 p-3 [@media(min-height:900px)]:p-4">

          <div className="flex items-center gap-3">

            <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />

            <span className="text-sm font-semibold text-emerald-300">
              AI Copilot Active
            </span>

          </div>

          <p className="mt-4 hidden text-sm leading-7 text-slate-400 [@media(min-height:1050px)]:block">
            FranGroove AI is continuously monitoring candidate
            conversations, buying signals, brand alignment,
            and next best actions across your pipeline.
          </p>

        </div>

      </div>

    </aside>
  );
}
