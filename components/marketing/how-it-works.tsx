import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";

type Step = { title: string; description: string };
type HowItWorksProps = { eyebrow?: string; title?: string; steps?: Step[] };
const defaultSteps: Step[] = [
  { title: "Assess", description: "Share the goals, experience, and priorities that shape your ideal opportunity." },
  { title: "Analyze", description: "See a thoughtful readiness profile that reveals what matters most." },
  { title: "Match", description: "Explore franchise opportunities aligned to your specific profile." },
  { title: "Launch", description: "Move ahead with an expert-informed plan and greater confidence." },
];

export function HowItWorks({ eyebrow = "A guided experience", title = "From first question to next step.", steps = defaultSteps }: HowItWorksProps) {
  return <section className="bg-canvas py-16 sm:py-20 lg:py-28"><Container><div className="flex max-w-2xl flex-col gap-3"><p className="text-sm font-semibold text-brand">{eyebrow}</p><h2 className="text-3xl font-semibold tracking-[-0.035em] text-ink sm:text-4xl">{title}</h2></div><ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">{steps.map((step, index) => <li key={step.title} className="relative rounded-2xl border border-border bg-surface p-6"><span className="text-sm font-semibold text-brand">0{index + 1}</span>{index < steps.length - 1 && <ArrowRight aria-hidden="true" className="absolute right-[-18px] top-9 z-10 hidden size-5 rounded-full bg-canvas p-1 text-border lg:block" />}<h3 className="mt-7 text-lg font-semibold text-ink">{step.title}</h3><p className="mt-2 text-sm leading-6 text-muted">{step.description}</p></li>)}</ol></Container></section>;
}
