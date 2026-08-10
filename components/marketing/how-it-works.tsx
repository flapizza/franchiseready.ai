import { ArrowDown } from "lucide-react";

import { Container } from "@/components/ui/container";

type Step = {
  title: string;
  description: string;
};

type Props = {
  eyebrow: string;
  title: string;
  steps: Step[];
};

function StepCard({
  index,
  step,
}: {
  index: number;
  step: Step;
}) {
  return (
    <div className="relative">

      <div className="flex items-start gap-6">

        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-xl font-black text-white">
          {index + 1}
        </div>

        <div>

          <h3 className="text-2xl font-bold text-ink">
            {step.title}
          </h3>

          <p className="mt-3 max-w-2xl leading-8 text-muted">
            {step.description}
          </p>

        </div>

      </div>

      {index < 3 && (
        <div className="ml-6 mt-8 flex justify-center">
          <ArrowDown className="h-8 w-8 text-brand/40" />
        </div>
      )}

    </div>
  );
}

export function HowItWorks({
  eyebrow,
  title,
  steps,
}: Props) {
  return (
    <section
  id="workflow"
  className="bg-surface py-24"
>

      <Container>

        <div className="mx-auto max-w-4xl text-center">

          <p className="text-sm font-semibold uppercase tracking-[0.30em] text-brand">
            {eyebrow}
          </p>

          <h2 className="mt-6 text-5xl font-black tracking-tight text-ink">
            {title}
          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-muted">
            FranchiseReady AI follows the same workflow professional franchise
            consultants use every day—only faster, smarter, and supported by
            transparent AI.
          </p>

        </div>

        <div className="mx-auto mt-24 max-w-5xl space-y-12">

          {steps.map((step, index) => (
            <StepCard
              key={step.title}
              index={index}
              step={step}
            />
          ))}

        </div>

      </Container>

    </section>
  );
}