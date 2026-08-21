"use client";

import {
  Bot,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { demoConsultant } from "@/feature/demo/data/demoConsultant";

export function TopBar() {
  const pathname = usePathname();
  const context = pathname === "/crm/referrals"
    ? { eyebrow: "Consultant Workspace", title: "Referral Studio", description: "Manage candidates ready for referral preparation and introduction." }
    : /^\/crm\/candidates\/[^/]+\/playbook$/.test(pathname)
    ? { eyebrow: "Candidate Strategy", title: "Engagement Playbook", description: "Review evidence-backed next steps and choose what happens." }
    : pathname === "/crm/communications"
    ? { eyebrow: "Consultant Workspace", title: "Communications", description: "Review replies, engagement, delivery issues, and candidate follow-up." }
    : pathname === "/crm/team"
    ? { eyebrow: "Leadership Workspace", title: "Team Mission Control", description: "See candidate momentum, consultant execution, and the interventions that matter now." }
    : pathname === "/crm/calendar"
    ? { eyebrow: "Consultant Workspace", title: "Calendar", description: "Prepare for meetings and protect follow-through." }
    : pathname === "/crm/strategy"
    ? { eyebrow: "AI Workspace", title: "Brand Strategy", description: "Open the candidates ready for evidence-backed brand evaluation." }
    : pathname === "/crm/discovery"
    ? { eyebrow: "AI Workspace", title: "Discovery Copilot", description: "Continue Discovery with candidates who are ready for evidence validation." }
    : /^\/crm\/candidates\/[^/]+\/referral$/.test(pathname)
    ? { eyebrow: "Referral Studio", title: "Referral Studio", description: "Prepare, review, and approve franchisor introductions." }
    : /^\/crm\/candidates\/[^/]+\/strategy$/.test(pathname)
    ? { eyebrow: "AI Brand Strategy", title: "Brand Strategy", description: "Evaluate candidate-brand fit, presentation order, and readiness for introduction." }
    : pathname === "/crm"
    ? { eyebrow: "Mission Control", title: `Welcome back, ${demoConsultant.firstName}.`, description: "Your AI team has prioritized the candidates and actions that deserve attention today." }
    : pathname === "/crm/candidates/new"
      ? { eyebrow: "Candidate Intake", title: "New Candidate", description: "Create the relationship first, then invite the candidate to complete their assessment." }
      : pathname === "/crm/candidates"
        ? { eyebrow: "Candidate CRM", title: "Candidates", description: "Manage candidate progress, assessment status, and next actions." }
        : /^\/crm\/candidates\/[^/]+$/.test(pathname)
          ? { eyebrow: "Candidate 360", title: "Candidate Workspace", description: "Review candidate context, intelligence, activity, and recommended next actions." }
          : /^\/crm\/[^/]+\/discovery$/.test(pathname)
            ? { eyebrow: "Discovery Copilot", title: "Discovery", description: "Validate ownership goals, risks, and evidence before Brand Strategy." }
            : /^\/crm\/[^/]+\/briefing$/.test(pathname)
              ? { eyebrow: "Consultant Briefing", title: "Meeting Brief", description: "Prepare candidate context, objectives, and conversation guidance." }
        : { eyebrow: "FranGroove Workspace", title: `Welcome back, ${demoConsultant.firstName}.`, description: "Your consultant workspace is ready." };
  return (
    <header data-app-topbar className="z-20 shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur">

      <div className="flex h-24 items-center justify-between px-8">

        <div className="flex items-center gap-8">

          <div>

            <div className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-600">
              {context.eyebrow}
            </div>

            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">
              {context.title}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {context.description}
            </p>

          </div>

        </div>

        <div className="flex items-center gap-4">

          <Link href="/crm/candidates/new" className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800">

            <Plus size={18} />

            New Candidate

          </Link>

          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">

            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />

            <Bot
              size={16}
              className="text-emerald-600"
            />

            <span className="text-sm font-semibold text-emerald-700">
              AI Active
            </span>

          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm">

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-slate-900 to-slate-700 font-bold text-white">
              {demoConsultant.initials}
            </div>

            <div>

              <div className="font-semibold text-slate-900">
                {demoConsultant.displayName}
              </div>

              <div className="text-sm text-slate-500">
                {demoConsultant.title}
              </div>

            </div>

          </div>

        </div>

      </div>

    </header>
  );
}
