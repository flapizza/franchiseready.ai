import {
  BrainCircuit,
  Briefcase,
  LayoutDashboard,
  Network,
  Presentation,
  Users,
} from "lucide-react";

import { Container } from "@/components/ui/container";

type PlatformCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

function PlatformCard({
  icon,
  title,
  description,
}: PlatformCardProps) {
  return (
    <div className="group rounded-3xl border border-border bg-surface p-8 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-2xl">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft">
        {icon}
      </div>

      <h3 className="mt-6 text-2xl font-bold text-ink">
        {title}
      </h3>

      <p className="mt-4 leading-8 text-muted">
        {description}
      </p>

    </div>
  );
}

export function PlatformOverview() {
  return (
    <section
      id="platform"
      className="bg-canvas py-28"
    >
      <Container>

        <div className="mx-auto max-w-4xl text-center">

          <p className="text-sm font-semibold uppercase tracking-[0.30em] text-brand">
            One Platform. Every Stage.
          </p>

          <h2 className="mt-6 text-5xl font-black tracking-tight text-ink">
            Everything a franchise consultant
            <br />
            needs in one intelligent workspace.
          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-muted">
            FranchiseReady AI combines candidate intelligence,
            Discovery meeting guidance, brand recommendations,
            CRM workflows, and automated referral packages into
            a single AI-powered platform.
          </p>

        </div>

        <div className="mt-20 grid gap-8 lg:grid-cols-3">

          <PlatformCard
            icon={
              <LayoutDashboard className="h-7 w-7 text-brand" />
            }
            title="Mission Control"
            description="Know exactly which candidates need your attention, what meetings are scheduled, and where every opportunity stands."
          />

          <PlatformCard
            icon={
              <Presentation className="h-7 w-7 text-brand" />
            }
            title="Discovery Copilot"
            description="Receive live AI guidance during Discovery meetings, including buying signals, suggested questions, and risk detection."
          />

          <PlatformCard
            icon={
              <Users className="h-7 w-7 text-brand" />
            }
            title="Candidate 360"
            description="View an executive-level summary of every candidate, including readiness, financial profile, buying confidence, and AI insights."
          />

          <PlatformCard
            icon={
              <BrainCircuit className="h-7 w-7 text-brand" />
            }
            title="AI Brand Strategy"
            description="Generate transparent brand recommendations backed by explainable AI reasoning and supporting evidence."
          />

          <PlatformCard
            icon={
              <Network className="h-7 w-7 text-brand" />
            }
            title="Candidate Intelligence Graph"
            description="Every assessment, meeting, and recommendation contributes to a living intelligence model that grows with every interaction."
          />

          <PlatformCard
            icon={
              <Briefcase className="h-7 w-7 text-brand" />
            }
            title="Referral Packages"
            description="Automatically generate professional candidate summaries that franchisors can immediately understand and act upon."
          />

        </div>

      </Container>
    </section>
  );
}