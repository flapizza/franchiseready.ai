import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";

type HeroProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

function DashboardPreview() {
  return (
    <div aria-label="Assessment dashboard preview" className="relative mx-auto w-full max-w-xl" role="img">
      <div className="absolute -inset-4 -z-10 rounded-[2.25rem] bg-brand-soft/70 blur-2xl" />
      <div className="overflow-hidden rounded-2xl border border-border bg-surface p-3 shadow-[0_24px_70px_var(--shadow-color)] sm:p-5">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-brand" /><span className="text-xs font-semibold text-ink">Your readiness overview</span></div>
          <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[10px] font-bold tracking-wide text-brand">IN PROGRESS</span>
        </div>
        <div className="grid gap-3 pt-4 sm:grid-cols-[1.12fr_.88fr]">
          <div className="rounded-xl border border-border bg-muted-surface p-4">
            <p className="text-xs font-medium text-muted">Franchise readiness</p>
            <div className="mt-4 flex items-end justify-between"><div><p className="text-4xl font-semibold tracking-tight text-ink">82<span className="text-lg text-muted">/100</span></p><p className="mt-1 text-xs font-medium text-brand">Strong fit signal</p></div><div className="grid size-15 place-items-center rounded-full border-[6px] border-brand border-r-brand-soft"><span className="text-xs font-bold text-ink">82%</span></div></div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs font-medium text-muted">Next best step</p>
            <div className="mt-4 rounded-lg bg-brand-soft p-3"><Sparkles aria-hidden="true" className="size-4 text-brand" /><p className="mt-2 text-xs font-semibold leading-5 text-ink">Compare your top three franchise matches.</p></div>
          </div>
        </div>
        <div className="mt-3 rounded-xl border border-border bg-surface p-4"><div className="flex items-center justify-between"><p className="text-xs font-semibold text-ink">Profile strengths</p><p className="text-xs text-muted">3 of 4 complete</p></div><div className="mt-3 space-y-2">{["Financial readiness", "Leadership experience", "Lifestyle alignment"].map((item, index) => <div key={item} className="flex items-center gap-2 text-xs text-muted"><CheckCircle2 aria-hidden="true" className="size-3.5 text-brand" /><span>{item}</span><span className={`ml-auto h-1.5 rounded-full bg-brand ${index === 1 ? "w-14" : "w-20"}`} /></div>)}</div></div>
      </div>
      <div className="absolute -bottom-5 -left-5 hidden rounded-xl border border-border bg-surface px-4 py-3 shadow-lg sm:block"><p className="text-[10px] font-semibold uppercase tracking-[.12em] text-muted">Top match</p><p className="mt-1 text-sm font-semibold text-ink">Aligned opportunities</p></div>
    </div>
  );
}

export function Hero({
  eyebrow = "A clearer path to franchise ownership",
  title = "Discover the Right Franchise Before You Invest.",
  description = "AI-powered franchise readiness assessments, intelligent franchise matching, and expert guidance that help entrepreneurs confidently choose the right franchise.",
  primaryCta = { label: "Start Your Free Assessment", href: "#assessment" },
  secondaryCta = { label: "For Consultants", href: "#consultants" },
}: HeroProps) {
  return <section className="overflow-hidden bg-canvas py-16 sm:py-20 lg:py-28"><Container><div className="grid items-center gap-14 lg:grid-cols-[.96fr_1.04fr] lg:gap-16"><div className="max-w-2xl"><p className="inline-flex items-center gap-2 rounded-full border border-brand/15 bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand"><Sparkles aria-hidden="true" className="size-3.5" />{eyebrow}</p><h1 className="mt-6 text-4xl font-semibold tracking-[-0.045em] text-ink sm:text-5xl sm:leading-[1.08] lg:text-6xl">{title}</h1><p className="mt-6 max-w-xl text-base leading-7 text-muted sm:text-lg sm:leading-8">{description}</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href={primaryCta.href} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-brand-foreground shadow-sm transition-colors hover:bg-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 focus-visible:ring-offset-canvas">{primaryCta.label}<ArrowRight aria-hidden="true" className="size-4" /></Link><Link href={secondaryCta.href} className="inline-flex min-h-12 items-center justify-center rounded-lg border border-border bg-surface px-5 text-sm font-semibold text-ink transition-colors hover:bg-muted-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 focus-visible:ring-offset-canvas">{secondaryCta.label}</Link></div><p className="mt-5 text-xs text-muted">No obligation. Start with a clear view of your readiness.</p></div><DashboardPreview /></div></Container></section>;
}
