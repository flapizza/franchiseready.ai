import Link from "next/link";
import { AlertTriangle, ArrowLeft, BookOpenCheck, CheckCircle2, CircleHelp, ExternalLink } from "lucide-react";
import type { ConsultantSignal, DiligenceGap, ProfileReadinessState } from "../models/ConsultantBrandIntelligence";
import type { BrandEvidence, BrandFact, BrandIntelligenceProfile } from "../models/BrandIntelligenceProfile";

const readinessLabels: Record<ProfileReadinessState, string> = {
  "core-intelligence-available": "Core intelligence available",
  "developing-profile": "Developing profile",
  "limited-intelligence": "Limited intelligence",
  "not-reviewed": "Not reviewed",
};
const humanize = (value: string) => value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const money = (value: number) => value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function BrandProfileWorkspace({ profile }: { profile: BrandIntelligenceProfile }) {
  const intelligence = profile.consultantIntelligence;

  return <main className="space-y-7">
    <Link href="/crm/brands" className="inline-flex items-center gap-2 text-sm font-black text-slate-500 hover:text-teal-700"><ArrowLeft size={16}/>Brand Intelligence</Link>
    <header className="overflow-hidden rounded-3xl bg-slate-950 p-7 text-white shadow-xl sm:p-9">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="max-w-3xl">
          <div className="flex flex-wrap gap-2"><Pill>{profile.category.value ?? "Category unknown"}</Pill><Pill>{profile.demoClassification === "curated-demo-concept" ? "Curated demo concept" : "Existing demo profile"}</Pill></div>
          <h1 className="mt-5 text-4xl font-black tracking-tight">{profile.name}</h1>
          <p className="mt-4 text-base leading-7 text-slate-300">{profile.description.value ?? "No reviewed description is available."}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-black uppercase tracking-wider text-teal-300">Profile readiness</p>
          <p className="mt-2 text-xl font-black">{readinessLabels[intelligence.readiness.state]}</p>
          <p className="mt-2 text-xs leading-5 text-slate-300">{intelligence.readiness.rationale}</p>
          <p className="mt-3 border-t border-white/10 pt-3 text-xs leading-5 text-slate-400">{profile.completeness.knownFields} of {profile.completeness.totalFields} core facts known · {profile.completeness.verifiedFields} verified</p>
        </div>
      </div>
    </header>

    <section aria-labelledby="business-summary" className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-6 shadow-sm sm:p-7">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">Consultant Intelligence</p>
      <h2 id="business-summary" className="mt-1 text-2xl font-black text-slate-950">What this business actually does</h2>
      <p className="mt-4 max-w-4xl text-base leading-7 text-slate-700">{intelligence.businessSummary.value ?? "There isn't enough verified information yet to explain this business clearly."}</p>
      <p className="mt-4 text-xs text-slate-500">Based on current Brand Intelligence · {intelligence.businessSummary.verification === "verified" ? "Verified" : "Not yet independently verified"}</p>
    </section>

    <section aria-label="Consultant interpretation" className="grid gap-5 xl:grid-cols-3">
      <SignalPanel title="What the franchisee does" intro="Where the owner is likely to spend time and attention." signals={intelligence.franchiseeRole}/>
      <SignalPanel title="Strong fit indicators" intro="Practical traits to explore with a candidate." signals={intelligence.strongFit}/>
      <SignalPanel title="Potential friction" intro="Parts of the role that may conflict with a candidate's preferences." signals={intelligence.potentialFriction}/>
    </section>

    <section aria-label="Decision summary" className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">Decision-useful facts</p>
        <h2 className="mt-1 text-2xl font-black text-slate-950">Business at a glance</h2>
        <FactGrid compact items={intelligence.businessAtAGlance.map((item) => [item.label, item.fact])}/>
      </section>
      <DiligencePanel gaps={intelligence.diligenceGaps}/>
    </section>

    <aside className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950"><AlertTriangle className="mt-0.5 shrink-0" size={18}/><p><strong>Consultant decision support—not a purchase recommendation.</strong> Brand-fit signals organize discovery and comparison. They do not guarantee candidate success, qualification, availability, or franchise performance.</p></aside>

    <section className="rounded-2xl border border-slate-300 bg-slate-100 p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-600">Detailed Brand Intelligence record</p>
      <p className="mt-2 text-sm text-slate-600">Known demo facts below remain unverified unless explicitly marked verified. Unknown facts are shown separately and the evidence ledger records why each value exists.</p>
    </section>

    <Section eyebrow="Business architecture" title="How this business operates"><FactGrid items={[
      ["Customer model", profile.characteristics.customerModel], ["Business type", profile.characteristics.businessType], ["Operating environment", profile.characteristics.operatingLocations],
      ["Owner-operator", profile.characteristics.ownerOperatorSuitability], ["Semi-absentee", profile.characteristics.semiAbsenteeSuitability], ["Executive / manager-run", profile.characteristics.executiveSuitability],
      ["Staffing intensity", profile.characteristics.staffingIntensity], ["Sales intensity", profile.characteristics.salesIntensity], ["Operational complexity", profile.characteristics.operationalComplexity],
      ["Customer acquisition", profile.characteristics.customerAcquisitionModel], ["Recurring revenue", profile.characteristics.recurringRevenue], ["Location dependence", profile.characteristics.locationDependence], ["Territory model", profile.characteristics.territoryModel],
    ]}/></Section>
    <Section eyebrow="Qualification context" title="Franchise economics"><FactGrid items={[
      ["Estimated initial investment", profile.economics.initialInvestment], ["Franchise fee", profile.economics.franchiseFee], ["Minimum liquid capital", profile.economics.minimumLiquidCapital],
      ["Minimum net worth", profile.economics.minimumNetWorth], ["Royalty structure", profile.economics.royalty], ["Marketing / brand fund", profile.economics.marketingFund], ["Other recurring fees", profile.economics.otherRecurringFees],
    ]}/></Section>
    <Section eyebrow="Explainable matching foundation" title="Candidate-fit signals"><FactGrid items={[
      ["Leadership", profile.fit.leadership], ["Sales comfort", profile.fit.salesComfort], ["Networking / business development", profile.fit.networkingBusinessDevelopment], ["Operational management", profile.fit.operationalManagement],
      ["People management", profile.fit.peopleManagement], ["Analytical aptitude", profile.fit.analyticalAptitude], ["Relationship building", profile.fit.relationshipBuilding], ["Community orientation", profile.fit.communityOrientation],
      ["Desired lifestyle", profile.fit.desiredLifestyle], ["Time commitment", profile.fit.timeCommitment], ["Financial suitability", profile.fit.financialSuitability], ["Prior industry experience", profile.fit.priorIndustryExperience],
    ]}/></Section>
    <Section eyebrow="Franchisor enablement" title="Training and support"><FactGrid items={[
      ["Initial training", profile.support.initialTraining], ["Ongoing support", profile.support.ongoingSupport], ["Marketing support", profile.support.marketingSupport], ["Sales support", profile.support.salesSupport], ["Technology / platform", profile.support.technologySupport], ["Field support", profile.support.fieldSupport],
    ]}/></Section>
    <Section eyebrow="System context" title="Scale, geography, and maturity"><FactGrid items={[["Approximate system size", profile.system.approximateSize], ["Company / franchise unit mix", profile.system.unitMix], ["Geography", profile.system.geography], ["Growth / maturity", profile.system.maturity]]}/></Section>
    <section className="grid gap-5 lg:grid-cols-2"><ListPanel title="Differentiators to explore" fact={profile.differentiators}/><ListPanel title="Considerations to validate" fact={profile.considerations}/><ListPanel title="Consultant discovery questions" fact={profile.discoveryQuestions}/><MissingPanel profile={profile}/></section>
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><BookOpenCheck className="text-teal-700"/><div><p className="text-xs font-black uppercase tracking-wider text-teal-700">Evidence ledger</p><h2 className="text-2xl font-black">Why FranGroove believes these facts</h2></div></div><p className="mt-3 text-sm text-slate-600">Evidence entries identify origin and review state. A source label does not imply external verification.</p><div className="mt-5 grid gap-3 md:grid-cols-2">{profile.evidence.map((item) => <EvidenceCard key={item.id} evidence={item}/>)}</div></section>
  </main>;
}

function Pill({ children }: { children: React.ReactNode }) { return <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-teal-100">{children}</span>; }
function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) { return <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">{eyebrow}</p><h2 className="mt-1 text-2xl font-black text-slate-950">{title}</h2><div className="mt-5">{children}</div></section>; }
function SignalPanel({ title, intro, signals }: { title: string; intro: string; signals: ConsultantSignal[] }) { return <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-black text-slate-950">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{intro}</p>{signals.length ? <ul className="mt-4 space-y-4">{signals.map((signal) => <li key={signal.label}><p className="text-sm font-black text-slate-900">{signal.label}</p><p className="mt-1 text-xs leading-5 text-slate-600">{signal.explanation}</p></li>)}</ul> : <p className="mt-4 text-sm font-bold text-slate-400">Unknown — insufficient reviewed facts.</p>}</section>; }
function DiligencePanel({ gaps }: { gaps: DiligenceGap[] }) { return <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Before serious presentation</p><h2 className="mt-1 text-2xl font-black text-amber-950">Key diligence gaps</h2><ul className="mt-4 space-y-3">{gaps.map((gap) => <li key={gap.sourceFact} className="rounded-xl bg-white/80 p-3 ring-1 ring-amber-200"><div className="flex items-center justify-between gap-2"><p className="text-sm font-black text-slate-900">{gap.label}</p><span className="text-[10px] font-black uppercase text-amber-700">{gap.state}</span></div><p className="mt-1 text-xs leading-5 text-slate-600">{gap.reason}</p></li>)}</ul></section>; }
function FactGrid({ items, compact = false }: { items: [string, BrandFact<unknown>][], compact?: boolean }) { return <dl className={`mt-5 grid gap-3 sm:grid-cols-2 ${compact ? "" : "xl:grid-cols-4"}`}>{items.map(([label, fact]) => <FactCard key={label} label={label} fact={fact}/>)}</dl>; }
function FactCard({ label, fact }: { label: string; fact: BrandFact<unknown> }) { const known = fact.value !== null; return <div className={`rounded-xl border p-4 ${known ? "border-slate-200 bg-slate-50" : "border-dashed border-slate-300 bg-white"}`}><dt className="text-[10px] font-black uppercase tracking-wide text-slate-400">{label}</dt><dd className={`mt-1 text-sm font-bold ${known ? "text-slate-900" : "text-slate-400"}`}>{formatValue(fact.value)}</dd>{fact.verification === "verified" && <dd className="mt-3 flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700"><CheckCircle2 size={12}/>Verified</dd>}{!known && <dd className="mt-3 flex items-center gap-1 text-[10px] font-black uppercase text-slate-500"><CircleHelp size={12}/>Unknown</dd>}</div>; }
function formatValue(value: unknown): string { if (value === null) return "Unknown — not yet reviewed"; if (typeof value === "boolean") return value ? "Yes" : "No"; if (typeof value === "number") return money(value); if (Array.isArray(value)) return value.length > 0 ? value.map((item) => typeof item === "string" && /^[a-z]+(?:-[a-z]+)*$/.test(item) ? humanize(item) : String(item)).join(" · ") : "None recorded"; if (typeof value === "object" && value && "minimum" in value && "maximum" in value) { const minimum=(value as {minimum:unknown}).minimum; const maximum=(value as {maximum:unknown}).maximum; return typeof minimum === "number" && typeof maximum === "number" ? `${money(minimum)}–${money(maximum)}` : "Unknown — not yet reviewed"; } if (typeof value === "string" && /^[a-z]+(?:-[a-z]+)*$/.test(value)) return humanize(value); return String(value); }
function ListPanel({ title, fact }: { title: string; fact: BrandFact<string[]> }) { return <section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-lg font-black">{title}</h2>{fact.value?.length ? <ul className="mt-4 space-y-2 text-sm text-slate-700">{fact.value.map((item) => <li key={item} className="flex gap-2"><span className="text-teal-600">●</span><span>{item}</span></li>)}</ul> : <p className="mt-3 text-sm text-slate-500">Unknown — not yet reviewed.</p>}</section>; }
function MissingPanel({ profile }: { profile: BrandIntelligenceProfile }) { return <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6"><h2 className="text-lg font-black">Other information still needed</h2><p className="mt-2 text-sm text-slate-600">These additional gaps remain open beyond the priorities highlighted above.</p><div className="mt-4 flex flex-wrap gap-2">{profile.completeness.missingFields.map((item) => <span key={item} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200">{item}</span>)}</div></section>; }
function EvidenceCard({ evidence }: { evidence: BrandEvidence }) { return <article className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-black text-slate-900">{evidence.title}</h3><p className="mt-1 text-xs font-bold uppercase text-slate-500">{humanize(evidence.sourceType)} · {humanize(evidence.verification)}</p></div>{evidence.sourceUrl && <a href={evidence.sourceUrl} target="_blank" rel="noreferrer" aria-label={`Open evidence: ${evidence.title}`}><ExternalLink size={15}/></a>}</div>{evidence.notes && <p className="mt-3 text-xs leading-5 text-slate-600">{evidence.notes}</p>}{(evidence.documentReference || evidence.fddReference) && <p className="mt-2 text-xs text-slate-500">{evidence.documentReference ?? `FDD ${evidence.fddReference?.item ?? ""} ${evidence.fddReference?.page ? `· page ${evidence.fddReference.page}` : ""}`}</p>}</article>; }
