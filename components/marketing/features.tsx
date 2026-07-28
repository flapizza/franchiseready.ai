import { BrainCircuit, Handshake, Radar, TrendingUp } from "lucide-react";
import { Container } from "@/components/ui/container";

type Feature = { title: string; description: string; icon: typeof BrainCircuit };
type FeaturesProps = { eyebrow?: string; title?: string; description?: string; items?: Feature[] };

const defaultItems: Feature[] = [
  { title: "AI Readiness™", description: "Measure your franchise ownership readiness with a clearer, more complete profile.", icon: BrainCircuit },
  { title: "Smart Matching™", description: "Find franchise brands that align with your financial, lifestyle, and leadership goals.", icon: Radar },
  { title: "Consultant Network™", description: "Connect with experienced franchise consultants when expert context matters most.", icon: Handshake },
  { title: "Predictive Insights™", description: "Understand strengths, risks, and opportunities before making a significant investment.", icon: TrendingUp },
];

export function Features({ eyebrow = "Intelligence for every decision", title = "Move forward with more certainty.", description = "A connected platform designed to make franchise discovery more focused, personal, and informed.", items = defaultItems }: FeaturesProps) {
  return <section className="bg-surface py-16 sm:py-20 lg:py-28"><Container><div className="max-w-2xl"><p className="text-sm font-semibold text-brand">{eyebrow}</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-ink sm:text-4xl">{title}</h2><p className="mt-4 text-base leading-7 text-muted">{description}</p></div><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">{items.map(({ title: featureTitle, description: featureDescription, icon: Icon }) => <article key={featureTitle} className="group rounded-2xl border border-border bg-canvas p-6 transition-shadow hover:shadow-[0_16px_40px_var(--shadow-color)]"><div className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand"><Icon aria-hidden="true" className="size-5" /></div><h3 className="mt-5 text-base font-semibold text-ink">{featureTitle}</h3><p className="mt-2 text-sm leading-6 text-muted">{featureDescription}</p></article>)}</div></Container></section>;
}
