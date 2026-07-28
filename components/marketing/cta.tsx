import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";

type CtaProps = { title?: string; description?: string; href?: string; label?: string };
export function Cta({ title = "Ready to Find Your Ideal Franchise?", description = "Begin with the insights that make every next step more intentional.", href = "#assessment", label = "Start Your Free Assessment" }: CtaProps) {
  return <section id="assessment" className="bg-canvas py-16 sm:py-20 lg:py-28"><Container><div className="overflow-hidden rounded-3xl bg-ink px-6 py-12 text-center sm:px-12 sm:py-16"><p className="text-sm font-semibold text-brand-light">Your franchise journey starts here</p><h2 className="mx-auto mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">{title}</h2><p className="mx-auto mt-4 max-w-xl text-base leading-7 text-white/70">{description}</p><Link href={href} className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-ink">{label}<ArrowRight aria-hidden="true" className="size-4" /></Link></div></Container></section>;
}
