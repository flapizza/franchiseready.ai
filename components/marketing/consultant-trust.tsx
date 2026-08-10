import {
  Brain,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Container } from "@/components/ui/container";

function TrustCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-border bg-surface p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">

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

export function ConsultantTrust() {
  return (
    <section className="bg-surface py-20">

      <Container>

        <div className="mx-auto max-w-4xl text-center">

          <p className="text-sm font-semibold uppercase tracking-[0.30em] text-brand">
            Built Exclusively for Consultants
          </p>

          <h2 className="mt-6 text-5xl font-black tracking-tight text-ink">
            Independent Intelligence.
            <br />
            Consultant First.
          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-muted">
            FranchiseReady AI was built exclusively for professional franchise
            consultants. We intentionally do not license our recommendation
            engine to franchisors, ensuring every recommendation remains
            independent and focused entirely on candidate success.
          </p>

        </div>

        <div className="mt-20 grid gap-8 lg:grid-cols-3">

          <TrustCard
            icon={<ShieldCheck className="h-7 w-7 text-brand" />}
            title="Independent Recommendations"
            description="Recommendations cannot be influenced by sponsorships, paid placement, or brand participation. Every recommendation is based solely on candidate fit."
          />

          <TrustCard
            icon={<Users className="h-7 w-7 text-brand" />}
            title="Candidate First"
            description="Every assessment, Discovery meeting, and recommendation is designed to maximize the candidate's long-term success—not promote a particular franchise."
          />

          <TrustCard
            icon={<Brain className="h-7 w-7 text-brand" />}
            title="Explainable AI"
            description="Every recommendation includes transparent reasoning and supporting evidence so consultants understand exactly why a brand was recommended."
          />

        </div>

      </Container>

    </section>
  );
}